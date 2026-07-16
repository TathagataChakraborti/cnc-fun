import React from 'react';
import {
    Tag,
    Grid,
    Column,
    DatePicker,
    DatePickerInput,
    Tile,
    Link,
    Button,
    Modal,
    CodeSnippet,
} from '@carbon/react';
import kstest from '@stdlib/stats-kstest';
import { InformationSquareFilled, ResetAlt } from '@carbon/icons-react';
import { HypothesisModalContent as ModalContent } from './Hypothesis';
import {
    LineChart,
    SimpleBarChart,
    ScaleTypes,
    AxisPositions,
} from '@carbon/charts-react';

import {
    print_date_str,
    print_date,
} from '../../components/BasicElements/Info';

import '@carbon/charts-react/styles.css';
import data from '../../cache/daily_distribution.json';

let max_date = data[0].datetime;
let min_date = data[data.length - 1].datetime;

let forgotten_types = ['Base', 'Camp'];

let line_options = {
    axes: {
        [AxisPositions.TOP]: {
            mapsTo: 'value',
            domain: [0, 1],
        },
        [AxisPositions.RIGHT]: {
            mapsTo: 'date',
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
    height: '450px',
};

let options = {
    axes: {
        [AxisPositions.LEFT]: {
            mapsTo: 'value',
            visible: false,
            domain: [0, 1],
        },
        [AxisPositions.TOP]: {
            mapsTo: 'date',
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
    height: '50px',
};

const timeOnlyData = data =>
    data.map(item => {
        const today = new Date();

        const then = new Date(item.datetime);

        const hours = then.getHours();
        const minutes = then.getMinutes();
        const seconds = then.getSeconds();

        today.setHours(hours, minutes, seconds);

        return {
            date: today,
            value: 1,
            group: item.type,
        };
    });

const timeOnlyDataP = data =>
    data
        .map(item => {
            const then = new Date(item.datetime);

            const hours = then.getHours();
            const minutes = then.getMinutes();
            const seconds = then.getSeconds();

            return hours * 60 * 60 + minutes * 60 + seconds;
        })
        .map(item => item / 86400);

function filter_data_by_date(data, start_date, end_date) {
    if (start_date)
        data = data.filter(item =>
            is_date_1_earlier_than_date_2(start_date, item.datetime)
        );

    if (end_date)
        data = data.filter(item =>
            is_date_1_earlier_than_date_2(item.datetime, end_date)
        );

    return data;
}

function is_date_1_earlier_than_date_2(date_1, date_2) {
    const date_1_object = new Date(date_1);
    const date_2_object = new Date(date_2);

    return date_1_object <= date_2_object;
}

function computeP(data) {
    const sampleTimes = timeOnlyDataP(data);

    return sampleTimes.length > 5
        ? kstest(sampleTimes, 'uniform', 0.0, 1.0)
        : null;
}

class DailyDistribution extends React.Component {
    constructor(props) {
        super(props);
        this.chartRef = React.createRef();
        this.state = {
            data: data,
            p_value_modal: false,
            hypothesis_modal: false,
            start_date: null,
            end_date: null,
            selected_types: forgotten_types,
        };
    }

    componentDidMount() {
        if (this.chartRef.current) {
            const chartInstance = this.chartRef.current.chart;

            chartInstance.services.events.addEventListener(
                'legend-item-onclick',
                this.handleLegendClick
            );
        }

        var p_value_data = [];
        var ref_date = new Date(min_date);

        while (ref_date <= new Date(max_date)) {
            var ref_date_2 = new Date(ref_date);
            ref_date_2.setDate(ref_date_2.getDate() + 3);

            forgotten_types.forEach(type => {
                const filtered_data = filter_data_by_date(
                    data,
                    ref_date,
                    ref_date_2
                ).filter(item => item.type === type);

                const result = computeP(filtered_data);

                if (result)
                    p_value_data.push({
                        date: ref_date,
                        value: result.pValue,
                        group: type,
                    });
            });

            const filtered_data = filter_data_by_date(
                data,
                ref_date,
                ref_date_2
            );

            const result = computeP(filtered_data);

            if (result)
                p_value_data.push({
                    date: ref_date,
                    value: result.pValue,
                    group: 'All',
                });

            p_value_data.push({
                date: ref_date,
                value: 0.05,
                group: 'Null Hypothesis',
            });

            ref_date = ref_date_2;
        }

        this.setState({
            ...this.state,
            p_value_data: p_value_data,
        });
    }

    componentWillUnmount() {
        if (this.chartRef.current) {
            const chartInstance = this.chartRef.current.chart;
            chartInstance.services.events.removeEventListener(
                'legend-item-onclick',
                this.handleLegendClick
            );
        }
    }

    setDate(e) {
        this.setState({
            ...this.state,
            start_date: e[0],
            end_date: e.length > 1 ? e[1] : new Date(max_date),
        });
    }

    handleLegendClick = ({ detail }) => {
        const selected_type = detail.clickedElement._groups[0][0].__data__.name;

        var new_selected_types = this.state.selected_types;

        if (!new_selected_types.includes(selected_type)) {
            new_selected_types.push(selected_type);
        } else if (new_selected_types === forgotten_types) {
            new_selected_types = [selected_type];
        } else {
            new_selected_types = forgotten_types;
        }

        this.setState({
            ...this.state,
            selected_types: new_selected_types,
        });
    };

    render() {
        const filtered_data = filter_data_by_date(
            this.state.data,
            this.state.start_date,
            this.state.end_date
        );

        const filtered_data_top = filtered_data.filter(item =>
            this.state.selected_types.includes(item.type)
        );

        const formatted_data_top = filtered_data_top.map(item => {
            return {
                date: new Date(item.datetime).getTime(),
                value: 1,
                group: item.type,
            };
        });

        const formatted_data_bottom = timeOnlyData(filtered_data);

        var result = computeP(filtered_data_top);
        var p_value = result ? result.pValue : null;

        return (
            <Grid>
                <Column lg={14} md={4} sm={4}>
                    <Grid>
                        <Column lg={10} md={4} sm={4}>
                            <SimpleBarChart
                                data={formatted_data_top}
                                options={options}
                            />

                            <br />
                            <br />

                            <SimpleBarChart
                                ref={this.chartRef}
                                data={formatted_data_bottom}
                                options={{
                                    ...options,
                                    height: '250px',
                                    legend: { enabled: true },
                                }}
                            />

                            <br />
                            <br />

                            <Tile className="panel-padding">
                                There has been{' '}
                                <Link
                                    className="link-to-modal"
                                    onClick={() => {
                                        this.setState({
                                            ...this.state,
                                            hypothesis_modal: true,
                                        });
                                    }}>
                                    <em>many</em>
                                </Link>
                                , largely unproven, theories about Forgotten
                                attacks. One of the early ones that appeared in
                                our alliance chat was whether the Forgotten
                                become more active during certain times of the
                                day. So here we are!
                                <br />
                                <br />
                                Each line on this graph appears on the timeline
                                of a 24-hour clock, whenever there has been an
                                attack over the period of{' '}
                                {this.state.start_date
                                    ? print_date(this.state.start_date)
                                    : print_date_str(min_date)}{' '}
                                to{' '}
                                {this.state.end_date
                                    ? print_date(this.state.end_date)
                                    : print_date_str(max_date)}
                                . A visual inspection does not show any pattern,
                                other than a very suspicous looking black hole
                                at 5:30 AM UTC+5:30 time. &#x1F440;
                                <br />
                                <br />
                                <DatePicker
                                    datePickerType="range"
                                    dateFormat="Y-m-d"
                                    minDate={min_date}
                                    maxDate={max_date}
                                    onChange={e => {
                                        this.setDate(e);
                                    }}>
                                    <DatePickerInput
                                        id="date-picker-input-id-start"
                                        labelText="Start date"
                                        placeholder="yyyy/mm/dd"
                                        size="sm"
                                    />
                                    <DatePickerInput
                                        id="date-picker-input-id-finish"
                                        labelText="End date"
                                        placeholder="yyyy/mm/dd"
                                        size="sm"
                                    />
                                </DatePicker>
                                <Button
                                    kind="ghost"
                                    size="sm"
                                    iconDescription="Reset dates"
                                    hasIconOnly
                                    renderIcon={ResetAlt}
                                    onClick={() => {
                                        this.setState({
                                            ...this.state,
                                            start_date: new Date(min_date),
                                            end_date: new Date(max_date),
                                        });
                                    }}
                                />
                                <br />
                                <br />
                                Fortunately, we can test the uniformity of this
                                distribution using the{' '}
                                <Link
                                    href="https://en.wikipedia.org/wiki/Kolmogorov%E2%80%93Smirnov_test"
                                    target="_blank">
                                    Kolmogorov-Smirnov test
                                </Link>
                                , which measures how closely a distribution,
                                such as the production of events on a timeline,
                                matches a uniform distribution i.e. follows a
                                truly random production pattern.
                                <br />
                                <br />
                                <strong>
                                    A p-value greater than 0.05
                                </strong>{' '}
                                indicates no{' '}
                                <Link
                                    href="https://en.wikipedia.org/wiki/Statistical_significance"
                                    target="_blank">
                                    statistically significant
                                </Link>{' '}
                                difference with a uniform distribution: so
                                nothing to worry about here, sans that blank at
                                midnight.
                                <br />
                                <br />
                                <div style={{ display: 'flex' }}>
                                    <Tag className="square-tag">p-value</Tag>
                                    {p_value && (
                                        <Tag
                                            className="square-tag"
                                            type={
                                                p_value < 0.05
                                                    ? 'magenta'
                                                    : 'green'
                                            }>
                                            {p_value.toFixed(5)}
                                        </Tag>
                                    )}
                                    <Button
                                        kind="secondary"
                                        size="sm"
                                        iconDescription="K-S Test Result"
                                        hasIconOnly
                                        renderIcon={InformationSquareFilled}
                                        onClick={() => {
                                            this.setState({
                                                ...this.state,
                                                p_value_modal: true,
                                            });
                                        }}
                                    />
                                </div>
                            </Tile>
                        </Column>

                        <Column lg={4} md={4} sm={4}>
                            {this.state.p_value_data && (
                                <>
                                    <LineChart
                                        data={this.state.p_value_data}
                                        options={line_options}
                                    />
                                    <br />
                                    <br />
                                </>
                            )}

                            <Tile className="panel-padding">
                                This measure does not corrupt with more data
                                points but of course, it might well be that over
                                time the timing of attacks itself have changed.
                                In statistical terms, this means that the
                                underlying probability distribution that
                                produces Forgotten attacks is{' '}
                                <Link
                                    href="https://en.wikipedia.org/wiki/Stationary_process"
                                    target="_blank">
                                    non-stationary
                                </Link>
                                , i.e. it changes with time! If you are paranoid
                                about this, you can change the date range on the
                                left and see if this impacts the p-value for a
                                sufficiently large (enough samples) time
                                interval.
                                <br />
                                <br />
                                It doesn't. &#128524;
                            </Tile>
                        </Column>
                    </Grid>
                </Column>

                {result && (
                    <Modal
                        onRequestClose={() => {
                            this.setState({
                                ...this.state,
                                p_value_modal: false,
                            });
                        }}
                        open={this.state.p_value_modal}
                        passiveModal>
                        <CodeSnippet
                            hideCopyButton
                            type="multi"
                            style={{
                                backgroundColor: 'inherit',
                            }}>
                            {result.print()}
                        </CodeSnippet>
                    </Modal>
                )}

                <Modal
                    isFullWidth
                    passiveModal
                    size="lg"
                    aria-label="Modal content"
                    modalHeading={<>We think thoughts &#128526;</>}
                    modalLabel="From musings to facts"
                    open={this.state.hypothesis_modal}
                    onRequestClose={() =>
                        this.setState({
                            ...this.state,
                            hypothesis_modal: false,
                        })
                    }>
                    <ModalContent />
                </Modal>
            </Grid>
        );
    }
}

export { DailyDistribution };
