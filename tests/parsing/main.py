from cnc.models.forgotten import Timeline
from cnc.read_raw_data import read_raw_data


class TestParsing:
    timeline: Timeline

    def setup_method(self) -> None:
        self.timeline = read_raw_data("../data/forgotten.xlsx")
