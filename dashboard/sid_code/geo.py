import cv2
import numpy as np
import json
from shapely.geometry import Polygon

image_path = "/images/himark_map.png"
image = cv2.imread(image_path)

gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

edges = cv2.Canny(gray, 50, 150)

contours, _ = cv2.findContours(edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

geojson_data = {
    "type": "FeatureCollection",
    "features": []
}

lat_min, lat_max = 0.045, 0.193
lon_min, lon_max = -119.97, -119.727
img_height, img_width = gray.shape

def pixel_to_geojson(x, y):
    lon = lon_min + (x / img_width) * (lon_max - lon_min)
    lat = lat_max - (y / img_height) * (lat_max - lat_min)
    return [lon, lat]

for i, contour in enumerate(contours):
    epsilon = 0.01 * cv2.arcLength(contour, True)
    approx = cv2.approxPolyDP(contour, epsilon, True)

    polygon = [pixel_to_geojson(int(pt[0][0]), int(pt[0][1])) for pt in approx]

    geojson_data["features"].append({
        "type": "Feature",
        "id": i + 1,
        "properties": {
            "name": f"District {i+1}",
            "shake_intensity": None
        },
        "geometry": {
            "type": "Polygon",
            "coordinates": [polygon]
        }
    })

geojson_path = "/mnt/data/st_himark.geojson"
with open(geojson_path, "w") as geojson_file:
    json.dump(geojson_data, geojson_file, indent=4)

print(f"GeoJSON file saved: {geojson_path}")