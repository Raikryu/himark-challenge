import json
import pandas as pd

geojson_path = "st_himark.geojson"
with open(geojson_path, "r") as file:
    full_geojson = json.load(file)

damage_data_path = "radar_chart_data.json"
with open(damage_data_path, "r") as file:
    damage_data = json.load(file)

damage_dict = {entry["location"]: entry["shake_intensity"] for entry in damage_data}

main_district_ids = set(damage_dict.keys())

filtered_features = []
for feature in full_geojson["features"]:
    district_id = feature["id"]
    if district_id in main_district_ids:
        feature["properties"]["damage_score"] = damage_dict.get(district_id, 0)
        filtered_features.append(feature)

filtered_geojson = {
    "type": "FeatureCollection",
    "features": filtered_features
}

filtered_geojson_path = "st_himark_20.geojson"
with open(filtered_geojson_path, "w") as file:
    json.dump(filtered_geojson, file, indent=4)

print(f"Filtered GeoJSON with 20 districts saved: {filtered_geojson_path}")