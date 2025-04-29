import pandas as pd


file_path = "mc1-reports-data.csv"  
df = pd.read_csv(file_path)


columns_to_fill = ["shake_intensity", "sewer_and_water", "power", "roads_and_bridges", "medical", "buildings"]


existing_columns = [col for col in columns_to_fill if col in df.columns]


for col in existing_columns:
    df[col] = df.groupby("location")[col].transform(lambda x: x.fillna(x.median()))


cleaned_file_path = "cleaned_mc1-reports-data.csv"
df.to_csv(cleaned_file_path, index=False)

print(f"Missing values have been filled with the median per location. Cleaned dataset saved as '{cleaned_file_path}'.")


import pandas as pd


file_path = cleaned_file_path 
df = pd.read_csv(file_path)


df['time'] = pd.to_datetime(df['time'], format='%d/%m/%Y %H:%M')


df['date'] = df['time'].dt.date


start_date = pd.to_datetime("06/04/2020", format='%d/%m/%Y').date()
end_date = pd.to_datetime("10/04/2020", format='%d/%m/%Y').date()
df = df[(df['date'] >= start_date) & (df['date'] <= end_date)]


columns_of_interest = ['shake_intensity', 'sewer_and_water', 'power', 'roads_and_bridges', 'medical', 'buildings']


mean_df = df.groupby(['date', 'location'])[columns_of_interest].mean().reset_index()


output_path = "daily_mean_by_location.csv"
mean_df.to_csv(output_path, index=False)

print(f"Processed data saved to: {output_path}")



