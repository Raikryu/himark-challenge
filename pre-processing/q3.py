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
df['time_30min'] = df['time'].dt.floor('30min')

uncertainty_df = df.groupby('time_5min')[damage].std().reset_index()

uncertainty2_df = df.groupby(['location', 'time_5min'])[damage].std().reset_index()

min_values = df.groupby(['location', 'time_30min'])[damage].min().reset_index()
max_values = df.groupby(['location', 'time_30min'])[damage].max().reset_index()
avg_damage = df.groupby(['location', 'time_5min'])[damage].mean().reset_index()

min_values = min_values.rename(columns={col: col + "_min" for col in damage})
max_values = max_values.rename(columns={col: col + "_max" for col in damage})

minmax_df = pd.merge(min_values, max_values, on=['location', 'time_30min'])

avg_damage.to_csv("data/avgdamage.csv", index=False)