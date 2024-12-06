import os
from typing import Callable
import logging

import pymongo
from pymongo import MongoClient
from pymongo.errors import OperationFailure


log = logging.getLogger('MONGO')


class MongoDBConnect:

    def __init__(self):
        self.client = MongoClient(
            os.environ.get('MONGODB_URI'),
            username=os.environ.get('MONGODB_USER'),
            password=os.environ.get('MONGODB_PASSWORD')
        )
        self.db = self.client[os.environ.get('MONGODB_DATABASE')]
    
    def transaction(func: Callable) -> Callable:
        '''
        Decorator to manage MongoDB transactions, ensuring that all database operations
        within the decorated function are executed entirely or not at all.
        
        Adds `session` parameter to function, so please pay attention to provide additional
        parameter `session` to decorated function (by default set to `None` for example).
        '''
        def wrapper(self, *args, **kwargs) -> bool:
            session = self.client.start_session()

            try:
                with session.start_transaction():
                    return func(self, *args, **kwargs, session=session)
            except OperationFailure as e:
                log.error(f"Error during transaction: {e}")
                return False
            finally:
                session.end_session()
                
        return wrapper
    
    def __del__(self) -> None:
        self.client.close()

    def get_collection(self, collection_name: str):
        return self.db[collection_name]

    def insert_one(self, collection_name: str, document: dict, session: pymongo.client_session.ClientSession | None = None) -> pymongo.results.InsertOneResult:
        collection = self.get_collection(collection_name)
        return collection.insert_one(document, session=session)

    def update_one(self, collection_name: str, filter: dict, new_values: dict, session: pymongo.client_session.ClientSession | None = None) -> pymongo.results.UpdateResult:
        collection = self.get_collection(collection_name)
        return collection.update_one(filter, new_values, session=session)

    def find(self, collection_name: str, filter: dict = {}, projection=None) -> list[dict]:
        collection = self.get_collection(collection_name)
        return list(collection.find(filter, projection))
    
    def find_one(self, collection_name: str, filter: dict) -> dict:
        collection = self.get_collection(collection_name)
        return collection.find_one(filter)
    def delete_one(self, collection_name: str, query: dict):
        collection = self.db[collection_name]
        result = collection.delete_one(query)  # Perform the deletion
        return result

