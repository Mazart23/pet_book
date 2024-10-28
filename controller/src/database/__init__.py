import os
import pymongo
from pymongo import MongoClient


class MongoDBConnect:

    def __init__(self):
        self.client = MongoClient(
            os.environ.get('MONGODB_URI'),
            username=os.environ.get('MONGODB_USER'),
            password=os.environ.get('MONGODB_PASSWORD')
        )
        self.db = self.client[os.environ.get('MONGODB_DATABASE')]
        
    def __del__(self):
        self.client.close()

    def get_collection(self, collection_name):
        return self.db[collection_name]

    def insert_one(self, collection_name, document):
        collection = self.get_collection(collection_name)
        return collection.insert_one(document)

    def find(self, collection_name, query={}, projection=None):
        collection = self.get_collection(collection_name)
        return collection.find(query, projection)

    def fetch_all(self, cursor):
        return list(cursor)