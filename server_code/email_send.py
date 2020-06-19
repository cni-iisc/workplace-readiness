import smtplib, ssl
import os
from dotenv import load_dotenv
load_dotenv()

def gmail_send(receiver_email, subject, body):
    smtp_server = "smtp.gmail.com"
    port = 587  # For starttls
    message = "Subject: " + subject + "\n\n" + body
    context = ssl.create_default_context()
    smail = os.getenv("SENDER_EMAIL")
    spass = os.getenv("SENDER_PASSWORD")
    with smtplib.SMTP(smtp_server, port) as server:
        server.starttls(context=context) # Secure the connection
        server.login(smail, spass)
        server.sendmail(spass, receiver_email, message)

