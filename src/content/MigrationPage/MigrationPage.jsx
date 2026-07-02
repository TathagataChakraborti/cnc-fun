import React from 'react';
import {
    PlayFilledAlt,
    PauseFilled,
    Reset,
    SkipForwardFilled,
} from '@carbon/icons-react';
import { Grid, Column, Tag, Button, ToastNotification } from '@carbon/react';

const start_date = '2026-05-27';
const end_date = '2026-07-02';

const make_next_date = date => {
    const date_object = new Date(date);
    date_object.setDate(date_object.getDate() + 1);

    return date_object.toISOString().split('T')[0];
};

const make_image_url = date => `/images/migration/${date}.png`;
const make_next_url = date => make_image_url(make_next_date(date));
const make_init_state = date => {
    return {
        current_date: date,
        isTransitioning: false,
        currentBg: make_image_url(date),
        nextBg: make_next_url(date),
        play_on: false,
        note: null,
    };
};

class MigrationPage extends React.Component {
    constructor(props) {
        super(props);
        this.timeoutId = null;
        this.timerId = null;
        this.state = make_init_state(start_date);
    }

    componentWillUnmount() {
        if (this.timeoutId) {
            clearTimeout(this.timeoutId);
        }

        if (this.timerId) {
            clearInterval(this.timer);
        }
    }

    preloadNextImage(_, date) {
        const new_date = date ? date : make_next_date(this.state.current_date);

        if (new Date(new_date) > new Date(end_date)) {
            if (this.state.play_on) this.pausePlay();
        } else {
            this.setState(
                {
                    current_date: new_date,
                    nextBg: make_next_url(new_date),
                },

                () => {
                    const img = new Image();
                    img.src = this.state.nextBg;

                    img.onload = () => {
                        this.setState({ isTransitioning: true });

                        this.timeoutId = setTimeout(() => {
                            this.setState({
                                currentBg: this.state.nextBg,
                                nextBg: null,
                                isTransitioning: false,
                            });
                        }, 100);
                    };
                }
            );
        }
    }

    pausePlay() {
        clearInterval(this.timerId);
        this.timerId = null;

        this.setState({
            ...this.state,
            play_on: false,
        });
    }

    startPlay() {
        if (!this.state.play_on) {
            this.timerId = setInterval(this.preloadNextImage.bind(this), 1000);

            this.setState({
                ...this.state,
                play_on: true,
            });
        }
    }

    render() {
        const { currentBg, nextBg, isTransitioning } = this.state;

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
                            backgroundImage: `url(${currentBg})`,
                            opacity: isTransitioning ? 0 : 1,
                        }}
                    />

                    {nextBg && (
                        <div
                            style={{
                                ...layerStyle,
                                backgroundImage: `url(${nextBg})`,
                                opacity: isTransitioning ? 1 : 0,
                            }}
                        />
                    )}

                    <Grid>
                        <Column lg={4} md={4} sm={4}>
                            <div style={contentStyle}>
                                <ToastNotification
                                    lowContrast
                                    hideCloseButton
                                    aria-label="closes notification"
                                    caption={
                                        <>
                                            <strong>
                                                This page is not ready yet!
                                            </strong>{' '}
                                            Until we reach the center &#128513;"
                                        </>
                                    }
                                    kind="error"
                                    role="status"
                                    statusIconDescription="notification"
                                    subtitle="This page visualizes Serenity's migration to the center on Tiberian 72."
                                    title="Serenity Migration"
                                />
                                {this.state.note && (
                                    <>
                                        <br />
                                        <br />
                                        <ToastNotification
                                            lowContrast
                                            hideCloseButton
                                            aria-label="closes notification"
                                            caption={this.state.current_date}
                                            kind="info"
                                            role="status"
                                            statusIconDescription="notification"
                                            subtitle={this.state.note}
                                            title="Migration Event"
                                        />
                                    </>
                                )}

                                <br />
                                <br />
                                <div style={{ display: 'flex' }}>
                                    <Tag
                                        className="square-tag"
                                        type="high-contrast"
                                        size="lg">
                                        DATE
                                    </Tag>
                                    <Tag
                                        className="square-tag"
                                        type="blue"
                                        size="lg">
                                        <strong>
                                            {this.state.current_date}
                                        </strong>
                                    </Tag>

                                    <Button
                                        className="right-relief"
                                        kind="primary"
                                        size="sm"
                                        iconDescription="Play next"
                                        hasIconOnly
                                        renderIcon={SkipForwardFilled}
                                        disabled={
                                            new Date(this.state.current_date) >=
                                                new Date(end_date) ||
                                            this.state.play_on
                                        }
                                        onClick={this.preloadNextImage.bind(
                                            this
                                        )}
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
                                        renderIcon={PlayFilledAlt}
                                        onClick={() => {
                                            this.startPlay();
                                        }}
                                    />
                                    <Button
                                        className="right-relief"
                                        kind="primary"
                                        size="sm"
                                        iconDescription="Pause"
                                        hasIconOnly
                                        renderIcon={PauseFilled}
                                        disabled={!this.state.play_on}
                                        onClick={() => {
                                            this.pausePlay();
                                        }}
                                    />
                                    <Button
                                        className="right-relief"
                                        kind="primary"
                                        size="sm"
                                        iconDescription="Reset"
                                        hasIconOnly
                                        renderIcon={Reset}
                                        onClick={e => {
                                            this.pausePlay();
                                            this.preloadNextImage(
                                                e,
                                                start_date
                                            );
                                        }}
                                    />
                                </div>
                            </div>
                        </Column>
                    </Grid>
                </div>
            </Grid>
        );
    }
}

export default MigrationPage;
