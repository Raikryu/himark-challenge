import pandas as pd

# Load the original report CSV
df = pd.read_csv("himark-challenge/data/mc1-reports-data.csv")

# Define damage-related columns
damage_columns = [
    "shake_intensity",
    "sewer_and_water",
    "power",
    "roads_and_bridges",
    "medical",
    "buildings"
]

# Remove exact duplicate rows
df = df.drop_duplicates()

# Strip whitespace from all string columns
str_cols = df.select_dtypes(include="object").columns
df[str_cols] = df[str_cols].apply(lambda x: x.str.strip())

# Optionally: ensure consistent casing (e.g., lowercase for categories)
# df['some_column'] = df['some_column'].str.lower()

# Drop rows where all damage fields are missing
df_cleaned = df.dropna(subset=damage_columns, how="all")

# Optional: fill remaining NaNs in damage columns with 0
df_cleaned[damage_columns] = df_cleaned[damage_columns].fillna(0)

# Save to cleaned CSV
df_cleaned.to_csv("mc1-reports-cleaned.csv", index=False)

print("✅ Cleaned dataset saved as mc1-reports-cleaned.csv")
