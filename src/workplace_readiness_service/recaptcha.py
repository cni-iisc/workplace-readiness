from __future__ import annotations

import requests

from workplace_readiness_service.config import Settings


class RecaptchaVerifier:
    verify_url = "https://www.google.com/recaptcha/api/siteverify"

    def __init__(self, settings: Settings):
        self.settings = settings

    def verify(self, token: str | None) -> bool:
        if not self.settings.recaptcha_enabled:
            return True
        if not token or not self.settings.captcha_private:
            return False

        response = requests.post(
            self.verify_url,
            data={"secret": self.settings.captcha_private, "response": token},
            timeout=10,
        )
        response.raise_for_status()
        return bool(response.json().get("success"))

