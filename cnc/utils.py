from typing import List, Sequence, Union

import numpy as np

from cnc.models.forgotten import ForgottenAttack


def compute_moving_average(
    data: Sequence[Union[float, int]], window_size: int = 3
) -> List[float]:
    data = np.array(data)
    weights = np.ones(window_size) / window_size

    sma = np.convolve(data, weights)
    return list(sma)


def time_difference_in_minutes(
    event_1: ForgottenAttack, event_2: ForgottenAttack
) -> float:
    return abs((event_1.datetime - event_2.datetime).total_seconds() / 60)
