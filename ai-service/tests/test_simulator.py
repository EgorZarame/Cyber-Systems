import pytest

from app.levels import LEVELS
from app.planner import compress, shortest_plan
from app.simulator import ProgramTooLong, expand, simulate


def test_moves_and_turns_follow_game_rules():
    level = LEVELS["1.1"]
    sim = simulate(level, ["move", "move", "left", "move"])
    # старт (1,3) смотрит на восток: две клетки вправо, налево = на север, одна клетка вверх
    assert sim.position == (3, 2)
    assert sim.direction == "north"
    assert sim.moves == 3 and sim.turns == 1 and sim.collisions == 0


def test_right_turn_goes_clockwise():
    sim = simulate(LEVELS["1.1"], ["right"])
    assert sim.direction == "south"


def test_border_counts_as_collision_and_drone_stays():
    sim = simulate(LEVELS["1.1"], ["left", "left", "left", "move"] + ["move"] * 5)
    # left x3 из востока даёт юг? проверяем только, что столкновения учтены и дрон не вышел за поле
    assert 0 <= sim.x < 10 and 0 <= sim.y < 6
    assert sim.collisions >= 1


def test_obstacle_blocks_movement():
    level = LEVELS["1.2"]
    sim = simulate(level, ["move", "move", "move"])
    # на (3,1) стена, дрон остановился на (2,1)
    assert sim.position == (2, 1)
    assert sim.collisions == 2


def test_loop_is_expanded():
    program = [{"type": "loop", "count": 3, "body": ["move", "left"]}]
    assert expand(program) == ["move", "left"] * 3
    assert simulate(LEVELS["1.1"], program).actions == 6


def test_too_long_program_is_rejected():
    program = [{"type": "loop", "count": 10, "body": ["move"] * 50}] * 2
    with pytest.raises(ProgramTooLong):
        expand(program)


def test_reaching_finish_marks_it_as_passed():
    sim = simulate(LEVELS["1.1"], ["move"] * 9)
    assert sim.passed_finish
    assert sim.position == (9, 3)


@pytest.mark.parametrize("level_id", sorted(LEVELS))
def test_shortest_plan_really_solves_the_level(level_id):
    level = LEVELS[level_id]
    plan = shortest_plan(level, *level.start, "east")
    assert plan is not None
    assert simulate(level, plan).position == level.finish


def test_shortest_plan_from_the_finish_is_empty():
    level = LEVELS["1.1"]
    assert shortest_plan(level, *level.finish, "east") == []


def test_compress_groups_repeated_actions():
    assert compress(["move", "move", "left", "move"]) == [("move", 2), ("left", 1), ("move", 1)]
