import React from 'react';
import {
    Grid,
    Column,
    Tag,
    ContainedList,
    ContainedListItem,
    ContentSwitcher,
    Switch,
} from '@carbon/react';
import { Touch_1, CheckmarkFilled } from '@carbon/icons-react';
import { ScatterChart, ScaleTypes, AxisPositions } from '@carbon/charts-react';
import {
    capitalize,
    get_all_combinations,
} from '../../components/BasicElements/Info';
import { OddsRatio } from './OddsRatio';

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
    height: '400px',
};

const filter_data_by_fg_type = (data, state) =>
    data.filter(item => state.includes(item.fg_type));

const filter_data_by_jump_type = (data, state) =>
    data.filter(item => item.jump_types.includes(state));

const filter_data = (data, fg_types, jump_type) =>
    filter_data_by_jump_type(filter_data_by_fg_type(data, fg_types), jump_type);

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
        return (
            <Grid>
                <Column lg={6} md={8} sm={4}>
                    <ContainedList
                        isInset
                        label="Do jumps to the frontline trigger attacks?"
                        size="md"
                        kind="disclosed">
                        <ContainedListItem>
                            sadadas sadadas sadadas sadadas sadadas sadadas
                            sadadas sadadas
                        </ContainedListItem>
                    </ContainedList>
                    <ContainedList
                        isInset
                        label="Do the jumping bases get attacked more?"
                        size="md"
                        kind="disclosed">
                        <ContainedListItem>
                            sadadas sadadas sadadas sadadas sadadas sadadas
                            sadadas sadadas
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
                            <OddsRatio
                                props={{
                                    data: this.state.data_1,
                                    type: this.state.selected_fg_type.join(
                                        ', '
                                    ),
                                    headers: {
                                        0: {
                                            header:
                                                'Interval is shorter than average',
                                        },
                                        1: {
                                            header:
                                                'Interval is longer than average',
                                        },
                                        2: {
                                            header: 'FG attack occurred',
                                        },
                                        3: {
                                            header: 'FG attack did NOT occur',
                                        },
                                    },
                                    notes: [],
                                }}
                            />
                        </Column>
                        <Column lg={4} md={4} sm={4}>
                            <OddsRatio
                                props={{
                                    data: this.state.data_2,
                                    type: this.state.selected_fg_type.join(
                                        ', '
                                    ),
                                    headers: {
                                        0: {
                                            header:
                                                'Observed attacks on jumpy bases',
                                        },
                                        1: {
                                            header:
                                                'Observed attacks on static bases',
                                        },
                                        2: {
                                            header:
                                                'Expected attacks on jumpy bases',
                                            note: 'Under a random baseline',
                                        },
                                        3: {
                                            header:
                                                'Expected attacks on static bases',
                                        },
                                    },
                                    notes: ['Under a random baseline'],
                                }}
                            />
                        </Column>
                        <Column lg={8} md={4} sm={4}>
                            <br />
                            <br />

                            <ContentSwitcher
                                lowContrast
                                size="sm"
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
                        </Column>
                    </Grid>
                </Column>
            </Grid>
        );
    }
}

export { JumpAnalysis };
