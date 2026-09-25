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
    Button,
    NumberInput,
    TextInput,
    RadioButtonGroup,
    RadioButton,
    Layer,
    Modal,
    Accordion,
    AccordionItem,
} from '@carbon/react';
import {
    AreaChart,
    LineChart,
    ScaleTypes,
    AxisPositions,
} from '@carbon/charts-react';
import {
    Add,
    TrashCan,
    AiBusinessImpactAssessment,
    Documentation,
    ResetAlt,
} from '@carbon/icons-react';

import '@carbon/charts-react/styles.css';
import data from '../../cache/jump_trend.json';

const fg_types = ['Base', 'Camp', 'Outposts'];

const Report = props => (
    <Grid>
        <Column lg={6} md={8} sm={4}>
            <div className="summary-tags">
                <Tag className="square-tag">Next attack on</Tag>
                <Tag className="square-tag" type="magenta"></Tag>
            </div>
            <div className="summary-tags">
                <Tag className="square-tag">Time to attack</Tag>
                <Tag className="square-tag" type="magenta"></Tag>
            </div>
            <div className="summary-tags">
                <Tag className="square-tag">Forgotten type</Tag>
                <Tag className="square-tag" type="magenta"></Tag>
            </div>
            <br />
            <Layer>
                <ContainedList
                    label="Attack probabilities"
                    kind="disclosed"
                    size="md">
                    <ContainedListItem>
                        <div className="flex-tab here">
                            <span>List title</span>
                            <Tag className="square-tag" size="sm">
                                4
                            </Tag>
                        </div>
                    </ContainedListItem>
                    <ContainedListItem>
                        <div className="flex-tab here">
                            <span>List title</span>
                            <Tag className="square-tag" size="sm">
                                4
                            </Tag>
                        </div>
                    </ContainedListItem>
                </ContainedList>
            </Layer>
        </Column>
    </Grid>
);

class BaseData extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            id: 0,
        };
    }

    render() {
        return (
            <Column lg={4} md={8} sm={4}>
                <Layer>
                    <Tile>
                        <div className="flex-tab here">
                            <div style={{ display: 'flex' }}>
                                <Tag className="square-tag">Base</Tag>
                                <Tag className="square-tag" type="purple">
                                    {this.state.id + 1}
                                </Tag>
                            </div>
                            <Button
                                hasIconOnly
                                size="xs"
                                kind="ghost"
                                renderIcon={TrashCan}
                                iconDescription="Delete"
                            />
                        </div>
                        <br />
                        <TextInput
                            hideLabel
                            id="previous-base-name"
                            maxCount={14}
                            onChange={() => {}}
                            labelText=""
                            helperText="Name of the base"
                            size="xs"
                            type="text"
                        />
                        <br />
                        <NumberInput
                            id="num-active"
                            hideLabel
                            helperText="Active Forgotten bases in range"
                            max={24 * 60}
                            min={0}
                            onChange={() => {}}
                            size="sm"
                            step={1}
                            value={50}
                            inputMode="decimal"
                            type="number"
                        />
                        <br />
                        <TextInput
                            inline
                            id="bases-in-range"
                            labelText="Bases"
                            placeholder="4x46, ..."
                            maxCount={14}
                            onChange={() => {}}
                            size="xs"
                        />
                        <br />
                        <TextInput
                            inline
                            disabled
                            id="outposts-in-range"
                            labelText="Outposts"
                            size="xs"
                        />
                        <br />
                        <TextInput
                            inline
                            disabled
                            id="camps-in-range"
                            labelText="Camps"
                            size="xs"
                        />
                        <br />
                    </Tile>
                </Layer>
            </Column>
        );
    }
}

class ProductionModel extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            info_modal: false,
            report_status: false,
            data: {
                previous_attack: {
                    name: '',
                    fg_type: fg_types[0],
                    time_since_last: 0,
                },
                base_data: [
                    {
                        id: 0,
                        name: '',
                        active_bases: 0,
                        bases: '',
                    },
                ],
            },
        };
    }

    componentDidMount() {}
    render() {
        return (
            <Grid>
                <Column lg={6} md={8} sm={4}>
                    <br />
                    <Layer>
                        <Tile>
                            <ContainedList
                                label="Learning a production model"
                                kind="disclosed"
                                size="lg">
                                <ContainedListItem>
                                    Enter details about all your bases below.
                                    Then click compute to get an estimate from
                                    the AI model of which base is likely to
                                    receive an attack next, with what
                                    probability, and when.
                                </ContainedListItem>
                            </ContainedList>
                        </Tile>
                    </Layer>
                </Column>
                <Modal
                    modalHeading={
                        <ContainedList
                            label="How to"
                            kind="disclosed"
                            size="lg">
                            <ContainedListItem>
                                Enter details about all your bases below. Then
                                click compute to get an estimate from the AI
                                model of which base is likely to receive an
                                attack next, with what probability, and when.
                            </ContainedListItem>
                        </ContainedList>
                    }
                    onRequestClose={() =>
                        this.setState({ ...this.state, info_modal: false })
                    }
                    open={this.state.info_modal}
                    passiveModal
                />
                <Column lg={8} md={8} sm={4}>
                    <br />
                    <Accordion isFlush align="end" size="md">
                        <AccordionItem
                            onHeadingClick={() =>
                                this.setState({
                                    ...this.state,
                                    report_status: false,
                                })
                            }
                            open={!this.state.report_status}
                            title="Details of last Forgotten Attack">
                            <Grid>
                                <Column lg={3} md={8} sm={4}>
                                    <Layer>
                                        <Tile>
                                            <RadioButtonGroup
                                                legendText="Attack type"
                                                name="attack-type"
                                                defaultSelected="radio-1"
                                                orientation="vertical">
                                                <RadioButton
                                                    labelText="Base"
                                                    value="radio-1"
                                                    id="radio-1"
                                                />
                                                <RadioButton
                                                    labelText="Camp"
                                                    value="radio-2"
                                                    id="radio-2"
                                                />
                                                <RadioButton
                                                    labelText="Outpost"
                                                    value="radio-3"
                                                    id="radio-3"
                                                />
                                            </RadioButtonGroup>
                                        </Tile>
                                    </Layer>
                                </Column>
                                <Column lg={5} md={8} sm={4}>
                                    <TextInput
                                        hideLabel
                                        id="previous-base-name"
                                        maxCount={14}
                                        onChange={() => {}}
                                        labelText=""
                                        helperText="Name of last defending base"
                                        size="sm"
                                        type="text"
                                    />
                                    <br />
                                    <NumberInput
                                        hideLabel
                                        id="time-since"
                                        helperText="Time since last attack (in minutes)"
                                        max={24 * 60}
                                        min={0}
                                        onChange={() => {}}
                                        size="sm"
                                        step={1}
                                        value={50}
                                        inputMode="decimal"
                                        type="number"
                                    />
                                </Column>
                            </Grid>
                        </AccordionItem>
                        <AccordionItem
                            onHeadingClick={() =>
                                this.setState({
                                    ...this.state,
                                    report_status: false,
                                })
                            }
                            open={!this.state.report_status}
                            title="Current base data">
                            <Grid>
                                {this.state.data.base_data.map(item => (
                                    <BaseData key={item.id} />
                                ))}
                                <Column lg={8} md={8} sm={4}>
                                    <br />
                                    <Button
                                        size="sm"
                                        renderIcon={Add}
                                        kind="tertiary"
                                        iconDescription="Add base data">
                                        Add Base
                                    </Button>

                                    <Button
                                        hasIconOnly
                                        kind="ghost"
                                        size="sm"
                                        renderIcon={Documentation}
                                        tooltipHighContrast={false}
                                        iconDescription="Information"
                                        onClick={() =>
                                            this.setState({
                                                ...this.state,
                                                info_modal: true,
                                            })
                                        }
                                    />
                                </Column>
                            </Grid>
                        </AccordionItem>

                        <AccordionItem
                            onHeadingClick={() =>
                                this.setState({
                                    ...this.state,
                                    report_status: true,
                                })
                            }
                            open={this.state.report_status}
                            title="Report">
                            <Report />
                        </AccordionItem>
                    </Accordion>
                    <Column>
                        <br />
                        <Button
                            style={{ width: '150px' }}
                            size="sm"
                            renderIcon={AiBusinessImpactAssessment}
                            kind="primary"
                            iconDescription="Compute probabilities">
                            Compute
                        </Button>
                        <br />
                        <br />
                        <Button
                            style={{ width: '150px' }}
                            size="sm"
                            renderIcon={ResetAlt}
                            kind="danger"
                            iconDescription="Compute probabilities">
                            Reset
                        </Button>
                    </Column>
                </Column>
            </Grid>
        );
    }
}

export { ProductionModel };
