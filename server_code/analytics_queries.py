# Import functions from custom python files...
from db_access import dates_query, dates_filter_query

# Import functions from libraries...
from bson.json_util import dumps
from bson.objectid import ObjectId
from datetime import datetime
import json
import os
import pandas as pd
from pymongo import MongoClient
from pytz import timezone

def number_of_users_analytics(creation_dates):
    generation_dt = []
    modification_dt = []

    for record in creation_dates:
        generation_dt.append(record['_id'].generation_time.astimezone(timezone('Asia/Kolkata')).date())
        modification_dt.append(record['date'].astimezone(timezone('Asia/Kolkata')).date())
    
    df = pd.DataFrame({'generation_date': generation_dt, 'modification_date': modification_dt})
    unique_generation_dates = sorted(pd.to_datetime(pd.unique(df['generation_date'])))
    unique_modification_dates = sorted(pd.to_datetime(pd.unique(df['modification_date'])))

    print ('Generation dates...')
    for i in range(len(unique_generation_dates)-1):
        filtered_value = dates_filter_query(field= '_id', start_time = unique_generation_dates[i], end_time = unique_generation_dates[i+1])
        temp_df = pd.json_normalize(list(filtered_value))['outputs.Total']
        print (unique_generation_dates[i+1], len(temp_df))
        print (unique_generation_dates[i+1], temp_df.mean())
     
    print ('Modification dates...')
    for i in range(len(unique_modification_dates)-1):
        filtered_value = dates_filter_query(field = 'date', start_time = unique_modification_dates[i], end_time = unique_modification_dates[i+1])
        temp_df = pd.json_normalize(list(filtered_value))
        if not (len(temp_df)):
            filtered_value = dates_filter_query(field= '_id', start_time = unique_generation_dates[i], end_time = unique_generation_dates[i+1])
            temp_df = pd.json_normalize(list(filtered_value))

        print (unique_modification_dates[i+1], len(temp_df['outputs.Total']))
        print (unique_modification_dates[i+1], temp_df['outputs.Total'].mean())

creation_dates = dates_query()
number_of_users_analytics(creation_dates)


