from datetime import datetime
from enum import StrEnum, auto
from statistics import fmean
from typing import List

from pydantic import BaseModel


class FORGOTTEN(StrEnum):
    CAMP = auto()
    BASE = auto()


class Neighbor(BaseModel):
    how_many: int
    level: int


class Base(BaseModel):
    active_forgotten_bases: int
    jumped_to_front: bool = False
    neighborhood: List[Neighbor] = []

    def expected_level(self) -> float:
        if len(self.neighborhood) == 0:
            return 0

        else:
            return fmean(
                data=[item.level for item in self.neighborhood],
                weights=[item.how_many for item in self.neighborhood],
            )

    def is_in_neighborhood_rough(self) -> int:
        raise NotImplementedError


class Report(BaseModel):
    datetime: datetime
    defending_against: FORGOTTEN
    defending_base: str
    state_of_the_union: List[Base]

    def after_jump(self) -> bool:
        return any([base.jumped_to_front for base in self.state_of_the_union])
