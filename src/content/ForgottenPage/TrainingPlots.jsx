import { ContainedList, ContainedListItem } from '@carbon/react';
import {
    LineChart,
    ScatterChart,
    HeatmapChart,
    ScaleTypes,
    AxisPositions,
} from '@carbon/charts-react';

import '@carbon/charts-react/styles.css';

import roc_y_base from '../../cache/plots/roc_y_base.json';
import roc_y_type from '../../cache/plots/roc_y_type.json';

import pr_y_base from '../../cache/plots/pr_y_base.json';
import pr_y_type from '../../cache/plots/pr_y_type.json';

import loss_y_base from '../../cache/plots/loss_y_base.json';
import loss_y_type from '../../cache/plots/loss_y_type.json';
import loss_y_time from '../../cache/plots/loss_y_time.json';

import residual_y_time from '../../cache/plots/residual_y_time.json';
import confusion_y_type from '../../cache/plots/confusion_y_type.json';

import shapley_y_base from '../../cache/plots/shapley_y_base.json';
import shapley_y_type from '../../cache/plots/shapley_y_type.json';
import shapley_y_time from '../../cache/plots/shapley_y_time.json';

import shap_pdp_y_base from '../../cache/plots/shap_pdp_y_base.json';
import shap_pdp_y_type from '../../cache/plots/shap_pdp_y_type.json';
import shap_pdp_y_time from '../../cache/plots/shap_pdp_y_time.json';

import correlation_y_base from '../../cache/plots/correlation_y_base.json';
import correlation_y_type from '../../cache/plots/correlation_y_type.json';
import correlation_y_time from '../../cache/plots/correlation_y_time.json';

const loss_options = {
    axes: {
        [AxisPositions.TOP]: {
            title: 'Iteration',
            mapsTo: 'iteration',
            scaleType: 'linear',
        },
        [AxisPositions.LEFT]: {
            title: 'Log Loss Score',
            mapsTo: 'loss',
            includeZero: false,
            visible: false,
        },
    },
    curve: ScaleTypes.curveMonotoneX,
    toolbar: {
        enabled: false,
    },
    points: {
        enabled: false,
    },
    height: '300px',
};

const roc_options = {
    axes: {
        [AxisPositions.TOP]: {
            title: 'False Positive Rate',
            mapsTo: 'fpr',
            domain: [0, 1],
        },
        [AxisPositions.LEFT]: {
            title: 'True Positive Rate',
            mapsTo: 'tpr',
            domain: [0, 1],
        },
    },
    toolbar: {
        enabled: false,
    },
    height: '400px',
};

const pr_options = {
    axes: {
        [AxisPositions.TOP]: {
            title: 'Recall',
            mapsTo: 'recall',
            domain: [0, 1],
        },
        [AxisPositions.LEFT]: {
            title: 'Precision',
            mapsTo: 'precision',
            domain: [0, 1],
        },
    },
    toolbar: {
        enabled: false,
    },
    height: '400px',
};

const residual_options = {
    axes: {
        [AxisPositions.TOP]: {
            title: 'Predicted Time-to-Attack (Minutes)',
            mapsTo: 'predictedTime',
            includeZero: false,
        },
        [AxisPositions.LEFT]: {
            title: 'Residual Error (Minutes)',
            mapsTo: 'residualError',
        },
    },
    legend: {
        enabled: false,
    },
    toolbar: {
        enabled: false,
    },
    height: '400px',
};

const confusion_options = {
    axes: {
        [AxisPositions.TOP]: {
            title: 'Predicted',
            mapsTo: 'column',
            scaleType: 'labels',
        },
        [AxisPositions.LEFT]: {
            title: 'Actual',
            mapsTo: 'row',
            scaleType: 'labels',
        },
    },
    heatmap: {
        colorLegend: {
            title: 'Sample Count',
            type: 'quantize',
        },
        colorPairing: {
            numberOfColors: 4,
            pairingOptions: ['blues'],
        },
    },
    toolbar: {
        enabled: false,
    },
    height: '400px',
};

const shap_beeswarm_options = {
    axes: {
        [AxisPositions.LEFT]: {
            mapsTo: 'group',
            scaleType: 'labels',
        },
        [AxisPositions.TOP]: {
            title: 'SHAP Value (Impact on Model Output)',
            mapsTo: 'shapValue',
        },
    },
    points: {
        radius: 4,
        fillColor: d => {
            const val = d.normalizedVal;
            return `rgb(${Math.round(val * 255)}, 50, ${Math.round(
                (1 - val) * 255
            )})`;
        },
    },
    toolbar: {
        enabled: false,
    },
    height: '400px',
};

const shap_pdp_options = {
    axes: {
        [AxisPositions.TOP]: {
            title: 'Aggregated Value',
            mapsTo: 'conceptValue',
        },
        [AxisPositions.LEFT]: {
            title: 'SHAP Value (Impact on Attack Probability)',
            mapsTo: 'shapImpact',
        },
    },
    toolbar: {
        enabled: false,
    },
    height: '400px',
};

const correlation_options = {
    axes: {
        bottom: {
            title: 'Concepts',
            mapsTo: 'column',
            scaleType: 'labels',
        },
        left: {
            title: 'Concepts',
            mapsTo: 'row',
            scaleType: 'labels',
        },
    },
    heatmap: {
        colorLegend: {
            title: 'Pearson Correlation (-1 to 1)',
            type: 'quantize',
        },
        colorPairing: {
            numberOfColors: 5,
            pairingOptions: ['purple-blue'],
        },
    },
    toolbar: {
        enabled: false,
    },
    height: '450px',
};

const training_plot_keys = {
    CORRELATION: {
        name: 'Correlation Heatmap',
        chart_type: HeatmapChart,
        description:
            'A correlation heatmap shows a correlation matrix to check for multicollinearity (e.g., if two features scale identically). Clearly, the features on number of active FG bases in range, wave level, and FG base levels are heavily correlated. Notably, as we say in previous chapters, the number of active bases is the most statistically signifcant one.',
    },
    SHAP_BEESWARM: {
        name: 'SHAP Beeswarm Plot',
        chart_type: ScatterChart,
        description:
            'In a SHAP Beeswarm plot, features are ranked vertically by overall importance. Points on the right (positive SHAP value) pushed the model toward predicting an attack; points on the left pushed the model away.',
    },
    SHAP_PDP: {
        name: 'SHAP Partial Dependence Plot',
        chart_type: ScatterChart,
        description:
            'A SHAP PDP plot shows how a single feature (e.g., time since last attack) linearly or non-linearly affects the outcome e.g. you can see if attack likelihood spikes at specific intervals or plateaus after a certain enemy strength threshold.',
    },
    CONFUSION: {
        name: 'Confusion Matrix',
        chart_type: HeatmapChart,
        description:
            'A confusion matrix shows how much a binary classifier gets confused between two prediction classes.',
    },
    RESIDUAL: {
        name: 'Residual Plot',
        chart_type: ScatterChart,
        description:
            'A residual plot shows if a prediction model is a good fit: the horizontal axis is the independent variable i.e. the predicted value, while the vertical axis is the residual i.e. the difference between the actual data and the prediction by the model. The center line represents a perfect prediction where the residual is zero.',
    },
    LOSS: {
        name: 'Model Convergence Curve',
        chart_type: LineChart,
        description:
            "A loss curve is a graph that plots a machine learning model's prediction error (the loss) against training iterations, epochs, or processed steps.",
    },
    ROC: {
        name: 'Receiver Operating Characteristic (ROC) Curve',
        chart_type: LineChart,
        description:
            'An ROC Curve shows how well a classification model performs across all possible classification thresholds: the vertical axis (True Positive Rate / Sensitivity / Recall) is the share of actual positives correctly identified, while the horizontal axis (False Positive Rate) is the share of actual negatives wrongly labeled as positive.',
    },
    PR: {
        name: 'Precision-Recall (PR) Curve',
        chart_type: LineChart,
        description:
            'A PR Curve evaluates the performance of a classification model across different decision thresholds: the horizontal axis (sensitivity or True Positive Rate) measures the fraction of actual positive cases that the model correctly identified while the vertical axis (positive predictive value) measures how many of the predicted positive cases were actually correct.',
    },
};

const training_metadata = [
    {
        name: 'y_base',
        plots: [
            {
                name: training_plot_keys.LOSS,
                description: '',
                data: loss_y_base,
                options: loss_options,
                is_secondary: false,
            },
            {
                name: training_plot_keys.ROC,
                description: '',
                data: roc_y_base,
                options: roc_options,
                is_secondary: false,
            },
            {
                name: training_plot_keys.PR,
                description: '',
                data: pr_y_base,
                options: pr_options,
                is_secondary: false,
            },
            {
                name: training_plot_keys.SHAP_BEESWARM,
                description: '',
                data: shapley_y_base,
                options: shap_beeswarm_options,
                is_secondary: true,
            },
            {
                name: training_plot_keys.SHAP_PDP,
                description: '',
                data: shap_pdp_y_base,
                options: shap_pdp_options,
                is_secondary: true,
            },
            {
                name: training_plot_keys.CORRELATION,
                data: correlation_y_base,
                options: correlation_options,
                is_secondary: true,
            },
        ],
    },
    {
        name: 'y_type',
        plots: [
            {
                name: training_plot_keys.LOSS,
                description: '',
                data: loss_y_type,
                options: loss_options,
                is_secondary: false,
            },
            {
                name: training_plot_keys.ROC,
                description: '',
                data: roc_y_type,
                options: roc_options,
                is_secondary: false,
            },
            {
                name: training_plot_keys.PR,
                description: '',
                data: pr_y_type,
                options: pr_options,
                is_secondary: false,
            },
            {
                name: training_plot_keys.CONFUSION,
                description: '',
                data: confusion_y_type,
                options: confusion_options,
                is_secondary: false,
            },
            {
                name: training_plot_keys.SHAP_BEESWARM,
                description: '',
                data: shapley_y_type,
                options: shap_beeswarm_options,
                is_secondary: true,
            },
            {
                name: training_plot_keys.SHAP_PDP,
                description: '',
                data: shap_pdp_y_type,
                options: shap_pdp_options,
                is_secondary: true,
            },
            {
                name: training_plot_keys.CORRELATION,
                data: correlation_y_type,
                options: correlation_options,
                is_secondary: true,
            },
        ],
    },
    {
        name: 'y_time',
        plots: [
            {
                name: training_plot_keys.LOSS,
                description: '',
                data: loss_y_time,
                options: loss_options,
                is_secondary: false,
            },
            {
                name: training_plot_keys.RESIDUAL,
                description: '',
                data: residual_y_time,
                options: residual_options,
                is_secondary: false,
            },
            {
                name: training_plot_keys.SHAP_BEESWARM,
                description: '',
                data: shapley_y_time,
                options: shap_beeswarm_options,
                is_secondary: true,
            },
            {
                name: training_plot_keys.SHAP_PDP,
                description: '',
                data: shap_pdp_y_time,
                options: shap_pdp_options,
                is_secondary: true,
            },
            {
                name: training_plot_keys.CORRELATION,
                data: correlation_y_time,
                options: correlation_options,
                is_secondary: true,
            },
        ],
    },
];

const TrainingPlots = props => {
    const model_name = props.model_name;
    const model_props = training_metadata.find(item => item.name == model_name);

    return (
        <>
            {model_props.plots
                .filter(item => !item.is_secondary)
                .map((item, index) => {
                    const Component = item.name.chart_type;

                    return (
                        <ContainedList
                            key={index}
                            label={item.name.name}
                            kind="disclosed"
                            size="sm">
                            <ContainedListItem>
                                <div className="text-relief">
                                    {item.name.description}
                                </div>
                                <div className="text-relief">
                                    {item.description}
                                </div>
                            </ContainedListItem>
                            <ContainedListItem>
                                <br />
                                <Component
                                    data={item.data}
                                    options={item.options}
                                />
                                <br />
                            </ContainedListItem>
                            <ContainedListItem />
                        </ContainedList>
                    );
                })}
        </>
    );
};

const ShapleyPlots = props => {
    const model_name = props.model_name;
    const model_props = training_metadata.find(item => item.name == model_name);

    return (
        <>
            {model_props.plots
                .filter(item => item.is_secondary)
                .map((item, index) => {
                    const Component = item.name.chart_type;

                    return (
                        <ContainedList
                            key={index}
                            label={item.name.name}
                            kind="disclosed"
                            size="sm">
                            <ContainedListItem>
                                <div className="text-relief">
                                    {item.name.description}
                                </div>
                                <div className="text-relief">
                                    {item.description}
                                </div>
                            </ContainedListItem>
                            <ContainedListItem>
                                <br />
                                <Component
                                    data={item.data}
                                    options={item.options}
                                />
                                <br />
                            </ContainedListItem>
                            <ContainedListItem />
                        </ContainedList>
                    );
                })}
        </>
    );
};

export { TrainingPlots, ShapleyPlots };
