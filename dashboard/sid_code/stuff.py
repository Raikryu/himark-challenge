import json
import pandas as pd
from sklearn.preprocessing import MinMaxScaler

# Load the damage dataset (radar_chart_data.json)
damage_data_path = "radar_chart_data.json"
with open(damage_data_path, "r") as file:
    damage_data = json.load(file)

# Convert to DataFrame
df_damage = pd.DataFrame(damage_data)

# Define the columns used to calculate the damage score
impact_columns = ["sewer_and_water", "power", "roads_and_bridges", "medical", "buildings", "shake_intensity"]

# Normalize scores to range (0-10)
scaler = MinMaxScaler(feature_range=(0, 10))
df_damage["damage_score"] = scaler.fit_transform(df_damage[impact_columns].sum(axis=1).values.reshape(-1, 1))

# Save the updated dataset
updated_damage_path = "radar_chart_updated.json"
df_damage.to_json(updated_damage_path, orient="records", indent=4)

print(f"Updated damage scores saved to: {updated_damage_path}")

geojson_path = "st_himark.geojson"
with open(geojson_path, "r") as file:
    full_geojson = json.load(file)

# Convert damage data to a dictionary { location_id: damage_score }
damage_dict = {row["location"]: row["damage_score"] for row in df_damage.to_dict(orient="records")}

# Merge damage scores into the full GeoJSON
for feature in full_geojson["features"]:
    district_id = feature.get("id")
    feature["properties"]["damage_score"] = damage_dict.get(district_id, 0)  # Default to 0 if not in dataset

# Save the updated full GeoJSON
updated_geojson_path = "st_himark_updated.geojson"
with open(updated_geojson_path, "w") as file:
    json.dump(full_geojson, file, indent=4)

print(f"Updated full GeoJSON saved to: {updated_geojson_path}")