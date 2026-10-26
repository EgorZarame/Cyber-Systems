from app.levels import LEVELS
from app.model import LABELS, build_dataset, features, label_by_rules
from app.planner import shortest_plan
from app.simulator import simulate


def test_dataset_has_every_class():
    _, y = build_dataset(per_level=400)
    assert set(y.tolist()) == set(range(len(LABELS)))


def test_model_is_accurate_on_held_out_data(classifier):
    assert classifier.accuracy > 0.95


def test_rule_labels():
    level = LEVELS["1.1"]
    assert label_by_rules(level, simulate(level, [])) == "empty"
    assert label_by_rules(level, simulate(level, ["move"] * 7)) == "solved"
    assert label_by_rules(level, simulate(level, ["move"] * 3)) == "stopped_short"
    assert label_by_rules(level, simulate(level, ["move"] * 9)) == "overshot"
    assert label_by_rules(level, simulate(level, ["left", "left", "move"])) == "wrong_way"
    assert label_by_rules(level, simulate(level, ["left"] * 1 + ["move"] * 5 + ["move"] * 5)) == "blocked"


def test_model_agrees_with_rules_on_typical_attempts(classifier):
    level = LEVELS["1.2"]
    full = shortest_plan(level, *level.start, "east")
    attempts = [full, full[:-2], full + ["move"] * 3, ["move"] * 5, []]
    for program in attempts:
        sim = simulate(level, program)
        verdict, confidence = classifier.predict(level, sim)
        assert verdict == label_by_rules(level, sim)
        assert 0.0 <= confidence <= 1.0


def test_feature_vector_has_stable_size():
    level = LEVELS["1.1"]
    assert len(features(level, simulate(level, ["move"]))) == 14
