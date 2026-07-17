import React, { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'

interface Repository {
    id: number;
    name: string;
    full_name: string;
    private: boolean;
    description: string | null;
    html_url: string;
    language: string | null;
    stars: number;
    commit_count: number;
    work_hours: number;
}

interface ChangeLog {
    repo: string;
    message: string;
    author: string;
}

interface DailyPulse {
    date: string;
    total_pushed_commits: number;
    daily_work_hours: number;
    changes_summary: ChangeLog[];
}

export default function DashBoard(): React.JSX.Element {
    const [searchParams] = useSearchParams()
    const userId = searchParams.get('user_id')
    const navigate = useNavigate()

    const [repos, setRepos] = useState<Repository[]>([])
    const [dailyPulse, setDailyPulse] = useState<DailyPulse | null>(null)
    const [loading, setLoading] = useState<boolean>(!!userId)
    const [error, setError] = useState<string | null>(null)

    const [hoveredRepoId, setHoveredRepoId] = useState<number | null>(null)
    const [selectedRepo, setSelectedRepo] = useState<Repository | null>(null)

    useEffect(() => {
        document.body.style.margin = '0'
        document.body.style.padding = '0'
        document.body.style.backgroundColor = '#0f172a'

        if (!userId) {
            navigate('/login')
            return
        }

        fetch(`https://devpulse-1-pxvk.onrender.com/api/v1/user/${userId}/repos`)
            .then((res) => {
                if (!res.ok) throw new Error('Failed to load tracking analytics')
                return res.json()
            })
            .then((data: Repository[]) => {
                setRepos(data)
                setLoading(false)
            })
            .catch((err: Error) => {
                setError(err.message)
                setLoading(false)
            })

        fetch(`https://devpulse-1-pxvk.onrender.com/api/v1/user/${userId}/daily-pulse`)
            .then((res) => res.ok ? res.json() : null)
            .then((data: DailyPulse) => {
                if (data) setDailyPulse(data)
            })
            .catch((err) => console.error("Daily pulse error: ", err))

    }, [userId, navigate])

    return (
        <div style={{
            minHeight: '100vh',
            backgroundColor: '#0f172a',
            color: '#ffffff',
            fontFamily: 'sans-serif',
            padding: '40px 20px',
            boxSizing: 'border-box'
        }}>
            <div style={{ maxWidth: '1000px', margin: '0 auto', width: '100%' }}>

                {}
                <header style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderBottom: '1px solid #334155',
                    paddingBottom: '24px',
                    marginBottom: '32px'
                }}>
                    <div>
                        <h1 style={{ fontSize: '32px', fontWeight: '800', margin: 0, letterSpacing: '-0.5px' }}>DevPulse Tracker</h1>
                        <p style={{ color: '#94a3b8', margin: '4px 0 0 0', fontSize: '15px' }}>Automated Time & Code Productivity Dashboard</p>
                    </div>

                    <button
                        onClick={() => navigate('/login')}
                        style={{
                            backgroundColor: '#ef4444',
                            color: '#ffffff',
                            border: 'none',
                            fontWeight: '600',
                            padding: '8px 16px',
                            borderRadius: '8px',
                            cursor: 'pointer'
                        }}
                    >
                        Log Out
                    </button>
                </header>

                {}
                {dailyPulse && dailyPulse.total_pushed_commits > 0 && (
                    <section style={{
                        backgroundColor: '#1e293b',
                        border: '2px solid #10b981',
                        borderRadius: '16px',
                        padding: '24px',
                        marginBottom: '40px',
                        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.4)'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                            <h2 style={{ fontSize: '22px', fontWeight: '800', margin: 0, color: '#10b981' }}>
                                🚀 Today's Push Pulse Summary
                            </h2>
                            <span style={{ backgroundColor: '#064e3b', color: '#34d399', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '700' }}>
                                LIVE LOG
                            </span>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                            <div style={{ backgroundColor: '#0f172a', padding: '16px', borderRadius: '12px' }}>
                                <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: '700' }}>TIME TRACKED TODAY</span>
                                <span style={{ display: 'block', fontSize: '28px', fontWeight: '800', color: '#34d399', marginTop: '4px' }}>
                                    {dailyPulse.daily_work_hours} Hours
                                </span>
                            </div>
                            <div style={{ backgroundColor: '#0f172a', padding: '16px', borderRadius: '12px' }}>
                                <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: '700' }}>TOTAL COMMITS PUSHED</span>
                                <span style={{ display: 'block', fontSize: '28px', fontWeight: '800', color: '#38bdf8', marginTop: '4px' }}>
                                    {dailyPulse.total_pushed_commits} Commits
                                </span>
                            </div>
                        </div>

                        <h3 style={{ fontSize: '15px', color: '#cbd5e1', marginBottom: '10px', fontWeight: '700' }}>Pushed Changes & Tasks Done:</h3>
                        <div style={{
                            backgroundColor: '#0f172a',
                            padding: '12px',
                            borderRadius: '12px',
                            maxHeight: '150px',
                            overflowY: 'auto',
                            border: '1px solid #334155'
                        }}>
                            {dailyPulse.changes_summary.map((change, index) => (
                                <div key={index} style={{ fontSize: '14px', padding: '6px 0', borderBottom: index !== dailyPulse.changes_summary.length - 1 ? '1px solid #1e293b' : 'none', color: '#e2e8f0' }}>
                                    <strong style={{ color: '#38bdf8' }}>[{change.repo}]</strong> {change.message}
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {}
                <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '20px' }}>
                    Project Activity Tracking ({repos.length})
                </h2>

                {loading && <p style={{ color: '#38bdf8', fontSize: '16px' }}>Calculating tracking codes and system hours...</p>}
                {error && <p style={{ color: '#f87171', fontSize: '16px' }}>Error: {error}</p>}

                {/* Grid Layout Cards */}
                {!loading && !error && (
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                        gap: '20px'
                    }}>
                        {repos.map((repo) => {
                            const isHovered = hoveredRepoId == repo.id;
                            return (
                                <div
                                    key={repo.id}
                                    onClick={() => setSelectedRepo(repo)}
                                    onMouseEnter={() => setHoveredRepoId(repo.id)}
                                    onMouseLeave={() => setHoveredRepoId(null)}
                                    style={{
                                        backgroundColor: '#1e293b',
                                        border: isHovered ? '1px solid #38bdf8' : '1px solid #334155',
                                        borderRadius: '14px',
                                        padding: '24px',
                                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        justifyContent: 'space-between',
                                        cursor: 'pointer',
                                        transform: isHovered ? 'translateY(-4px)' : 'translateY(0)',
                                        transition: 'all 0.2s ease-in-out'
                                    }}
                                >
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                                            <span style={{ color: '#38bdf8', fontWeight: '700', fontSize: '18px' }}>{repo.name}</span>
                                        </div>
                                        <div style={{ margin: '14px 0', backgroundColor: '#0f172a', padding: '12px', borderRadius: '8px' }}>
                                            <div style={{ fontSize: '13px', color: '#cbd5e1', marginBottom: '4px' }}>
                                                ⏱️ Tracked Time: <strong>{repo.work_hours} Hours</strong>
                                            </div>
                                            <div style={{ fontSize: '13px', color: '#cbd5e1' }}>
                                                💻 Total Commits: <strong>{repo.commit_count} Units</strong>
                                            </div>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#94a3b8', borderTop: '1px solid #334155', paddingTop: '14px' }}>
                                        <span>🟢 {repo.language || 'Code'}</span>
                                        <span>⭐ {repo.stars}</span>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}

                {}
                {selectedRepo && (
                    <div style={{
                        position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
                        backgroundColor: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(8px)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
                    }} onClick={() => setSelectedRepo(null)}>
                        <div style={{
                            backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '20px',
                            width: '90%', maxWidth: '550px', padding: '32px', position: 'relative'
                        }} onClick={(e) => e.stopPropagation()}>

                            <h3 style={{ fontSize: '24px', fontWeight: '800', margin: 0 }}>{selectedRepo.name} Tracking Report</h3>
                            <p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '20px' }}>Automated Activity Log</p>

                            <div style={{
                                display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px'
                            }}>
                                <div style={{ backgroundColor: '#0f172a', padding: '16px', borderRadius: '12px', border: '1px solid #334155' }}>
                                    <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: '700' }}>TOTAL TIME SPENT</span>
                                    <span style={{ fontSize: '22px', fontWeight: '800', color: '#34d399', display: 'block', marginTop: '4px' }}>{selectedRepo.work_hours} hrs</span>
                                </div>
                                <div style={{ backgroundColor: '#0f172a', padding: '16px', borderRadius: '12px', border: '1px solid #334155' }}>
                                    <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: '700' }}>CODE PUSHED</span>
                                    <span style={{ fontSize: '22px', fontWeight: '800', color: '#38bdf8', display: 'block', marginTop: '4px' }}>{selectedRepo.commit_count} Commits</span>
                                </div>
                            </div>

                            <button
                                onClick={() => setSelectedRepo(null)}
                                style={{ width: '100%', backgroundColor: '#ffffff', color: '#0f172a', fontWeight: '700', padding: '12px', borderRadius: '10px', border: 'none', cursor: 'pointer' }}
                            >
                                Close Tracking Sheet
                            </button>
                        </div>
                    </div>
                )}

            </div>
        </div>
    )
}