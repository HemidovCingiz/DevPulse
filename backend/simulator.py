import os
import time
import requests

API_URL = os.getenv("API_URL", "https://devpulse-1-pxvk.onrender.com/api/v1/track/heartbeat")
USER_ID = 1
REPO_NAME = "Realtime-Kanban"

print(f"[Pulse Simulator] Başlatıldı. {REPO_NAME} projesi için her 10 saniyede bir sinyal gönderiliyor...")

try:
    while True:
        payload = {
            "user_id": USER_ID,
            "repo_name": REPO_NAME
        }
        try:
            response = requests.post(API_URL, json=payload)
            if response.status_code == 200:
                data = response.json()
                print(f"[Sinyal Gönderildi] Durum: {data['status']} | Toplam Süre: {data['total_seconds']} saniye")
            else:
                print(f"[Hata] Sunucu hata kodu döndürdü: {response.status_code}")
        except Exception as e:
            print(f"[Bağlantı Hatası] Backend çalışıyor mu? Hata: {e}")
        
        time.sleep(10)

except KeyboardInterrupt:
    print("\n[Pulse Simulator] Durduruldu.")