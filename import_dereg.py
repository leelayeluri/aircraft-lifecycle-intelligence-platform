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

file_path = "/Users/rameshyeluri/Desktop/Coral Comp/ReleasableAircraft/DEREG.txt"

df = pd.read_csv(
    file_path,
    on_bad_lines="skip",
    low_memory=False
)

# Remove empty last column
df = df.drop(columns=["Unnamed: 38"])

# Rename columns
df.columns = [
    "n_number",
    "serial_number",
    "mfr_mdl_code",
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
    "mode_s_code_hex",
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
    "status",
    "year_mfr",
    "eng_mfr_mdl",
    "mfr_mdl_code2",
    "reserved1",
    "reserved2"
]

# Upload to PostgreSQL
df.to_sql(
    "dereg_registry",
    engine,
    if_exists="replace",
    index=False
)

print("================================")
print("DEREG uploaded successfully!")
print("Rows uploaded:", len(df))
print("Columns uploaded:", len(df.columns))
print("================================")