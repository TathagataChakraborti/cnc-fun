from datetime import datetime

from cnc.models.forgotten import JumpType, Report
from tests.parsing.main import TestParsing


class TestMovement(TestParsing):
    def setup_method(self) -> None:
        super().setup_method()

    def test_jumping_report_0(self) -> None:
        first_indeterminate_report: Report | None = None

        for report in self.timeline.reports:
            if JumpType.INDETERMINATE in report.after_jump:
                first_indeterminate_report = report
                break

        assert first_indeterminate_report is not None
        assert first_indeterminate_report.datetime == datetime(
            year=2026, month=5, day=21, hour=20, minute=21, second=26
        )

    def test_jumping_report_1(self) -> None:
        first_jumpy_report: Report | None = None

        for report in self.timeline.reports:
            if report.after_jump:
                first_jumpy_report = report
                break

        assert first_jumpy_report is not None
        assert first_jumpy_report.datetime == datetime(
            year=2026, month=6, day=26, hour=23, minute=36, second=25
        )

        for base in first_jumpy_report.state_of_the_union:
            if base.name in ["New York", "Edinburgh"]:
                assert set(base.jumped_to_front) == {
                    JumpType.JUMP_TO_FRONT,
                    JumpType.ANY_MOVEMENT,
                }
            else:
                assert base.jumped_to_front == []

    def test_jumping_report_2(self) -> None:
        report = self.timeline.get_report_by_datetime(
            datetime=datetime(year=2026, month=5, day=23, hour=15, minute=5, second=46)
        )

        assert report is not None
        assert set(report.after_jump) == {
            JumpType.JUMP_TO_FRONT,
            JumpType.ANY_MOVEMENT,
            JumpType.WAVE_CHANGE,
        }

        report = self.timeline.get_report_by_datetime(
            datetime=datetime(year=2026, month=5, day=23, hour=15, minute=5, second=46)
        )

        assert report is not None
        assert set(report.after_jump) == {
            JumpType.JUMP_TO_FRONT,
            JumpType.ANY_MOVEMENT,
            JumpType.WAVE_CHANGE,
        }

        base_info = report.base_info(base_name="Boston")

        assert base_info is not None
        assert base_info.jumped_to_front == []

        base_info = report.base_info(base_name="London")

        assert base_info is not None
        assert set(base_info.jumped_to_front) == {
            JumpType.JUMP_TO_FRONT,
            JumpType.ANY_MOVEMENT,
            JumpType.WAVE_CHANGE,
        }

    def test_jumping_report_3(self) -> None:
        report = self.timeline.get_report_by_datetime(
            datetime=datetime(year=2026, month=5, day=23, hour=15, minute=42, second=42)
        )

        assert report is not None
        base_info = report.base_info(base_name="Boston")

        assert base_info is not None
        assert set(base_info.jumped_to_front) == {
            JumpType.JUMP_TO_FRONT,
            JumpType.ANY_MOVEMENT,
            JumpType.WAVE_CHANGE,
        }

        for base in report.state_of_the_union:
            if base.name != "Boston":
                assert base.jumped_to_front == []

    def test_jumping_report_4(self) -> None:
        report = self.timeline.get_report_by_datetime(
            datetime=datetime(year=2026, month=5, day=23, hour=15, minute=45, second=00)
        )

        assert report is not None
        assert all([base.jumped_to_front == [] for base in report.state_of_the_union])

    def test_jumping_report_5(self) -> None:
        report = self.timeline.get_report_by_datetime(
            datetime=datetime(year=2026, month=5, day=23, hour=22, minute=30, second=12)
        )

        assert report is not None

        for base in report.state_of_the_union:
            if base.name == "Boston":
                assert base.jumped_to_front == [JumpType.ANY_MOVEMENT]
            else:
                assert base.jumped_to_front == []

    def test_jumping_event_0(self) -> None:
        event = self.timeline.get_event_by_datetime(
            datetime=datetime(year=2026, month=5, day=23, hour=15, minute=42, second=42)
        )

        assert event is not None
        assert set(event.jumped_to_front) == {
            JumpType.JUMP_TO_FRONT,
            JumpType.ANY_MOVEMENT,
            JumpType.WAVE_CHANGE,
        }

        event = self.timeline.get_event_by_datetime(
            datetime=datetime(year=2026, month=5, day=23, hour=15, minute=3, second=23)
        )

        assert event is not None
        assert event.jumped_to_front == [JumpType.INTRA_EVENT]

    def test_jumping_event_1(self) -> None:
        check_indeterminate = False
        for event in self.timeline.forgotten_attacks:
            if (
                check_indeterminate is False
                and JumpType.INDETERMINATE in event.jumped_to_front
            ):
                check_indeterminate = True

                assert event.datetime == datetime(
                    year=2026, month=5, day=21, hour=20, minute=21, second=26
                )

            if check_indeterminate:
                assert JumpType.INDETERMINATE in event.jumped_to_front

    def test_jumping_event_2(self) -> None:
        event = self.timeline.get_event_by_datetime(
            datetime=datetime(year=2026, month=6, day=6, hour=13, minute=9, second=37)
        )

        assert event is not None
        assert event.jumped_to_front == []
