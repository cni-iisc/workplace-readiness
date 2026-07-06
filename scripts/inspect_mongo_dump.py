#!/usr/bin/env python3
from __future__ import annotations

import argparse
from collections import Counter
from pathlib import Path
from typing import Any

from bson import decode_file_iter


def main() -> None:
    parser = argparse.ArgumentParser(description="Summarize legacy MongoDB BSON dumps.")
    parser.add_argument("json_logs_bson", type=Path)
    parser.add_argument("feedback_bson", type=Path)
    args = parser.parse_args()

    print("json_logs")
    summarize_json_logs(args.json_logs_bson)
    print()
    print("fb_logs")
    summarize_feedback(args.feedback_bson)


def summarize_json_logs(path: Path) -> None:
    top_level_keys: Counter[str] = Counter()
    input_keys: Counter[str] = Counter()
    output_keys: Counter[str] = Counter()
    suggestion_keys: Counter[str] = Counter()
    score_gen: Counter[str] = Counter()
    input_mod: Counter[str] = Counter()
    total = 0

    with path.open("rb") as handle:
        for row in decode_file_iter(handle):
            total += 1
            top_level_keys.update(row.keys())
            update_nested_keys(input_keys, row.get("inputs"))
            update_nested_keys(output_keys, row.get("outputs"))
            update_nested_keys(suggestion_keys, row.get("suggestions"))
            score_gen.update([str(row.get("score_gen", "<missing>"))])
            input_mod.update([str(row.get("input_mod", "<missing>"))])

    print(f"  documents: {total}")
    print_counter("  top-level keys", top_level_keys)
    print_counter("  score_gen", score_gen)
    print_counter("  input_mod", input_mod)
    print_counter("  inputs", input_keys)
    print_counter("  outputs", output_keys)
    print_counter("  suggestions", suggestion_keys)


def summarize_feedback(path: Path) -> None:
    top_level_keys: Counter[str] = Counter()
    total = 0
    with path.open("rb") as handle:
        for row in decode_file_iter(handle):
            total += 1
            top_level_keys.update(row.keys())

    print(f"  documents: {total}")
    print_counter("  top-level keys", top_level_keys)


def update_nested_keys(counter: Counter[str], value: Any) -> None:
    if isinstance(value, dict):
        counter.update(value.keys())


def print_counter(label: str, counter: Counter[str]) -> None:
    print(f"{label}:")
    for key, count in sorted(counter.items()):
        print(f"    {key}: {count}")


if __name__ == "__main__":
    main()

