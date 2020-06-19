# COVID-19 Readiness Indicator

## About

The very first priority of any organisation during a  pandemic is the safety and well-being of its workforce. Organisations  must assess whether their employees are safe, followed by whether  they are available to perform critical functions. It is important for  organisations to be able to monitor the situation, provide a safe  workplace and offer their employees the support that they need. This  readiness indicator will enable organisations to understand their  current level of preparedness and key risk areas. It also helps in  planning and in establishing pandemic-specific policies, procedures, and  necessary management practices. From a pandemic planning perspective, organisations could pay closer attention to the geographical concentration of critical activities and functions, and  their segmentation for  work transfer to alternate locations, sites and shifts.  Organisations must create requisite capabilities, practice relevant  standard operating procedures and conduct brief pandemic training  with employees to enhance employee and organisational preparedness to  respond  effectively to COVID-19 pandemic.               

To help organisations and agents navigate this difficult  environment, the COVID 19 Workplace Readiness Calculator provides not  only a quantitative readiness score but also suggestions on  measures so that they could relaunch economic activities in a safe and  compliant manner.            

Organisations have the power to decide for themselves how best to maximise their productivity, given the advertised  epidemic-readiness threshold. Further, it also gives the social planner a  means to respond to an emergency or a waning public health threat, by  adaptively raising or lowering the threshold readiness level.                

There are ten specific readiness indices, one for each  sub-heading. Some of these are weighted combinations of  various precautions and awareness actions taken by firms. Others are roughly proportional to the doubling rate of a hypothetical infection, if contacts were to take place at rates  deduced from the input data.

## Software for the Readiness Indicator

The software tool is comprised of two parts: 

1. the static website (including the client-side javascript code) that takes care of rendering the questionnaire, user input validation, and readiness score calculation. The files for these are kept in the top-level directory of this repository. The tool can work stand-alone without the server-side component (although with limited functionality).
2. the server-side code that implements the REST API for storing the submitted inputs in a database and retrieving a specific user submission based on a unique session key.

### Instructions for hosting the Readiness Indicator

#### Prerequisites

1. An HTTP server capable of hosting static web-pages. The web-server should also support forwarding a sub-path to a WSGI application. You may also choose to serve static files directly from the WSGI HTTP server (item 2 below); you may need to address the load and security concerns (SSL certificates, domain restrictions, etc.) while choosing the HTTP server. It's recommended to limit the HTTP traffic to SSL/TLS only, because user information is transferred over the REST API. In that case, you need to configure your HTTP/WSGI for SSL/TLS.
2. A WSGI server that implements the REST API. We chose to use Gunicorn (https://gunicorn.org/) for this purpose.
3. Python-3 with flask WSGI package installed, to run the server-side scripts
4. MongoDB installation for storing the saved sessions. MongoDB should be secured through appropriate access control mechanism.

#### Instructions

Clone this repository into a directory from which you wish to serve the files through an HTTP server. An easy way to try out the basic functionality of the tool is by running the below command in the repo root directory:

On Windows: `python -m http.server 8000`. On Linux:   `python -m SimpleHTTPServer 8000`

This will serve the tool files via a webserver on port 8000. The port  number can changed to any available port number. Once the web-server is running, you can open your web browser and access `localhost:8000` or `127.0.0.1:8000` to access the tool.

If you are interested in the server-side functionality as well:

1. Configure the HTTP server to direct the queries to the WSGI server for REST API under /api path
2. If using Gunicorn, configure Gunicorn to run the app defined in server_code/wsgi.py
3. Configure HTTP server, Gunicorn, and MongoDB to run on system startup

The steps laid below are for one such reference implementation on AWS EC2 running Ubuntu 18.04 LTS. 

### Setting up gunicorn server

1. Install Gunicorn server with the command: `pip3 install gunicorn`
2. Create a gunicorn_server.service file in `/etc/systemd/system/` folder. One such file is present in config folder of this repository. 
3. Fill in the necessary fields, namely WorkingDirectory and ExecStart. WorkingDirectory requires absolute path to the server code. ExecStart requires the absolute path to gunicorn executable.
4. Number of subworkers can also be configured in the service file. The default number is configured as 3.  

### Setting up nginx
1. Install nginx with `sudo apt install nginx`
2. Create a website specific nginx configuration file in `/etc/nginx/sites-available/` folder. One such file is present in config folder of this repository. 
3. Fill in the necessary field, namely server_name, ssl_certificate, ssl_certificate_key, root and proxy_pass. server_name requires website address, ssl_certificate requires fullchain.pem file location, ssl_certificate_key requires privkey.pem file location, root requires location of the static files to be served on server_name and proxy_pass requires the location of the gunicorn server.
4. Create a sumbolic link to sites-enable folder with the following command: `sudo ln -s /etc/nginx/sites-available/example.com /etc/nginx/sites-enabled/`
5. This configuration makes the nginx accept requests only on http and https. It will also enforce all http requests to https requests.

### Additional steps
1. One needs to configure the DNS entries to forward the request received on the website address to our server.
2. The reference implementation reads fields from SAMPLE_ENV file while running the serve code. Fields like SENDER_EMAIL, SENDER_PASSWORD, CAPTCHA_PRIVATE, DB_JSON, DB_FEEDBACK, HTTP_ORIGIN can be configured in this file. Once this field are configured we can start running our services.
3. Start mongoDB: `sudo systemctl start mongod`
4. Start gunicorn server: `sudo systemctl start gunicorn_server`
5. Start nginx: `sudo systemctl start nginx`
6. Verify everything is working correctly and then make these processes autostart on startup with the same step, except replacing `start` with `enable`, as 3, 4 and 5.

## Copyright and License
Copyright [2020] [Indian Institute of Science, Bangalore]
SPDX-License-Identifier: Apache-2.0
