import numpy as np
import shap

from sklearn.ensemble import (
    HistGradientBoostingClassifier,
    HistGradientBoostingRegressor,
)

from cnc.models.plots import SHAPBeeswarm, SHAPDependency


def prepare_shap(
    clf: HistGradientBoostingClassifier,
    x_train: np.ndarray[object, np.dtype[np.float32]],
    x_val: np.ndarray[object, np.dtype[np.float32]],
    concept_groups: dict[str, list[int]],
) -> tuple[
    int,
    list[str],
    dict[str, np.ndarray[object, np.dtype[np.float32]]],
    dict[str, np.ndarray[object, np.dtype[np.float32]]],
]:
    masker = shap.maskers.Independent(x_train, max_samples=len(x_train))

    # NOTE: Use TreeExplainer (or Explainer)
    if isinstance(clf, HistGradientBoostingClassifier):
        explainer = shap.Explainer(clf.predict_proba, masker=masker)
        shap_explanation = explainer(x_val)

        # NOTE: Handle multi-class / probability output dimensions
        if len(shap_explanation.shape) == 3:
            raw_shap_values = shap_explanation.values[:, :, 1]  # Positive class (1.0)
        else:
            raw_shap_values = shap_explanation.values

    else:
        # NOTE: Compute SHAP Values (2D output for regression)
        explainer = shap.Explainer(clf, masker=masker)
        shap_explanation = explainer(x_val)

        # NOTE: Direct 2D assignment (No class slicing needed)
        raw_shap_values = shap_explanation.values

    # NOTE: Aggregate SHAP values per concept group
    # NOTE: Sum of SHAP values within each group per sample
    sample_count = x_val.shape[0]

    grouped_shap_values = {}
    grouped_feature_values = {}

    for group_name, feature_indices in concept_groups.items():
        grouped_shap_values[group_name] = raw_shap_values[:, feature_indices].sum(
            axis=1
        )

        # NOTE: Mean standardized feature value across group
        # NOTE: For coloring/dependence plots
        grouped_feature_values[group_name] = x_val[:, feature_indices].mean(axis=1)

    # NOTE: Sort concept groups by Mean Absolute SHAP Importance
    mean_abs_importance = {
        g: float(np.mean(np.abs(vals))) for g, vals in grouped_shap_values.items()
    }

    sorted_concepts = sorted(
        mean_abs_importance.keys(), key=lambda k: mean_abs_importance[k], reverse=True
    )

    return sample_count, sorted_concepts, grouped_shap_values, grouped_feature_values


def generate_shap_dependency(
    clf: HistGradientBoostingClassifier,
    x_train: np.ndarray[object, np.dtype[np.float32]],
    x_val: np.ndarray[object, np.dtype[np.float32]],
    concept_groups: dict[str, list[int]],
) -> list[SHAPDependency]:
    sample_count, sorted_concepts, grouped_shap_values, grouped_feature_values = (
        prepare_shap(clf, x_train, x_val, concept_groups)
    )

    dependence_data: list[SHAPDependency] = []

    for target_concept in sorted_concepts:
        target_s_vals = grouped_shap_values[target_concept]
        target_f_vals = grouped_feature_values[target_concept]

        for i in range(sample_count):
            dependence_data.append(
                SHAPDependency(
                    group=target_concept,
                    conceptValue=round(float(target_f_vals[i]), 4),
                    shapImpact=round(float(target_s_vals[i]), 4),
                )
            )

    return dependence_data


def generate_shap_beeswarm(
    clf: HistGradientBoostingClassifier | HistGradientBoostingRegressor,
    x_train: np.ndarray[object, np.dtype[np.float32]],
    x_val: np.ndarray[object, np.dtype[np.float32]],
    concept_groups: dict[str, list[int]],
) -> list[SHAPBeeswarm]:
    sample_count, sorted_concepts, grouped_shap_values, grouped_feature_values = (
        prepare_shap(clf, x_train, x_val, concept_groups)
    )

    beeswarm_data: list[SHAPBeeswarm] = []

    for concept in sorted_concepts:
        s_vals = grouped_shap_values[concept]
        f_vals = grouped_feature_values[concept]

        # NOTE: Normalize feature value between 0 (Low - Blue)
        # NOTE: And 1 (High - Red) for color scale
        f_min, f_max = f_vals.min(), f_vals.max()
        f_norm = (f_vals - f_min) / (f_max - f_min + 1e-8)

        for i in range(sample_count):
            beeswarm_data.append(
                SHAPBeeswarm(
                    group=concept,
                    shapValue=round(float(s_vals[i]), 4),
                    sampleIndex=i,
                    featureValue=round(float(f_vals[i]), 4),
                    normalizedVal=round(float(f_norm[i]), 4),
                )
            )

    return beeswarm_data


def generate_correlation_heatmap() -> list[object]:
    return []
