from __future__ import annotations

from datetime import UTC, datetime, timedelta
from typing import Any
from uuid import uuid4

from bson.json_util import dumps
from pymongo import ASCENDING, MongoClient
from pymongo.collection import Collection

from workplace_readiness_service.config import Settings


class MongoStore:
    def __init__(self, settings: Settings):
        self.settings = settings
        self.client: MongoClient = MongoClient(settings.mongo_uri)
        self.json_logs.create_index([("uuid", ASCENDING)], name="uuid_1")

    @property
    def json_logs(self) -> Collection:
        return self.client[self.settings.db_json]["json_logs"]

    @property
    def feedback_logs(self) -> Collection:
        return self.client[self.settings.db_feedback]["fb_logs"]

    def close(self) -> None:
        self.client.close()

    def new_uuid(self) -> str:
        while True:
            candidate = str(uuid4())
            if self.json_logs.count_documents({"uuid": candidate}, limit=1) == 0:
                return candidate

    def create_submission(self, data: dict[str, Any]) -> str:
        data = dict(data)
        data["uuid"] = self.new_uuid()
        data["date"] = utcnow()
        data["score_gen"] = False
        self.json_logs.insert_one(data)
        return data["uuid"]

    def upsert_scored_submission(self, data: dict[str, Any]) -> str:
        data = dict(data)
        uuid_value = data.get("uuid") or self.new_uuid()
        data["uuid"] = uuid_value
        data["date"] = utcnow()
        data["score_gen"] = True
        data["input_mod"] = False

        if self.json_logs.count_documents({"uuid": uuid_value}, limit=1):
            self.json_logs.replace_one({"uuid": uuid_value}, data)
        else:
            self.json_logs.insert_one(data)

        return uuid_value

    def save_inputs(self, uuid_value: str, inputs: dict[str, Any]) -> bool:
        result = self.json_logs.update_one(
            {"uuid": uuid_value},
            {"$set": {"inputs": inputs, "date": utcnow(), "input_mod": True}},
        )
        return result.modified_count == 1

    def retrieve_inputs_json(self, uuid_value: str) -> str:
        records = (
            self.json_logs.find(
                {"uuid": uuid_value},
                {"_id": 0, "outputs": 0, "suggestions": 0, "date": 0},
            )
            .sort([("$natural", -1)])
            .limit(1)
        )
        return dumps(records)

    def append_feedback(self, data: dict[str, Any]) -> None:
        self.feedback_logs.insert_one(dict(data))

    def visitor_stats(self, establishment_type: int, score: int) -> tuple[int, int, float]:
        week_start = datetime.now(UTC).replace(hour=0, minute=0, second=1, microsecond=0)
        week_start = week_start - timedelta(days=7)

        total_count = 0
        week_count = 0
        matching_scores: list[int] = []

        for row in self.json_logs.find({}):
            total_count += 1
            object_id = row.get("_id")
            generated_at = getattr(object_id, "generation_time", None)
            if generated_at and generated_at > week_start:
                week_count += 1

            if row.get("inputs", {}).get("NOE") == establishment_type:
                total = row.get("outputs", {}).get("Total")
                if isinstance(total, int | float):
                    matching_scores.append(int(total))

        percentile = -1.0
        if len(matching_scores) > 50 and score in matching_scores:
            at_or_below = sum(1 for existing_score in matching_scores if existing_score <= score)
            percentile = 100 * at_or_below / len(matching_scores)

        return total_count, week_count, percentile


def utcnow() -> datetime:
    return datetime.now(UTC).replace(tzinfo=None)

