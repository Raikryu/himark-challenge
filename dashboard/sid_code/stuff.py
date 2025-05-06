import json
import pandas as pd
from sklearn.preprocessing import MinMaxScaler

damage_data_path = "radar_chart_data.json"
with open(damage_data_path, "r") as file:
    damage_data = json.load(file)

df_damage = pd.DataFrame(damage_data)

impact_columns = ["sewer_and_water", "power", "roads_and_bridges", "medical", "buildings", "shake_intensity"]

scaler = MinMaxScaler(feature_range=(0, 10))
df_damage["damage_score"] = scaler.fit_transform(df_damage[impact_columns].sum(axis=1).values.reshape(-1, 1))

updated_damage_path = "radar_chart_updated.json"
df_damage.to_json(updated_damage_path, orient="records", indent=4)

print(f"Updated damage scores saved to: {updated_damage_path}")

geojson_path = "st_himark.geojson"
with open(geojson_path, "r") as file:
    full_geojson = json.load(file)

damage_dict = {row["location"]: row["damage_score"] for row in df_damage.to_dict(orient="records")}

for feature in full_geojson["features"]:
    district_id = feature.get("id")
    feature["properties"]["damage_score"] = damage_dict.get(district_id, 0)

updated_geojson_path = "st_himark_updated.geojson"
with open(updated_geojson_path, "w") as file:
    json.dump(full_geojson, file, indent=4)

print(f"Updated full GeoJSON saved to: {updated_geojson_path}")