from sqlalchemy import create_engine, text
import pandas as pd

engine = create_engine(
    "postgresql://postgres:Ramesh%402005@127.0.0.1:5432/aircraft_lifecycle_db"
)

print("\nAircraft Search System")
print("1. Tail Number")
print("2. Owner")
print("3. Manufacturer")
print("4. Aircraft Model")

choice = input("\nChoose option (1-4): ")
search_value = input("Enter Search Value: ")

columns = {
    "1": "n_number",
    "2": "owner_name",
    "3": "aircraft_manufacturer",
    "4": "aircraft_model"
}

if choice not in columns:
    print("Invalid option")
    exit()

column = columns[choice]

query = text(f"""
SELECT *
FROM aircraft_search
WHERE {column} ILIKE :search_value
LIMIT 20;
""")

df = pd.read_sql(query, engine, params={"search_value": f"%{search_value}%"})

print(df)