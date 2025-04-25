import json
import pandas as pd

# Load the affected regions dataset
radar_chart_data_path = "radar_chart_data.json"

with open(radar_chart_data_path, "r") as file:
    affected_regions_data = json.load(file)

# Convert JSON to DataFrame for analysis
df_affected = pd.DataFrame(affected_regions_data)

# Define district coordinates (approximate centroids based on St. Himark map)
district_coords = {
    1: [0.180, -119.970], 2: [0.185, -119.928], 3: [0.193, -119.870],
    4: [0.180, -119.810], 5: [0.120, -119.930], 6: [0.153, -119.925],
    7: [0.110, -119.727], 8: [0.045, -119.755], 9: [0.058, -119.845],
    10: [0.055, -119.790], 11: [0.075, -119.769], 12: [0.120, -119.760],
    13: [0.115, -119.805], 14: [0.160, -119.869], 15: [0.160, -119.895],
    16: [0.132, -119.895], 17: [0.090, -119.842], 18: [0.130, -119.840],
    19: [0.130, -119.870]
}

# Merge coordinates into the DataFrame
df_affected["latitude"] = df_affected["location"].map(lambda x: district_coords.get(x, [None, None])[0])
df_affected["longitude"] = df_affected["location"].map(lambda x: district_coords.get(x, [None, None])[1])

# Display the mapped dataset
import ace_tools as tools
tools.display_dataframe_to_user(name="Mapped Earthquake Intensity Data", dataframe=df_affected)