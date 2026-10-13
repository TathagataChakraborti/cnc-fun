from enum import StrEnum, auto
from typing import Type

import numpy as np

from pydantic import BaseModel, ConfigDict
from sklearn.base import BaseEstimator
from sklearn.ensemble import (
    HistGradientBoostingClassifier,
    HistGradientBoostingRegressor,
)

from cnc.models.plots import PlotType


class TaskType(StrEnum):
    CLASSIFICATION = auto()
    REGRESSION = auto()


class TaskInfo(BaseModel):
    model_config = ConfigDict(arbitrary_types_allowed=True)

    name: str
    task_type: TaskType
    plot_types: list[PlotType]
    x: np.ndarray[object, np.dtype[np.float32]]
    y: np.ndarray[object, np.dtype[np.int64]] | np.ndarray[object, np.dtype[np.float32]]

    @property
    def num_classes(self) -> int:
        return (
            len(set(list(self.y))) if self.task_type == TaskType.CLASSIFICATION else 0
        )

    @property
    def train(
        self,
    ) -> Type[BaseEstimator]:
        if self.task_type == TaskType.CLASSIFICATION:
            return HistGradientBoostingClassifier  # type: ignore[no-any-return]
        elif self.task_type == TaskType.REGRESSION:
            return HistGradientBoostingRegressor  # type: ignore[no-any-return]
        else:
            raise NotImplementedError()

    @property
    def zipmap(self) -> bool:
        return self.task_type == TaskType.CLASSIFICATION
