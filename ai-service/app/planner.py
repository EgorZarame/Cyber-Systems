"""Поиск кратчайшего пути к финишу из любого состояния дрона (клетка + направление)."""
from collections import deque

from .levels import Level
from .simulator import LEFT_TURN, RIGHT_TURN, STEP, can_move


def shortest_plan(level: Level, x: int, y: int, direction: str):
    """Возвращает список действий move/left/right или None, если дойти нельзя."""
    start = (x, y, direction)
    queue = deque([start])
    came = {start: None}
    goal = None
    while queue:
        state = queue.popleft()
        cx, cy, cd = state
        if (cx, cy) == level.finish:
            goal = state
            break
        dx, dy = STEP[cd]
        options = [("left", (cx, cy, LEFT_TURN[cd])), ("right", (cx, cy, RIGHT_TURN[cd]))]
        if can_move(level, cx + dx, cy + dy):
            options.insert(0, ("move", (cx + dx, cy + dy, cd)))
        for action, nxt in options:
            if nxt not in came:
                came[nxt] = (state, action)
                queue.append(nxt)
    if goal is None:
        return None
    plan = []
    state = goal
    while came[state] is not None:
        state, action = came[state]
        plan.append(action)
    plan.reverse()
    return plan


def compress(plan):
    """[move, move, left, move] -> [(move, 2), (left, 1), (move, 1)]"""
    out = []
    for action in plan:
        if out and out[-1][0] == action:
            out[-1] = (action, out[-1][1] + 1)
        else:
            out.append((action, 1))
    return out
