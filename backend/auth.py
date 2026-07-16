import os
import httpx
import logging
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session
from database import get_db
import models

router = APIRouter()
logger = logging.getLogger("uvicorn.error")

GITHUB_CLIENT_ID = os.getenv("GITHUB_CLIENT_ID")
GITHUB_CLIENT_SECRET = os.getenv("GITHUB_CLIENT_SECRET")
GITHUB_REDIRECT_URI = os.getenv("REDIRECT_URI", "https://devpulse-1-pxvk.onrender.com/api/v1/auth/callback")

@router.get("/api/v1/auth/login")
def login_github():
    scope = "user:email,repo"
    github_url = f"https://github.com/login/oauth/authorize?client_id={GITHUB_CLIENT_ID}&redirect_uri={GITHUB_REDIRECT_URI}&scope={scope}"
    return RedirectResponse(url=github_url)

@router.get("/api/v1/auth/callback")
async def callback_github(code: str, db: Session = Depends(get_db)):
    if not code:
        raise HTTPException(status_code=400, detail="Missing authorization code")

    token_url = "https://github.com/login/oauth/access_token"
    headers = {"Accept": "application/json"}
    data = {
        "client_id": GITHUB_CLIENT_ID,
        "client_secret": GITHUB_CLIENT_SECRET,
        "code": code,
        "redirect_uri": GITHUB_REDIRECT_URI
    }

    async with httpx.AsyncClient() as client:
        token_res = await client.post(token_url, headers=headers, data=data)
        token_data = token_res.json()
        access_token = token_data.get("access_token")
        
        if not access_token:
            logger.error(f"GitHub Token Error: {token_data}")
            raise HTTPException(status_code=400, detail="Access token could not be retrieved")

        user_res = await client.get("https://api.github.com/user", headers={
            "Authorization": f"Bearer {access_token}",
            "Accept": "application/vnd.github.v3+json"
        })
        gh_profile = user_res.json()

    user = db.query(models.User).filter(models.User.github_id == str(gh_profile["id"])).first()
    email_value = gh_profile.get("email") or f"{gh_profile.get('login')}@users.noreply.github.com"
    
    if not user:
        user = models.User(
            github_id=str(gh_profile["id"]),
            username=gh_profile.get("login"),
            email=email_value,
            access_token=access_token
        )
        db.add(user)
    else:
        user.access_token = access_token
        user.username = gh_profile.get("login")

    db.commit()
    db.refresh(user)

    FRONTEND_URL = os.getenv("FRONTEND_URL", "https://devpulse-bpnr.onrender.com")
    return RedirectResponse(url=f"{FRONTEND_URL}/dashboard?user_id={user.id}")

@router.get("/api/v1/user/{user_id}/repos")
async def get_user_repositories(user_id: int, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    headers = {
        "Authorization": f"Bearer {user.access_token}",
        "Accept": "application/vnd.github.v3+json"
    }
    
    async with httpx.AsyncClient() as client:
        repos_response = await client.get("https://api.github.com/user/repos?per_page=100&sort=updated", headers=headers)
        if repos_response.status_code != 200:
            raise HTTPException(status_code=repos_response.status_code, detail="Repositories could not be fetched")
        
        repos_data = repos_response.json()
        simplified_repos = []

        for repo in repos_data:
            repo_name = repo["name"]
            full_name = repo["full_name"]
            
            sessions = db.query(models.WorkSession).filter(
                models.WorkSession.user_id == user_id,
                models.WorkSession.repo_name == repo_name
            ).all()
            
            total_seconds = sum(session.duration_seconds for session in sessions)
            real_hours = round(total_seconds / 3600, 1)

            commits_count = 0
            commits_response = await client.get(
                f"https://api.github.com/repos/{full_name}/commits?author={user.username}&per_page=1",
                headers=headers
            )
            
            if commits_response.status_code == 200:
                link_header = commits_response.headers.get("Link", "")
                if 'rel="last"' in link_header:
                    try:
                        commits_count = int(link_header.split('page=')[-1].split('>')[0])
                    except ValueError:
                        commits_count = 1
                else:
                    commits_data = commits_response.json()
                    commits_count = len(commits_data)

            simplified_repos.append({
                "id": repo["id"],
                "name": repo_name,
                "full_name": full_name,
                "private": repo["private"],
                "description": repo["description"],
                "html_url": repo["html_url"],
                "language": repo["language"],
                "stars": repo["stargazers_count"],
                "commit_count": commits_count,
                "work_hours": real_hours
            })
        
    return simplified_repos

@router.get("/api/v1/user/{user_id}/daily-pulse")
async def get_daily_pulse_summary(user_id: int, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    today_start_utc = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
    today_start_naive = today_start_utc.replace(tzinfo=None)
    
    todays_sessions = db.query(models.WorkSession).filter(
        models.WorkSession.user_id == user_id,
        models.WorkSession.started_at >= today_start_naive
    ).all()
    
    total_seconds_spent = sum(session.duration_seconds for session in todays_sessions)
    real_work_hours = round(total_seconds_spent / 3600, 1)

    headers = {
        "Authorization": f"Bearer {user.access_token}",
        "Accept": "application/vnd.github.v3+json"
    }
    since_param = today_start_utc.isoformat()
    commit_messages = []
    
    async with httpx.AsyncClient() as client:
        repos_response = await client.get(
            "https://api.github.com/user/repos?per_page=15&sort=updated", 
            headers=headers
        )
        
        if repos_response.status_code == 200:
            repos_data = repos_response.json()
            for repo in repos_data:
                commits_url = f"https://api.github.com/repos/{repo['full_name']}/commits?since={since_param}"
                commits_response = await client.get(commits_url, headers=headers)
                
                if commits_response.status_code == 200:
                    commits = commits_response.json()
                    for c in commits:
                        commit_info = c.get("commit", {})
                        commit_messages.append({
                            "repo": repo["name"],
                            "message": commit_info.get("message", "No commit message"),
                            "author": commit_info.get("author", {}).get("name", "Unknown")
                        })

    return {
        "date": today_start_naive.strftime("%Y-%m-%d"),
        "total_pushed_commits": len(commit_messages),
        "daily_work_hours": real_work_hours,
        "changes_summary": commit_messages
    }