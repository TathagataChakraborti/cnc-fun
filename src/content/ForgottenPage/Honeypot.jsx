import React from 'react';
import {
    Grid,
    Column,
    ContainedList,
    ContainedListItem,
    Link,
    Tile,
    Tag,
    StructuredListWrapper,
    StructuredListHead,
    StructuredListBody,
    StructuredListRow,
    StructuredListCell,
    ContentSwitcher,
    Switch,
} from '@carbon/react';
import {
    AreaChart,
    LineChart,
    ScaleTypes,
    AxisPositions,
} from '@carbon/charts-react';
import { windowedExpandingKSTest, pmfToCDF } from '../../@stats/kStest';
import { get_all_combinations } from '../../components/BasicElements/Info';
import { print_date_str } from '../../components/BasicElements/Info';

import '@carbon/charts-react/styles.css';
import tmp_data from '../../cache/jump_trend.json';

const data = tmp_data.filter(item =>
    item.base_data.reduce(
        (flag, item) =>
            flag && (item.active_bases === 0 || item.neighborhood.length > 0),
        true
    )
);

let forgotten_types = ['Base', 'Camp'];

let max_date = data[0].datetime;
let min_date = data[data.length - 1].datetime;

const alpha = 0.05;
const beta = 0.05;

const normalize = array => {
    let tmp = array.map(item => Math.abs(item));

    tmp = tmp.map(item => item / Math.sumPrecise(tmp));
    return tmp;
};

function computeKS(data) {
    // AI-generated
    // 1. Define discrete domain outcomes
    const domain = data[0].base_data.map(item => item.name);

    // 2. Define non-stationary CDF generator functions for step t
    function getCDFA(sample, domain) {
        let probs = [];
        let names = sample.base_data.map(item => item.name);

        domain.forEach(item => {
            const tmp = sample.base_data.find(i => i.name === item)
                .active_bases;

            probs.push(sample.defending_base === item && tmp === 0 ? 1 : tmp);
        });

        return pmfToCDF(normalize(probs));
    }

    function getCDFB(sample, domain) {
        let probs = new Array(domain.length).fill(1 / domain.length);

        return pmfToCDF(normalize(probs));
    }

    // 3. Run K-S test over a rolling window of 15 samples
    const ksResults = windowedExpandingKSTest(
        data.toReversed(),
        getCDFA,
        getCDFB,
        domain,
        20
    );

    let plot_data = [];

    ksResults.forEach((item, index) => {
        plot_data = plot_data.concat([
            {
                date: new Date(item.datetime),
                value: item.distanceA,
                group: 'Distance to H2',
            },
            {
                date: new Date(item.datetime),
                value: item.distanceB,
                group: 'Distance to H1',
            },
        ]);
    });

    return plot_data;
}

function computeLTR(data) {
    let h1 = 0;
    let h2 = 0;
    let h3 = 0;
    let h4 = 0;

    let a = Math.log(beta / (1 - alpha));
    let b = Math.log((1 - beta) / alpha);
    let z2 = 0;
    let z3 = 0;
    let z4 = 0;

    let trajectory = [];
    let wald_sprt = [];

    data.toReversed().forEach(data_item => {
        const categories = data_item.base_data.map(item => item.name);
        const sample_index = categories.indexOf(data_item.defending_base);

        const active_array = data_item.base_data.map(item =>
            item.active_bases === 0 ? 1 : item.active_bases
        );

        const active_strength_array = data_item.base_data.map(
            item => item.expected_level_in_range
        );

        const waves_array = data_item.base_data.map(
            item => item.neighborhood_roughness
        );

        const h1_dist = new Array(data_item.base_data.length).fill(
            1 / data_item.base_data.length
        );

        const h2_dist = normalize(active_array);
        const h3_dist = normalize(active_strength_array);
        const h4_dist = normalize(waves_array);

        h1 += Math.log(h1_dist[sample_index]);
        h2 += Math.log(h2_dist[sample_index]);
        h4 += Math.log(h4_dist[sample_index]);

        z2 += Math.log(h2_dist[sample_index] / h1_dist[sample_index]);
        z4 += Math.log(h4_dist[sample_index] / h1_dist[sample_index]);

        if (h3_dist[sample_index] === 0) {
            h3 += Math.log(h1_dist[sample_index]);
        } else {
            h3 += Math.log(h3_dist[sample_index]);
            z3 += Math.log(h3_dist[sample_index] / h1_dist[sample_index]);
        }

        const cumsum = [h1, h2, h3, h4].map((item, index) => {
            return {
                date: new Date(data_item.datetime),
                value: item,
                group: 'H' + (index + 1),
            };
        });

        const wald = [z2, z3, z4].map((item, index) => {
            return {
                date: new Date(data_item.datetime),
                value: item,
                group: 'H' + (index + 2),
            };
        });

        trajectory = trajectory.concat(cumsum);

        if (new Date(data_item.datetime) < new Date('2026-06-06')) {
            wald_sprt = wald_sprt.concat(wald);
            wald_sprt = wald_sprt.concat([
                {
                    date: new Date(data_item.datetime),
                    value: a,
                    group: 'Lower Bound',
                },
                {
                    date: new Date(data_item.datetime),
                    value: b,
                    group: 'Upper Bound',
                },
            ]);
        }
    });

    h4 = Math.round(h4 - h1);
    h3 = Math.round(h3 - h1);
    h2 = Math.round(h2 - h1);
    h1 = 0;

    return { h1, h2, h3, h4, trajectory, wald_sprt };
}

const h_pass = 50;
const hypothesis_map = {
    h1: { name: 'H1', description: 'At uniform random chance' },
    h2: {
        name: 'H2',
        description: 'In proportion to how many active FG bases are in range',
    },
    h3: {
        name: 'H3',
        description:
            'In proportion to number as well as strength of FG bases in range',
    },
    h4: { name: 'H4', description: 'In proportion to wave level of a base' },
};

const ltr_options = {
    axes: {
        [AxisPositions.LEFT]: {
            mapsTo: 'value',
            visible: false,
            domain: [-500, 0],
        },
        [AxisPositions.TOP]: {
            scaleType: ScaleTypes.TIME,
            mapsTo: 'date',
        },
    },
    toolbar: {
        enabled: false,
    },
    legend: {
        position: 'bottom',
    },
    grid: {
        x: {
            enabled: false,
        },
        y: {
            enabled: false,
        },
    },
    timeScale: {
        addSpaceOnEdges: 0,
    },
    curve: 'curveMonotoneX',
    height: '240px',
};

const ks_options = {
    axes: {
        [AxisPositions.LEFT]: {
            mapsTo: 'value',
            visible: false,
        },
        [AxisPositions.TOP]: {
            visible: false,
            scaleType: ScaleTypes.TIME,
            mapsTo: 'date',
        },
    },
    toolbar: {
        enabled: false,
    },
    legend: {
        position: 'top',
    },
    grid: {
        x: {
            enabled: false,
        },
        y: {
            enabled: false,
        },
    },
    points: {
        radius: 0,
    },
    curve: 'curveMonotoneX',
    height: '125px',
};

const sprt_options = {
    axes: {
        [AxisPositions.LEFT]: {
            mapsTo: 'value',
            visible: false,
        },
        [AxisPositions.TOP]: {
            scaleType: ScaleTypes.TIME,
            mapsTo: 'date',
        },
    },
    toolbar: {
        enabled: false,
    },
    legend: {
        position: 'bottom',
    },
    grid: {
        x: {
            enabled: false,
        },
        y: {
            enabled: false,
        },
    },
    timeScale: {
        addSpaceOnEdges: 0,
    },
    points: {
        radius: 0,
    },
    curve: 'curveMonotoneX',
    height: '175px',
};

class Honeypot extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            data: [],
            selected_fg_type: [forgotten_types[0]],
        };
    }

    componentDidMount() {
        this.updateSelection({ name: forgotten_types[0], index: 0 });
    }

    updateSelection(e) {
        const tmp = e.name.split(', ');

        this.setState({
            ...this.state,
            selected_fg_type: tmp,
            data: data.filter(item => tmp.includes(item.fg_type)),
            selected_index: e.index,
        });
    }

    render() {
        let result = computeLTR(this.state.data);
        let ks_result = [];

        if (this.state.data.length > 0) {
            ks_result = computeKS(this.state.data);
        }
        return (
            <Grid>
                <Column lg={6} md={8} sm={4}>
                    <Tile>
                        In the previous chapter, we saw the hints of our first
                        statistically significant result: FG attacks were all
                        clumped on bases in higher wave areas even if a jump by
                        itself did not statistically produce more attacks. On
                        the right, we hypthesize different distributions that
                        produce FG attacks and compute their relative
                        probability mass according to the{' '}
                        <Link
                            href="https://en.wikipedia.org/wiki/Likelihood-ratio_test"
                            target="_blank">
                            Likelihood Ratio Test
                        </Link>{' '}
                        (LTR) for the{' '}
                        <span className="text-alert">
                            {this.state.data.length}
                        </span>{' '}
                        FG {this.state.selected_fg_type.join(', ')} attacks
                        recorded between {print_date_str(min_date)} and{' '}
                        {print_date_str(max_date)}, considering independent
                        <sup className="text-alert">1</sup> but non-identical
                        <sup className="text-alert">2</sup> samples.
                        <div className="footnote">
                            <sup className="text-alert">1</sup>The probability
                            of an attack does not depend on the properties of
                            the previous attack.
                        </div>
                        <div className="footnote">
                            <sup className="text-alert">2</sup>The categories of
                            the distribution (number of defending bases) change
                            over time.
                        </div>
                        As suspected, the number of active FG bases in range as
                        well as the wave level makes an attack from an FG base
                        more likely.{' '}
                        <strong>
                            This is statistical backing for the decoy strategy
                            of placing cash bases in vulnerable locations to
                            protect the primary base.
                        </strong>
                        <br />
                        <br />
                        Interestingly, the actual level of the FG bases in range
                        do not seem to have an impact at all. Also note how
                        attacks{' '}
                        <Link
                            style={{ cursor: 'pointer' }}
                            inline
                            onClick={() => {
                                this.updateSelection({
                                    name: forgotten_types[1],
                                    index: 1,
                                });
                            }}>
                            from camps only
                        </Link>{' '}
                        (or{' '}
                        <Link
                            style={{ cursor: 'pointer' }}
                            inline
                            onClick={() => {
                                this.updateSelection({
                                    name: forgotten_types.join(', '),
                                    index: 2,
                                });
                            }}>
                            {' '}
                            together with bases
                        </Link>
                        ) invalidates (or dilutes respectively) the strength of
                        the result, indicating that FG camps are likely
                        following {hypothesis_map.h1.name}. On the right, you
                        can see the cumulative log-likelihood trajectories of
                        each hypothesis (higher is better).
                    </Tile>
                    <ContainedList
                        isInset
                        kind="disclosed"
                        label="Windowed Kolmogorov-Smirnov (K-S) Test"
                        size="sm">
                        <ContainedListItem>
                            The windowed{' '}
                            <Link
                                href="https://en.wikipedia.org/wiki/Kolmogorov%E2%80%93Smirnov_test"
                                target="_blank">
                                Kolmogorov–Smirnov (K-S) test
                            </Link>{' '}
                            tells us if the underlying distributions have
                            changed over time. This is important especially
                            because game mechanics change with higher FG levels
                            (e.g. base level 50). Distance to{' '}
                            {hypothesis_map.h2.name} remains comfortably lower
                            than {hypothesis_map.h1.name}.
                        </ContainedListItem>
                        <ContainedList
                            isInset
                            kind="disclosed"
                            label="Sequential Probability Ratio Test (SPRT)"
                            size="sm">
                            <ContainedListItem>
                                <Link
                                    href="https://en.wikipedia.org/wiki/Sequential_probability_ratio_test"
                                    target="_blank">
                                    Wald's SPRT
                                </Link>{' '}
                                measure tells us how quickly we can confirm a
                                hypothesis relative to {hypothesis_map.h1.name}.
                                When the measure goes past any of the two
                                bounding 5% error rate lines, we can stop
                                measuring further. By early June, we can already
                                confirm statistically, with 5% error, that{' '}
                                {hypothesis_map.h2.name} and{' '}
                                {hypothesis_map.h4.name} and not{' '}
                                {hypothesis_map.h3.name} is true relative to{' '}
                                {hypothesis_map.h1.name}.
                            </ContainedListItem>
                        </ContainedList>
                    </ContainedList>
                </Column>
                <Column lg={8} md={8} sm={4}>
                    <StructuredListWrapper
                        isFlush
                        isCondensed
                        aria-label="Hypothesis overview">
                        <StructuredListHead>
                            <StructuredListRow head>
                                <StructuredListCell head>
                                    Hypothesis: Attacks from FG{' '}
                                    {this.state.selected_fg_type.join(', ')} are
                                    produced
                                </StructuredListCell>
                                <StructuredListCell head>
                                    LTR
                                </StructuredListCell>
                            </StructuredListRow>
                        </StructuredListHead>
                        <StructuredListBody>
                            {Object.keys(hypothesis_map).map((item, index) => (
                                <StructuredListRow key={index}>
                                    <StructuredListCell noWrap>
                                        <Tag
                                            type={
                                                result[item] > h_pass
                                                    ? 'magenta'
                                                    : 'gray'
                                            }
                                            className="square-tag"
                                            size="sm">
                                            {hypothesis_map[item].name}
                                        </Tag>{' '}
                                        &nbsp;{' '}
                                        {hypothesis_map[item].description}
                                    </StructuredListCell>
                                    <StructuredListCell>
                                        {result[item]}
                                    </StructuredListCell>
                                </StructuredListRow>
                            ))}
                        </StructuredListBody>
                    </StructuredListWrapper>
                    <br />
                    <ContentSwitcher
                        selectedIndex={this.state.selected_index}
                        lowContrast
                        size="sm"
                        onChange={this.updateSelection.bind(this)}>
                        {get_all_combinations(forgotten_types).map(
                            (item, index) => (
                                <Switch
                                    key={index}
                                    name={item.join(', ')}
                                    text={item.join(', ')}
                                />
                            )
                        )}
                    </ContentSwitcher>
                    <br />
                    <br />
                    <div style={{ paddingBottom: '8px' }}>
                        <LineChart
                            data={result.trajectory}
                            options={ltr_options}
                        />
                    </div>
                    <LineChart data={ks_result} options={ks_options} />
                    <br />
                    <br />
                    <AreaChart data={result.wald_sprt} options={sprt_options} />
                </Column>
            </Grid>
        );
    }
}

export { Honeypot };
