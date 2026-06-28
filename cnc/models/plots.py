from typing import Optional

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
    value: Optional[float] = None
    value_secondary: Optional[float] = None
    group: str
