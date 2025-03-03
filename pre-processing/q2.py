import pandas as pd

df = pd.read_csv("data/mc1-reports-data.csv")

'''

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

'''

# report frequency per neighbourhood (in total)

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

df["location"] = df["location"].map(regions)
reports = df["location"].value_counts()
reports.columns = ["region", "reports"]
print(reports)
