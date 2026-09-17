import React from 'react';
import {
    Grid,
    Column,
    Tag,
    ContainedList,
    ContainedListItem,
    ContentSwitcher,
    Switch,
    Link,
    Tile,
    Theme,
} from '@carbon/react';
import { Touch_1, CheckmarkFilled } from '@carbon/icons-react';
import { ScatterChart, ScaleTypes, AxisPositions } from '@carbon/charts-react';
import {
    capitalize,
    get_all_combinations,
} from '../../components/BasicElements/Info';
import { OddsRatio } from './OddsRatio';
import { chi2ToPValueDF1 } from '../../@stats/chiSquareUtils';
import { mannWhitneyU, zToPValue } from '../../@stats/mannWhitneyU';

import '@carbon/charts-react/styles.css';
import data from '../../cache/jump_trend.json';

import { colors } from '@carbon/colors';

let forgotten_types = ['Base', 'Camp'];
let jump_types = ['jump_forward', 'any_movement', 'wave_change'];

const group_color = group => {
    if (group == 'Positive') {
        return colors.red[60];
    } else {
        return colors.green[20];
    }
};

const scatter_options = {
    axes: {
        [AxisPositions.BOTTOM]: {
            mapsTo: 'interval',
        },
        [AxisPositions.LEFT]: {
            mapsTo: 'num_active',
            scaleType: ScaleTypes.LINEAR,
            visible: false,
        },
    },
    toolbar: {
        enabled: false,
    },
    grid: {
        x: {
            enabled: false,
        },
        y: {
            enabled: false,
        },
    },
    getFillColor: group_color,
    getStrokeColor: group_color,
    points: {
        radius: 3,
    },
    height: '375px',
};

const filter_data_by_fg_type = (data, state) =>
    data.filter(item => state.includes(item.fg_type));

const filter_data_by_jump_type = (data, state) =>
    data.filter(item => item.jump_types.includes(state));

const filter_data = (data, fg_types, jump_type) =>
    filter_data_by_jump_type(filter_data_by_fg_type(data, fg_types), jump_type);

const tableConstructor = (data, fg_types, jump_type) => {
    const all_intervals = data.map(item => item.interval);
    const mean_interval =
        all_intervals.reduce((sum, value) => sum + value, 0) /
        all_intervals.length;

    const tmp_data = filter_data_by_jump_type(data, jump_type);

    return {
        title: fg_types.join(', ') + ' attacks',
        total: data.length,
        headers: [
            {
                row: 0,
                column: 1,
                value: 'Interval is shorter than average',
            },
            {
                row: 0,
                column: 2,
                value: 'Interval is longer than average',
            },
            {
                row: 1,
                column: 0,
                value: 'Jump occurred',
            },
            {
                row: 2,
                column: 0,
                value: 'Jump did NOT occur',
            },
        ],
        data: [
            {
                row: 1,
                column: 1,
                value: tmp_data.filter(item => item.interval <= mean_interval)
                    .length,
            },
            {
                row: 1,
                column: 2,
                value: tmp_data.filter(item => item.interval > mean_interval)
                    .length,
            },
            {
                row: 2,
                column: 1,
                value: data
                    .filter(item => !tmp_data.includes(item))
                    .filter(item => item.interval <= mean_interval).length,
            },
            {
                row: 2,
                column: 2,
                value: data
                    .filter(item => !tmp_data.includes(item))
                    .filter(item => item.interval > mean_interval).length,
            },
        ],
    };
};

function intervalTest(data, jump_type) {
    const groupWithB = [];
    const groupWithoutB = [];

    data.forEach(data_item => {
        if (data_item.jump_types.includes(jump_type)) {
            groupWithB.push(data_item.interval);
        } else {
            groupWithoutB.push(data_item.interval);
        }
    });

    const result = mannWhitneyU(groupWithB, groupWithoutB);
    const pValue = zToPValue(result.z);

    return pValue;
}

// AI-generated
function jumpAnalysisComputation(data) {
    let observedHits = 0;
    let expectedHits = 0.0;
    let roundsWithJumps = data.length;

    data.forEach(data_item => {
        const jumpy_bases = data_item.base_data
            .filter(item => item.jumped_to_front.length > 0)
            .map(item => item.name);

        if (jumpy_bases.includes(data_item.defending_base)) observedHits++;

        expectedHits += jumpy_bases.length / data_item.base_data.length;
    });

    const observedNonHits = roundsWithJumps - observedHits;
    const expectedNonHits = roundsWithJumps - expectedHits;

    // Chi-Square Statistic: sum((O - E)^2 / E)
    const chi2 =
        Math.pow(observedHits - expectedHits, 2) / expectedHits +
        Math.pow(observedNonHits - expectedNonHits, 2) / expectedNonHits;

    // Use the numerically stable p-value function
    const pValue = chi2ToPValueDF1(chi2);

    return { roundsWithJumps, observedHits, expectedHits, chi2, pValue };
}

class JumpAnalysis extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            data_1: [],
            data_2: [],
            selected_fg_type: forgotten_types,
            selected_jump_type: jump_types[0],
        };
    }

    componentDidMount() {
        this.updateSelection();
    }

    updateSelection() {
        let new_data_1 = filter_data_by_fg_type(
            data,
            this.state.selected_fg_type
        ).map(item => {
            if (this.state.selected_jump_type === jump_types[2]) {
                const waves = item.base_data.map(
                    item => item.neighborhood_roughness
                );
                const max_wave_level = Math.max(...waves);

                return {
                    ...item,
                    num_active: max_wave_level,
                    group: item.jump_types.includes(
                        this.state.selected_jump_type
                    )
                        ? 'Positive'
                        : 'Negative',
                };
            } else {
                return {
                    ...item,
                    group: item.jump_types.includes(
                        this.state.selected_jump_type
                    )
                        ? 'Positive'
                        : 'Negative',
                };
            }
        });

        let new_data_2 = filter_data(
            data,
            this.state.selected_fg_type,
            this.state.selected_jump_type
        );

        this.setState({
            ...this.state,
            data_1: new_data_1,
            data_2: new_data_2,
        });
    }

    updateTabSelection(e) {
        this.setState(
            {
                ...this.state,
                selected_jump_type: e.name,
            },
            () => {
                this.updateSelection();
            }
        );
    }

    updateFGSelection(e) {
        this.setState({ ...this.state, selected_fg_type: e }, () => {
            this.updateSelection();
        });
    }

    render() {
        const table_data = tableConstructor(
            this.state.data_1,
            this.state.selected_fg_type,
            this.state.selected_jump_type
        );

        const {
            roundsWithJumps,
            observedHits,
            expectedHits,
            _,
            pValue,
        } = jumpAnalysisComputation(this.state.data_2);

        const upValue = intervalTest(
            this.state.data_1,
            this.state.selected_jump_type
        );

        return (
            <Grid>
                <Column lg={6} md={8} sm={4}>
                    <ContainedList
                        isInset
                        label="Do jumps to the frontline trigger attacks?"
                        size="md"
                        kind="disclosed">
                        <ContainedListItem>
                            To figure this out, on the right, we compute a 2x2
                            contingency table. This lends us to two, for this
                            purpose equivalent, statistical checks to confirm if
                            the number in the upper left (indicating jumps do
                            statistically significantly shorten attack
                            intervals) is too high given the size of the
                            recorded samples.{' '}
                            <span className="text-alert">It is not.</span>
                        </ContainedListItem>
                    </ContainedList>
                    <ContainedList
                        isInset
                        label="Do the jumping bases get attacked more?"
                        size="md"
                        kind="disclosed">
                        <ContainedListItem>
                            If the Forgotten attack at random, every base has an
                            equal chance of being targeted. So, we measured how
                            many times [
                            <span className="text-alert">{observedHits}</span>],
                            a jumped base got attacked versus how many times we
                            would expect (probability mass) [
                            <span className="text-alert">
                                {expectedHits.toFixed(2)}
                            </span>
                            ] it to be when at random, over a period of{' '}
                            <span className="text-alert">
                                {roundsWithJumps}
                            </span>{' '}
                            recorded attacks where a jump has occurred. Then we
                            compute our good old{' '}
                            <Link
                                href="https://en.wikipedia.org/wiki/Chi-squared_test"
                                target="_blank">
                                chi-squared test
                            </Link>{' '}
                            to decide if the observed hits is statistically
                            significantly (<strong>p &lt; 0.05</strong>)
                            different than the expected hits.
                            <br />
                            <br />
                            <div style={{ display: 'flex' }}>
                                <Tag className="square-tag">p-value</Tag>
                                <Tag
                                    className="square-tag"
                                    type={pValue <= 0.05 ? 'magenta' : 'green'}>
                                    {pValue.toFixed(2)}
                                </Tag>

                                {pValue <= 0.05 ? (
                                    <Tag className="square-tag" type="magenta">
                                        Significantly different
                                    </Tag>
                                ) : (
                                    <Tag className="square-tag" type="green">
                                        NOT significantly different
                                    </Tag>
                                )}
                            </div>
                            <br />
                            At this point, you are wondering:{' '}
                            <em className="text-alert">What the fuck?</em>{' '}
                            Surely, jumping to the front causes more attacks.
                            Well, math says no. However, a quick glance at{' '}
                            <Link
                                style={{ cursor: 'pointer' }}
                                inline
                                onClick={() => {
                                    this.updateTabSelection({
                                        name: jump_types[2],
                                    });
                                }}>
                                this attack pattern
                            </Link>{' '}
                            reveals that movements to higher wave areas clearly
                            triggers an attack. So we have a{' '}
                            <Link
                                href="https://en.wikipedia.org/wiki/Confounding"
                                target="_blank">
                                confound
                            </Link>
                            : where is the base jumping to and where all the
                            other bases are, jumped or otherwise.
                            <br />
                            <br />
                            What we have answered here is that, with those
                            variables smoothed over, jumping by itself does not
                            make a base statistically more vulnerable.
                            <br />
                            <br />
                        </ContainedListItem>

                        {get_all_combinations(forgotten_types)
                            .toReversed()
                            .map((item, index) => {
                                const is_selected =
                                    JSON.stringify(
                                        this.state.selected_fg_type.sort()
                                    ) === JSON.stringify(item.sort());

                                return (
                                    <ContainedListItem
                                        className={
                                            is_selected
                                                ? 'fg-attack-selected'
                                                : ''
                                        }
                                        key={index}
                                        renderIcon={
                                            is_selected
                                                ? CheckmarkFilled
                                                : Touch_1
                                        }
                                        onClick={this.updateFGSelection.bind(
                                            this,
                                            item
                                        )}>
                                        <div
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'space-between',
                                            }}>
                                            <span>
                                                View attacks from{' '}
                                                {item.join(', ')}
                                            </span>
                                            <Tag
                                                className="square-tag"
                                                size="sm"
                                                role="status"
                                                aria-label="">
                                                {
                                                    filter_data_by_fg_type(
                                                        data,
                                                        item
                                                    ).length
                                                }
                                            </Tag>
                                        </div>
                                    </ContainedListItem>
                                );
                            })}
                    </ContainedList>
                    <br />
                    <br />
                </Column>
                <Column lg={8} md={8} sm={4}>
                    <Grid>
                        <Column lg={4} md={4} sm={4}>
                            <OddsRatio data={table_data} />
                        </Column>
                        <Column lg={4} md={4} sm={4}>
                            <Theme theme="white">
                                <Tile>
                                    While the tabular form has more illustrative
                                    power, the{' '}
                                    <Link
                                        href="https://en.wikipedia.org/wiki/Mann%E2%80%93Whitney_U_test"
                                        target="_blank">
                                        Mann-Whitney U Test
                                    </Link>{' '}
                                    is able to account for the actual values of
                                    the time intervals to yield a much tighter
                                    result for whether the intervals with a jump
                                    in it are statistically significantly
                                    shorter than the median interval.
                                    <br />
                                    <br />
                                    <Tag className="square-tag">p-value</Tag>
                                    <Tag
                                        className="square-tag"
                                        type={
                                            upValue <= 0.05
                                                ? 'magenta'
                                                : 'green'
                                        }>
                                        {upValue.toFixed(2)}
                                    </Tag>
                                    <Tag
                                        className="square-tag"
                                        type={
                                            upValue <= 0.05
                                                ? 'magenta'
                                                : 'green'
                                        }>
                                        {upValue <= 0.05 ? 'YES' : 'NO'}
                                    </Tag>
                                </Tile>
                            </Theme>
                        </Column>
                        <Column lg={8} md={4} sm={4}>
                            <br />
                            <br />
                            <ContentSwitcher
                                lowContrast
                                size="sm"
                                selectedIndex={jump_types.indexOf(
                                    this.state.selected_jump_type
                                )}
                                onChange={this.updateTabSelection.bind(this)}>
                                {jump_types.map((item, index) => (
                                    <Switch
                                        key={index}
                                        name={item}
                                        text={capitalize(item)}
                                    />
                                ))}
                            </ContentSwitcher>
                            <ScatterChart
                                data={this.state.data_1}
                                options={scatter_options}
                            />
                            <br />
                            <div className="footnote">
                                The plot shows how the recorded attack intervals
                                are distrtibuted for positive (attack after
                                jump) versus negative (attack with no bases
                                moving) samples. Note that this is a single axis
                                plot, with "
                                <Link
                                    href="https://datavizcatalogue.com/blog/chart-snapshot-jitter-plot"
                                    target="_blank">
                                    jittering
                                </Link>
                                " on the vertical axis, according to the
                                selected type of jump (e.g. forward, any, or
                                wave change) for illustrative purposes only.
                            </div>
                        </Column>
                    </Grid>
                </Column>
            </Grid>
        );
    }
}

export { JumpAnalysis };
