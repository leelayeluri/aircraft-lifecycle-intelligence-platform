import pandas as pd
from connect_db import engine

file_path = "/Users/rameshyeluri/Desktop/Coral Comp/ReleasableAircraft/DOCINDEX.txt"

df = pd.read_csv(
    file_path,
    on_bad_lines="skip",
    low_memory=False
)

# Remove extra column
df = df.drop(columns=["Unnamed: 10"])

# Rename columns
df.columns = [
    "type_collateral",
    "collateral",
    "party",
    "reserved1",
    "reserved2",
    "reserved3",
    "reserved4",
    "serial_id",
    "doc_type",
    "document_number"
]

# Upload to PostgreSQL
df.to_sql(
    "docindex_registry",
    engine,
    if_exists="replace",
    index=False
)

print("==============================")
print("DOCINDEX uploaded successfully!")
print("Rows uploaded:", len(df))
print("Columns uploaded:", len(df.columns))
print("==============================")