import json

from collections.abc import Sequence

import numpy as np
import onnx
import onnx.helper
import onnxruntime as ort

from skl2onnx import to_onnx
from sklearn.model_selection import train_test_split

from cnc.helpers.training import (
    generate_confusion,
    generate_loss_curve,
    generate_pr_binary_class,
    generate_pr_multi_binary_class,
    generate_residual_plot,
    generate_roc_binary_class,
    generate_roc_multi_class,
)
from cnc.models.forgotten import FORGOTTEN, Timeline
from cnc.models.plots import CONFUSION, LOSS, PR, RESIDUAL, ROC
from cnc.models.training import PlotType, TaskInfo, TaskType
from cnc.read_raw_data import read_raw_data


BASE_FEATURES = 2
FEATURES_PER_BASE = 5

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
    return BASE_FEATURES + FEATURES_PER_BASE * max_bases


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

        for base_info in event.state_of_the_union:
            base_id = base_names.index(base_info.name)
            base_index = BASE_FEATURES + base_id * FEATURES_PER_BASE

            # Base ID
            new_x[base_index] = base_id

            # Active bases in range
            new_x[base_index + 1] = base_info.active_bases

            # Mean neighborhood level
            new_x[base_index + 2] = base_info.expected_level_in_range

            # Highest base in range
            new_x[base_index + 3] = base_info.max_level_in_range

            # Wave level
            new_x[base_index + 4] = base_info.neighborhood_roughness

        x[index] = new_x

    return x, y_base, y_type, y_time, num_features


def train_model(
    timeline_data: Timeline, max_iter: int = 100, max_bases: int = 16
) -> None:
    x, y_base, y_type, y_time, num_features = generate_training_data(
        timeline_data, max_bases
    )

    training_map = [
        TaskInfo(
            name="y_base",
            x=x,
            y=y_base,
            task_type=TaskType.CLASSIFICATION,
            plot_types=[
                PlotType.LOSS,
                PlotType.ROC,
                PlotType.PR,
                # PlotType.SHAPLEY,
                # PlotType.SHAP_PDP,
            ],
        ),
        TaskInfo(
            name="y_type",
            x=x,
            y=y_type,
            task_type=TaskType.CLASSIFICATION,
            plot_types=[
                PlotType.LOSS,
                PlotType.ROC,
                PlotType.PR,
                PlotType.CONFUSION,
                # PlotType.SHAPLEY,
                # PlotType.SHAP_PDP,
            ],
        ),
        TaskInfo(
            name="y_time",
            x=x,
            y=y_time,
            task_type=TaskType.REGRESSION,
            plot_types=[
                PlotType.LOSS,
                PlotType.RESIDUAL,
                # PlotType.SHAPLEY,
                # PlotType.SHAP_PDP,
            ],
        ),
    ]

    for task in training_map:
        x_train, x_val, y_train, y_val = train_test_split(
            task.x, task.y, test_size=0.2, random_state=42
        )

        clf = task.train(
            max_iter=max_iter,
            early_stopping=True,
            scoring="loss",
            validation_fraction=0.2,
            n_iter_no_change=10,
            random_state=42,
        ).fit(x_train, y_train)

        x_sample = np.zeros((1, num_features), dtype=np.float32)

        onnx_model = to_onnx(
            clf,
            x_sample,
            options={id(clf): {"zipmap": False} if task.zipmap else {}},
            target_opset=17,
        )

        save_clean_onnx(
            onnx_model, x_sample, filename=f"../src/cache/models/{task.name}.onnx"
        )

        for plot_type in task.plot_types:
            plot_data: Sequence[ROC | PR | LOSS | RESIDUAL | CONFUSION] = []

            if plot_type == PlotType.ROC:
                if task.num_classes > 2:
                    plot_data = generate_roc_multi_class(
                        clf, x_val, y_val, num_classes=task.num_classes
                    )

                else:
                    plot_data = generate_roc_binary_class(clf, x_val, y_val)

            if plot_type == PlotType.PR:
                if task.num_classes > 2:
                    plot_data = generate_pr_multi_binary_class(
                        clf, x_val, y_val, num_classes=task.num_classes
                    )

                else:
                    plot_data = generate_pr_binary_class(clf, x_val, y_val)

            if plot_type == PlotType.LOSS:
                plot_data = generate_loss_curve(clf)

            if plot_type == PlotType.RESIDUAL:
                plot_data = generate_residual_plot(clf, x_val, y_val)

            if plot_type == PlotType.CONFUSION:
                plot_data = generate_confusion(clf, x_val, y_val)

            with open(f"../src/cache/plots/{plot_type}_{task.name}.json", "w") as df:
                json.dump([item.model_dump() for item in plot_data], df, indent=4)


if __name__ == "__main__":
    timeline = read_raw_data("../data/forgotten.xlsx")
    train_model(timeline)
