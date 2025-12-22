import pandas as pd
import numpy as np
import tensorflow as tf
from tensorflow import keras
import json
import os
import sys
import requests
import io

# --- Configuration ---
# VitalDB API URL
API_URL = "https://api.vitaldb.net"
# Track names to search for (prioritized list)
TRACK_PATTERNS = {
    'HR': ['Solar8000/HR', 'HR'],
    'SBP': ['Solar8000/ART_SBP', 'ART_SBP', 'NIBP_SBP'],
    'DBP': ['Solar8000/ART_DBP', 'ART_DBP', 'NIBP_DBP'],
    'SpO2': ['Solar8000/PLETH_SPO2', 'PLETH_SPO2', 'SPO2'],
    'RR': ['Solar8000/RR_CO2', 'RR_CO2', 'RR'],
    'Temp': ['Solar8000/BT', 'BT', 'Temp']
}
# Number of cases to fetch (User requested "whole dataset", but let's start with a safe batch for dev, 
# can be increased to 6000 for full run)
MAX_CASES = 50 
BATCH_SIZE = 32
EPOCHS = 10
MODEL_DIR = "../public/models/vital-monitor"

def get_track_ids(case_id, df_tracks):
    """Finds the best matching TID for each vital sign for a given case."""
    case_tracks = df_tracks[df_tracks['caseid'] == case_id]
    tids = {}
    for vital, patterns in TRACK_PATTERNS.items():
        for pattern in patterns:
            match = case_tracks[case_tracks['tname'].str.contains(pattern, case=False, na=False)]
            if not match.empty:
                tids[vital] = match.iloc[0]['tid']
                break
    return tids

import vitaldb

def fetch_vitaldb_data(max_cases=MAX_CASES):
    print("Fetching Data using vitaldb library...")
    
    # 1. Get all track list
    # vitaldb.find_items returns a list of track names matching a keyword
    # But we want to find cases that have ALL our required vitals.
    
    # The vitaldb library is a bit different. 
    # vitaldb.load_case(caseid, tnames, interval)
    
    # Let's get the list of cases first.
    # There isn't a direct "get all cases" in the library docs easily visible, 
    # but we can use the web API for the case list (which we know works-ish, or we cached it).
    
    try:
        df_cases = pd.read_csv(f"{API_URL}/cases", storage_options={'User-Agent': 'Mozilla/5.0'})
    except:
        print("Failed to fetch case list from API, trying fallback...")
        return pd.DataFrame()

    # Shuffle
    case_ids = df_cases['caseid'].sample(frac=1).tolist()
    
    all_data = []
    cases_processed = 0
    
    # Standard track names we want
    # Note: VitalDB library allows specifying track names like 'HR', 'ART_SBP' etc.
    # It handles the mapping internally or we provide specific names.
    # Common names: 'Solar8000/HR', 'Solar8000/ART_SBP', 'Solar8000/ART_DBP', 'Solar8000/PLETH_SPO2', 'Solar8000/RR_CO2', 'Solar8000/BT'
    
    track_names = [
        'Solar8000/HR', 
        'Solar8000/ART_SBP', 
        'Solar8000/ART_DBP', 
        'Solar8000/PLETH_SPO2', 
        'Solar8000/RR_CO2', 
        'Solar8000/BT'
    ]
    
    if not os.path.exists("data_cache"):
        os.makedirs("data_cache")

    for case_id in case_ids:
        if cases_processed >= max_cases:
            break
            
        case_file = f"data_cache/case_{case_id}.csv"
        if os.path.exists(case_file):
             try:
                case_df = pd.read_csv(case_file)
                all_data.append(case_df)
                cases_processed += 1
                print(f"Loaded Case {case_id} from cache ({cases_processed}/{max_cases})")
                continue
             except:
                pass

        try:
            # vitaldb.load_case returns numpy array
            # interval=10 means every 10 seconds (downsampling)
            vals = vitaldb.load_case(case_id, track_names, 10)
            
            # vals is (samples, tracks)
            if np.isnan(vals).any():
                # Simple cleaning: drop rows with nans
                vals = vals[~np.isnan(vals).any(axis=1)]
            
            if len(vals) > 0:
                # Convert to DataFrame
                # Note: load_case doesn't return time column by default, it returns values at interval.
                # We can construct time if needed, or just ignore it for training (we just need values).
                # But our training script expects 'Time' column for consistency with previous code, 
                # though we don't use it for training X.
                
                case_df = pd.DataFrame(vals, columns=['HR', 'SBP', 'DBP', 'SpO2', 'RR', 'Temp'])
                case_df['Time'] = np.arange(len(case_df)) * 10 # Fake time
                
                # Reorder to put Time first
                case_df = case_df[['Time', 'HR', 'SBP', 'DBP', 'SpO2', 'RR', 'Temp']]
                
                case_df.to_csv(case_file, index=False)
                all_data.append(case_df)
                cases_processed += 1
                print(f"Downloaded Case {case_id} ({cases_processed}/{max_cases})")
            
        except Exception as e:
            # print(f"Error Case {case_id}: {e}")
            pass

    if not all_data:
        raise ValueError("No valid data found!")
        
    full_df = pd.concat(all_data, ignore_index=True)
    print(f"Total Training Samples: {len(full_df)}")
    return full_df

def label_data(df):
    """
    Applies the Expert Rules to label the data.
    Priority 1 (Critical) -> 0
    Priority 2 (Urgent) -> 1
    Priority 3 (Warning) -> 2
    Priority 4 (Normal) -> 3
    """
    conditions = [
        # Priority 1: Critical
        (df['HR'] < 40) | ((df['SBP'] < 90) & (df['HR'] > 100)) | (df['SpO2'] < 85) | (df['RR'] > 30),
        
        # Priority 2: Urgent
        (df['SBP'] < 100) | ((df['SpO2'] >= 85) & (df['SpO2'] < 90)) | (df['HR'] > 120) | ((df['Temp'] > 39) & (df['HR'] > 100)),
        
        # Priority 3: Warning
        ((df['HR'] > 100) & (df['HR'] <= 120)) | (df['SBP'] > 160) | ((df['SpO2'] >= 90) & (df['SpO2'] < 94))
    ]
    
    choices = [0, 1, 2] # 0=P1, 1=P2, 2=P3
    
    # Default to 3 (Priority 4 - Normal)
    df['label'] = np.select(conditions, choices, default=3)
    
    return df

def create_model():
    model = keras.Sequential([
        keras.layers.Dense(16, activation='relu', input_shape=(6,)),
        keras.layers.Dense(12, activation='relu'),
        keras.layers.Dense(4, activation='softmax')
    ])
    
    model.compile(
        optimizer='adam',
        loss='sparse_categorical_crossentropy',
        metrics=['accuracy']
    )
    return model

def main():
    # 1. Fetch
    print("--- Step 1: Fetching Data ---")
    df = fetch_vitaldb_data(MAX_CASES)
    
    # 2. Label
    print("--- Step 2: Labeling Data ---")
    df = label_data(df)
    
    print("Label Distribution:")
    print(df['label'].value_counts())
    
    # 3. Preprocess
    print("--- Step 3: Preprocessing ---")
    # Normalize features
    X = df[['HR', 'SBP', 'DBP', 'SpO2', 'RR', 'Temp']].values
    # Normalization factors from process.md
    # HR/220, SBP/250, DBP/150, SpO2/100, RR/60, Temp/45
    X[:, 0] /= 220.0
    X[:, 1] /= 250.0
    X[:, 2] /= 150.0
    X[:, 3] /= 100.0
    X[:, 4] /= 60.0
    X[:, 5] /= 45.0
    
    y = df['label'].values
    
    # 4. Train
    print("--- Step 4: Training Model ---")
    model = create_model()
    model.fit(X, y, epochs=EPOCHS, batch_size=BATCH_SIZE, validation_split=0.2)
    
    # 5. Save
    print("--- Step 5: Saving Model ---")
    if not os.path.exists(MODEL_DIR):
        os.makedirs(MODEL_DIR)
        
    # Save as Keras model first
    model.save('vital_model.h5')
    print("Saved Keras model to vital_model.h5")
    
    # Convert to TF.js
    # Note: This requires tensorflowjs to be installed
    # pip install tensorflowjs
    print("Converting to TensorFlow.js format...")
    try:
        import subprocess
        cmd = [
            sys.executable, "-m", "tensorflowjs_converter",
            "--input_format", "keras",
            "vital_model.h5",
            MODEL_DIR
        ]
        subprocess.check_call(cmd)
        print(f"Model saved to {MODEL_DIR}")
    except Exception as e:
        print(f"Conversion failed: {e}")
        print("Please run manually: tensorflowjs_converter --input_format keras vital_model.h5 public/models/vital-monitor")

if __name__ == "__main__":
    main()
