import os
from pymongo import MongoClient


def init_db():
    uri = os.getenv("MONGO_URI", "mongodb://localhost:27017/inboXpert")
    client = MongoClient(uri)
    return client["inboXpert"]


# if __name__ == "__main__":
#     client, db = init_db()
#     print("✅ MongoClient object:", client)
#     print("✅ Connected to DB:", db["users"])
#     print("✅ List of databases:", client.list_database_names())
#     print("✅ Collections in inboXpert:", db.list_collection_names())