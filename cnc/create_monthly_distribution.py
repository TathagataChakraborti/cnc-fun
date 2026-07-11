from datetime import date

from cnc.models.forgotten import FORGOTTEN, ForgottenAttack, Timeline
from cnc.models.plots import MonthlyDistribution, MonthlyTrend
from cnc.utils import compute_moving_average, time_difference_in_minutes


def create_distribution_data(
    timeline: Timeline, event_type: FORGOTTEN
) -> list[MonthlyDistribution]:
    data: list[MonthlyDistribution] = []

    for event in timeline.forgotten_attacks:
        if event.defending_against == event_type:
            data.append(
                MonthlyDistribution(
                    datetime=f"{event.datetime:%Y-%m-%dT%H:%M:%S+05:30}",
                )
            )

    return data


def create_trend_data(timeline: Timeline, window_size: int = 3) -> list[MonthlyTrend]:
    dates: list[date] = []
    num_attacks: list[float] = []
    forgotten_level: list[float] = []
    gap_between_attacks: list[float] = []

    reference_event: ForgottenAttack | None = None

    num_attacks_tmp: float = 0.0
    forgotten_level_tmp: float = 0.0
    gap_between_attacks_tmp: float = 0.0

    min_gap: float = 100.0

    for event in timeline.forgotten_attacks:
        if event.defending_against == FORGOTTEN.BASE and not event.is_legacy:
            reference_event = reference_event or event

            if reference_event.datetime.date() == event.datetime.date():
                num_attacks_tmp += 1
                forgotten_level_tmp += event.max_forgotten_level

                gap = 100.0

                if reference_event is not None:
                    gap = time_difference_in_minutes(reference_event, event)
                    gap_between_attacks_tmp += gap

            else:
                dates.append(reference_event.datetime.date())
                num_attacks.append(num_attacks_tmp)
                forgotten_level.append(forgotten_level_tmp / num_attacks_tmp)
                gap_between_attacks.append(gap_between_attacks_tmp / num_attacks_tmp)

                # NOTE: reset
                num_attacks_tmp = 1.0
                forgotten_level_tmp = event.max_forgotten_level

                gap = time_difference_in_minutes(reference_event, event)
                gap_between_attacks_tmp = gap

            reference_event = event

            if 0.0 < gap < min_gap:
                min_gap = gap

    # NOTE: n-day moving average
    if window_size > 0:
        num_attacks = compute_moving_average(num_attacks, window_size)
        forgotten_level = compute_moving_average(forgotten_level, window_size)
        gap_between_attacks = compute_moving_average(gap_between_attacks, window_size)

    # NOTE: construct trend
    trend_data: list[MonthlyTrend] = []
    key_map = {
        "Number of Forgotten Base attacks": num_attacks,
        "Maximum Forgotten Base level in range": forgotten_level,
        "Gap (in minutes) between consecutive Forgotten Base attacks": gap_between_attacks,
    }

    truncated_index = window_size - 1

    for index, date_item in enumerate(dates[truncated_index:-truncated_index]):
        for key in key_map:
            new_trend_item = MonthlyTrend(
                date=f"{date_item:%Y-%m-%d}",
                group=key,
            )

            value = round(key_map[key][index + truncated_index], 2)

            if key == "Gap (in minutes) between consecutive Forgotten Base attacks":
                new_trend_item.__dict__["value_secondary"] = value
            else:
                new_trend_item.__dict__["value"] = value

            trend_data.append(new_trend_item)

    print(f"Minimum gap (in minutes): {min_gap}")

    return trend_data
