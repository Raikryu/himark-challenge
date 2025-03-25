import pandas as pd

df = pd.read_csv("data/mc1-reports-data.csv")

# report frequency per neighbourhood
df_locations = df.copy()

regions = {
    1: "Palace Hills",
    2: "Northwest",
    3: "Old Town",
    4: "Safe Town",
    5: "Southwest",
    6: "Downtown",
    7: "Wilson Forest",
    8: "Scenic Vista",
    9: "Broadview",
    10: "Chapparal",
    11: "Terrapin Springs",
    12: "Pepper Mill",
    13: "Cheddarford",
    14: "Easton",
    15: "Weston",
    16: "Southton",
    17: "Oak Willow",
    18: "East Parton",
    19: "West Parton"
    }

df_locations["location"] = df_locations["location"].map(regions)
reports = df_locations["location"].value_counts()
reports.columns = ["region", "reports"]

damage = ['sewer_and_water', 'power', 'roads_and_bridges', 'medical', 'buildings', 'shake_intensity']

df['time'] = pd.to_datetime(df['time'])
df['time_5min'] = df['time'].dt.floor('5min')

uncertainty_df = df.groupby('time_5min')[damage].std().reset_index()

uncertainty_df.to_csv("uncertainty.csv", index=False)