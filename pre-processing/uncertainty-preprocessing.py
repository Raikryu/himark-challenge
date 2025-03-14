import pandas as pd
import numpy as np

# Load the CSV data.
file_path = "himark-challenge/data/mc1-reports-data.csv"
df = pd.read_csv(file_path)

# Convert the time column to datetime.
df['time'] = pd.to_datetime(df['time'])

report_columns = ["sewer_and_water", "power", "roads_and_bridges", "medical", "buildings", "shake_intensity"]

def compute_metrics(group):
    # Work with the report columns.
    data = group[report_columns]

    # Missing Data Rate: Percentage of missing values in the reports for this neighborhood.
    missing_rate = data.isna().sum().sum() / (len(data) * len(report_columns)) * 100

    # Damage Variability: Average standard deviation of reported damage categories.
    variability = data.std().mean()

    # Report Frequency: Average time gap (in minutes) between consecutive reports.
    time_diffs = group.sort_values('time')['time'].diff().dt.total_seconds() / 60
    avg_report_freq = time_diffs.mean()

    # Reliability Score: A measure of how trustworthy the reports are.
    reliability = 1 / (1 + missing_rate + variability)

    return pd.Series({
        "missing_data_rate": missing_rate,
        "report_frequency": avg_report_freq,
        "damage_variability": variability,
        "reliability_score": reliability
    })

# Compute metrics grouped by location.
processed_data = df.groupby("location", as_index=False, group_keys=False)[report_columns + ["time"]].apply(compute_metrics).reset_index()

# Map location to neighborhood name.
neighborhood_map = {
    1: "Palace Hills", 2: "Northwest", 3: "Old Town", 4: "Safe Town", 5: "Southwest",
    6: "Downtown", 7: "Wilson Forest", 8: "Scenic Vista", 9: "Broadview", 10: "Chapparal",
    11: "Terrapin Springs", 12: "Pepper Mill", 13: "Cheddarford", 14: "Easton", 15: "Weston",
    16: "Southton", 17: "Oak Willow", 18: "East Parton", 19: "West Parton"
}
processed_data["neighborhood"] = processed_data["location"].map(neighborhood_map)

# Normalize all metrics using min–max scaling.
for col in ["missing_data_rate", "report_frequency", "damage_variability", "reliability_score"]:
    min_val = processed_data[col].min()
    max_val = processed_data[col].max()
    processed_data[col + "_norm"] = (processed_data[col] - min_val) / (max_val - min_val)


output_path = "himark-challenge/dashboard/src/data/processed_neighborhood_reliability.json"
processed_data.to_json(output_path, orient="records")


