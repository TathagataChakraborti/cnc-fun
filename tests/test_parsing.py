from datetime import date, datetime

from cnc.models.forgotten import FORGOTTEN, Report, Timeline
from cnc.read_raw_data import read_raw_data


class TestParsing:
    def setup_method(self) -> None:
        date_object = date(year=2026, month=6, day=26)

        self.timeline: Timeline = read_raw_data("../data/forgotten.xlsx")
        self.filtered_timeline: Timeline = self.timeline.get_timeline_by_date(
            date_object
        )

    def test_num_reports(self) -> None:
        assert len(self.timeline.reports) == 971
        assert len(self.filtered_timeline.reports) == 37

    def test_consolidation(self) -> None:
        assert len(self.filtered_timeline.forgotten_attacks) == 17

    def test_forgotten_attack(self) -> None:
        assert len(self.timeline.forgotten_attacks) == 599

        event = next(iter(self.timeline.forgotten_attacks), None)

        assert event is not None
        assert event.defending_against == FORGOTTEN.BASE
        assert event.waves == 2

        base_info = event.base_info(name="London")

        assert base_info is not None
        assert base_info.neighborhood_roughness == 3
        assert base_info.active_bases == 34

    def test_growth(self) -> None:
        event = next(
            filter(lambda x: x.size_of_army == 8, self.timeline.forgotten_attacks), None
        )

        assert event is not None and event.datetime == datetime(
            year=2026, month=6, day=26, hour=23, minute=36, second=25
        )

        event = next(
            filter(lambda x: x.size_of_army == 7, self.timeline.forgotten_attacks), None
        )

        assert event is not None and event.datetime == datetime(
            year=2026, month=6, day=22, hour=2, minute=3
        )

        event = next(
            filter(lambda x: x.size_of_army == 6, self.timeline.forgotten_attacks), None
        )

        assert event is not None and event.datetime == datetime(
            year=2026, month=6, day=11, hour=19, minute=43, second=17
        )

        event = next(
            filter(lambda x: x.size_of_army == 5, self.timeline.forgotten_attacks), None
        )

        assert event is not None and event.datetime == datetime(
            year=2026, month=5, day=31, hour=22, minute=56, second=36
        )

        event = next(
            filter(lambda x: x.size_of_army == 4, self.timeline.forgotten_attacks), None
        )

        assert event is not None and event.datetime == datetime(
            year=2026, month=5, day=29, hour=7, minute=19, second=19
        )

    def test_legacy_with_neighborhood(self) -> None:
        first_legacy_report: Report | None = None

        for event in self.timeline.forgotten_attacks:
            if event.is_legacy():
                first_legacy_report = event.report
                break

        assert first_legacy_report is not None
        assert first_legacy_report.datetime == datetime(
            year=2026, month=5, day=29, hour=21, minute=59, second=16
        )

    def test_legacy_without_neighborhood(self) -> None:
        first_legacy_report: Report | None = None

        for event in self.timeline.forgotten_attacks:
            if event.is_legacy(with_neighborhood=False):
                first_legacy_report = event.report
                break

        assert first_legacy_report is not None
        assert first_legacy_report.datetime == datetime(
            year=2026, month=5, day=21, hour=18, minute=41, second=45
        )

    def test_jumping(self) -> None:
        for report in self.timeline.reports:
            print(f"{report.datetime}, {report.after_jump}")
