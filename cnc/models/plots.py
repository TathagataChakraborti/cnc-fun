from pydantic import BaseModel

from cnc.models.forgotten import FORGOTTEN


class DailyDistribution(BaseModel):
    datetime: str
    type: FORGOTTEN


class MonthlyDistribution(BaseModel):
    datetime: str
    value: int = 1


class MonthlyTrend(BaseModel):
    date: str
    value: float | None = None
    value_secondary: float | None = None
    group: str
