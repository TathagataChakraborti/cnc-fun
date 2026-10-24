import React from 'react';
import {
    Link,
    ContainedList,
    ContainedListItem,
    UnorderedList,
    ListItem,
} from '@carbon/react';
import {
    LineChart,
    ScatterChart,
    HeatmapChart,
    ScaleTypes,
    AxisPositions,
} from '@carbon/charts-react';
import { large_random_number } from '../../components/BasicElements/Info';

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
            'In a SHAP Beeswarm plot, features are ranked vertically by overall importance. Points on the right (positive SHAP value) pushed the model toward predicting an attack; points on the left pushed the model away. Consistent with previous plots, the number of active bases in range is a dominant feature. But note how the model flips to the mean FG level when it has to decide on the next FG attack type! Also, the base ID features prominently when deciding on the time to next attack probably because a vulnerable base remains so for a while until the move timer is over.',
    },
    SHAP_PDP: {
        name: 'SHAP Partial Dependence Plot',
        chart_type: ScatterChart,
        description:
            'A SHAP PDP plot shows how a single feature (e.g., time since last attack) linearly or non-linearly affects the outcome e.g. you can see if attack likelihood spikes at specific intervals or plateaus after a certain enemy strength threshold. You can click on the feature names below to explore their impact individually.',
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
            "A loss curve is a graph that plots a machine learning model's prediction error (the loss) against training iterations. We have stopped when the validation error has stabilized, indicating that the model is ready to use.",
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
            'A PR curve shows the trade-off between precision and recall. Unlike an ROC curve which focuses on both classes, a PR curve focuses entirely on how well our model handles the positive class (for us, this is whether the next attack will be from an FG base). The vertical axis shows precision which represents out of all the times our model cried wolf, what percentage of those were actually real?  High precision means very few false alarms. The horizontal axis shows recall or sensitivity which represents out of all the base attacks, what percentage did our model successfully catch? High recall means our model rarely misses an attack.',
    },
};

const training_metadata = [
    {
        name: 'y_base',
        plots: [
            {
                name: training_plot_keys.LOSS,
                data: loss_y_base,
                options: loss_options,
                is_secondary: false,
            },
            {
                name: training_plot_keys.ROC,
                description:
                    'There is not much discrimanatory power on the base ID really. Some bases (e.g. 7 and 6 where the curve shoots up toward the top-left corner, meaning the model can catch almost all true instances) fare better than others, but I am yet to see a useful pattern here.',
                data: roc_y_base,
                options: roc_options,
                is_secondary: false,
            },
            {
                name: training_plot_keys.PR,
                description: (
                    <UnorderedList>
                        <ListItem>
                            Most of the mid-to-lower curves bunch up densely
                            between 0.10 and 0.35 precision. This suggests that
                            the model frequently confuses several of the base
                            categories with one another, struggling to cleanly
                            separate them using the current feature set.
                        </ListItem>
                        <ListItem>
                            The lower ID bases show the highest overall curves
                            and reliability (highest AP). indicating that the AI
                            model has learned distinct patterns for these bases.
                            This makes sense because these were my attack bases!
                            It is very difficult to pick correctly among the
                            cash bases at the back since these are often in
                            identical circumstances.
                        </ListItem>
                    </UnorderedList>
                ),
                data: pr_y_base,
                options: pr_options,
                is_secondary: false,
            },
            {
                name: training_plot_keys.SHAP_BEESWARM,
                data: shapley_y_base,
                options: shap_beeswarm_options,
                is_secondary: true,
            },
            {
                name: training_plot_keys.SHAP_PDP,
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
                data: loss_y_type,
                options: loss_options,
                is_secondary: false,
            },
            {
                name: training_plot_keys.ROC,
                description: (
                    <UnorderedList>
                        <ListItem></ListItem>
                        An area under the curve (AUC) of 0.75 indicates that our
                        model has quite good, reliable discriminative ability.
                        It comfortably outperforms random guessing (0.50 along
                        the diagonal) and successfully separates base attacks
                        from camps.
                        <ListItem>
                            Notice how aggressively the curve shoots upward in
                            the early section (between 0 and 0.2 on the False
                            Positive Rate axis). This is our ideal threshold
                            zone. It means the model can capture roughly 40% to
                            60% of all base attacks while keeping false alarms
                            exceptionally low (under 15–20%). If we want to
                            minimize annoying false alerts of an incoming FG
                            base attack, this is the region to configure our
                            threshold.
                        </ListItem>
                    </UnorderedList>
                ),
                data: roc_y_type,
                options: roc_options,
                is_secondary: false,
            },
            {
                name: training_plot_keys.PR,
                description: (
                    <UnorderedList>
                        <ListItem>
                            An Average Precision (AP) of 0.69 indicates that the
                            model is performing quite well above random baseline
                            (which sits around 0.50, as evidenced by the curve
                            leveling off near 0.5 at full recall).
                            <UnorderedList nested>
                                <ListItem>
                                    The sharp jagged drops and spikes at the
                                    beginning is because of not enough samples.
                                </ListItem>
                                <ListItem>
                                    The model quickly recovers, hitting its
                                    highest sustained precision of ~0.85 at
                                    around 0.2 recall. If you set a very strict
                                    threshold, 85% of your alerts will be true
                                    attacks, though you will miss a vast
                                    majority of them.
                                </ListItem>
                                <ListItem>
                                    Between 0.4 and 0.6 recall, is the optimal
                                    operating window. It means you can
                                    successfully catch roughly half to 60% of
                                    all incoming game attacks while maintaining
                                    a dependable 70% accuracy rate on your
                                    alerts.
                                </ListItem>
                                <ListItem>
                                    If you push the model to catch nearly all
                                    attacks (recall moving toward 1.0),
                                    precision degrades linearly down to ~0.50
                                    (effectively a coin-flip).
                                </ListItem>
                            </UnorderedList>
                        </ListItem>
                    </UnorderedList>
                ),
                data: pr_y_type,
                options: pr_options,
                is_secondary: false,
            },
            {
                name: training_plot_keys.CONFUSION,
                description:
                    "The true positives and true negatives (there is / isn't an attack of the correct FG type when predicted) are very high relative to the mistakes. Pretty good!",
                data: confusion_y_type,
                options: confusion_options,
                is_secondary: false,
            },
            {
                name: training_plot_keys.SHAP_BEESWARM,
                data: shapley_y_type,
                options: shap_beeswarm_options,
                is_secondary: true,
            },
            {
                name: training_plot_keys.SHAP_PDP,
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
                data: loss_y_time,
                options: loss_options,
                is_secondary: false,
            },
            {
                name: training_plot_keys.RESIDUAL,
                description:
                    'Our model is reliable for near-term attack predictions (60–90 min), but becomes unstable and overly pessimistic (over-predicting time) when trying to forecast events further out into the future, largely due to data sparsity in those ranges.',
                data: residual_y_time,
                options: residual_options,
                is_secondary: false,
            },
            {
                name: training_plot_keys.SHAP_BEESWARM,
                data: shapley_y_time,
                options: shap_beeswarm_options,
                is_secondary: true,
            },
            {
                name: training_plot_keys.SHAP_PDP,
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

class ShapleyPlots extends React.Component {
    constructor(props) {
        super(props);
    }

    pdpIllustration() {
        this.props.updateTabSelection({
            name: 'y_type',
            selected_legends: ['Active bases in range', 'Mean FG level'],
        });
    }

    render() {
        const model_props = training_metadata.find(
            item => item.name == this.props.model_name
        );

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
                                    {item.description && (
                                        <div className="text-relief">
                                            {item.description}
                                        </div>
                                    )}
                                    {item.name ===
                                        training_plot_keys.SHAP_PDP && (
                                        <div className="text-relief">
                                            For example, for predicting{' '}
                                            <Link
                                                onClick={this.pdpIllustration.bind(
                                                    this
                                                )}
                                                style={{
                                                    cursor: 'pointer',
                                                }}>
                                                FG type
                                            </Link>
                                            , there is a cluster at 0 which
                                            means that the AI model has
                                            understood that with no bases around
                                            there will be no base attack, while
                                            the scatter on both sides of the
                                            horizontal 0 line in the middle
                                            points to the mean level being a
                                            slight deterrant as a dominant
                                            indicating feature in relation to
                                            the number of active bases in range
                                            which demonstrates positive values
                                            in that area. Similarly, for higher
                                            base levels, we get positive SHAP
                                            only which shows that the AI has
                                            been able to learn of the &gt;50
                                            difficulty upgrade on FG attacks!
                                        </div>
                                    )}
                                </ContainedListItem>
                                <ContainedListItem>
                                    <br />
                                    <Component
                                        key={large_random_number()}
                                        data={item.data}
                                        options={{
                                            ...item.options,
                                            data: {
                                                selectedGroups:
                                                    item.name ===
                                                    training_plot_keys.SHAP_PDP
                                                        ? this.props
                                                              .selected_legends
                                                        : [],
                                            },
                                        }}
                                    />
                                    <br />
                                </ContainedListItem>
                            </ContainedList>
                        );
                    })}
            </>
        );
    }
}

export { TrainingPlots, ShapleyPlots };
