from enum import StrEnum, auto

from pydantic import BaseModel

from cnc.models.forgotten import FORGOTTEN, Base, JumpType


class PlotType(StrEnum):
    LOSS = auto()
    ROC = auto()
    PR = auto()
    RESIDUAL = auto()
    CONFUSION = auto()
    SHAPLEY = auto()
    SHAP_PDP = auto()


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


class ROC(BaseModel):
    group: str
    tpr: float
    fpr: float


class PR(BaseModel):
    group: str
    precision: float
    recall: float


class LOSS(BaseModel):
    group: str
    iteration: int
    loss: float


class RESIDUAL(BaseModel):
    group: str
    predictedTime: float
    residualError: float


class CONFUSION(BaseModel):
    row: str
    column: str
    value: int
