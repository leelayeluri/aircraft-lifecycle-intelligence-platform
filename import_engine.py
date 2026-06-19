import pandas as pd
from sqlalchemy import create_engine
from urllib.parse import quote_plus

# PostgreSQL connection

username = "postgres"
password = quote_plus("Ramesh@2005")
host = "127.0.0.1"
port = "5432"
database = "aircraft_lifecycle_db"

engine = create_engine(
    f"postgresql://{username}:{password}@{host}:{port}/{database}"
)

# ENGINE.txt location

file_path = "/Users/rameshyeluri/Desktop/Coral Comp/ReleasableAircraft/ENGINE.txt"

# Read file

df = pd.read_csv(file_path)

# Remove empty column

df = df.drop(columns=["Unnamed: 6"])

# Rename columns

df.columns = [
    "code",
    "manufacturer",
    "model",
    "type",
    "horsepower",
    "thrust"
]

# Upload to PostgreSQL

df.to_sql(
    "engine_reference",
    engine,
    if_exists="replace",
    index=False
)

print("===================================")
print("ENGINE uploaded successfully!")
print("Rows uploaded:", len(df))
print("Columns uploaded:", len(df.columns))
print("===================================")