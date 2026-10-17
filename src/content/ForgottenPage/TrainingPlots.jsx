import {
    Grid,
    Column,
    ContainedList,
    ContainedListItem,
    Link,
    Tile,
    Tag,
    Button,
    NumberInput,
    TextInput,
    RadioButtonGroup,
    RadioButton,
    Layer,
    Accordion,
    AccordionItem,
    InlineLoading,
    Callout,
    ContentSwitcher,
    Switch,
} from '@carbon/react';
import { LineChart, ScaleTypes, AxisPositions } from '@carbon/charts-react';

import '@carbon/charts-react/styles.css';

import roc_y_base from '../../cache/plots/roc_y_base.json';
import roc_y_type from '../../cache/plots/roc_y_type.json';

import pr_y_base from '../../cache/plots/pr_y_base.json';
import pr_y_type from '../../cache/plots/pr_y_type.json';

import loss_y_base from '../../cache/plots/loss_y_base.json';
import loss_y_type from '../../cache/plots/loss_y_type.json';
import loss_y_time from '../../cache/plots/loss_y_time.json';
import { descending } from 'firebase/firestore/pipelines';

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

const training_plot_keys = {
    LOSS: {
        name: 'Model Convergence Curve',
        description:
            "A loss curve is a graph that plots a machine learning model's prediction error (the loss) against training iterations, epochs, or processed steps.",
    },
    ROC: {
        name: 'Receiver Operating Characteristic (ROC) Curve',
        description:
            'An ROC Curve shows how well a classification model performs across all possible classification thresholds: the vertical axis (True Positive Rate / Sensitivity / Recall) is the share of actual positives correctly identified, while the horizontal axis (False Positive Rate) is the share of actual negatives wrongly labeled as positive.',
    },
    PR: {
        name: 'Precision-Recall (PR) Curve',
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
            },
            {
                name: training_plot_keys.ROC,
                description: '',
                data: roc_y_base,
                options: roc_options,
            },
            {
                name: training_plot_keys.PR,
                description: '',
                data: pr_y_base,
                options: pr_options,
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
            },
            {
                name: training_plot_keys.ROC,
                description: '',
                data: roc_y_type,
                options: roc_options,
            },
            {
                name: training_plot_keys.PR,
                description: '',
                data: pr_y_type,
                options: pr_options,
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
            },
        ],
    },
];

const TrainingPlots = props => {
    const model_name = props.model_name;
    const model_props = training_metadata.find(item => item.name == model_name);

    return (
        <>
            {model_props.plots.map((item, index) => (
                <ContainedList
                    key={index}
                    label={item.name.name}
                    kind="disclosed"
                    size="sm">
                    <ContainedListItem>
                        <div className="text-relief">
                            {item.name.description}
                        </div>
                        <div className="text-relief">{item.description}</div>
                    </ContainedListItem>
                    <ContainedListItem>
                        <br />
                        <LineChart data={item.data} options={item.options} />
                        <br />
                    </ContainedListItem>
                    <ContainedListItem />
                </ContainedList>
            ))}
        </>
    );
};

const ShapleyPlots = props => {
    return <></>;
};

export { TrainingPlots, ShapleyPlots };
