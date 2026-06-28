from cnc.models.forgotten import Timeline
from cnc.read_raw_data import read_raw_data
from cnc.utils import compute_moving_average, time_difference_in_minutes


class TestUtils:
    def setup_method(self) -> None:
        self.timeline: Timeline = read_raw_data("../data/forgotten.xlsx")

    def test_time_difference(self) -> None:
        iter_item = iter(self.timeline.forgotten_attacks)

        event_1 = next(iter_item)
        event_2 = next(iter_item)

        assert event_1 is not None and event_2 is not None
        assert round(time_difference_in_minutes(event_1, event_2)) == 91

    def test_moving_average(self) -> None:
        data = [10, 20, 30, 40]

        window_size = 3
        index = window_size - 1

        transform = compute_moving_average(data, window_size)
        transform_truncated = [round(item) for item in transform][index:-index]

        assert transform_truncated == [20, 30]
