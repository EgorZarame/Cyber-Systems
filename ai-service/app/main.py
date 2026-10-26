import os
from typing import List, Literal, Union

from fastapi import Depends, FastAPI, Header, HTTPException
from pydantic import BaseModel, Field

from .hints import detail_level, make_hint
from .levels import LEVELS
from .model import ErrorClassifier, label_by_rules
from .simulator import ProgramTooLong, manhattan, simulate

Action = Literal["move", "left", "right"]


class LoopBlock(BaseModel):
    type: Literal["loop"]
    count: int = Field(ge=1, le=10)
    body: List[Action] = Field(max_length=50)


class HintRequest(BaseModel):
    levelId: str = Field(max_length=10)
    program: List[Union[Action, LoopBlock]] = Field(max_length=100)
    attempts: int = Field(default=1, ge=1, le=1000)


class Stats(BaseModel):
    x: int
    y: int
    direction: str
    collisions: int
    distanceToFinish: int


class HintResponse(BaseModel):
    levelId: str
    supported: bool
    verdict: str
    confidence: float
    hint: str
    nextSteps: List[str]
    detailLevel: int
    stats: Stats | None = None


def create_app(classifier: ErrorClassifier | None = None) -> FastAPI:
    app = FastAPI(title="ai-service", description="Подсказки игроку по его программе")
    model = classifier or ErrorClassifier().train()
    token = os.environ.get("INTERNAL_TOKEN", "")

    def check_token(x_internal_token: str | None = Header(default=None)):
        if token and x_internal_token != token:
            raise HTTPException(status_code=401, detail="Нужен токен сервиса")

    @app.get("/health")
    def health():
        return {"status": "ok", "levels": sorted(LEVELS), "modelAccuracy": round(model.accuracy, 3)}

    @app.post("/internal/hint", response_model=HintResponse, dependencies=[Depends(check_token)])
    def hint(req: HintRequest):
        detail = detail_level(req.attempts)
        level = LEVELS.get(req.levelId)
        if level is None:
            return HintResponse(
                levelId=req.levelId, supported=False, verdict="unsupported", confidence=1.0,
                hint="Для этого уровня умная подсказка пока недоступна. Перечитай задание и попробуй пройти путь по шагам.",
                nextSteps=[], detailLevel=detail)
        try:
            sim = simulate(level, [i.model_dump() if isinstance(i, LoopBlock) else i for i in req.program])
        except ProgramTooLong as e:
            raise HTTPException(status_code=422, detail=str(e))
        verdict, confidence = model.predict(level, sim)
        if confidence < 0.6:
            # сеть не уверена, тогда полагаемся на проверку по правилам
            verdict, confidence = label_by_rules(level, sim), 1.0
        text, steps = make_hint(level, sim, verdict, req.attempts)
        return HintResponse(
            levelId=level.id, supported=True, verdict=verdict, confidence=round(confidence, 3),
            hint=text, nextSteps=steps, detailLevel=detail,
            stats=Stats(x=sim.x, y=sim.y, direction=sim.direction, collisions=sim.collisions,
                        distanceToFinish=manhattan(sim.position, level.finish)))

    return app


app = create_app()
