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
import { Touch_1, CheckmarkFilled, Api_1 } from '@carbon/icons-react';
import { ScatterChart, ScaleTypes, AxisPositions } from '@carbon/charts-react';
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

function computeLTR(data) {
    let h1 = 0;
    let h2 = 0;
    let h3 = 0;
    let h4 = 0;

    data.forEach(data_item => {
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

        const h2_dist = active_array.map(
            item => item / Math.sumPrecise(active_array)
        );

        const h3_dist = active_strength_array.map(
            item => item / Math.sumPrecise(active_strength_array)
        );

        const h4_dist = waves_array.map(
            item => item / Math.sumPrecise(waves_array)
        );

        const h1_basis = Math.log(h1_dist[sample_index]);

        h1 += h1_basis;
        h2 += Math.log(h2_dist[sample_index]) - h1_basis;
        h4 += Math.log(h4_dist[sample_index]) - h1_basis;

        if (h3_dist[sample_index] > 0)
            h3 += Math.log(h3_dist[sample_index]) - h1_basis;
    });

    h1 = 0;

    h2 = Math.round(h2);
    h3 = Math.round(h3);
    h4 = Math.round(h4);

    return { h1, h2, h3, h4 };
}

const h_pass = 10;
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

class Honeypot extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            data: [],
            selected_fg_type: [forgotten_types[0]],
        };
    }

    componentDidMount() {
        this.updateSelection({ name: [forgotten_types[0]], index: 0 });
    }

    updateSelection(e) {
        this.setState({
            ...this.state,
            selected_fg_type: e.name,
            data: data.filter(item => e.name.includes(item.fg_type)),
            selected_index: e.index,
        });
    }

    render() {
        const result = computeLTR(this.state.data);

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
                            the distribution (defending bases) change over time.
                        </div>
                        As suspected, the number of active FG bases in range
                        (strongest signal) as well as the wave level of a base
                        strongly determines if it receives an attack from an FG
                        base. On the other hand, the actual level of the FG
                        bases in range do not seem to impact the likelihood of
                        an attack. Also note how attacks{' '}
                        <Link
                            style={{ cursor: 'pointer' }}
                            inline
                            onClick={() => {
                                this.updateSelection({
                                    name: [forgotten_types[1]],
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
                                    name: forgotten_types,
                                    index: 2,
                                });
                            }}>
                            {' '}
                            together with bases
                        </Link>
                        ) invalidates (or dilutes respectively) the strength of
                        the result, indicating that FG camps are likely to be
                        following {hypothesis_map.h1.name}. On the right, you
                        can see how the cumulative log-likelihood trajectories
                        of each hypothesis relative to {hypothesis_map.h1.name}{' '}
                        panned out.
                    </Tile>
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
                                                    : ''
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
                                    name={item}
                                    text={item.join(', ')}
                                />
                            )
                        )}
                    </ContentSwitcher>
                </Column>

                <Column lg={6} md={8} sm={4}>
                    <ContainedList
                        isInset
                        kind="disclosed"
                        label="Sequential Probability Ratio Test (SPRT)"
                        size="sm">
                        <ContainedListItem>List item</ContainedListItem>
                    </ContainedList>
                </Column>
                <Column lg={8} md={8} sm={4}></Column>
                <Column lg={6} md={8} sm={4}>
                    <ContainedList
                        isInset
                        kind="disclosed"
                        label="Windowed Kolmogorov-Smirnov (K-S) Test"
                        size="sm">
                        <ContainedListItem>List item</ContainedListItem>
                    </ContainedList>
                </Column>
                <Column lg={8} md={8} sm={4}></Column>
            </Grid>
        );
    }
}

export { Honeypot };
