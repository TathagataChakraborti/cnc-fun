import numpy as np
import onnx
import onnx.helper
import onnxruntime as ort

from skl2onnx import to_onnx
from sklearn.ensemble import (
    HistGradientBoostingClassifier,
    HistGradientBoostingRegressor,
)

from cnc.models.forgotten import FORGOTTEN, Timeline
from cnc.read_raw_data import read_raw_data


_original_make_attribute = onnx.helper.make_attribute


def _patched_make_attribute(
    key: str, value: object, doc_string: object = None, **kwargs: object
) -> onnx.AttributeProto:
    if isinstance(value, (list, tuple)):
        value = [int(v) if isinstance(v, bool) else v for v in value]
    elif isinstance(value, bool):
        value = int(value)
    return _original_make_attribute(key, value, doc_string=doc_string, **kwargs)


onnx.helper.make_attribute = _patched_make_attribute


def verify_mode(
    filename: str, x: np.ndarray[tuple[int], np.dtype[np.float64]]
) -> object:
    print("\nVerifying ONNX binary integrity with Python ONNX Runtime...")

    sess = ort.InferenceSession(filename)
    result = sess.run(output_names=None, input_feed={sess.get_inputs()[0].name: x})

    return result


def save_clean_onnx(
    onnx_model: onnx.ModelProto,
    x: np.ndarray[tuple[int], np.dtype[np.float64]],
    filename: str,
) -> None:
    print(f"Saving: {filename}")
    onnx.save_model(onnx_model, filename, save_as_external_data=False)

    verify_mode(filename, x)


def get_num_features(max_bases: int) -> int:
    return 2 + 5 * max_bases


def get_forgotten_feature(fg_type: FORGOTTEN) -> int:
    if fg_type == FORGOTTEN.CAMP:
        return 0
    elif fg_type == FORGOTTEN.BASE:
        return 1
    else:
        raise NotImplementedError()


def generate_training_data(
    timeline_data: Timeline, max_bases: int = 16
) -> tuple[
    np.ndarray[object, np.dtype[np.float32]],
    np.ndarray[object, np.dtype[np.int64]],
    np.ndarray[object, np.dtype[np.int64]],
    np.ndarray[object, np.dtype[np.float32]],
    int,
]:
    num_features = get_num_features(max_bases)
    num_samples = len(timeline_data.forgotten_attacks) - 1

    x = np.zeros(shape=(num_samples, num_features), dtype=np.float32)
    y_base = np.zeros(num_samples)
    y_type = np.zeros(num_samples)
    y_time = np.random.rand(num_samples)

    base_names = [
        base_info.name
        for base_info in timeline_data.forgotten_attacks[0].state_of_the_union
    ]

    for index, event in enumerate(timeline_data.forgotten_attacks):
        if index + 1 == len(timeline_data.forgotten_attacks):
            break

        previous_event = timeline_data.forgotten_attacks[index + 1]

        mins_since_last_attack = (
            event.datetime - previous_event.datetime
        ).total_seconds() / 60

        y_base[index] = base_names.index(event.report.defending_base)
        y_type[index] = get_forgotten_feature(event.defending_against)
        y_time[index] = mins_since_last_attack

        new_x = np.zeros(num_features, dtype=float)

        # Base ID of last attack
        new_x[0] = base_names.index(previous_event.report.defending_base)

        # FG type of last attack
        new_x[1] = get_forgotten_feature(previous_event.defending_against)

        for base_id, base_info in enumerate(event.state_of_the_union):
            base_index = base_names.index(base_info.name)

            # Base ID
            new_x[2 + base_index * 5 + base_id] = base_index

            # Active bases in range
            new_x[2 + base_index * 5 + base_id + 1] = base_info.active_bases

            # Mean neighborhood level
            new_x[2 + base_index * 5 + base_id + 2] = base_info.expected_level_in_range

            # Highest base in range
            new_x[2 + base_index * 5 + base_id + 3] = base_info.max_level_in_range

            # Wave level
            new_x[2 + base_index * 5 + base_id + 4] = base_info.neighborhood_roughness

        x[index] = new_x

    return x, y_base, y_type, y_time, num_features


def train_model(
    timeline_data: Timeline, max_iter: int = 50, max_bases: int = 16
) -> None:
    x, y_base, y_type, y_time, num_features = generate_training_data(
        timeline_data, max_bases
    )

    clf_base = HistGradientBoostingClassifier(max_iter=max_iter).fit(x, y_base)

    clf_type = HistGradientBoostingClassifier(max_iter=max_iter).fit(x, y_type)

    reg_time = HistGradientBoostingRegressor(max_iter=max_iter).fit(x, y_time)

    x_sample = np.zeros((1, num_features), dtype=np.float32)

    for index, model in enumerate([clf_base, clf_type, reg_time]):
        onnx_model = to_onnx(
            model,
            x_sample,
            options={id(model): {"zipmap": False} if model != reg_time else {}},
            target_opset=17,
        )

        save_clean_onnx(
            onnx_model, x_sample, filename=f"../src/cache/models/model_{index}.onnx"
        )


if __name__ == "__main__":
    timeline = read_raw_data("../data/forgotten.xlsx")
    train_model(timeline)
