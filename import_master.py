import pandas as pd
from sqlalchemy import create_engine
from urllib.parse import quote_plus

# PostgreSQL Connection
username = "postgres"
password = quote_plus("Ramesh@2005")
host = "127.0.0.1"
port = "5432"
database = "aircraft_lifecycle_db"

engine = create_engine(
    f"postgresql://{username}:{password}@{host}:{port}/{database}"
)

# MASTER.txt location
file_path = "/Users/rameshyeluri/Desktop/Coral Comp/ReleasableAircraft/MASTER.txt"

# Read file
df = pd.read_csv(file_path)

# Remove empty last column
df = df.drop(columns=["Unnamed: 34"])

# Rename columns
df.columns = [
    "n_number",
    "serial_number",
    "mfr_mdl_code",
    "eng_mfr_mdl",
    "year_mfr",
    "type_registrant",
    "name",
    "street",
    "street2",
    "city",
    "state",
    "zip_code",
    "region",
    "county",
    "country",
    "last_action_date",
    "cert_issue_date",
    "certification",
    "type_aircraft",
    "type_engine",
    "status_code",
    "mode_s_code",
    "fract_owner",
    "air_worth_date",
    "other_names1",
    "other_names2",
    "other_names3",
    "other_names4",
    "other_names5",
    "expiration_date",
    "unique_id",
    "kit_mfr",
    "kit_model",
    "mode_s_code_hex"
]

# Upload to PostgreSQL
df.to_sql(
    "master_registry",
    engine,
    if_exists="replace",
    index=False
)

print("====================================")
print("MASTER uploaded successfully!")
print("Rows uploaded:", len(df))
print("Columns uploaded:", len(df.columns))
print("====================================")