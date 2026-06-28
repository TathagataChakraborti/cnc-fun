import { Grid, Column, Tile, Tag, Theme, Link } from '@carbon/react';
import {
    SimpleBarChart,
    LineChart,
    ScaleTypes,
    AxisPositions,
} from '@carbon/charts-react';

import '@carbon/charts-react/styles.css';

import base_data from '../../cache/monthly_distribution_Base.json';
import camp_data from '../../cache/monthly_distribution_Camp.json';
import trend_data from '../../cache/monthly_trend.json';

let min_gap = 29.6;
let max_date = new Date(base_data[0].datetime).toISOString().split('T')[0];
let average_gap = trend_data.filter(item => item.value_secondary)[0]
    .value_secondary;

let bar_chart_options = {
    axes: {
        [AxisPositions.LEFT]: {
            mapsTo: 'value',
            visible: false,
            domain: [0, 1],
        },
        [AxisPositions.TOP]: {
            mapsTo: 'datetime',
            scaleType: ScaleTypes.TIME,
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
    timeScale: {
        addSpaceOnEdges: 0,
    },
    legend: {
        enabled: false,
    },
    height: '100px',
};

const line_chart_options = {
    title: '',
    axes: {
        [AxisPositions.TOP]: {
            mapsTo: 'date',
            scaleType: ScaleTypes.TIME,
        },
        [AxisPositions.LEFT]: {
            mapsTo: 'value',
            scaleType: 'linear',
        },
        [AxisPositions.RIGHT]: {
            mapsTo: 'value_secondary',
            correspondingDatasets: [
                'Gap (in minutes) between consecutive Forgotten Base attacks',
            ],
        },
    },
    toolbar: {
        enabled: false,
    },
    legend: {
        position: 'top',
        truncation: {
            numCharacter: 240,
        },
    },
    height: '400px',
};

const MonthlyDistribution = props => (
    <Grid>
        <Column lg={4} md={4} sm={4}>
            <Theme theme="white">
                <Tile style={{ height: '315px' }}>
                    As you may have noticed in the previous chapter, the
                    prodution of attacks from Forgotten camps versus bases is
                    non-stationary on the timeline. I have separated this out on
                    the right: notice the camps are distributed evenly on the
                    timeline while base attacks have gone up quite
                    significantly (crowding on the right).
                    <br />
                    <br />
                    This is as advertised, with the well-known additional
                    difficulty level past 50+ level bases; but thought I will
                    visualize that phenomemon anyway!
                </Tile>
            </Theme>
            <br />
            <br />
            <Theme theme="white">
                <Tile>
                    You can also see this play out in how the gap between
                    attacks (right) and number of attacks trend with respect to
                    the level of the Forgotten bases in range as we progress to
                    the center. Note that the graph plots a{' '}
                    <Link
                        href="https://en.wikipedia.org/wiki/Moving_average"
                        target="_blank">
                        3-day moving average
                    </Link>{' '}
                    (and not raw numbers) to smooth out variations in attack
                    probabilty based on whether a base has jumped to the edge or
                    not.
                    <br />
                    <br />
                    As of {max_date}, you have an average of{' '}
                    <span className="text-alert">{average_gap}</span> minutes and a
                    minimum of <span className="text-alert">{min_gap}</span>{' '}
                    minutes beteween attacks. <em>Run!</em>
                </Tile>
            </Theme>
            <br />
            <Tag className="square-tag">Min mins to attack</Tag>
            <Tag className="square-tag" type="magenta">
                {min_gap}
            </Tag>
        </Column>
        <Column lg={10} md={4} sm={4}>
            <SimpleBarChart data={camp_data} options={bar_chart_options} />

            <SimpleBarChart
                data={base_data}
                options={{
                    ...bar_chart_options,
                    axes: {
                        ...bar_chart_options.axes,
                        [AxisPositions.TOP]: {
                            ...bar_chart_options.axes[AxisPositions.TOP],
                            visible: false,
                        },
                    },
                    getFillColor: () => {
                        return '#9f1854';
                    },
                    height: '175px',
                }}
            />

            <br />

            <Tag className="square-tag" type="purple">
                Camp
            </Tag>
            <Tag className="square-tag" type="magenta">
                Base
            </Tag>

            <br />
            <br />
            <br />

            <LineChart data={trend_data} options={line_chart_options} />
        </Column>
    </Grid>
);

export { MonthlyDistribution };
