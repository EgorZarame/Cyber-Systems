"""Поля уровней, где игрок собирает программу из блоков: двигаться, повернуть налево/направо, повторить."""
from dataclasses import dataclass


@dataclass(frozen=True)
class Level:
    id: str
    width: int
    height: int
    start: tuple
    finish: tuple
    obstacles: frozenset


LEVELS = {
    "1.1": Level("1.1", 10, 6, (1, 3), (8, 3), frozenset()),
    "1.2": Level(
        "1.2", 10, 6, (1, 1), (8, 4),
        frozenset({(3, 1), (3, 2), (3, 3), (3, 4), (3, 5),
                   (4, 3), (5, 3), (6, 3), (7, 3), (8, 3)})),
    "2.2": Level(
        "2.2", 12, 8, (1, 1), (10, 6),
        frozenset({(2, 1), (2, 2), (2, 3), (5, 1), (5, 2), (5, 3), (8, 1), (8, 2), (8, 3),
                   (3, 4), (4, 4), (5, 4), (6, 5), (7, 5), (8, 5),
                   (1, 6), (2, 6), (10, 4), (10, 5)})),
}

START_DIRECTION = "east"
