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
