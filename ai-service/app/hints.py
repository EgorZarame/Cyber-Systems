"""Тексты подсказок. Чем больше попыток у игрока, тем подробнее совет."""
from .levels import Level
from .planner import compress, shortest_plan
from .simulator import SimResult, manhattan

DIRECTION_RU = {"north": "вверх", "east": "вправо", "south": "вниз", "west": "влево"}
ACTION_RU = {"move": "двигаться вперёд", "left": "повернуть налево", "right": "повернуть направо"}


def times(count: int) -> str:
    if count % 10 in (2, 3, 4) and count % 100 not in (12, 13, 14):
        return f"{count} раза"
    return f"{count} раз"


def describe_plan(plan) -> list:
    steps = []
    for action, count in compress(plan):
        steps.append(ACTION_RU[action] + (f" ({times(count)})" if count > 1 else ""))
    return steps


def detail_level(attempts: int) -> int:
    if attempts <= 2:
        return 1
    if attempts <= 5:
        return 2
    return 3


def side_of_finish(level: Level, sim: SimResult) -> str:
    dx, dy = level.finish[0] - sim.x, level.finish[1] - sim.y
    if abs(dx) >= abs(dy):
        return "правее" if dx > 0 else "левее"
    return "ниже" if dy > 0 else "выше"


def make_hint(level: Level, sim: SimResult, verdict: str, attempts: int):
    """Возвращает (текст подсказки, список шагов). Список шагов заполняется на 2 и 3 уровне подробности."""
    detail = detail_level(attempts)
    where = f"({sim.x}, {sim.y})"
    steps = []
    if verdict == "solved":
        best = shortest_plan(level, *level.start, "east")
        if best is not None and sim.actions > len(best):
            return f"Уровень пройден. Можно короче: хватит {len(best)} блоков.", []
        return "Программа проходит уровень, всё верно.", []
    if verdict == "empty":
        return "Программа пустая. Перетащи блоки в область программы и запусти её.", []

    if verdict == "blocked":
        text = (f"Дрон упёрся в препятствие или край поля на клетке {where}, "
                f"он смотрел {DIRECTION_RU[sim.direction]}. Подумай, где нужно повернуть раньше.")
    elif verdict == "overshot":
        text = ("Дрон побывал на финише, но поехал дальше. "
                "Убери лишние блоки в конце программы, чтобы он остановился на финише.")
    elif verdict == "wrong_way":
        text = (f"Дрон едет от финиша: сейчас он на клетке {where} и смотрит {DIRECTION_RU[sim.direction]}, "
                f"а финиш {side_of_finish(level, sim)}. Начни с поворота в нужную сторону.")
    else:
        left = manhattan(sim.position, level.finish)
        text = (f"Дрон остановился на клетке {where}, до финиша ещё {left} клеток по прямой. "
                "Добавь блоков, чтобы он доехал.")

    if detail >= 2:
        plan = shortest_plan(level, sim.x, sim.y, sim.direction)
        if plan:
            steps = describe_plan(plan)
            text += " Из этой точки путь к финишу такой: " + "; ".join(steps) + "."
    if detail >= 3:
        full = shortest_plan(level, *level.start, "east")
        if full:
            text += f" Весь маршрут с самого начала занимает {len(full)} действий."
    return text, steps
