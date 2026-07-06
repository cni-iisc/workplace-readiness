from __future__ import annotations

import json
from pathlib import Path
from typing import Any

from flask import Flask, Response, jsonify, request
from flask_cors import CORS

from workplace_readiness_service.config import Settings, get_settings
from workplace_readiness_service.database import MongoStore
from workplace_readiness_service.emailer import Mailer
from workplace_readiness_service.recaptcha import RecaptchaVerifier


def create_app(
    settings: Settings | None = None,
    store: MongoStore | None = None,
    mailer: Mailer | None = None,
    recaptcha: RecaptchaVerifier | None = None,
) -> Flask:
    settings = settings or get_settings()
    app = Flask(__name__, static_folder=str(resolve_static_folder(settings)), static_url_path="")
    app.config["SETTINGS"] = settings

    CORS(app, origins=[settings.http_origin] if settings.http_origin else "*")

    store = store or MongoStore(settings)
    mailer = mailer or Mailer(settings)
    recaptcha = recaptcha or RecaptchaVerifier(settings)

    app.extensions["wrc_store"] = store
    app.extensions["wrc_mailer"] = mailer
    app.extensions["wrc_recaptcha"] = recaptcha

    @app.get("/health")
    def health() -> dict[str, str]:
        return {"status": "ok"}

    @app.get("/")
    def index() -> Any:
        return app.send_static_file("index.html")

    @app.post("/api/create")
    def create_session() -> Response:
        if not allowed_origin(settings):
            return undone()
        data = parse_legacy_payload()
        if not verify_recaptcha(data, recaptcha):
            return recaptcha_failed()

        uuid_value = store.create_submission(data)
        inputs = data.get("inputs", {})
        email = inputs.get("emailAddr")
        if email:
            mailer.send_session_created(email, inputs.get("cmpName", ""), uuid_value)

        return json_response({"uuid": uuid_value})

    @app.post("/api/retrieve")
    def retrieve_session() -> Response:
        if not allowed_origin(settings):
            return undone()
        data = parse_legacy_payload()
        return Response(
            store.retrieve_inputs_json(data.get("uuid", "")),
            status=200,
            mimetype="application/json",
        )

    @app.post("/api/saveInputs")
    def save_inputs() -> Response:
        if not allowed_origin(settings):
            return undone()
        data = parse_legacy_payload()
        uuid_value = data.get("uuid", "")
        if not uuid_value:
            return undone()
        if store.save_inputs(uuid_value, data.get("inputs", {})):
            return json_response({"status": "success"})
        return undone()

    @app.post("/api/update")
    def update_scores() -> Response:
        if not allowed_origin(settings):
            return undone()
        data = parse_legacy_payload()
        if not verify_recaptcha(data, recaptcha):
            return recaptcha_failed()

        uuid_value = store.upsert_scored_submission(data)
        inputs = data.get("inputs", {})
        outputs = data.get("outputs", {})
        total = int(outputs.get("Total", 0))
        establishment_type = int(inputs.get("NOE", 0))
        visitor_count, week_count, percentile = store.visitor_stats(establishment_type, total)

        return json_response(
            {
                "uuid": uuid_value,
                "percentile": f"{percentile:.2g}",
                "vis_counter": visitor_count,
                "week_counter": week_count,
            }
        )

    @app.post("/api/feedbackSubmit")
    def feedback_submit() -> Response:
        if not allowed_origin(settings):
            return undone()
        data = parse_legacy_payload()
        if not verify_recaptcha(data, recaptcha):
            return recaptcha_failed()

        store.append_feedback(data)
        if data.get("fbEmail"):
            mailer.send_feedback_ack(
                data.get("fbName", ""),
                data.get("fbEmail", ""),
                data.get("fbText", ""),
            )
        return Response("Submitted feedback", status=200, mimetype="application/text")

    return app


def allowed_origin(settings: Settings) -> bool:
    if not settings.http_origin:
        return True
    return request.headers.get("Origin") == settings.http_origin


def parse_legacy_payload() -> dict[str, Any]:
    if "data" in request.form:
        return json.loads(request.form["data"])
    if request.is_json:
        return request.get_json() or {}
    raw_data = request.get_data(as_text=True)
    if raw_data.startswith("data="):
        return json.loads(raw_data[5:])
    return {}


def verify_recaptcha(data: dict[str, Any], verifier: RecaptchaVerifier) -> bool:
    return verifier.verify(data.get("recaptcha"))


def recaptcha_failed() -> Response:
    return Response("recaptcha_failed", status=403, mimetype="application/text")


def undone() -> Response:
    return Response("Undone", status=200, mimetype="application/text")


def json_response(data: dict[str, Any]) -> Response:
    return jsonify(data)


def resolve_static_folder(settings: Settings) -> Path:
    if settings.static_root:
        return Path(settings.static_root).expanduser().resolve()

    candidates = [
        Path.cwd() / "web_files",
        Path.cwd().parent / "web_files",
        Path(__file__).resolve().parents[2] / "web_files",
    ]
    for candidate in candidates:
        if candidate.is_dir():
            return candidate

    return candidates[0]
