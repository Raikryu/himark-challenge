import pandas as pd

# Load dataset
file_path = "cleaned_mc1-reports-data.csv"
df = pd.read_csv(file_path)

# Convert 'time' column to datetime and extract only the date
df["time"] = pd.to_datetime(df["time"], format="%d/%m/%Y %H:%M")
df["date"] = df["time"].dt.date  # Extract date part

# Define the start and end date range
start_date = pd.to_datetime("06/04/2020", format="%d/%m/%Y").date()
end_date = pd.to_datetime("10/04/2020", format="%d/%m/%Y").date()

# Filter data within the selected date range
df = df[(df["date"] >= start_date) & (df["date"] <= end_date)]

# Define the numeric variables for box plot calculations
metrics = ["shake_intensity", "sewer_and_water", "power", "roads_and_bridges", "medical", "buildings"]
existing_metrics = [col for col in metrics if col in df.columns]

# Fill missing values using the median per day per location
for col in existing_metrics:
    df[col] = df.groupby(["date", "location"])[col].transform(lambda x: x.fillna(x.median()))

# Function to calculate box plot statistics for all metrics
def boxplot_stats(group):
    return pd.Series({
        "min": group.min(),
        "q1": group.quantile(0.25),
        "median": group.median(),
        "q3": group.quantile(0.75),
        "max": group.max()
    })

# Apply box plot calculations for all variables, grouped by date and location
boxplot_data = df.groupby(["date", "location"])[existing_metrics].apply(lambda x: x.apply(boxplot_stats)).reset_index()

# Save the processed box plot data
boxplot_file_path = "boxplot_data.csv"
boxplot_data.to_csv(boxplot_file_path, index=False)

print(f"Processed box plot data saved as '{boxplot_file_path}'.")
