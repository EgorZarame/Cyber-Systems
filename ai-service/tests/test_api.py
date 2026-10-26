import pytest
from fastapi.testclient import TestClient

from app.main import create_app
from app.planner import shortest_plan
from app.levels import LEVELS


@pytest.fixture()
def client(classifier, monkeypatch):
    monkeypatch.delenv("INTERNAL_TOKEN", raising=False)
    return TestClient(create_app(classifier))


def hint(client, level, program, attempts=1, **kw):
    return client.post("/internal/hint", json={"levelId": level, "program": program, "attempts": attempts}, **kw)


def test_health_lists_levels(client):
    body = client.get("/health").json()
    assert body["status"] == "ok"
    assert "1.2" in body["levels"]
    assert body["modelAccuracy"] > 0.95


def test_solved_program(client):
    r = hint(client, "1.1", ["move"] * 7)
    body = r.json()
    assert r.status_code == 200
    assert body["verdict"] == "solved"
    assert body["stats"]["distanceToFinish"] == 0


def test_solved_but_longer_than_needed_gets_a_tip(client):
    plan = shortest_plan(LEVELS["1.1"], 1, 3, "east")
    r = hint(client, "1.1", plan[:3] + ["left", "right"] + plan[3:])
    assert r.json()["verdict"] == "solved"
    assert "короче" in r.json()["hint"]


def test_empty_program(client):
    body = hint(client, "1.1", []).json()
    assert body["verdict"] == "empty"


def test_blocked_program_mentions_the_cell(client):
    body = hint(client, "1.2", ["move", "move", "move"]).json()
    assert body["verdict"] == "blocked"
    assert "(2, 1)" in body["hint"]


def test_overshoot(client):
    body = hint(client, "1.1", ["move"] * 9).json()
    assert body["verdict"] == "overshot"


def test_detail_grows_with_attempts(client):
    program = ["move", "move", "move"]
    first = hint(client, "1.2", program, attempts=1).json()
    third = hint(client, "1.2", program, attempts=3).json()
    late = hint(client, "1.2", program, attempts=8).json()
    assert (first["detailLevel"], third["detailLevel"], late["detailLevel"]) == (1, 2, 3)
    assert first["nextSteps"] == []
    assert third["nextSteps"]
    assert len(late["hint"]) > len(third["hint"]) > len(first["hint"])


def test_loops_are_supported(client):
    program = [{"type": "loop", "count": 7, "body": ["move"]}]
    assert hint(client, "1.1", program).json()["verdict"] == "solved"


def test_unsupported_level(client):
    body = hint(client, "3.1", ["move"]).json()
    assert body["supported"] is False
    assert body["verdict"] == "unsupported"


def test_invalid_input_is_rejected(client):
    assert hint(client, "1.1", ["jump"]).status_code == 422
    assert hint(client, "1.1", [{"type": "loop", "count": 0, "body": ["move"]}]).status_code == 422
    assert client.post("/internal/hint", json={"program": []}).status_code == 422


def test_program_that_expands_too_far_gives_422(client):
    program = [{"type": "loop", "count": 10, "body": ["move"] * 50}] * 2
    assert hint(client, "1.1", program).status_code == 422


def test_token_is_required_when_configured(classifier, monkeypatch):
    monkeypatch.setenv("INTERNAL_TOKEN", "secret-token")
    client = TestClient(create_app(classifier))
    assert hint(client, "1.1", ["move"]).status_code == 401
    assert hint(client, "1.1", ["move"], headers={"X-Internal-Token": "wrong"}).status_code == 401
    assert hint(client, "1.1", ["move"], headers={"X-Internal-Token": "secret-token"}).status_code == 200
    assert client.get("/health").status_code == 200


def test_wrong_way_hint_names_the_side_of_finish(client):
    body = hint(client, "1.1", ["left", "left", "move"]).json()
    assert body["verdict"] == "wrong_way"
    assert "правее" in body["hint"]


def test_stopped_short_hint_counts_cells(client):
    body = hint(client, "1.1", ["move"] * 3).json()
    assert body["verdict"] == "stopped_short"
    assert "до финиша ещё 4" in body["hint"]


def test_plan_steps_are_readable(client):
    body = hint(client, "1.2", ["move", "move", "move"], attempts=4).json()
    assert any("повернуть" in step for step in body["nextSteps"])
    assert any("раз" in step for step in body["nextSteps"])


def test_russian_plural_in_steps():
    from app.hints import times
    assert [times(n) for n in (2, 5, 11, 12, 21, 24)] == ["2 раза", "5 раз", "11 раз", "12 раз", "21 раз", "24 раза"]
