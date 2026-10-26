"""Небольшая нейросеть, которая по признакам попытки определяет тип ошибки игрока.

Обучающих данных от настоящих игроков пока нет, поэтому набор генерируется: случайные и слегка
испорченные правильные программы прогоняются через симулятор. Метки ставит проверка по правилам
(label_by_rules), сеть учится различать их по признакам. Фактические данные для подсказки (клетка,
столкновения, расстояние) всё равно берутся из симулятора, сеть решает только, какой совет дать.
"""
import random

import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.neural_network import MLPClassifier

from .levels import LEVELS, Level
from .planner import shortest_plan
from .simulator import STEP, SimResult, manhattan, simulate

LABELS = ["solved", "empty", "blocked", "overshot", "wrong_way", "stopped_short"]
DIRECTIONS = ["north", "east", "south", "west"]


def label_by_rules(level: Level, sim: SimResult) -> str:
    if sim.actions == 0:
        return "empty"
    if sim.position == level.finish:
        return "solved"
    if sim.passed_finish:
        return "overshot"
    if sim.collisions > 0:
        return "blocked"
    if manhattan(sim.position, level.finish) > manhattan(level.start, level.finish):
        return "wrong_way"
    return "stopped_short"


def features(level: Level, sim: SimResult) -> list:
    diag = level.width + level.height
    dist = manhattan(sim.position, level.finish)
    fx, fy = level.finish[0] - sim.x, level.finish[1] - sim.y
    dx, dy = STEP[sim.direction]
    norm = (fx * fx + fy * fy) ** 0.5
    facing = (fx * dx + fy * dy) / norm if norm else 0.0
    return [
        dist / diag,
        sim.min_distance / diag,
        manhattan(level.start, level.finish) / diag,
        min(sim.collisions, 5) / 5,
        min(sim.moves, 30) / 30,
        min(sim.turns, 15) / 15,
        min(sim.actions, 40) / 40,
        1.0 if sim.passed_finish else 0.0,
        1.0 if sim.actions == 0 else 0.0,
        facing,
        *[1.0 if sim.direction == d else 0.0 for d in DIRECTIONS],
    ]


def _random_program(rng: random.Random):
    length = rng.randint(0, 28)
    program = []
    for _ in range(length):
        r = rng.random()
        if r < 0.62:
            program.append("move")
        elif r < 0.81:
            program.append("left")
        else:
            program.append("right")
    return program


def _damaged_solution(level: Level, rng: random.Random):
    plan = shortest_plan(level, *level.start, "east") or []
    program = list(plan)
    for _ in range(rng.randint(0, 3)):
        if not program:
            break
        kind = rng.choice(["drop", "add", "swap"])
        i = rng.randrange(len(program))
        if kind == "drop":
            program.pop(i)
        elif kind == "add":
            program.insert(i, rng.choice(["move", "move", "left", "right"]))
        else:
            program[i] = rng.choice(["move", "left", "right"])
    return program


def _overshoot(level: Level, rng: random.Random):
    plan = shortest_plan(level, *level.start, "east") or []
    return plan + ["move"] * rng.randint(1, 4)


def _wrong_way(rng: random.Random):
    turn = rng.choice([["left", "left"], ["right", "right"], ["left"], ["right"]])
    return turn + ["move"] * rng.randint(1, 6)


def build_dataset(seed: int = 7, per_level: int = 3000):
    rng = random.Random(seed)
    xs, ys = [], []
    for level in LEVELS.values():
        for i in range(per_level):
            kind = i % 4
            if kind == 0:
                program = _random_program(rng)
            elif kind == 1:
                program = _damaged_solution(level, rng)
            elif kind == 2:
                program = _overshoot(level, rng)
            else:
                program = _wrong_way(rng)
            sim = simulate(level, program)
            xs.append(features(level, sim))
            ys.append(LABELS.index(label_by_rules(level, sim)))
    return np.array(xs), np.array(ys)


class ErrorClassifier:
    def __init__(self, seed: int = 7):
        self.net = MLPClassifier(hidden_layer_sizes=(24, 12), max_iter=600, random_state=seed)
        self.accuracy = 0.0

    def train(self, seed: int = 7):
        x, y = build_dataset(seed)
        x_train, x_test, y_train, y_test = train_test_split(x, y, test_size=0.2, random_state=seed)
        self.net.fit(x_train, y_train)
        self.accuracy = float(self.net.score(x_test, y_test))
        return self

    def predict(self, level: Level, sim: SimResult):
        vec = np.array([features(level, sim)])
        probs = self.net.predict_proba(vec)[0]
        best = int(np.argmax(probs))
        return LABELS[int(self.net.classes_[best])], float(probs[best])
