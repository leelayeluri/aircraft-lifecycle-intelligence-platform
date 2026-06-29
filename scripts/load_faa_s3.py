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

AWS_REGION = os.getenv("AWS_REGION")
S3_BUCKET = os.getenv("S3_BUCKET")

engine = create_engine(
    f"postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
)

s3_path = f"s3://{S3_BUCKET}/raw/faa/FAA_Full_Registry_314k , Final.csv"

print("Reading FAA dataset from S3...")
df = pd.read_csv(s3_path, low_memory=False)

print("Cleaning column names...")
df.columns = (
    df.columns
    .str.strip()
    .str.lower()
    .str.replace(" ", "_")
    .str.replace("-", "_")
)

print("Removing duplicate rows...")
df = df.drop_duplicates()

print("Loading FAA dataset into PostgreSQL...")
df.to_sql(
    "faa_registry_raw",
    engine,
    if_exists="replace",
    index=False,
    chunksize=5000
)

print("FAA S3 load completed successfully.")
print("Rows loaded:", len(df))
print("Columns loaded:", len(df.columns)) 