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

file_path = "/Users/rameshyeluri/Desktop/Coral Comp/ReleasableAircraft/RESERVED.txt"

df = pd.read_csv(
    file_path,
    on_bad_lines="skip",
    low_memory=False
)

df = df.drop(columns=["Unnamed: 12"])

df.columns = [
    "n_number",
    "registrant",
    "street",
    "street2",
    "city",
    "state",
    "zip_code",
    "region",
    "reserved_date",
    "exp_date",
    "n_num_chg",
    "purge_date"
]

df.to_sql(
    "reserved_registry",
    engine,
    if_exists="replace",
    index=False
)

print("================================")
print("RESERVED uploaded successfully!")
print("Rows uploaded:", len(df))
print("Columns uploaded:", len(df.columns))
print("================================")