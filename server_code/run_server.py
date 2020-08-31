# Copyright [2020] [Indian Institute of Science, Bangalore]
# SPDX-License-Identifier: Apache-2.0

from datetime import datetime
from db_access import insert_row, update_inputs, get_row, check_uniqueness, append_row_fb, visitor_count_percentile
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

load_dotenv()
http_origin = os.getenv("HTTP_ORIGIN")
admin_email = os.getenv("ADMIN_EMAIL")

app = Flask(__name__)
CORS(app)


def get_uuid():
    temp_uuid = uuid.uuid4()
    if (check_uniqueness(temp_uuid)==False):
        return (get_uuid())
    else:
        return (temp_uuid)

def verify_recaptcha(recaptchaResponse):
    URIReCaptcha = 'https://www.google.com/recaptcha/api/siteverify'
    #recaptchaResponse = body.get('recaptchaResponse', None)
    private_recaptcha = os.getenv("CAPTCHA_PRIVATE")

    remote_ip = request.remote_addr
    params = urlencode({
        'secret': private_recaptcha,
        'response': recaptchaResponse,
    })

    # print params
    data = urlopen(URIReCaptcha, params.encode('utf-8')).read()
    result = json.loads(data)
    success = result.get('success', None)

    if success == True:
        #print('reCaptcha passed')
        return(True)
    else:
        #print('recaptcha failed')
        return(False)

@app.route('/api/update', methods=["POST"])
def start_receiving():
    #if ((request.method == "POST")):
    if ((request.method == "POST") and request.environ['HTTP_ORIGIN'] == http_origin):
        data = request.form['data']
        json_data = json.loads(data)
        if 'recaptcha' in json_data:
            if (not verify_recaptcha(json_data['recaptcha'])):
                #print("Recaptcha validation failed")
                return_response = Response('recaptcha_failed', status=403, mimetype='application/text')
                return(return_response)

        else:
            #print("No recaptcha present in the input")
            return_response = Response('recaptcha_failed', status=403, mimetype='application/text')
            return(return_response)
        json_data['date'] = datetime.utcnow()
        json_data['score_gen'] = True
        json_data['input_mod'] = False
        new_uuid = 0
        if (len(json_data['uuid'])==0):
            json_data['uuid'] = str(get_uuid())
            new_uuid = 1
        insert_row(json_data, new_uuid)
        #return_response = Response(json.dumps({'uuid': json_data['uuid']}), status=200, mimetype='application/json')
        vis_count, week_count, percentile = visitor_count_percentile(json_data['inputs']['NOE'], json_data['outputs']['Total'])
        f_percentile = f'{percentile:.2g}'
        return_response = Response(json.dumps({'uuid': json_data['uuid'], 'percentile': f_percentile, 'vis_counter': vis_count, 'week_counter': week_count}), status=200, mimetype='application/json')
        return (return_response)
    else:
        return ('Undone')

@app.route('/api/retrieve', methods=["POST"])
def start_sending():
    #if (request.method == "POST"):
    if ((request.method == "POST") and request.environ['HTTP_ORIGIN'] == http_origin):
        received_data = request.form['data']
        json_data = json.loads(received_data)
        uuid_field = json_data['uuid']
        return_data = get_row(uuid_field)
        if (len(return_data)):
            return_response = Response(return_data, status=200, mimetype='application/json')
        else:
            return_response = Response('', status=200, mimetype='application/json')
        return (return_response)
    else:
        return ('Undone')

@app.route('/api/saveInputs', methods=["POST"])
def save_inputs():
    #if ((request.method == "POST")):
    if ((request.method == "POST") and request.environ['HTTP_ORIGIN'] == http_origin):
        data = request.form['data']
        json_data = json.loads(data)
        json_data['date'] = datetime.utcnow()
        #json_data['score_gen'] = True
        json_data['input_mod'] = True
        if (len(json_data['uuid'])==0):
            return ('Undone')
        res = update_inputs(json_data)
        if (res.modified_count == 1):
            return_response = Response(json.dumps({'status': 'success'}), status=200, mimetype='application/json')
            return (return_response)
    else:
        return ('Undone')

@app.route('/api/create', methods=["POST"])
def new_session():
    #if ((request.method == "POST")):
    if ((request.method == "POST") and request.environ['HTTP_ORIGIN'] == http_origin):
        data = request.form['data']
        json_data = json.loads(data)
        if 'recaptcha' in json_data:
            if (not verify_recaptcha(json_data['recaptcha'])):
                #print("Recaptcha validation failed")
                return_response = Response('recaptcha_failed', status=403, mimetype='application/text')
                return(return_response)

        else:
            #print("No recaptcha present in the input")
            return_response = Response('recaptcha_failed', status=403, mimetype='application/text')
            return(return_response)
        json_data['date'] = datetime.utcnow()
        json_data['score_gen'] = False
        new_uuid = 1
        json_data['uuid'] = str(get_uuid())
        insert_row(json_data, new_uuid)

        print(json_data['inputs']['emailAddr'])
        
        if ('emailAddr' in json_data['inputs']):
            email_sub = "Submission ID created for inputs to Covid Readiness Indicator"
            body1 = 'Dear user,\n\nThis is regarding the COVID-19 Workplace Readiness Indicator (covid.readiness.in). \n\nA new submission ID was created for the organisation "'
            body2 = '" with your email address as contact Email.\nIn case you have not submitted it, you may safely ignore and discard this email.\n\nThank you for your interest in the COVID-19 Readiness Indicator. Please note the new submission ID created as per your request:\n\n\t'
            body3 = '\n\nYou can resume your session (to update data or re-generate report) by entering the above submission ID. Kindly let us know if you face difficulty in using the tool.\nBest regards,\n\n- Covid-19 workplace readiness team\nEmail: contact.cni@iisc.ac.in \n'

            email_body = body1 + json_data['inputs']['cmpName'] + body2 + json_data['uuid'] + body3
            email_recipients = [json_data['inputs']['emailAddr']]
            send_gmails(email_recipients, email_sub, email_body)
            #gmail_send(email_recipient, email_sub, email_body)

        return_response = Response(json.dumps({'uuid': json_data['uuid']}), status=200, mimetype='application/json')
        return (return_response)
    else:
        return ('Undone')

@app.route('/api/feedbackSubmit', methods=["POST"])
def receive_feedback():
    #if ((request.method == "POST")):
    if ((request.method == "POST") and request.environ['HTTP_ORIGIN'] == http_origin):
        data = request.form['data']
        json_data = json.loads(data)
        #print(json_data)
        if 'recaptcha' in json_data:
            if (not verify_recaptcha(json_data['recaptcha'])):
                #print("Recaptcha validation failed")
                return_response = Response('recaptcha_failed', status=403, mimetype='application/text')
                return(return_response)

        else:
            #print("No recaptcha present in the input")
            return_response = Response('recaptcha_failed', status=403, mimetype='application/text')
            return(return_response)
        append_row_fb(json_data)
        if ('fbEmail' in json_data):
            email_sub = "Acknowledgement for feedback on Covid Readiness Indicator"
            email_body = "Dear " + json_data['fbName'] + ",\nThank you for your feedback.\n-COVID-19 Readiness Indicator team\n"
            email_recipient = json_data['fbEmail']
            gmail_send(email_recipient, email_sub, email_body)
            fb_body = 'Feedback received from ' + json_data['fbName'] + '\nEmail: '
            fb_body += json_data['fbEmail']
            fb_body += '\n\nFeedback text:\n\n'
            fb_body += json_data['fbText']
            self_sub = "Feedback on WRC received"
            gmail_send(admin_email, self_sub, fb_body)

        return_response = Response('Submitted feedback', status=200, mimetype='application/text')
        return (return_response)
    else:
        return ('Undone')

if __name__=="__main__":
    app.run(port=5000)
