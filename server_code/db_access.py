from bson.json_util import dumps
from bson.objectid import ObjectId
import json
import os
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()
db_json = os.getenv("DB_JSON")
db_fb = os.getenv("DB_FEEDBACK")

def get_mongo_client(db_name, collection_name):
    client = MongoClient('mongodb://localhost:27017')
    db = client[db_name]
    collection = db[collection_name]
    return (collection)

def insert_row(data, new_uuid): 
    collection = get_mongo_client(db_name = db_json, collection_name = "json_logs")
    if (new_uuid==1):
        returned_value = collection.insert_one(data)
    else:
        returned_value = collection.replace_one({"uuid" : data['uuid']}, data)
    return (True)

def get_row(uuid_field):
    collection = get_mongo_client(db_name = db_json, collection_name = "json_logs")
    returned_value = collection.find({"uuid" : uuid_field}, {"_id":0, "outputs":0, "suggestions":0, "date":0}).sort([('$natural',  -1)]).limit(1) #latest record
    returned_value = dumps(returned_value)
    return (returned_value)

def check_uniqueness(uuid_field):
    collection = get_mongo_client(db_name = db_json, collection_name = "json_logs")
    count_value = collection.find({"uuid" : uuid_field}, {"_id":0}).count()
    if (count_value == 0):
        return (True)
    else:
        return (False)

def append_row_fb(data):
    collection = get_mongo_client(db_name = db_fb, collection_name = "fb_logs")
    returned_value = collection.insert_one(data)
    return (returned_value)

# Analytics Queries...
def dates_query():
    collection = get_mongo_client(db_name = db_json, collection_name = "json_logs")
    creation_modification_dates = collection.find({'outputs': {'$exists': True}, 'date': {'$exists': True}}, {'_id': 1, 'date': 1})
    return (creation_modification_dates)

def dates_filter_query(field, start_time, end_time):
    collection = get_mongo_client(db_name = db_json, collection_name = "json_logs")
    if (field == '_id'):
        filtered_rows = collection.find({field : {'$gte' : ObjectId.from_datetime(start_time), '$lt' : ObjectId.from_datetime(end_time)}})
    else:
        filtered_rows = collection.find({'$or': [{field : {'$gte' : start_time, '$lt' : end_time}}, {'_id': {'$gte' : ObjectId.from_datetime(start_time), '$lt' : ObjectId.from_datetime(end_time)}}]})
    return (filtered_rows)
