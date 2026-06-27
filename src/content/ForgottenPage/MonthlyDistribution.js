import { Grid, Column, Tile, Tag, Theme } from '@carbon/react';
// import {
//     SimpleBarChart,
//     LineChart,
//     ScaleTypes,
//     AxisPositions,
// } from '@carbon/charts-react';
import '@carbon/charts-react/styles.css';

// let data = require('../../cache/daily_distribution.json');

// let forgotten_types = ['Base', 'Camp'];

// let options = {
//     axes: {
//         [AxisPositions.LEFT]: {
//             mapsTo: 'value',
//             visible: false,
//             domain: [0, 1],
//         },
//         [AxisPositions.TOP]: {
//             mapsTo: 'date',
//             scaleType: ScaleTypes.TIME,
//         },
//     },
//     toolbar: {
//         enabled: false,
//     },
//     grid: {
//         x: {
//             enabled: false,
//         },
//         y: {
//             enabled: false,
//         },
//     },
//     timeScale: {
//         addSpaceOnEdges: 0,
//     },
//     legend: {
//         enabled: false,
//     },
//     height: '50px',
// };

const MonthlyDistribution = props => (
    <Grid>
        <Column lg={4} md={4} sm={4}>
            <Theme theme="white">
                <Tile>
                    As you might have noticed in the previous chapter, the
                    prodution of attacks from Forgotten camps versus bases is
                    non-stationary on the timeline. I have separated this out on
                    the right: notice the camps are distributed evenly on the
                    timeline while base attacks have gone up quite clearly.
                    <br />
                    <br />
                    This is as advertised with the well-known additional
                    difficulty level past 50+ level bases; but thought I will
                    visualize that phenomemon anyway!
                </Tile>
            </Theme>
            <br />
            <br />
            <Theme theme="white">
                <Tile>
                    You can also see this play out in how the gap between
                    attacks and number of attacks trend with respect to the
                    level of the Forgotten bases in range as we progress to the
                    center. You have a minimum of 32 minutes beteween attacks.{' '}
                    <em>Run!</em>
                </Tile>
            </Theme>
            <br />
            <br />
            <Tag className="square-tag">Min mins to attack</Tag>
            <Tag className="square-tag" type="magenta">
                32
            </Tag>
        </Column>
        <Column lg={10} md={4} sm={4}></Column>
    </Grid>
);

export { MonthlyDistribution };
