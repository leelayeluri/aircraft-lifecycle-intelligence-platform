import os
import pandas as pd
from dotenv import load_dotenv
from sqlalchemy import create_engine
from urllib.parse import quote_plus

load_dotenv()

DB_NAME = os.getenv("DB_NAME")
DB_USER = os.getenv("DB_USER")
DB_PASSWORD = quote_plus(os.getenv("DB_PASSWORD"))
DB_HOST = os.getenv("DB_HOST")
DB_PORT = os.getenv("DB_PORT")
S3_BUCKET = os.getenv("S3_BUCKET")

engine = create_engine(
    f"postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
)

def clean_columns(df):
    df.columns = (
        df.columns
        .str.strip()
        .str.lower()
        .str.replace(" ", "_")
        .str.replace("-", "_")
        .str.replace("/", "_")
    )
    return df.drop_duplicates()

files = {
    "boeing_orders_deliveries": f"s3://{S3_BUCKET}/raw/boeing/Boeing_Orders_Deliveries_Final.csv",
    "boeing_cmo_2025": f"s3://{S3_BUCKET}/raw/boeing/boeing_cmo_2025_dataset FInal.csv",
    "boeing_airport_planning": f"s3://{S3_BUCKET}/raw/boeing/Boeing_Airport_Planning_Dataset_final.xlsx",
}

for table_name, path in files.items():
    print(f"Reading {table_name} from S3...")

    if path.endswith(".xlsx"):
        df = pd.read_excel(path)
    else:
        df = pd.read_csv(path, low_memory=False)

    print(f"Cleaning {table_name}...")
    df = clean_columns(df)

    print(f"Loading {table_name} into PostgreSQL...")
    df.to_sql(
        table_name,
        engine,
        if_exists="replace",
        index=False,
        chunksize=5000
    )

    print(f"{table_name} loaded successfully.")
    print("Rows:", len(df))
    print("Columns:", len(df.columns))
    print("-" * 50)

print("All Boeing datasets loaded successfully.")