import pandas as pd

file_path = "/Users/rameshyeluri/Desktop/Coral Comp/ReleasableAircraft/DOCINDEX.txt"

df = pd.read_csv(
    file_path,
    on_bad_lines="skip",
    low_memory=False
)

for i, col in enumerate(df.columns):
    print(i, ":", col)

print("\nFirst 5 rows:")
print(df.head())

print("\nTotal columns:", len(df.columns))
print("Total rows:", len(df))
