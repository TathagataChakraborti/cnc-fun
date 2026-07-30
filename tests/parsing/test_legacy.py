from datetime import datetime

from cnc.models.forgotten import Report
from tests.parsing.main import TestParsing


class TestLegacy(TestParsing):
    def setup_method(self) -> None:
        super().setup_method()

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
