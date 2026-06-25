import json

from openpyxl import load_workbook
from openpyxl.worksheet.worksheet import Worksheet

from cnc.models.forgotten import Timeline


def read_raw_data(filename: str) -> Timeline:
    workbook = load_workbook(filename, read_only=True)
    worksheet: Worksheet = workbook["forgotten"]

    new_timeline = Timeline()
    new_timeline.parse_timeline(worksheet)

    return new_timeline


if __name__ == "__main__":
    data = read_raw_data("../data/forgotten.xlsx")

    with open("../data/forgotten_parsed.json", "w") as data_file:
        json.dump(data.model_dump(), data_file, indent=4, default=str)
