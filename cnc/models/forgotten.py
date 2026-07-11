from __future__ import annotations

import math

from datetime import date as d
from datetime import datetime as dt
from datetime import timedelta
from enum import StrEnum, auto
from statistics import fmean

from openpyxl.worksheet.worksheet import Worksheet
from pydantic import BaseModel


class FORGOTTEN(StrEnum):
    @staticmethod
    def _generate_next_value_(
        name: str, start: int, count: int, last_values: list[str]
    ) -> str:
        return name.capitalize()

    CAMP = auto()
    BASE = auto()


class Neighbor(BaseModel):
    how_many: int
    level: int

    @staticmethod
    def parse_from_string(raw_string: str | None) -> list[Neighbor]:
        if not raw_string:
            return []

        split = raw_string.split(", ")
        neighbors: list[Neighbor] = []

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
    name: str
    active_bases: int
    jumped_to_front: bool = False
    neighborhood: list[Neighbor] = []

    @property
    def expected_level_in_range(self) -> float:
        if len(self.neighborhood) == 0:
            return 0

        else:
            return fmean(
                data=[item.level for item in self.neighborhood],
                weights=[item.how_many for item in self.neighborhood],
            )

    @property
    def max_level_in_range(self) -> int:
        if len(self.neighborhood) == 0:
            return 0

        else:
            return max([neighbor.level for neighbor in self.neighborhood])

    @property
    def num_bases_in_range(self) -> int:
        return sum([neighbor.how_many for neighbor in self.neighborhood])

    @property
    def neighborhood_roughness(self) -> int:
        return math.floor(self.num_bases_in_range / 10) or 1


class Report(BaseModel):
    datetime: dt
    defending_against: FORGOTTEN
    defending_base: str
    state_of_the_union: list[Base] = []

    def after_jump(self) -> bool:
        return any([base.jumped_to_front for base in self.state_of_the_union])

    @classmethod
    def parse_defending_base(cls, raw_string: str) -> str:
        return raw_string.split(":")[-1].strip()

    @classmethod
    def parse_report(cls, row: list[str], header_info: HeaderInfo) -> Report:
        report = Report(
            datetime=dt.strptime(row[header_info.datetime], "%m/%d/%Y, %H:%M:%S"),
            defending_against=FORGOTTEN(row[header_info.defending_against]),
            defending_base=cls.parse_defending_base(row[header_info.defending_base]),
        )

        jump_tags = row[header_info.jump_tags]

        for base_index in header_info.base_indices:
            active_bases = row[base_index.active_bases]

            if active_bases:
                report.state_of_the_union.append(
                    Base(
                        name=base_index.name,
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
    bases: list[str] = []
    defending_base: int = 0
    datetime: int = 1
    defending_against: int = 2
    jump_tags: int = 3
    starting_index: int = 4
    base_indices: list[BaseIndices] = []


class ForgottenAttack(BaseModel):
    reports: list[Report] = []

    @property
    def report(self) -> Report:
        *_, first_report = iter(self.reports)
        return first_report

    def get_base_info_by_name(self, name: str) -> Base:
        base_info: Base = next(
            filter(lambda x: name == x.name, self.state_of_the_union)
        )

        return base_info

    @property
    def waves(self) -> int:
        base_info = self.get_base_info_by_name(name=self.report.defending_base)
        return base_info.neighborhood_roughness

    @property
    def datetime(self) -> dt:
        return self.report.datetime

    @property
    def defending_against(self) -> FORGOTTEN:
        return self.report.defending_against

    @property
    def state_of_the_union(self) -> list[Base]:
        return self.report.state_of_the_union

    @property
    def size_of_army(self) -> int:
        return len(self.state_of_the_union)

    @property
    def max_forgotten_level(self) -> int:
        return max([base.max_level_in_range for base in self.state_of_the_union])

    @property
    def is_legacy(self) -> bool:
        return all([len(base.neighborhood) == 0 for base in self.state_of_the_union])


class Timeline(BaseModel):
    reports: list[Report] = []
    forgotten_attacks: list[ForgottenAttack] = []

    def get_timeline_by_date(self, date: d) -> Timeline:
        return Timeline(
            reports=[
                report for report in self.reports if report.datetime.date() == date
            ],
            forgotten_attacks=[
                event
                for event in self.forgotten_attacks
                if event.datetime.date() == date
            ],
        )

    @classmethod
    def parse_headers(cls, row: tuple[str | float | dt | None, ...]) -> HeaderInfo:
        headers = HeaderInfo()
        str_row = [str(item) if item else None for item in row]

        for index, item in enumerate(
            str_row[headers.starting_index :], start=headers.starting_index
        ):
            if item is None:
                break

            headers.bases.append(item)

            primary_index = index
            secondary_index = primary_index + 1

            for i, reference in enumerate(
                str_row[secondary_index:], start=secondary_index
            ):
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
        generator = worksheet.iter_rows(values_only=True)
        header_info = self.parse_headers(next(generator))

        for row in worksheet.iter_rows(values_only=True, min_row=2):
            str_row = ["" if item is None else str(item) for item in row]
            self.reports.append(Report.parse_report(str_row, header_info))

        self.forgotten_attacks = consolidate_timeline(self.reports)
        return self


def consolidate_timeline(
    reports: list[Report], max_duration: int = 10
) -> list[ForgottenAttack]:
    forgotten_attacks: list[ForgottenAttack] = []

    consolidate: bool = True
    new_event = ForgottenAttack()
    reference_time: dt | None = None

    for report in reports:
        if reference_time is not None and abs(
            reference_time - report.datetime
        ) > timedelta(minutes=max_duration):
            consolidate = False

        if not consolidate:
            forgotten_attacks.append(new_event)
            new_event = ForgottenAttack()
            consolidate = True

        new_event.reports.append(report)
        reference_time = report.datetime

    return forgotten_attacks
