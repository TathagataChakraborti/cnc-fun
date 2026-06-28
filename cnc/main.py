import json

from typing import Sequence

from pydantic import BaseModel

from cnc import create_daily_distribution, create_monthly_distribution
from cnc.models.forgotten import FORGOTTEN
from cnc.read_raw_data import read_raw_data


def save_to_client(
    name: str, data: Sequence[BaseModel], exclude_none: bool = False
) -> None:
    with open(f"../src/cache/{name}.json", "w") as data_file:
        json.dump(
            [item.model_dump(exclude_none=exclude_none) for item in data],
            data_file,
            indent=4,
            default=str,
        )


if __name__ == "__main__":
    timeline = read_raw_data("../data/forgotten.xlsx")

    daily_distribution = create_daily_distribution.create_data(timeline)
    save_to_client(name="daily_distribution", data=daily_distribution)

    for key in FORGOTTEN:
        monthly_distribution = create_monthly_distribution.create_distribution_data(
            timeline, event_type=key
        )

        save_to_client(name=f"monthly_distribution_{key}", data=monthly_distribution)

    trend_data = create_monthly_distribution.create_trend_data(timeline)
    save_to_client(name="monthly_trend", data=trend_data, exclude_none=True)
