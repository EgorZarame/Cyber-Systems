"""Прогон программы дрона по полю уровня. Правила те же, что в игре на фронтенде."""
from dataclasses import dataclass, field

from .levels import Level, START_DIRECTION

# порядок как в игре: поворот налево идёт по этому списку вперёд, направо по обратному
LEFT_TURN = {"north": "west", "west": "south", "south": "east", "east": "north"}
RIGHT_TURN = {"north": "east", "east": "south", "south": "west", "west": "north"}
STEP = {"north": (0, -1), "east": (1, 0), "south": (0, 1), "west": (-1, 0)}

MAX_ACTIONS = 500


class ProgramTooLong(ValueError):
    pass


def expand(program):
    """Раскрывает циклы в плоский список действий."""
    actions = []
    for item in program:
        if isinstance(item, str):
            actions.append(item)
        else:
            body = expand(item["body"])
            actions.extend(body * item["count"])
        if len(actions) > MAX_ACTIONS:
            raise ProgramTooLong(f"В программе больше {MAX_ACTIONS} действий")
    return actions


def can_move(level: Level, x: int, y: int) -> bool:
    return 0 <= x < level.width and 0 <= y < level.height and (x, y) not in level.obstacles


def manhattan(a, b) -> int:
    return abs(a[0] - b[0]) + abs(a[1] - b[1])


@dataclass
class SimResult:
    x: int
    y: int
    direction: str
    moves: int = 0
    turns: int = 0
    collisions: int = 0
    actions: int = 0
    passed_finish: bool = False
    min_distance: int = 0
    path: list = field(default_factory=list)

    @property
    def position(self):
        return (self.x, self.y)


def simulate(level: Level, program) -> SimResult:
    actions = expand(program)
    x, y = level.start
    direction = START_DIRECTION
    res = SimResult(x, y, direction, actions=len(actions), min_distance=manhattan(level.start, level.finish))
    res.path.append((x, y))
    for action in actions:
        if action == "move":
            dx, dy = STEP[direction]
            if can_move(level, x + dx, y + dy):
                x, y = x + dx, y + dy
                res.moves += 1
                res.path.append((x, y))
            else:
                res.collisions += 1
        elif action == "left":
            direction = LEFT_TURN[direction]
            res.turns += 1
        elif action == "right":
            direction = RIGHT_TURN[direction]
            res.turns += 1
        dist = manhattan((x, y), level.finish)
        res.min_distance = min(res.min_distance, dist)
        if (x, y) == level.finish and action == "move":
            res.passed_finish = True
    res.x, res.y, res.direction = x, y, direction
    return res
