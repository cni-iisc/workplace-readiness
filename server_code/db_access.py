# Copyright [2020] [Indian Institute of Science, Bangalore]
# SPDX-License-Identifier: Apache-2.0

from bson.json_util import dumps
from bson.objectid import ObjectId
from datetime import datetime, timedelta
from dotenv import load_dotenv
import json
import numpy as np
import os
import pandas as pd
from pymongo import MongoClient
from pytz import timezone

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

def update_inputs(data):
    collection = get_mongo_client(db_name = db_json, collection_name = "json_logs")
    returned_value = collection.update_one({"uuid" : data['uuid']}, {"$set": {"inputs": data["inputs"], "date": data["date"], "input_mod": True}})
    return (returned_value)


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
        filtered_rows = collection.find({field : {'$gte' : start_time, '$lt' : end_time}})
    return (filtered_rows)

def dates_filter_query_revisits(start_time, end_time):
    collection = get_mongo_client(db_name = db_json, collection_name = "json_logs")
    revisit_rows = collection.find({'date' : {'$gte' : start_time, '$lt' : end_time}})
    filtered_row = []
    count = 0
    for record in revisit_rows:
        gen_time = datetime.strftime(record['_id'].generation_time.astimezone(timezone('Asia/Kolkata')), '%d-%m-%Y %H:%M')
        mod_time = datetime.strftime(record['date'].astimezone(timezone('Asia/Kolkata')), '%d-%m-%Y %H:%M')
        if (mod_time != gen_time):
            filtered_row.append(count)
        count += 1
    revisit_rows = collection.find({'date' : {'$gte' : start_time, '$lt' : end_time}})
    temp_df = pd.json_normalize(list(revisit_rows))
    temp_df = temp_df.iloc[filtered_row, :].reset_index()
    return (temp_df)

def visitor_count_percentile(NOE, score):
    collection = get_mongo_client(db_name = db_json, collection_name = "json_logs")
    all_rows = collection.find()

    current_time = datetime.now().astimezone(timezone('Asia/Kolkata'))
    current_time = current_time.replace(hour=0, minute=0, second=1)
    week_before = current_time - timedelta(days=7)

    total_count = 0
    week_count = 0

    for row in all_rows:
        gen_time = row['_id'].generation_time.astimezone(timezone('Asia/Kolkata'))
        if (gen_time > week_before):
            week_count += 1
        total_count += 1

    filtered_rows = collection.find({"inputs.NOE" : NOE})
    temp_df = pd.DataFrame({'Total': pd.json_normalize(list(filtered_rows))['outputs.Total']})
    percentile_score = -1
    if(len(temp_df.index) > 50):
        if(score in temp_df['Total'].unique()):
            temp_df['ranks'] = temp_df.Total.rank(pct=True)*100
            percentile_score = temp_df['ranks'][temp_df.loc[temp_df['Total'] == score].index[0]]
    return ([total_count, week_count, percentile_score])
