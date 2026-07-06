from functools import lru_cache

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    sender_email: str = Field(default="", alias="SENDER_EMAIL")
    sender_password: str = Field(default="", alias="SENDER_PASSWORD")
    captcha_private: str = Field(default="", alias="CAPTCHA_PRIVATE")
    recaptcha_site_key: str = Field(default="", alias="RECAPTCHA_SITE_KEY")
    db_json: str = Field(default="production_db", alias="DB_JSON")
    db_feedback: str = Field(default="production_fb_db", alias="DB_FEEDBACK")
    http_origin: str = Field(default="", alias="HTTP_ORIGIN")
    admin_email: str = Field(default="", alias="ADMIN_EMAIL")
    report_recipients: str = Field(default="", alias="REPORT_RECIPIENTS")
    mongo_uri: str = Field(default="mongodb://localhost:27017", alias="MONGO_URI")
    static_root: str = Field(default="", alias="STATIC_ROOT")
    recaptcha_enabled: bool = Field(default=True, alias="RECAPTCHA_ENABLED")
    email_enabled: bool = Field(default=True, alias="EMAIL_ENABLED")

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
        populate_by_name=True,
    )


@lru_cache
def get_settings() -> Settings:
    return Settings()
