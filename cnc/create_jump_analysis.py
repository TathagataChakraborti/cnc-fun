from cnc.models.forgotten import Timeline
from cnc.models.plots import JumpTrend


def create_jump_trend(timeline: Timeline) -> list[JumpTrend]:
    data: list[JumpTrend] = []

    for index, event in enumerate(timeline.forgotten_attacks):
        if index + 1 == len(timeline.forgotten_attacks):
            pass
        else:
            if event.is_legacy(with_neighborhood=False):
                pass
            else:
                previous_event = timeline.forgotten_attacks[index + 1]
                base_info = event.report.base_info(event.report.defending_base)

                assert base_info is not None

                data.append(
                    JumpTrend(
                        fg_type=event.report.defending_against,
                        defending_base=event.report.defending_base,
                        jump_types=event.jumped_to_front,
                        base_data=event.report.state_of_the_union,
                        interval=round(
                            (event.datetime - previous_event.datetime).total_seconds()
                            / 60,
                            2,
                        ),
                        num_active=base_info.active_bases,
                    )
                )

    return data
