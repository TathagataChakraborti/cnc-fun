import numpy as np

from sklearn.ensemble import (
    HistGradientBoostingClassifier,
    HistGradientBoostingRegressor,
)
from sklearn.metrics import (
    auc,
    average_precision_score,
    precision_recall_curve,
    roc_auc_score,
    roc_curve,
)
from sklearn.preprocessing import label_binarize

from cnc.models.plots import LOSS, PR, ROC


def generate_roc_binary_class(
    clf: HistGradientBoostingClassifier,
    x: np.ndarray[object, np.dtype[np.float32]],
    y: np.ndarray[object, np.dtype[np.int64]],
) -> list[ROC]:
    y_scores_bin = clf.predict_proba(x)[:, 1]

    fpr, tpr, _ = roc_curve(y, y_scores_bin)
    auc_score = roc_auc_score(y, y_scores_bin)

    return [
        ROC(
            group=f"AUC = {auc_score:.2f}",
            fpr=round(float(f), 4),
            tpr=round(float(t), 4),
        )
        for f, t in zip(fpr, tpr)
    ]


def generate_roc_multi_class(
    clf: HistGradientBoostingClassifier,
    x: np.ndarray[object, np.dtype[np.float32]],
    y: np.ndarray[object, np.dtype[np.int64]],
    num_classes: int,
) -> list[ROC]:
    y_scores_multi = clf.predict_proba(x)
    y_va_bin = label_binarize(y, classes=list(range(num_classes)))

    plot_data: list[ROC] = []

    for i in range(num_classes):
        f_m, t_m, _ = roc_curve(y_va_bin[:, i], y_scores_multi[:, i])
        a_m = auc(f_m, t_m)

        for f, t in zip(f_m, t_m):
            plot_data.append(
                ROC(
                    group=f"Base {i} ({a_m:.2f})",
                    fpr=round(float(f), 4),
                    tpr=round(float(t), 4),
                )
            )

    return plot_data


def generate_pr_binary_class(
    clf: HistGradientBoostingClassifier,
    x: np.ndarray[object, np.dtype[np.float32]],
    y: np.ndarray[object, np.dtype[np.int64]],
) -> list[PR]:
    y_scores_bin = clf.predict_proba(x)[:, 1]

    p_bin, r_bin, _ = precision_recall_curve(y, y_scores_bin)
    ap_score = average_precision_score(y, y_scores_bin)

    return [
        PR(
            group=f"AP = {ap_score:.2f}",
            recall=round(float(r), 4),
            precision=round(float(p), 4),
        )
        for p, r in zip(p_bin, r_bin)
    ]


def generate_pr_multi_binary_class(
    clf: HistGradientBoostingClassifier,
    x: np.ndarray[object, np.dtype[np.float32]],
    y: np.ndarray[object, np.dtype[np.int64]],
    num_classes: int,
) -> list[PR]:
    y_scores_multi = clf.predict_proba(x)
    y_va_bin = label_binarize(y, classes=list(range(num_classes)))

    plot_data: list[PR] = []

    for i in range(num_classes):
        p_m, r_m, _ = precision_recall_curve(y_va_bin[:, i], y_scores_multi[:, i])

        ap_m = average_precision_score(y_va_bin[:, i], y_scores_multi[:, i])
        for pr, re in zip(p_m[::5], r_m[::5]):
            plot_data.append(
                PR(
                    group=f"Base {i} ({ap_m:.2f})",
                    recall=round(float(re), 4),
                    precision=round(float(pr), 4),
                )
            )

    return plot_data


def generate_loss_curve(
    clf: HistGradientBoostingClassifier | HistGradientBoostingRegressor,
) -> list[LOSS]:
    train_scores = clf.train_score_
    val_scores = clf.validation_score_ if hasattr(clf, "validation_score_") else []

    loss_data: list[LOSS] = []

    for iteration, (train_loss, val_loss) in enumerate(zip(train_scores, val_scores)):
        loss_data.append(
            LOSS(
                group="Training Loss",
                iteration=iteration + 1,
                loss=round(float(train_loss), 4),
            )
        )

        loss_data.append(
            LOSS(
                group="Validation Loss",
                iteration=iteration + 1,
                loss=round(float(val_loss), 4),
            )
        )

    return loss_data


def generate_confusion() -> list[ROC]:
    return []


def generate_residual_plot() -> list[ROC]:
    return []
