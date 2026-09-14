"""저장한 출력의 조건 가리기와 관찰 집계. 모델을 호출하지 않는다."""

import hashlib
import json
import statistics
import sys
from pathlib import Path


directory = Path(sys.argv[2])


def read(name):
    return json.loads((directory / name).read_text())


def write(name, value):
    (directory / name).write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n")


rows = [json.loads(line) for line in (directory / "responses.jsonl").read_text().splitlines()]
manifest = read("manifest.json")
expected_ids = {job["id"] for job in manifest["jobs"]}
assert len(rows) == len(expected_ids)
assert {row["id"] for row in rows} == expected_ids
manifest_sha = hashlib.sha256((directory / "manifest.json").read_bytes()).hexdigest()
assert all(row["manifestSha256"] == manifest_sha for row in rows)
fixtures = {fixture["id"]: fixture for fixture in manifest["scenarios"]}

if sys.argv[1] == "mask":
    assert not (directory / "review.json").exists(), "관찰한 뒤 검토 번호를 다시 만들지 않는다."
    ordered = sorted(rows, key=lambda row: hashlib.sha256(("simple-review:" + row["id"]).encode()).hexdigest())
    masked = [{"reviewId": f"V{i + 1:03d}", "scenarioId": row["scenarioId"],
               "scene": row.get("answer", {}).get("scene"), "error": row.get("error")}
              for i, row in enumerate(ordered)]
    write("masked-scenes.json", masked)
    write("review-map.json", {item["reviewId"]: row["id"] for item, row in zip(masked, ordered)})
    (directory / "masked-dialogue.txt").write_text("\n".join(
        item["reviewId"] + " " + item["scenarioId"] + " | " + " | ".join(
            line["speaker"] + ": " + line["text"] for line in (item["scene"] or {}).get("dialogue", []))
        for item in masked) + "\n")
    (directory / "masked-endings.txt").write_text("\n".join(
        item["reviewId"] + " " + item["scenarioId"] + " | " + json.dumps(
            (item["scene"] or {}).get("ending"), ensure_ascii=False) for item in masked) + "\n")
    print(f"Masked {len(masked)} outputs")
elif sys.argv[1] == "summarize":
    review = read("review.json")
    mapping = read("review-map.json")
    assert set(review["reviewedIds"]) == set(mapping)
    notes = {mapping[note["reviewId"]]: note for note in review["observations"]}
    assert len(notes) == len(review["observations"])
    categories = ["wrong-person", "invented-schedule", "ambiguous-recipient", "missing-answer", "other-fact"]

    def aggregate(subset):
        answers = [row["answer"] for row in subset if "answer" in row]
        def issues(category):
            return [row["id"] for row in subset if category in notes.get(row["id"], {}).get("categories", [])]
        return {
            "n": len(subset),
            "requestErrors": [row["id"] for row in subset if row.get("error")],
            "mechanicalFailures": [row["id"] for row in subset if row.get("error") or row["problems"]],
            "issues": {category: issues(category) for category in categories},
            "scheduleErrors": [row["id"] for row in subset if any(category in notes.get(row["id"], {}).get("categories", []) for category in categories[:2])],
            "requiredAnswers": sum(bool(fixtures[row["scenarioId"]]["requiredMention"]) for row in subset),
            "correctEnding": sum("answer" in row and (row["answer"]["scene"]["ending"] or {}).get("kind") == fixtures[row["scenarioId"]]["expectedEnding"] for row in subset),
            "oneOrTwoUtterances": sum(1 <= len(answer["scene"]["dialogue"]) <= 2 for answer in answers),
            "costUsd": sum(answer["gatewayCostUsd"] for answer in answers if answer["gatewayCostUsd"] is not None),
            "missingCost": sum(answer["gatewayCostUsd"] is None for answer in answers),
            "medianFirstDialogueMs": statistics.median(answer["deltas"][0]["elapsedMs"] for answer in answers if answer["deltas"]) if answers else None,
            "medianElapsedMs": statistics.median(answer["elapsedMs"] for answer in answers) if answers else None,
        }

    summary = {"calls": len(rows), "manifestSha256": manifest_sha,
               "models": sorted({row.get("answer", {}).get("model", "error") for row in rows}),
               "variants": {variant: aggregate([row for row in rows if row["variant"] == variant]) for variant in ["before", "after"]},
               "byScenario": {scenario_id: {variant: aggregate([row for row in rows if row["scenarioId"] == scenario_id and row["variant"] == variant]) for variant in ["before", "after"]} for scenario_id in fixtures}}
    write("summary.json", summary)
    print(json.dumps({key: value for key, value in summary.items() if key != "byScenario"}, ensure_ascii=False, indent=2))
else:
    raise ValueError("Usage: analyze.py <mask|summarize> <data-directory>")
