import { Grid, Column, Tile, ContainedList, Theme } from '@carbon/react';
import { colors } from '@carbon/colors';
import {
    LineChart,
    BubbleChart,
    ScaleTypes,
    AxisPositions,
} from '@carbon/charts-react';

import data from '../../cache/jump_trend.json';

const base_only_data = data.filter(item => item.fg_type == 'Base');
const base_inventory = data
    .reduce((arr, item) => {
        if (!arr.includes(item.base_data.length)) {
            arr.push(item.base_data.length);
        }
        return arr;
    }, [])
    .toReversed();

const min_bubble = 10;
const base_opacity = 50;
const degree = 1;

const plot_colors = ['red', 'blue', 'purple', 'yellow', 'green'];
const plot_options = {
    axes: {
        [AxisPositions.BOTTOM]: {
            mapsTo: 'x',
            scaleType: ScaleTypes.LINEAR,
            visible: false,
            includeZero: true,
        },
        [AxisPositions.LEFT]: {
            mapsTo: 'y',
            scaleType: ScaleTypes.LINEAR,
            visible: false,
            includeZero: true,
        },
    },
    toolbar: {
        enabled: false,
    },
    legend: {
        enabled: false,
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
};

/**
 * AI-generated
 * Calculates the vertices of a regular n-gon of
 * equal side lengths starting at (0, 0).
 *
 * @param {number} sides - Number of sides (n >= 3)
 * @param {number} sideLength - Length of each side (default is 1)
 * @returns {Array<{x: number, y: number}>} Array of vertex coordinates
 */
function getPolygonVertices(sides, sideLength = 10) {
    if (sides < 3) {
        throw new Error('A polygon must have at least 3 sides.');
    }

    const vertices = [{ x: 0, y: 0 }];
    const turnAngle = (2 * Math.PI) / sides; // Exterior angle in radians

    let currentX = 0;
    let currentY = 0;

    for (let k = 0; k < sides - 1; k++) {
        const angle = k * turnAngle;

        // Calculate next point using trigonometric vector offsets
        currentX += sideLength * Math.cos(angle);
        currentY += sideLength * Math.sin(angle);

        // Clean up precision artifacts (e.g., -0.0000000000000001 -> 0)
        const x = Number(currentX.toFixed(6));
        const y = Number(currentY.toFixed(6));

        vertices.push({ x, y });
    }

    return vertices;
}

const AttractorPlot = props => {
    let basis_data = getPolygonVertices(props.num_sides);
    let basis_options = structuredClone(plot_options);

    const x_min = Math.min(...basis_data.map(item => item.x));
    const x_max = Math.max(...basis_data.map(item => item.x));
    const y_min = Math.min(...basis_data.map(item => item.y));
    const y_max = Math.max(...basis_data.map(item => item.y));

    basis_options.axes[AxisPositions.BOTTOM].domain = [x_min, x_max];
    basis_options.axes[AxisPositions.LEFT].domain = [y_min, y_max];
    basis_options.height = '300px';

    let bubble_options = structuredClone(basis_options);

    basis_options.getIsFilled = () => true;
    basis_options.getFillColor = () => colors[props.color][60];
    basis_options.getStrokeColor = group => {
        if (group && group.includes('neg-')) {
            return colors.gray[20];
        } else {
            return colors[props.color][base_opacity];
        }
    };

    bubble_options.getStrokeColor = () => 'white';
    bubble_options.getFillColor = (_, __, data) => {
        if (data) return colors[props.color][data.opacity];
    };

    bubble_options.legend.enabled = false;
    bubble_options.bubble = {
        radiusMapsTo: 'size',
        fillOpacity: 0.75,
        radiusRange: () => [min_bubble, 3 * min_bubble],
    };

    const size_only_data = base_only_data
        .filter(item => item.base_data.length === props.num_sides)
        .filter(item => item.num_active > 0);

    let data = [];
    let base_map = [];

    basis_data.forEach((item, index) => {
        base_map.push({
            ...item,
            name: size_only_data[0].base_data[index].name,
        });
    });

    function computeBubble(data_item, base_map) {
        let x = 0,
            y = 0,
            total = 0;

        base_map.forEach(base => {
            const base_data = data_item.base_data.find(
                item => item.name === base.name
            );

            x += Math.pow(base_data.active_bases, degree) * base.x;
            y += Math.pow(base_data.active_bases, degree) * base.y;

            total += Math.pow(base_data.active_bases, degree);
        });

        x /= total;
        y /= total;

        x = Math.pow(x, 1 / degree);
        y = Math.pow(y, 1 / degree);

        const max_active = Math.max(
            ...data_item.base_data.map(item => item.active_bases)
        );

        const targets = data_item.base_data
            .filter(item => item.active_bases === max_active)
            .map(item => item.name);

        const is_gold = targets.includes(data_item.defending_base);
        const golden_ratio = is_gold ? 1 : data_item.num_active / max_active;

        return { x, y, golden_ratio };
    }

    size_only_data.forEach((data_item, index) => {
        const { x, y, golden_ratio } = computeBubble(data_item, base_map);

        let existing_data = data.find(item => item.x === x && item.y === y);

        if (existing_data) {
            const index = data.indexOf(existing_data);

            existing_data.size += 1;
            existing_data.opacity *= golden_ratio;

            data[index] = existing_data;
        } else {
            data.push({ x, y, size: min_bubble, opacity: base_opacity });
        }

        const group =
            golden_ratio === 1 ? 'pos-group-' + index : 'neg-group-' + index;

        const defending_coords = base_map.find(
            item => item.name === data_item.defending_base
        );

        basis_data = basis_data.concat([
            {
                x: defending_coords.x,
                y: defending_coords.y,
                group,
            },
            { x, y, group },
        ]);
    });

    data = data.map(item => {
        return {
            ...item,
            opacity: 10 * Math.round(item.opacity / 10) + 10,
        };
    });

    basis_data.push({ x: 0, y: 0, group: props.num_sides + ' Bases' });
    basis_data.push(basis_data[0]);

    return (
        <>
            <br />
            <Theme theme="white">
                <ContainedList
                    kind="on-page"
                    label={props.num_sides + ' Bases'}
                    size="sm"
                />
            </Theme>
            <div
                className="chart-overlay-container"
                style={{ marginBottom: '64px' }}>
                <div className="chart-layer base-layer">
                    <LineChart data={basis_data} options={basis_options} />
                </div>

                <div className="chart-layer overlay-layer">
                    <BubbleChart data={data} options={bubble_options} />
                </div>
            </div>
        </>
    );
};

const AttractorPlots = _ => {
    return (
        <Grid>
            <Column lg={6} md={8} sm={4}>
                <Tile>
                    In the previous chapter, we saw how the number of active
                    Forgotten bases in range is the most statistically
                    significant indicator of which of your bases are going to
                    get hit. This leads to the well-established{' '}
                    <span className="text-alert">honeypot strategy</span> of
                    placing cash bases in vulnerable locations to attract
                    Forgotten attacks while your main base remains safe. Here we
                    will visualize the honeypotting strategy through the means
                    of attractor plots.
                    <br />
                    <br />
                    Each vertex on the plots represents one of my bases. Each
                    circle represents an attack from a Forgotten base where the
                    location of the circle is pulled towards one the the
                    vertices in proportion to the number of active Forgotten
                    bases in the range of the base represented by that vertex.
                    The lines connect the Forgotten attack with the defending
                    base: a dark line implies the attack did not follow the
                    honeypot strategy and the size of the circle indicates the
                    number of attaks it represents while the strength of its
                    color indicates how many times it represents a succesfull
                    honeypot. Note the abundance of colored lines relative to
                    dark ones as well as the strength of color in most the
                    circles, and the relative position of the most succesful
                    honeypots positioned closer to their attracting vertices.
                </Tile>
            </Column>
            {base_inventory.map(item => (
                <Column key={item} lg={item === 6 ? 6 : 4} md={8} sm={4}>
                    <AttractorPlot
                        num_sides={item}
                        color={plot_colors[item - 4]}
                    />
                </Column>
            ))}
        </Grid>
    );
};

export { AttractorPlots };
