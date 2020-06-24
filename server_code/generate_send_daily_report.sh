#!/bin/sh

cd /home/ubuntu/covid_19_wrc/wrc_web/workplace-readiness/server_code/
# Run analytics queries...
echo "Running analytics queries"
python3 analytics_queries.py

# Generate the report pptx...
echo "Generating the report pptx"
python3 pptx_code.py

# Send the daily report via email...
echo "Sending the daily report via email"
python3 daily_report.py
echo "Success!"
