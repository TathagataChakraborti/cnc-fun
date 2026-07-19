import React from 'react';
import {
    PlayFilledAlt,
    PauseFilled,
    Reset,
    SkipBackFilled,
    SkipForwardFilled,
    InterfaceUsage,
} from '@carbon/icons-react';
import {
    Grid,
    Column,
    Tag,
    Button,
    ProgressBar,
    ToastNotification,
    NumberInput,
    Accordion,
    AccordionItem,
    CheckboxGroup,
    Checkbox,
    Theme,
    DatePicker,
    DatePickerInput,
} from '@carbon/react';

import { print_date } from '../../components/BasicElements/Info';
import migration_manifest from '../../cache/migration_manifest.json';

const advancement = 100;

const make_previous_date = date => {
    const date_object = new Date(date);
    date_object.setDate(date_object.getDate() - 1);

    return date_object.toISOString().split('T')[0];
};

const make_next_date = date => {
    const date_object = new Date(date);
    date_object.setDate(date_object.getDate() + 1);

    return date_object.toISOString().split('T')[0];
};

const find_manifest = date => {
    const manifest = migration_manifest.manifests.find(
        item => item.date === date
    );
    return manifest ? manifest : null;
};

const make_image_url = date => `/images/migration/${date}.png`;
const make_next_url = date => make_image_url(make_next_date(date));
const make_init_state = date => {
    return {
        current_date: date,
        currentBg: make_image_url(date),
        nextBg: make_next_url(date),
        play_on: false,
        progress: 0,
        manifest: null,
        controls: {
            autopause: false,
            play_speed: 1,
            event_speed: 2,
        },
    };
};

class MigrationPage extends React.Component {
    constructor(props) {
        super(props);
        this.timeoutId = null;
        this.timerId = null;
        this.state = make_init_state(migration_manifest.start_date);
    }

    componentWillUnmount() {
        if (this.timeoutId) clearTimeout(this.timeoutId);
        if (this.timerId) clearInterval(this.timerId);
    }

    loadPreviousImage(_, date) {
        const new_date = date
            ? date
            : make_previous_date(this.state.current_date);

        if (new Date(new_date) < new Date(migration_manifest.start_date)) {
            if (this.state.play_on) this.pausePlay();
        } else {
            this.preloadNextImage(new_date);
        }
    }

    loadNextImage(_, date) {
        const new_date = date ? date : make_next_date(this.state.current_date);

        if (new Date(new_date) > new Date(migration_manifest.end_date)) {
            if (this.state.play_on) this.pausePlay();
        } else {
            this.preloadNextImage(new_date);
        }
    }

    preloadNextImage(new_date) {
        this.setState(
            {
                current_date: new_date,
                nextBg: make_image_url(new_date),
                progress: 0,
            },

            () => {
                const img = new Image();
                img.src = this.state.nextBg;

                const manifest = find_manifest(this.state.current_date);

                if (this.state.play_on) {
                    if (manifest) {
                        this.pausePlay();

                        if (!this.state.controls.autopause) {
                            const progressId = setInterval(() => {
                                const progress_size =
                                    1000 * this.state.controls.event_speed;

                                const new_progress =
                                    this.state.progress + advancement;

                                if (new_progress <= progress_size) {
                                    this.setState({
                                        ...this.state,
                                        progress: new_progress,
                                        play_on: true,
                                    });
                                } else {
                                    clearInterval(progressId);

                                    this.timerId = setInterval(
                                        this.loadNextImage.bind(this),
                                        1000 * this.state.controls.play_speed
                                    );
                                }
                            }, advancement);
                        }
                    }
                }

                img.onload = () => {
                    this.timeoutId = setTimeout(() => {
                        this.setState({
                            currentBg: this.state.nextBg,
                            nextBg: null,
                            manifest: manifest,
                        });
                    }, advancement);
                };
            }
        );
    }

    pausePlay() {
        clearInterval(this.timerId);
        this.timerId = null;

        this.setState({
            ...this.state,
            play_on: false,
            progress: 0,
        });
    }

    startPlay() {
        if (this.state.play_on) {
            this.pausePlay();
        } else {
            this.timerId = setInterval(
                this.loadNextImage.bind(this),
                1000 * this.state.controls.play_speed
            );

            this.setState({
                ...this.state,
                play_on: true,
            });
        }
    }

    render() {
        const { currentBg, nextBg } = this.state;

        const containerStyle = {
            position: 'relative',
            width: '100vw',
            height: '95vh',
            overflow: 'hidden',
        };

        const layerStyle = {
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100vw',
            height: '95vh',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
        };

        const contentStyle = {
            backgroundColor: `rgba(0, 0, 0, 0.2)`,
            height: '100vh',
            padding: '32px',
            position: 'relative',
            zIndex: 1,
        };

        return (
            <Grid className="migration">
                <div style={containerStyle}>
                    <div
                        style={{
                            ...layerStyle,
                            zIndex: 0,
                            backgroundImage: `url(${currentBg})`,
                        }}
                    />

                    {nextBg && (
                        <div
                            style={{
                                ...layerStyle,
                                zIndex: -1,
                                backgroundImage: `url(${nextBg})`,
                            }}
                        />
                    )}

                    <Grid>
                        <Column lg={4} md={4} sm={4} style={contentStyle}>
                            <div
                                style={{ minHeight: '200px' }}
                                className="grid-container">
                                <ToastNotification
                                    lowContrast
                                    hideCloseButton
                                    aria-label="closes notification"
                                    style={{ width: '375px' }}
                                    caption={
                                        this.state.manifest ? (
                                            this.state.current_date
                                        ) : (
                                            <>
                                                <strong>
                                                    This page is not ready yet.
                                                    Look away!
                                                </strong>{' '}
                                                It requires forty kilograms of
                                                AI. Until we reach the center.
                                                &#128513;
                                            </>
                                        )
                                    }
                                    kind={this.state.manifest ? this.state.manifest.type : 'info'}
                                    role="status"
                                    statusIconDescription="notification"
                                    subtitle={
                                        this.state.manifest
                                            ? this.state.manifest.description
                                            : "This page visualizes Serenity's migration to the center on Tiberian 72."
                                    }
                                    title="Serenity Migration"
                                />
                                {this.state.manifest && this.state.play_on && (
                                    <ProgressBar
                                        value={this.state.progress}
                                        max={
                                            1000 *
                                            this.state.controls.event_speed
                                        }
                                        status="active"
                                        label=""
                                    />
                                )}
                                <br />
                                <br />
                            </div>

                            <div className="grid-container">
                                <div style={{ display: 'flex' }}>
                                    <Tag
                                        className="square-tag"
                                        type="high-contrast"
                                        size="lg">
                                        DATE
                                    </Tag>

                                    <DatePicker
                                        allowInput={false}
                                        datePickerType="single"
                                        locale="en"
                                        dateFormat="Y-m-d"
                                        minDate={migration_manifest.start_date}
                                        maxDate={migration_manifest.end_date}
                                        value={this.state.current_date}
                                        onChange={e => {
                                            this.setState(
                                                {
                                                    ...this.state,
                                                    current_date: print_date(
                                                        new Date(e[0])
                                                    ),
                                                },
                                                e => {
                                                    this.loadNextImage(
                                                        e,
                                                        this.state.current_date
                                                    );
                                                }
                                            );
                                        }}>
                                        <DatePickerInput
                                            hideLabel
                                            style={{ width: '150px' }}
                                            disabled={this.state.play_on}
                                            id="date-picker-single"
                                            size="sm"
                                            placeholder="yyyy/mm/dd"
                                        />
                                    </DatePicker>

                                    <Button
                                        className="right-relief"
                                        kind="primary"
                                        size="sm"
                                        iconDescription="Play previous"
                                        hasIconOnly
                                        renderIcon={SkipBackFilled}
                                        disabled={
                                            new Date(this.state.current_date) <=
                                                new Date(
                                                    migration_manifest.start_date
                                                ) || this.state.play_on
                                        }
                                        onClick={this.loadPreviousImage.bind(
                                            this
                                        )}
                                    />
                                    <Button
                                        className="right-relief"
                                        kind="primary"
                                        size="sm"
                                        iconDescription="Play next"
                                        hasIconOnly
                                        renderIcon={SkipForwardFilled}
                                        disabled={
                                            new Date(this.state.current_date) >=
                                                new Date(
                                                    migration_manifest.end_date
                                                ) || this.state.play_on
                                        }
                                        onClick={this.loadNextImage.bind(this)}
                                    />
                                    <Button
                                        className="right-relief"
                                        kind={
                                            this.state.play_on
                                                ? 'danger'
                                                : 'primary'
                                        }
                                        size="sm"
                                        iconDescription="Play"
                                        hasIconOnly
                                        renderIcon={
                                            this.state.play_on
                                                ? PauseFilled
                                                : PlayFilledAlt
                                        }
                                        disabled={this.state.progress > 0}
                                        onClick={() => {
                                            this.startPlay();
                                        }}
                                    />
                                    <Button
                                        className="right-relief"
                                        kind="primary"
                                        size="sm"
                                        iconDescription="Reset"
                                        hasIconOnly
                                        renderIcon={Reset}
                                        disabled={this.state.progress > 0}
                                        onClick={e => {
                                            this.pausePlay();
                                            this.loadNextImage(
                                                e,
                                                migration_manifest.start_date
                                            );
                                        }}
                                    />
                                </div>
                                <div>
                                    <br />
                                    <Accordion align="end" size="sm">
                                        <Theme
                                            theme="g90"
                                            style={{
                                                backgroundColor: `rgba(0, 0, 0, 0.2)`,
                                            }}>
                                            <AccordionItem title="Controls">
                                                <br />
                                                <NumberInput
                                                    disabled={
                                                        this.state.play_on
                                                    }
                                                    id="input-play-interval"
                                                    label="Play speed (in seconds)"
                                                    helperText="Min: 1, Max: 5"
                                                    max={5}
                                                    min={1}
                                                    onChange={(
                                                        _,
                                                        { value, __ }
                                                    ) => {
                                                        if (
                                                            value >= 1 &&
                                                            value <= 5
                                                        )
                                                            this.setState({
                                                                ...this.state,
                                                                controls: {
                                                                    ...this
                                                                        .state
                                                                        .controls,
                                                                    play_speed: value,
                                                                },
                                                            });
                                                    }}
                                                    size="sm"
                                                    step={1}
                                                    value={
                                                        this.state.controls
                                                            .play_speed
                                                    }
                                                />
                                                <br />
                                                <NumberInput
                                                    disabled={
                                                        this.state.play_on
                                                    }
                                                    id="input-event-interval"
                                                    label="Event speed (in seconds)"
                                                    helperText="Min: 1, Max: 10"
                                                    max={10}
                                                    min={1}
                                                    onChange={(
                                                        _,
                                                        { value, __ }
                                                    ) => {
                                                        if (
                                                            value >= 1 &&
                                                            value <= 10
                                                        )
                                                            this.setState({
                                                                ...this.state,
                                                                controls: {
                                                                    ...this
                                                                        .state
                                                                        .controls,
                                                                    event_speed: value,
                                                                },
                                                            });
                                                    }}
                                                    size="sm"
                                                    step={1}
                                                    value={
                                                        this.state.controls
                                                            .event_speed
                                                    }
                                                />
                                                <br />
                                                <CheckboxGroup
                                                    helperText="Use this to stop simulation on eventful days"
                                                    legendText="Autoplay controls">
                                                    <Checkbox
                                                        id="checkbox-label-1"
                                                        labelText="Autopause on event"
                                                        disabled={
                                                            this.state.play_on
                                                        }
                                                        checked={
                                                            this.state.controls
                                                                .autopause
                                                        }
                                                        onChange={(
                                                            _,
                                                            { checked }
                                                        ) =>
                                                            this.setState({
                                                                ...this.state,
                                                                controls: {
                                                                    ...this
                                                                        .state
                                                                        .controls,
                                                                    autopause: checked,
                                                                },
                                                            })
                                                        }
                                                    />
                                                </CheckboxGroup>{' '}
                                            </AccordionItem>
                                        </Theme>
                                    </Accordion>
                                </div>
                            </div>
                        </Column>
                        <Column
                            lg={4}
                            md={4}
                            sm={4}
                            className="top-relief"
                            style={{ zIndex: 42 }}>
                            {this.state.play_on && (
                                <InterfaceUsage size={24} color="red" />
                            )}
                        </Column>
                    </Grid>
                </div>
            </Grid>
        );
    }
}

export default MigrationPage;
