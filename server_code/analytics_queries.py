# Copyright [2020] [Indian Institute of Science, Bangalore]
# SPDX-License-Identifier: Apache-2.0

# Import functions from custom python files...
from db_access import dates_query, dates_filter_query, dates_filter_query_revisits

# Import functions from libraries...
from bson.json_util import dumps
from bson.objectid import ObjectId
from datetime import datetime, timedelta
import json
import matplotlib.pyplot as plt
import numpy as np
import os
import pandas as pd
from pymongo import MongoClient
from pytz import timezone
import seaborn as sns

def pie_chart(percentages, labels, file_name, title, legend_loc, startangle):
    color_palette_list = ['#0466c8', '#0353a4', '#023e7d', '#002855', '#001845', '#001233', '#33415c', '#5c677d', '#7d8597', '#979dac']
    fig, ax = plt.subplots(figsize=(16, 9), dpi=300)
    plt.rcParams['font.sans-serif'] = 'Arial'
    plt.rcParams['font.family'] = 'sans-serif'
    plt.rcParams['text.color'] = '#001233'
    plt.rcParams['axes.labelcolor']= '#001233'
    plt.rcParams['xtick.color'] = '#001233'
    plt.rcParams['ytick.color'] = '#001233'
    plt.rcParams['font.size'] = 16
    plt.rcParams['axes.titleweight'] = 'bold'
    ax.pie(percentages, labels=labels,
           colors=color_palette_list[0:len(labels)], autopct='%1.0f%%',
           shadow=False, startangle=startangle,
           pctdistance=1.1,labeldistance=1.2)
    ax.axis('equal')
    ax.set_title(title, y=-0.1)
    ax.legend(frameon=False, bbox_to_anchor=legend_loc, loc="upper left")
    fig.savefig('./analytics/'+file_name)
    fig.clear()
    return (True)

def number_of_users(start_time, end_time, NOE, score_category, print_statement, timeframe):
    new_user_today = dates_filter_query(field = '_id', start_time = start_time, end_time = end_time)
    active_user_today = dates_filter_query(field = 'date', start_time = start_time, end_time = end_time)
    new_temp_df = pd.json_normalize(list(new_user_today))
    active_temp_df = pd.json_normalize(list(active_user_today)) 
    #total_users_count = len(list(active_user_today))
    total_users_count = len(active_temp_df)
    print("Total users: " + str(total_users_count)) 
    print(active_temp_df)

    # prepare pie-charts only if the number of users is > 0
    if ( (len(active_temp_df) + len(new_temp_df)) > 0):
        percentages = np.array([len(active_temp_df), len(new_temp_df)]) * 100 / (len(active_temp_df)+len(new_temp_df))
        labels = ['Active User', 'New User']
        file_name = "User_distibution_"+timeframe+".png"
        plot_title = "User distribution of "+timeframe
        pie_chart(percentages, labels, file_name, plot_title, (0, 0.1), 0)
     
    percentages = []
    labels = []
        
    # prepare pie-charts only if the number of users is > 0
    if ( len(active_temp_df) > 0):
        for key in NOE.keys():
            NOE_filtered_rows = active_temp_df[active_temp_df['inputs.NOE']==int(key)]
            if (len(NOE_filtered_rows)):
                percentages.append(len(NOE_filtered_rows))
                labels.append(NOE[key])
            #print (NOE[key], ': ', len(NOE_filtered_rows), ' Mean score: ', mean_score) 

    percentages = np.array(percentages) * 100 / np.sum(percentages)
    print (percentages)
    file_name = "User_distibution_"+timeframe+"_(Category_wise)"
    plot_title = "Category-wise user distribution "+timeframe+" (Total users: " + str(total_users_count) + ")"
    #plot_title = "User distribution of "+timeframe+" (Category_wise)"
    pie_chart(percentages, labels, file_name, plot_title, (-0.1, 1.1), 90) 

    return (True) 

def score_by_category(key, NOE, df, score_category):
    for category in score_category:
        sns.distplot(df['outputs.'+category], kde=False)
        if (category == 'Total' and key!='scores_hist'):
            plt.xlabel(NOE[key], fontsize=30)
        else:
            plt.xlabel(category, fontsize=30)
        if (category== 'Total'):
            plt.xlim([0, 1000])
        else:
            plt.xlim([0, 100])
        plt.ylabel('Counts', fontsize=30)
        plt.savefig('./analytics/'+key+'/'+category.replace('/', '_')+'.png')
        plt.clf()
    return (True)

def scores_categorywise_histogram(field, start_time, end_time, NOE, score_category, print_statement):
    user_today = dates_filter_query(field = field, start_time = start_time, end_time = end_time)
    temp_df = pd.json_normalize(list(user_today))
    #print (print_statement, len(temp_df))
    score_by_category('scores_hist', NOE, temp_df, score_category)

    for key in NOE.keys():
        NOE_filtered_rows = temp_df[temp_df['inputs.NOE']==int(key)]
        mean_score = 0
        if (len(NOE_filtered_rows)>0):
            mean_score = NOE_filtered_rows['outputs.Total'].mean()
            score_by_category(key, NOE, NOE_filtered_rows, score_category)
        #print (NOE[key], ': ', len(NOE_filtered_rows), ' Mean score: ', mean_score)  

    return (True)

def number_of_users_per_timeframe(field, start_time, end_time):
    user_today = dates_filter_query(field = field, start_time = start_time, end_time = end_time)
    temp_df = pd.json_normalize(list(user_today))
    print (len(temp_df))
    return (len(temp_df))

def number_of_users_per_timeframe_revis(start_time, end_time):
    temp_df = dates_filter_query_revisits(start_time = start_time, end_time = end_time)
    print (len(temp_df))
    return (len(temp_df))

def user_bar_plot(counts, label_name, file_name):
    plt.figure(figsize=(16,10), dpi=300)
    sns.barplot(x='dates', y='counts', data=counts)
    plt.xlabel('Date', fontsize=20)
    plt.ylabel('Counts', fontsize=20)
    plt.xticks(rotation=90)
    plt.title(label_name, fontsize=20)
    plt.savefig('./analytics/'+file_name+'.png')
    plt.clf()
    return (True)

def number_of_users_analytics(creation_dates, NOE, score_category):
    # Number of users today...
    print ('Number of Users today queries...')
    current_time = (datetime.now()).replace(hour=23, minute=59, second=59)
    midnight_time = current_time.replace(hour=0, minute=0, second=1) 
    print_statement = 'Total user today: '
    number_of_users(start_time = midnight_time, end_time = current_time, NOE = NOE, score_category = score_category, print_statement = print_statement, timeframe = 'today')
    
    generation_dt = []
    modification_dt = []

    for record in creation_dates:
        generation_dt.append(record['_id'].generation_time.astimezone(timezone('Asia/Kolkata')).date())
        modification_dt.append(record['date'].astimezone(timezone('Asia/Kolkata')).date())
    
    df = pd.DataFrame({'generation_date': generation_dt, 'modification_date': modification_dt})
    unique_generation_dates = sorted(pd.to_datetime(pd.unique(df['generation_date'])))
    unique_modification_dates = sorted(pd.to_datetime(pd.unique(df['modification_date'])))
    
    # Number of users thus far...
    print ('Number of Users thus far queries...')
    print_statement = 'Total users thus far: '    
    number_of_users(start_time = unique_generation_dates[0], end_time = current_time, NOE = NOE, score_category = score_category, print_statement = print_statement, timeframe = 'thus far')

    # Number of scores per category per organisation type...
    print_statement = ''
    scores_categorywise_histogram(field = '_id', start_time = unique_generation_dates[0], end_time = current_time, NOE = NOE, score_category = score_category, print_statement = print_statement)

    # Number of new users on each day...
    print ('Generation dates...')
    gen_user = []
    for i in range(len(unique_generation_dates)-1):
        print_statement = 'Total number of new users on ' + datetime.strftime(unique_generation_dates[i+1], '%d-%m-%Y') + ': '
        gen_user.append(number_of_users_per_timeframe(field = '_id', start_time = unique_generation_dates[i], end_time = unique_generation_dates[i+1]))
    data = pd.DataFrame({'dates': unique_generation_dates[1:], 'counts': gen_user})
    data['dates'] = data['dates'].dt.date
    user_bar_plot(data, 'New Users', 'New_users')
    
    # Number of revisiting users on each day...
    print ('Modification dates...')
    mod_user = []
    for i in range(len(unique_modification_dates)-1):
        print_statement = 'Total number of revisiting users on ' + datetime.strftime(unique_modification_dates[i+1], '%d-%m-%Y') + ': '
        mod_user.append(number_of_users_per_timeframe_revis(start_time = unique_modification_dates[i], end_time = unique_modification_dates[i+1])) 
    data = pd.DataFrame({'dates': unique_modification_dates[1:], 'counts': mod_user})
    data['dates'] = data['dates'].dt.date
    user_bar_plot(data, 'Revisiting Users', 'Revisiting_users')

# Main function...
NOE = {"1": "IT / ITES / Software Park", "2": "BPO / Call Centre / Medical Transcription", "3": "Manufacturing", "4": "Garment manufacturing", "5": "Bank / Financial", "6": "Automobile sales and service", "7": "Government office", "8": "Research and Development", "9": "Other"}

score_category = ["Infrastructure", "Epidemic related: Precautions", "Epidemic related: Awareness and readiness", "Epidemic related: Advertisement and outreach", "Transportation", "Employee interactions: Mobility", "Employee interactions: Meetings", "Employee interactions: Outside contacts", "Canteen/pantry", "Hygiene and sanitation", "Total"]

creation_dates = dates_query()
number_of_users_analytics(creation_dates, NOE, score_category)
