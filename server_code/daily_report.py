#!/usr/bin/env python3

from datetime import datetime, timedelta
import pytz
from db_access import insert_row, get_row, check_uniqueness, append_row_fb, visitor_count_percentile
from flask import Flask, jsonify, request, Response
from flask_cors import CORS
import json
import random
import time
import uuid
from urllib.parse import urlencode
from urllib.request import urlopen
import os
from dotenv import load_dotenv
from email_send import gmail_send, send_gmails

today = datetime.now()
IST = pytz.timezone ("Asia/Kolkata")
#yest = timedelta(days=1)
#rdate = (datetime.now().astimezone(IST) - yest).strftime('%d-%b-%Y')
rdate = (datetime.now().astimezone(IST)).strftime('%d-%b-%Y')
#print(rdate)
email_sub = "Daily report (" + rdate + ") on Covid Readiness Indicator"
email_body = "Please find attached the daily summary report for submissions to the web server.\n\n"
#email_body += "Dry run only, hence not attaching the report pptx yet.\n\n"
email_body += "\n-COVID-19 Readiness Indicator team\n"
email_recipients = ['contact.cni@iisc.ac.in', 'nihesh.7391@gmail.com', 'pvp.iisc@gmail.com', 'rajeshs@iisc.ac.in']
file_name = 'Daily_Reports/Workplace_Readiness_Daily_Report_'+datetime.strftime(today, '%d_%m')+'.pptx'
attachment = [file_name]
#gmail_send(email_recipient, email_sub, email_body)

#send_gmails(email_recipients, email_sub, email_body)
send_gmails(email_recipients, email_sub, email_body, attachment)

