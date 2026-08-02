from datetime import date

from pydantic import BaseModel


class FluencyTrendPoint(BaseModel):
    date: date
    fluency_score: float


class DashboardResponse(BaseModel):
    session_count: int
    average_fluency_score: float | None
    fluency_trend: list[FluencyTrendPoint]
