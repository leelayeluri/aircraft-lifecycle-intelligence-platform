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

file_path = "/Users/rameshyeluri/Desktop/Coral Comp/ReleasableAircraft/ACFTREF.txt"

df = pd.read_csv(file_path)

df = df.drop(columns=["Unnamed: 13"])

df.columns = [
    "code",
    "manufacturer",
    "model",
    "type_acft",
    "type_eng",
    "ac_cat",
    "build_cert_ind",
    "no_eng",
    "no_seats",
    "ac_weight",
    "speed",
    "tc_data_sheet",
    "tc_data_holder"
]

df.to_sql(
    "aircraft_reference",
    engine,
    if_exists="replace",
    index=False
)

print("ACFTREF uploaded successfully!")
print("Rows uploaded:", len(df))
print("Columns uploaded:", len(df.columns))