import React from 'react';
import {
    Grid,
    Column,
    Layer,
    Tabs,
    Tab,
    TabList,
    TabPanels,
    TabPanel,
    Accordion,
    AccordionItem,
    ContainedList,
    ContainedListItem,
    Button,
    Tag,
} from '@carbon/react';
import { ChevronDown, ChevronUp, Switcher } from '@carbon/icons-react';
import { ComparisonSlider } from './ComparisonSlider';

import assetList from './Data';

import topImageSrc from '/images/assets/world/championship.png';
import bottomImageSrc from '/images/assets/world/firestorm.png';

const max_size = 4;

class MoviePage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            selected_index: 2,
            starting_index: 0,
            selected_tab: 0,
        };
    }

    selectIndex(index) {
        this.setState({
            ...this.state,
            selected_index: this.state.starting_index + index,
        });
    }

    selectTab(tab_index) {
        this.setState({
            ...this.state,
            selected_tab: tab_index,
        });
    }

    render() {
        return (
            <Grid className="top-relief">
                <Column lg={8} md={4} sm={4}>
                    <Accordion align="start" size="lg">
                        <AccordionItem
                            open
                            title={
                                <div className="flex-tab here">
                                    <span>Movie I: Journey to the Center</span>
                                    <div>
                                        <Tag
                                            size="sm"
                                            className="square-tag tag-relief"
                                            type="cool-gray">
                                            2026-09-19
                                        </Tag>
                                        <Tag
                                            size="sm"
                                            className="square-tag"
                                            type="magenta">
                                            Live
                                        </Tag>
                                    </div>
                                </div>
                            }>
                            <div
                                className="video-responsive"
                                style={{
                                    overflow: 'hidden',
                                    paddingBottom:
                                        '56.25%' /* 16:9 Aspect Ratio */,
                                    position: 'relative',
                                    height: 0,
                                }}>
                                <iframe
                                    style={{
                                        left: 0,
                                        top: 0,
                                        height: '100%',
                                        width: '100%',
                                        position: 'absolute',
                                    }}
                                    src=""
                                    frameborder="0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                    referrerpolicy="strict-origin-when-cross-origin"
                                    allowfullscreen
                                />
                            </div>
                        </AccordionItem>
                        <AccordionItem
                            title={
                                <div className="flex-tab here">
                                    <span>Movie II: Fort Defeat</span>
                                    <div>
                                        <Tag
                                            size="sm"
                                            className="square-tag tag-relief"
                                            type="cool-gray">
                                            2026-10-18
                                        </Tag>
                                        <Tag
                                            size="sm"
                                            className="square-tag"
                                            type="outline">
                                            Coming soon
                                        </Tag>
                                    </div>
                                </div>
                            }
                            disabled
                        />
                        <AccordionItem
                            title={
                                <div className="flex-tab here">
                                    <span>Movie III: Fort Victory</span>
                                    <Tag
                                        size="sm"
                                        className="square-tag"
                                        type="outline">
                                        Coming soon
                                    </Tag>
                                </div>
                            }
                            disabled
                        />
                    </Accordion>
                </Column>
                <Column lg={6} md={4} sm={4}>
                    <Layer>
                        <Tabs selectedIndex={this.state.selected_tab}>
                            <TabList contained fullWidth size="lg">
                                {assetList.map((item, index) => (
                                    <Tab
                                        key={index}
                                        onClick={this.selectTab.bind(
                                            this,
                                            index
                                        )}>
                                        {item.name}
                                    </Tab>
                                ))}
                            </TabList>
                            <TabPanels>
                                {assetList.map((_, index) => {
                                    if (index !== this.state.selected_tab) {
                                        return <TabPanel />;
                                    } else {
                                        return (
                                            <TabPanel className="flushed-panel">
                                                <br />
                                                <Grid>
                                                    <Column
                                                        lg={2}
                                                        md={4}
                                                        sm={4}>
                                                        <ContainedList
                                                            isInset
                                                            size="sm">
                                                            <ContainedListItem>
                                                                <Button
                                                                    onClick={() =>
                                                                        this.setState(
                                                                            {
                                                                                ...this
                                                                                    .state,
                                                                                starting_index:
                                                                                    this
                                                                                        .state
                                                                                        .starting_index -
                                                                                    1,
                                                                            }
                                                                        )
                                                                    }
                                                                    disabled={
                                                                        this
                                                                            .state
                                                                            .starting_index ===
                                                                        0
                                                                    }
                                                                    hasIconOnly
                                                                    size="xs"
                                                                    kind="ghost"
                                                                    renderIcon={
                                                                        ChevronUp
                                                                    }
                                                                    iconDescription="Scroll up"
                                                                />
                                                                <Button
                                                                    onClick={() =>
                                                                        this.setState(
                                                                            {
                                                                                ...this
                                                                                    .state,
                                                                                starting_index:
                                                                                    this
                                                                                        .state
                                                                                        .starting_index +
                                                                                    1,
                                                                            }
                                                                        )
                                                                    }
                                                                    disabled={
                                                                        this
                                                                            .state
                                                                            .starting_index +
                                                                            max_size ===
                                                                        assetList[
                                                                            this
                                                                                .state
                                                                                .selected_tab
                                                                        ].assets
                                                                            .length
                                                                    }
                                                                    hasIconOnly
                                                                    size="xs"
                                                                    kind="ghost"
                                                                    renderIcon={
                                                                        ChevronDown
                                                                    }
                                                                    iconDescription="Scroll down"
                                                                />
                                                            </ContainedListItem>

                                                            {assetList[
                                                                this.state
                                                                    .selected_tab
                                                            ].assets
                                                                .slice(
                                                                    this.state
                                                                        .starting_index,
                                                                    this.state
                                                                        .starting_index +
                                                                        max_size
                                                                )
                                                                .map(
                                                                    (
                                                                        item,
                                                                        index
                                                                    ) => (
                                                                        <ContainedListItem
                                                                            onClick={this.selectIndex.bind(
                                                                                this,
                                                                                index
                                                                            )}
                                                                            key={
                                                                                index
                                                                            }>
                                                                            <div className="flex-tab here">
                                                                                <div
                                                                                    className={
                                                                                        this
                                                                                            .state
                                                                                            .starting_index +
                                                                                            index ===
                                                                                        this
                                                                                            .state
                                                                                            .selected_index
                                                                                            ? 'text-blue'
                                                                                            : ''
                                                                                    }
                                                                                    style={{
                                                                                        width:
                                                                                            '80%',
                                                                                        fontSize:
                                                                                            'small',
                                                                                    }}>
                                                                                    {
                                                                                        item.name
                                                                                    }
                                                                                </div>
                                                                                {this
                                                                                    .state
                                                                                    .starting_index +
                                                                                    index ===
                                                                                    this
                                                                                        .state
                                                                                        .selected_index && (
                                                                                    <Switcher className="text-blue" />
                                                                                )}
                                                                            </div>
                                                                        </ContainedListItem>
                                                                    )
                                                                )}
                                                        </ContainedList>
                                                    </Column>
                                                    <Column
                                                        lg={4}
                                                        md={4}
                                                        sm={4}>
                                                        <ComparisonSlider
                                                            topImage={
                                                                topImageSrc
                                                            }
                                                            bottomImage={
                                                                bottomImageSrc
                                                            }
                                                        />
                                                    </Column>
                                                </Grid>
                                            </TabPanel>
                                        );
                                    }
                                })}
                            </TabPanels>
                        </Tabs>
                    </Layer>
                </Column>
            </Grid>
        );
    }
}

export default MoviePage;
