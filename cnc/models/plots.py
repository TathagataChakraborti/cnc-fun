from pydantic import BaseModel

from cnc.models.forgotten import FORGOTTEN, Base, JumpType


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


class JumpTrend(BaseModel):
    datetime: str
    fg_type: FORGOTTEN
    jump_types: list[JumpType]
    interval: float
    num_active: int
    defending_base: str
    base_data: list[Base]
