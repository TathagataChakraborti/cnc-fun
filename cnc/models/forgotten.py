from __future__ import annotations

from datetime import datetime
from enum import StrEnum, auto
from statistics import fmean
from typing import List, Optional, Tuple

from openpyxl.workbook.workbook import Worksheet
from pydantic import BaseModel


class FORGOTTEN(StrEnum):
    @staticmethod
    def _generate_next_value_(
        name: str, start: int, count: int, last_values: List[str]
    ) -> str:
        return name.capitalize()

    CAMP = auto()
    BASE = auto()


class Neighbor(BaseModel):
    how_many: int
    level: int

    @staticmethod
    def parse_from_string(raw_string: Optional[str]) -> List[Neighbor]:
        if raw_string is None:
            return []

        split = raw_string.split(", ")
        neighbors: List[Neighbor] = []

        for item in split:
            sec_split = item.split("x")

            neighbors.append(
                Neighbor(
                    how_many=int(sec_split[0]),
                    level=int(sec_split[1]),
                )
            )

        return neighbors


class Base(BaseModel):
    active_bases: int
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

    def is_neighborhood_rough(self) -> int:
        raise NotImplementedError


class Report(BaseModel):
    datetime: datetime
    defending_against: FORGOTTEN
    defending_base: str
    state_of_the_union: List[Base] = []

    def after_jump(self) -> bool:
        return any([base.jumped_to_front for base in self.state_of_the_union])

    @classmethod
    def parse_defending_base(cls, raw_string: str) -> str:
        return raw_string.split(":")[-1].strip()

    @classmethod
    def parse_report(cls, row: List[str], header_info: HeaderInfo) -> Report:
        report = Report(
            datetime=datetime.strptime(row[header_info.datetime], "%m/%d/%Y, %H:%M:%S"),
            defending_against=FORGOTTEN(row[header_info.defending_against]),
            defending_base=cls.parse_defending_base(row[header_info.defending_base]),
        )

        jump_tags = row[header_info.jump_tags]

        for base_index in header_info.base_indices:
            active_bases = row[base_index.active_bases]

            if active_bases is not None:
                report.state_of_the_union.append(
                    Base(
                        active_bases=int(active_bases),
                        jumped_to_front=jump_tags is not None
                        and base_index.name in jump_tags,
                        neighborhood=Neighbor.parse_from_string(
                            row[base_index.neighborhood]
                        ),
                    )
                )

        return report


class BaseIndices(BaseModel):
    name: str
    active_bases: int
    neighborhood: int


class HeaderInfo(BaseModel):
    bases: List[str] = []
    defending_base: int = 0
    datetime: int = 1
    defending_against: int = 2
    jump_tags: int = 3
    starting_index: int = 4
    base_indices: List[BaseIndices] = []


class Timeline(BaseModel):
    reports: List[Report] = []

    @classmethod
    def parse_headers(cls, row: Tuple[Optional[str]]) -> HeaderInfo:
        headers = HeaderInfo()

        for index, item in enumerate(
            row[headers.starting_index :], start=headers.starting_index
        ):
            if item is None:
                break

            headers.bases.append(item)

            primary_index = index
            secondary_index = primary_index + 1

            for i, reference in enumerate(row[secondary_index:], start=secondary_index):
                if reference == item:
                    secondary_index = i
                    break

            headers.base_indices.append(
                BaseIndices(
                    name=item,
                    active_bases=primary_index,
                    neighborhood=secondary_index,
                )
            )

        return headers

    def parse_timeline(self, worksheet: Worksheet) -> Timeline:
        header_info = self.parse_headers(next(worksheet.iter_rows(values_only=True)))

        for row in worksheet.iter_rows(values_only=True, min_row=2):
            self.reports.append(Report.parse_report(row, header_info))

        return self
