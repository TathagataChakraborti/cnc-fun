import React from 'react';
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
    ResetAlt,
} from '@carbon/icons-react';

import { large_random_number } from '../../components/BasicElements/Info';
import { print_date_str } from '../../components/BasicElements/Info';

import '@carbon/charts-react/styles.css';
import data from '../../cache/jump_trend.json';

const fg_types = ['Base', 'Camp', 'Outposts'];
const max_date = data[0].datetime;
const min_date = data[data.length - 1].datetime;

const base_init = {
    hash_id: 0,
    id: 0,
    name: '',
    active_bases: 0,
    bases: '',
};

const init_state = {
    show_report: false,
    computing: false,
    report: null,
    feedback_msg: [],
    data: {
        previous_attack: {
            name: '',
            fg_type: fg_types[0],
            time_since_last: 0,
        },
        base_data: [],
    },
};

function parseBaseInfo(base_info_str) {
    let parsed_info = [];
    let error = null;

    try {
        let str_split = base_info_str
            .trim()
            .split(',')
            .map(item => item.trim());

        str_split.forEach(item => {
            if (item !== '') {
                const item_split = item.split('x').map(item => item.trim());
                const how_many = Number(item_split[0]);
                const level = Number(item_split[1]);

                if (Number.isNaN(how_many) || Number.isNaN(level)) {
                    const message = `Could not parse neighborhood information for Base ${index}`;

                    error = { message };
                    return { parsed_info, error };
                }

                parsed_info.push({ how_many, level });
            }
        });

        return { parsed_info, error };
    } catch (error) {
        return { parsed_info, error };
    }
}

const create_init_state = _ => {
    let init = structuredClone(init_state);
    let init_base = create_new_base(init.data.base_data);

    init.data.base_data = [init_base];
    return init;
};

const create_new_base = base_data => {
    let new_base = structuredClone(base_init);

    new_base.hash_id = large_random_number();
    new_base.id = base_data.length;

    return new_base;
};

const Report = props => (
    <Grid>
        <Column lg={6} md={8} sm={4}>
            <div className="summary-tags">
                <Tag className="square-tag">Next attack on</Tag>
                <Tag className="square-tag" type="magenta">
                    {props.data.next_attack_on}
                </Tag>
            </div>
            <div className="summary-tags">
                <Tag className="square-tag">Time to attack</Tag>
                <Tag className="square-tag" type="magenta">
                    {props.data.time_to_attack} minutes
                </Tag>
            </div>
            <div className="summary-tags">
                <Tag className="square-tag">Forgotten type</Tag>
                <Tag className="square-tag" type="magenta">
                    {props.data.fg_type}
                </Tag>
            </div>
            <br />
            <Layer>
                <ContainedList
                    label="Attack probabilities"
                    kind="disclosed"
                    size="md">
                    {props.data.probabilities.map((item, index) => (
                        <ContainedListItem key={index}>
                            <div className="flex-tab here">
                                <span>{item.name}</span>
                                <Tag
                                    className="square-tag"
                                    size="sm"
                                    type={index > 0 ? 'gray' : 'magenta'}>
                                    {(100 * item.probability).toFixed(2)}%
                                </Tag>
                            </div>
                        </ContainedListItem>
                    ))}
                </ContainedList>
            </Layer>
        </Column>
    </Grid>
);

class BaseData extends React.Component {
    constructor(props) {
        super(props);
        this.state = props.data;
    }

    deleteItem = _ => {
        this.props.deleteItem(this.state.id);
    };

    nameChange = e => {
        this.props.updateValue({
            id: this.state.id,
            key: 'name',
            value: e.target.value,
        });
    };

    activeBaseChange = (_, { value, __ }) => {
        this.props.updateValue({
            id: this.state.id,
            key: 'active_bases',
            value: value,
        });
    };

    baseInfoChange = e => {
        this.props.updateValue({
            id: this.state.id,
            key: 'bases',
            value: e.target.value,
        });
    };

    render() {
        return (
            <Column lg={4} md={8} sm={4}>
                <Layer>
                    <Tile className="base-info">
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
                                onClick={this.deleteItem.bind(this)}
                            />
                        </div>
                        <TextInput
                            hideLabel
                            id="previous-base-name"
                            maxCount={14}
                            onChange={this.nameChange.bind(this)}
                            value={this.state.name}
                            helperText="Name of the base"
                            labelText=""
                            size="sm"
                            type="text"
                        />
                        <br />
                        <NumberInput
                            id="num-active"
                            hideLabel
                            helperText="Active FG bases in range"
                            max={24 * 60}
                            min={0}
                            onChange={this.activeBaseChange.bind(this)}
                            size="sm"
                            step={1}
                            value={this.state.active_bases}
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
                            onChange={this.baseInfoChange.bind(this)}
                            value={this.state.bases}
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
                <br />
            </Column>
        );
    }
}

class ProductionModel extends React.Component {
    constructor(props) {
        super(props);
        this.state = create_init_state();
    }

    updateValue = ({ id, key, value }) => {
        let tmp_base_data = this.state.data.base_data;

        tmp_base_data[id][key] = value;

        this.setState({
            ...this.state,
            data: {
                ...this.state.data,
                base_data: tmp_base_data,
            },
        });
    };

    addItem = _ => {
        let base_data = this.state.data.base_data;
        let new_base = create_new_base(base_data);

        base_data.push(new_base);

        this.setState({
            ...this.state,
            data: {
                ...this.state.data,
                base_data: base_data,
            },
        });
    };

    deleteItem = id => {
        this.setState({
            ...this.state,
            data: {
                ...this.state.data,
                base_data: this.state.data.base_data
                    .filter(item => item.id != id)
                    .map((item, index) => {
                        item.id = index;
                        return item;
                    }),
            },
        });
    };

    prepareData = _ => {
        let cleaned_data = structuredClone(this.state.data);

        cleaned_data.previous_attack.name = cleaned_data.previous_attack.name.trim();

        cleaned_data.base_data.map(item => {
            const { parsed_info, _ } = parseBaseInfo(item.bases);

            item.name = item.name.trim();
            item.bases = parsed_info;

            return item;
        });

        return cleaned_data;
    };

    checkDataIntegrity = _ => {
        let check_status = true;
        let feedback = [];

        if (this.state.data.previous_attack.name.trim() === '') {
            check_status = false;
            feedback.push('Name of the last attacked base missing.');
        } else {
            const base_names = this.state.data.base_data.map(item =>
                item.name.trim()
            );

            check_status = base_names.includes(
                this.state.data.previous_attack.name.trim()
            );

            if (!check_status) {
                feedback.push(
                    `Previous attack on Base: ${
                        this.state.data.previous_attack.name
                    } not among list of bases: ${base_names.join(', ')}`
                );
            }
        }

        this.state.data.base_data.forEach((item, index) => {
            if (item.name.trim() === '') {
                check_status = false;
                feedback.push(`Name of Base ${index} is missing.`);
            }

            const { _, error } = parseBaseInfo(item.bases);

            if (error) {
                check_status = false;
                feedback.push(
                    `Incorrectly formatted neighborhood information for Base ${index}. ${error.message}.`
                );
            }
        });

        return { check_status, feedback };
    };

    compute = _ => {
        const { check_status, feedback } = this.checkDataIntegrity();

        if (check_status) {
            this.setState(
                {
                    ...this.state,
                    feedback_msg: [],
                    show_report: true,
                    computing: true,
                },
                () => {
                    const cleaned_data = this.prepareData(this.state.data);

                    console.log(123, cleaned_data);

                    const report = {
                        new_attack_on: 'cc',
                        time_to_attack: 0,
                        fg_type: '',
                        probabilities: [
                            {
                                name: 'aa',
                                probability: 0.54833,
                            },
                            {
                                name: 'bb',
                                probability: 0.334141,
                            },
                        ],
                    };

                    this.setState(
                        {
                            ...this.state,
                            report: report,
                        },
                        () => this.setState({ ...this.state, computing: false })
                    );
                }
            );
        } else {
            this.setState({
                ...this.state,
                feedback_msg: feedback,
            });
        }
    };

    resetAll = _ => this.setState(create_init_state());

    render() {
        return (
            <Grid>
                <Column lg={6} md={8} sm={4}>
                    <br />
                    <ContainedList
                        label="Learning a production model"
                        kind="disclosed"
                        size="sm">
                        <ContainedListItem>
                            We will use an old machine learning technique called{' '}
                            <Link
                                href="https://en.wikipedia.org/wiki/Gradient_boosting"
                                target="_blank">
                                gradient boosting
                            </Link>{' '}
                            [
                            <Link
                                href="https://xgboost.readthedocs.io/en/stable"
                                target="_blank">
                                XGBoost
                            </Link>
                            ] to compute a prediction model for the production
                            of Forgotten attacks based on{' '}
                            <span className="text-alert">{data.length}</span>{' '}
                            Forgotten attacks on my bases between{' '}
                            {print_date_str(min_date)} and{' '}
                            {print_date_str(max_date)}.
                            <br />
                            <br />
                            Below you can see the details of what goes into
                            training this AI model. On the right, enter details
                            about all your and click compute to get an estimate
                            from the model of which base is likely to receive an
                            attack next, with what probability, and when.
                            <br />
                            <br />
                            <img
                                alt="xgboost"
                                src="images/xgboost.png"
                                width="100%"
                            />
                            <br />
                            <div className="footnote">
                                Architecture of the AI model. A classifier
                                answers a multiple-choice question (e.g. which
                                of my bases is going to get attacked and whether
                                the attack is going to come from a FG base or
                                camp), while a regressor produces a value
                                prediction (e.g. how long till the next attack).
                                The input data i.e. <em>features</em> are
                                visualized below in terms of how strongly they
                                affected the outcomes.
                            </div>
                        </ContainedListItem>
                    </ContainedList>
                </Column>
                <Column lg={8} md={8} sm={4}>
                    <Accordion isFlush align="end" size="sm">
                        <AccordionItem
                            onHeadingClick={() =>
                                this.setState({
                                    ...this.state,
                                    show_report: false,
                                })
                            }
                            open={!this.state.show_report}
                            title={
                                <strong>
                                    Details of the last Forgotten Attack
                                </strong>
                            }>
                            <Grid>
                                <Column lg={3} md={8} sm={4}>
                                    <Layer>
                                        <Tile>
                                            <RadioButtonGroup
                                                onChange={name =>
                                                    this.setState({
                                                        ...this.state,
                                                        data: {
                                                            ...this.state.data,
                                                            previous_attack: {
                                                                ...this.state
                                                                    .data
                                                                    .previous_attack,
                                                                fg_type: name,
                                                            },
                                                        },
                                                    })
                                                }
                                                legendText="Attack type"
                                                name="attack-type"
                                                orientation="vertical">
                                                {fg_types.map((item, index) => (
                                                    <RadioButton
                                                        checked={
                                                            this.state.data
                                                                .previous_attack
                                                                .fg_type ===
                                                            item
                                                        }
                                                        disabled={
                                                            item === fg_types[2]
                                                        }
                                                        labelText={item}
                                                        value={item}
                                                        id={item}
                                                        key={index}
                                                    />
                                                ))}
                                            </RadioButtonGroup>
                                        </Tile>
                                    </Layer>
                                </Column>
                                <Column lg={5} md={8} sm={4}>
                                    <TextInput
                                        hideLabel
                                        id="previous-base-name"
                                        maxCount={14}
                                        labelText=""
                                        helperText="Name of last defending base"
                                        size="sm"
                                        type="text"
                                        value={
                                            this.state.data.previous_attack.name
                                        }
                                        onChange={e =>
                                            this.setState({
                                                ...this.state,
                                                data: {
                                                    ...this.state.data,
                                                    previous_attack: {
                                                        ...this.state.data
                                                            .previous_attack,
                                                        name: e.target.value,
                                                    },
                                                },
                                            })
                                        }
                                    />
                                    <br />
                                    <NumberInput
                                        hideLabel
                                        id="time-since"
                                        helperText="Time since last attack (in minutes)"
                                        max={24 * 60}
                                        min={0}
                                        size="sm"
                                        step={1}
                                        inputMode="decimal"
                                        type="number"
                                        value={
                                            this.state.data.previous_attack
                                                .time_since_last
                                        }
                                        onChange={(_, { value, __ }) =>
                                            this.setState({
                                                ...this.state,
                                                data: {
                                                    ...this.state.data,
                                                    previous_attack: {
                                                        ...this.state.data
                                                            .previous_attack,
                                                        time_since_last: value,
                                                    },
                                                },
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
                                    show_report: false,
                                })
                            }
                            open={!this.state.show_report}
                            title={
                                <strong>
                                    State of the Union: Current Base Data
                                </strong>
                            }>
                            <Grid>
                                {this.state.data.base_data.map(item => (
                                    <BaseData
                                        key={item.hash_id}
                                        data={
                                            this.state.data.base_data[item.id]
                                        }
                                        updateValue={this.updateValue.bind(
                                            this
                                        )}
                                        deleteItem={this.deleteItem.bind(this)}
                                    />
                                ))}
                                <Column lg={8} md={8} sm={4}>
                                    <Button
                                        onClick={this.addItem.bind(this)}
                                        size="sm"
                                        renderIcon={Add}
                                        kind="tertiary"
                                        iconDescription="Add base data">
                                        Add Base
                                    </Button>
                                </Column>
                            </Grid>
                        </AccordionItem>

                        <AccordionItem
                            disabled={!this.state.show_report}
                            onHeadingClick={() =>
                                this.setState({
                                    ...this.state,
                                    show_report: true,
                                })
                            }
                            open={this.state.show_report}
                            title={<strong>Report</strong>}>
                            {this.state.computing && (
                                <InlineLoading
                                    aria-live="assertive"
                                    description="Computing"
                                    iconDescription="Computing"
                                    status={
                                        this.state.computing
                                            ? 'active'
                                            : this.state.report
                                            ? 'finished'
                                            : 'error'
                                    }
                                />
                            )}
                            {this.state.report && (
                                <Report data={this.state.report} />
                            )}
                        </AccordionItem>
                    </Accordion>

                    <Column>
                        <Grid>
                            <Column lg={3} md={4} sm={4}>
                                <br />
                                <Button
                                    onClick={this.compute.bind(this)}
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
                                    onClick={this.resetAll.bind(this)}
                                    style={{ width: '150px' }}
                                    size="sm"
                                    renderIcon={ResetAlt}
                                    kind="danger"
                                    iconDescription="Compute probabilities">
                                    Reset
                                </Button>
                            </Column>

                            <Column lg={3} md={4} sm={4}>
                                {this.state.feedback_msg.length > 0 && (
                                    <>
                                        <br />
                                        <Callout
                                            lowContrast
                                            kind="error"
                                            statusIconDescription="notification"
                                            title="ERROR"
                                            subtitle={
                                                <ContainedList
                                                    isInset
                                                    size="sm">
                                                    {this.state.feedback_msg.map(
                                                        (item, index) => (
                                                            <ContainedListItem
                                                                key={index}>
                                                                {item}
                                                            </ContainedListItem>
                                                        )
                                                    )}
                                                </ContainedList>
                                            }
                                        />
                                    </>
                                )}
                                <br />
                                <Callout
                                    lowContrast
                                    kind="info"
                                    statusIconDescription="notification"
                                    subtitle={
                                        <span>
                                            This model is trained on a tiny bit
                                            of data from my own bases. Need help
                                            to log camp / outpost information as
                                            well as data from the whole
                                            alliance.
                                        </span>
                                    }
                                    title="Help wanted"
                                />
                            </Column>
                        </Grid>
                    </Column>
                </Column>
            </Grid>
        );
    }
}

export { ProductionModel };
