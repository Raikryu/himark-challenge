import json
import pandas as pd

geojson_path = "st_himark.geojson"
with open(geojson_path, "r") as file:
    full_geojson = json.load(file)

# Load the damage dataset (radar_chart_data.json)
damage_data_path = "radar_chart_data.json"
with open(damage_data_path, "r") as file:
    damage_data = json.load(file)

# Convert damage data to a dictionary { location_id: damage_score }
damage_dict = {entry["location"]: entry["shake_intensity"] for entry in damage_data}

# Define the 20 main districts (using IDs from the dataset)
main_district_ids = set(damage_dict.keys())  # Extract the 20 location IDs

# Filter the main 20 districts from the 724-district GeoJSON
filtered_features = []
for feature in full_geojson["features"]:
    district_id = feature["id"]
    if district_id in main_district_ids:
        feature["properties"]["damage_score"] = damage_dict.get(district_id, 0)  # Assign shake intensity
        filtered_features.append(feature)

# Create a new GeoJSON with only 20 districts
filtered_geojson = {
    "type": "FeatureCollection",
    "features": filtered_features
}

# Save the new filtered GeoJSON
filtered_geojson_path = "st_himark_20.geojson"
with open(filtered_geojson_path, "w") as file:
    json.dump(filtered_geojson, file, indent=4)

# Output file location
print(f"Filtered GeoJSON with 20 districts saved: {filtered_geojson_path}")