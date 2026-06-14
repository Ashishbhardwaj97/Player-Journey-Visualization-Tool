import os
import glob
import pandas as pd
import pyarrow.parquet as pq
import json
import numpy as np

class NpEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, pd.Timestamp):
            return obj.value // 10**6
        if isinstance(obj, pd.Timedelta):
            return obj.value // 10**6
        if isinstance(obj, (np.integer, np.int64, np.int32)):
            return int(obj)
        if isinstance(obj, (np.floating, np.float64, np.float32)):
            return float(obj)
        if isinstance(obj, np.ndarray):
            return obj.tolist()
        if pd.isna(obj):
            return None
        return super(NpEncoder, self).default(obj)

DATA_DIR = "player_data"
OUTPUT_DIR = "public/data"
DAYS = ["February_10", "February_11", "February_12", "February_13", "February_14"]

MAP_CONFIGS = {
    "AmbroseValley": {"scale": 900, "origin_x": -370, "origin_z": -473},
    "GrandRift": {"scale": 581, "origin_x": -290, "origin_z": -290},
    "Lockdown": {"scale": 1000, "origin_x": -500, "origin_z": -500},
}

def is_human(user_id):
    return len(str(user_id)) > 10

def process_file(file_path, date):
    try:
        table = pq.read_table(file_path)
        df = table.to_pandas()
    except Exception as e:
        print(f"Error reading {file_path}: {e}")
        return []
    
    if df.empty:
        return []
        
    if 'event' in df.columns and df['event'].apply(type).eq(bytes).any():
        df['event'] = df['event'].apply(lambda x: x.decode('utf-8') if isinstance(x, bytes) else x)
        
    df['is_human'] = df['user_id'].apply(is_human)
    
    map_id = df['map_id'].iloc[0] if not df['map_id'].empty else None
    
    if map_id in MAP_CONFIGS:
        config = MAP_CONFIGS[map_id]
        df['u'] = (df['x'] - config['origin_x']) / config['scale']
        df['v'] = (df['z'] - config['origin_z']) / config['scale']
        df['pixel_x'] = df['u'] * 1024
        df['pixel_y'] = (1 - df['v']) * 1024
    else:
        df['pixel_x'] = None
        df['pixel_y'] = None

    df['date'] = date
    return df.to_dict('records')

def main():
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    processed_data = {}
    
    for day in DAYS:
        print(f"Processing {day}...")
        day_dir = os.path.join(DATA_DIR, day)
        if not os.path.exists(day_dir):
            print(f"Directory {day_dir} not found. Skipping.")
            continue
            
        parquet_files = glob.glob(os.path.join(day_dir, "*.parquet"))
        if not parquet_files:
            parquet_files = glob.glob(os.path.join(day_dir, "*"))
            
        for p_file in parquet_files:
            if not os.path.isfile(p_file) or p_file.endswith(".DS_Store"):
                continue
                
            records = process_file(p_file, day)
            
            for record in records:
                map_id = record['map_id']
                date = record['date']
                
                clean_record = {
                    'u_id': record['user_id'],
                    'm_id': record['match_id'],
                    'event': record['event'],
                    'ts': record['ts'],
                    'is_human': record['is_human'],
                    'x': round(record['pixel_x'], 2) if record['pixel_x'] is not None else None,
                    'y': round(record['pixel_y'], 2) if record['pixel_y'] is not None else None
                }
                
                if map_id not in processed_data:
                    processed_data[map_id] = {}
                if date not in processed_data[map_id]:
                    processed_data[map_id][date] = []
                    
                processed_data[map_id][date].append(clean_record)
                
    print("Exporting to JSON...")
    for map_id, dates_data in processed_data.items():
        for date, records in dates_data.items():
            filename = f"{map_id}_{date}.json"
            filepath = os.path.join(OUTPUT_DIR, filename)
            with open(filepath, 'w') as f:
                json.dump(records, f, cls=NpEncoder)
            print(f"Saved {filepath} ({len(records)} events)")

if __name__ == "__main__":
    main()
