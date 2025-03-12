import pandas as pd

df = pd.read_csv("data/mc1-reports-data.csv")

'''

Use visual analytics to show uncertainty in the data. 

1. Compare the reliability of neighbourhood reports. 
2. Which neighbourhoods are providing reliable reports? Provide a rationale for your response.

- Some timestamps or neighbourhoods may have **fewer reports** than expected.
	- Solution: Compute **report frequency per neighbourhood** and flag underreported areas.
- Power outages may cause delays in data submission. 
	- Time lag analysis compare when the  shaking occurred vs. when reports were received.
 - Some areas may report wildly different damage levels for the same event.
	 - Solution: Compute Standard Deviation (SD) for each damage type **per neighbourhood**.
- Compare shake_intens from reports to actual shakemap data (ground truth).
	- Solution: Compute **error margin** (absolute difference between reported and actual intensity).
- Box-plots & scatter plots
- Number of reports
- Break down by time frame (number of time at which there was the most reports)
	- When is there good report coverage (lots of reports) when is there little, what does that say about the data
	- Heat map with time series

'''

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

# underreported areas (median?)
threshold = reports.median() * 0.5
underreported = reports[reports < threshold].index.tolist()

# standard deviation for damage
damage = ['sewer_and_water', 'power', 'roads_and_bridges', 'medical', 'buildings', 'shake_intensity']
damage_std = df.groupby('location')[damage].std()

# break reporting into time frame
df['time'] = pd.to_datetime(df['time'])

df['time_10min'] = df['time'].dt.floor('10min')

new_col = df.pivot_table(
    index='time_10min',
    columns='location', 
    aggfunc='size',  
    fill_value=0  
)

new_col.reset_index(inplace=True)

reports_interval = df.groupby('time_10min').size().reset_index(name='number_of_reports')
reports_location = df.groupby(['time_10min', 'location']).size().reset_index(name='number_of_reports')

new_col.to_csv("heatmap_data.csv", index=False)