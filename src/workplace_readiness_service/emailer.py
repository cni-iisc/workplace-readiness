from __future__ import annotations

import smtplib
import ssl
from datetime import datetime
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.utils import COMMASPACE, format_datetime
from zoneinfo import ZoneInfo

from workplace_readiness_service.config import Settings


class Mailer:
    def __init__(self, settings: Settings):
        self.settings = settings

    def send(self, recipients: list[str], subject: str, body: str) -> None:
        if not self.settings.email_enabled:
            return
        if not recipients or not self.settings.sender_email or not self.settings.sender_password:
            return

        msg = MIMEMultipart()
        msg["From"] = self.settings.sender_email
        msg["To"] = COMMASPACE.join(recipients)
        msg["Date"] = format_datetime(datetime.now(ZoneInfo("Asia/Kolkata")))
        msg["Subject"] = subject
        msg.attach(MIMEText(body))

        context = ssl.create_default_context()
        with smtplib.SMTP("smtp.gmail.com", 587) as server:
            server.starttls(context=context)
            server.login(self.settings.sender_email, self.settings.sender_password)
            server.sendmail(self.settings.sender_email, recipients, msg.as_string())

    def send_session_created(self, email: str, organisation: str, uuid_value: str) -> None:
        subject = "Submission ID created for inputs to Covid Readiness Indicator"
        body = (
            "Dear user,\n\n"
            "This is regarding the COVID-19 Workplace Readiness Indicator "
            '(covid.readiness.in).\n\nA new submission ID was created for the organisation "'
            f"{organisation}"
            '" with your email address as contact Email.\n'
            "In case you have not submitted it, you may safely ignore and discard this email.\n\n"
            "Thank you for your interest in the COVID-19 Readiness Indicator. Please note the "
            "new submission ID created as per your request:\n\n\t"
            f"{uuid_value}"
            "\n\nYou can resume your session (to update data or re-generate report) by entering "
            "the above submission ID. Kindly let us know if you face difficulty in using the "
            "tool.\nBest regards,\n\n- Covid-19 workplace readiness team\n"
            "Email: contact.cni@iisc.ac.in \n"
        )
        self.send([email], subject, body)

    def send_feedback_ack(self, name: str, email: str, text: str) -> None:
        self.send(
            [email],
            "Acknowledgement for feedback on Covid Readiness Indicator",
            f"Dear {name},\nThank you for your feedback.\n-COVID-19 Readiness Indicator team\n",
        )

        if self.settings.admin_email:
            self.send(
                [self.settings.admin_email],
                "Feedback on WRC received",
                f"Feedback received from {name}\nEmail: {email}\n\nFeedback text:\n\n{text}",
            )
