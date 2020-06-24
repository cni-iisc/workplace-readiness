import smtplib, ssl
import os
from os.path import basename
from email.mime.application import MIMEApplication
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.utils import COMMASPACE, formatdate
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

def send_gmails(send_to, subject, body, files=None):
    assert isinstance(send_to, list)

    send_from = os.getenv("SENDER_EMAIL")
    spass = os.getenv("SENDER_PASSWORD")
    msg = MIMEMultipart()
    msg['From'] = send_from
    msg['To'] = COMMASPACE.join(send_to)
    msg['Date'] = formatdate(localtime=True)
    msg['Subject'] = subject

    msg.attach(MIMEText(body))

    for f in files or []:
        with open(f, "rb") as fil:
            part = MIMEApplication(
                fil.read(),
                Name=basename(f)
            )
        # After the file is closed
        part['Content-Disposition'] = 'attachment; filename="%s"' % basename(f)
        msg.attach(part)

    smtp_server = "smtp.gmail.com"
    port = 587  # For starttls
    message = "Subject: " + subject + "\n\n" + body
    context = ssl.create_default_context()
    smail = os.getenv("SENDER_EMAIL")
    spass = os.getenv("SENDER_PASSWORD")
    with smtplib.SMTP(smtp_server, port) as server:
        server.starttls(context=context) # Secure the connection
        server.login(smail, spass)
        server.sendmail(spass, send_to, msg.as_string())

    #smtp = smtplib.SMTP(server)
    #smtp.sendmail(send_from, send_to, msg.as_string())
    #smtp.close()
