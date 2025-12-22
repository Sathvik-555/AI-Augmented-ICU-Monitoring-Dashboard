import requests
import pandas as pd
import io

API_URL = "https://api.vitaldb.net"

def test_case_1():
    print("Testing Case 1 access...")
    # TIDs for Case 1 we found earlier
    tids = [
        "6326f61f2b89f8afb550c102fd1b9c9e44249fe0", # HR
        "69128c2f14c14d5a74170946ea88e8d5d8ef0bfa", # SBP
        "22f7c87e40887e437db5e0f6bde5e3df254d79f5", # DBP
        "b50ea1e4216b5c88f1b8d53c5f2c4eff2993edb6", # SpO2
        "eb93fa330eba4cd2f4eac92d5e448dfe7f421106", # RR
        "55488b14a4f2c1133273a3b8a897f7ee62b24ddc"  # Temp
    ]
    tid_str = ",".join(tids)
    url = f"{API_URL}/{tid_str}"
    
    try:
        response = requests.get(url, headers={'User-Agent': 'Mozilla/5.0'}, timeout=10)
        print(f"Status Code: {response.status_code}")
        if response.status_code == 200:
            print("Success! Data received.")
            print(response.text[:200])
        else:
            print("Failed.")
            print(response.text)
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_case_1()
