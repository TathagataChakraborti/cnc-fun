from cnc.models.forgotten import Timeline
from cnc.models.plots import DailyDistribution


def create_data(timeline: Timeline) -> list[DailyDistribution]:
    data: list[DailyDistribution] = []

    for event in timeline.forgotten_attacks:
        data.append(
            DailyDistribution(
                datetime=f"{event.datetime:%Y-%m-%dT%H:%M:%S+05:30}",
                type=event.defending_against,
            )
        )

    return data
