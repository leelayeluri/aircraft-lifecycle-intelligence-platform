import pandas as pd
from sqlalchemy import create_engine
from urllib.parse import quote_plus

username = "postgres"
password = quote_plus("Ramesh@2005")
host = "127.0.0.1"
port = "5432"
database = "aircraft_lifecycle_db"

engine = create_engine(
    f"postgresql://{username}:{password}@{host}:{port}/{database}"
)

file_path = "/Users/rameshyeluri/Desktop/Coral Comp/ReleasableAircraft/DEALER.txt"

df = pd.read_csv(
    file_path,
    on_bad_lines="skip",
    low_memory=False
)

df = df.drop(columns=["Unnamed: 38"])

df.columns = [
    "certificate_number",
    "ownership",
    "certificate_date",
    "dealer_name",
    "street",
    "street2",
    "city",
    "state",
    "zip_code",
    "other_names1",
    "other_names2",
    "other_names3",
    "other_names4",
    "other_names5",
    "other_names6",
    "other_names7",
    "other_names8",
    "other_names9",
    "other_names10",
    "other_names11",
    "other_names12",
    "other_names13",
    "other_names14",
    "other_names15",
    "other_names16",
    "other_names17",
    "other_names18",
    "other_names19",
    "other_names20",
    "other_names21",
    "other_names22",
    "other_names23",
    "other_names24",
    "other_names25",
    "expiration_date",
    "status_code",
    "region_code",
    "unique_id"
]

df.to_sql(
    "dealer_registry",
    engine,
    if_exists="replace",
    index=False
)

print("DEALER uploaded successfully!")
print("Rows uploaded:", len(df))
print("Columns uploaded:", len(df.columns))