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

try:
    connection = engine.connect()
    print("✅ Successfully connected to PostgreSQL!")
    connection.close()
except Exception as e:
    print("❌ Connection failed:")
    print(e)