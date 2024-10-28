import pymongo
from pymongo import MongoClient
from config import db_string

cluster = MongoClient(db_string)

db = cluster["pet_book"]
collection = db["users"]

# collection.insert_one({"name": "Julia" })
result = collection.find_one({"name": "Julia"})
print(result)