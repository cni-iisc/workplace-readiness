from __future__ import annotations

import json
from typing import Any

from workplace_readiness_service.app import create_app
from workplace_readiness_service.config import Settings


class FakeStore:
    def __init__(self) -> None:
        self.rows: dict[str, dict[str, Any]] = {}
        self.feedback: list[dict[str, Any]] = []

    def close(self) -> None:
        return None

    def create_submission(self, data: dict[str, Any]) -> str:
        self.rows["new-uuid"] = {**data, "uuid": "new-uuid", "score_gen": False}
        return "new-uuid"

    def retrieve_inputs_json(self, uuid_value: str) -> str:
        row = self.rows.get(uuid_value)
        if not row:
            return "[]"
        return json.dumps(
            [{"uuid": uuid_value, "inputs": row["inputs"], "score_gen": row["score_gen"]}]
        )

    def save_inputs(self, uuid_value: str, inputs: dict[str, Any]) -> bool:
        if uuid_value not in self.rows:
            return False
        self.rows[uuid_value]["inputs"] = inputs
        self.rows[uuid_value]["input_mod"] = True
        return True

    def upsert_scored_submission(self, data: dict[str, Any]) -> str:
        uuid_value = data.get("uuid") or "scored-uuid"
        self.rows[uuid_value] = {**data, "uuid": uuid_value, "score_gen": True}
        return uuid_value

    def visitor_stats(self, establishment_type: int, score: int) -> tuple[int, int, float]:
        return len(self.rows), 1, -1.0

    def append_feedback(self, data: dict[str, Any]) -> None:
        self.feedback.append(data)


class FakeMailer:
    def __init__(self) -> None:
        self.session_emails: list[tuple[str, str, str]] = []
        self.feedback_emails: list[tuple[str, str, str]] = []

    def send_session_created(self, email: str, organisation: str, uuid_value: str) -> None:
        self.session_emails.append((email, organisation, uuid_value))

    def send_feedback_ack(self, name: str, email: str, text: str) -> None:
        self.feedback_emails.append((name, email, text))


class FakeRecaptcha:
    def verify(self, token: str | None) -> bool:
        return token == "ok"


def make_client() -> tuple[Any, FakeStore, FakeMailer]:
    store = FakeStore()
    mailer = FakeMailer()
    app = create_app(
        Settings(
            HTTP_ORIGIN="https://covid.readiness.in",
            RECAPTCHA_ENABLED=True,
            EMAIL_ENABLED=False,
        ),
        store=store,  # type: ignore[arg-type]
        mailer=mailer,  # type: ignore[arg-type]
        recaptcha=FakeRecaptcha(),  # type: ignore[arg-type]
    )
    app.testing = True
    return app.test_client(), store, mailer


def post_data(client: Any, path: str, payload: dict[str, Any]) -> Any:
    return client.post(
        path,
        data={"data": json.dumps(payload)},
        headers={"Origin": "https://covid.readiness.in"},
    )


def test_create_session_returns_uuid_and_sends_email() -> None:
    client, store, mailer = make_client()

    response = post_data(
        client,
        "/api/create",
        {
            "uuid": "",
            "inputs": {"cmpName": "ACME", "emailAddr": "ops@example.com"},
            "recaptcha": "ok",
        },
    )

    assert response.status_code == 200
    assert response.get_json() == {"uuid": "new-uuid"}
    assert store.rows["new-uuid"]["inputs"]["cmpName"] == "ACME"
    assert mailer.session_emails == [("ops@example.com", "ACME", "new-uuid")]


def test_retrieve_returns_legacy_json_array() -> None:
    client, store, _ = make_client()
    store.rows["new-uuid"] = {"uuid": "new-uuid", "inputs": {"NOE": 1}, "score_gen": False}

    response = post_data(client, "/api/retrieve", {"uuid": "new-uuid"})

    assert response.status_code == 200
    assert response.get_json() == [{"uuid": "new-uuid", "inputs": {"NOE": 1}, "score_gen": False}]


def test_save_inputs_updates_existing_session() -> None:
    client, store, _ = make_client()
    store.rows["new-uuid"] = {"uuid": "new-uuid", "inputs": {"NOE": 1}, "score_gen": False}

    response = post_data(client, "/api/saveInputs", {"uuid": "new-uuid", "inputs": {"NOE": 2}})

    assert response.status_code == 200
    assert response.get_json() == {"status": "success"}
    assert store.rows["new-uuid"]["inputs"] == {"NOE": 2}


def test_update_scores_preserves_legacy_counters() -> None:
    client, store, _ = make_client()

    response = post_data(
        client,
        "/api/update",
        {
            "uuid": "",
            "inputs": {"NOE": 1},
            "outputs": {"Total": 750},
            "suggestions": {},
            "recaptcha": "ok",
        },
    )

    assert response.status_code == 200
    assert response.get_json() == {
        "uuid": "scored-uuid",
        "percentile": "-1",
        "vis_counter": 1,
        "week_counter": 1,
    }
    assert store.rows["scored-uuid"]["score_gen"] is True


def test_feedback_submit_stores_feedback() -> None:
    client, store, mailer = make_client()

    response = post_data(
        client,
        "/api/feedbackSubmit",
        {"fbName": "User", "fbEmail": "user@example.com", "fbText": "Thanks", "recaptcha": "ok"},
    )

    assert response.status_code == 200
    assert response.get_data(as_text=True) == "Submitted feedback"
    assert store.feedback[0]["fbText"] == "Thanks"
    assert mailer.feedback_emails == [("User", "user@example.com", "Thanks")]


def test_origin_is_required_when_configured() -> None:
    client, _, _ = make_client()

    response = client.post(
        "/api/retrieve",
        data={"data": json.dumps({"uuid": "new-uuid"})},
        headers={"Origin": "https://example.invalid"},
    )

    assert response.status_code == 200
    assert response.get_data(as_text=True) == "Undone"


def test_client_config_reflects_recaptcha_settings() -> None:
    app = create_app(
        Settings(
            HTTP_ORIGIN="",
            RECAPTCHA_ENABLED=False,
            RECAPTCHA_SITE_KEY="staging-key",
            EMAIL_ENABLED=False,
        ),
        store=FakeStore(),  # type: ignore[arg-type]
        mailer=FakeMailer(),  # type: ignore[arg-type]
        recaptcha=FakeRecaptcha(),  # type: ignore[arg-type]
    )
    app.testing = True

    response = app.test_client().get("/api/client-config.js")

    assert response.status_code == 200
    assert "recaptchaEnabled" in response.get_data(as_text=True)
    assert "false" in response.get_data(as_text=True)
    assert "staging-key" in response.get_data(as_text=True)
