import { useState } from 'react';
import {
    LogoYoutube,
    Chemistry,
    Documentation,
    EarthAmericasFilled,
} from '@carbon/icons-react';
import {
    Grid,
    Column,
    TabsVertical,
    TabListVertical,
    Tab,
    TabPanels,
    TabPanel,
    Theme,
    Button,
    Modal,
    Tag,
} from '@carbon/react';

import { DailyDistribution } from './DailyDistribution';
import { MonthlyDistribution } from './MonthlyDistribution';
import { JumpAnalysis } from './JumpAnalysis';
import { Honeypot } from './Honeypot';

import { ModalContentDisclaimer } from './Disclaimer';
import { HypothesisModalContent } from './Hypothesis';

const ForgottenPage = _ => {
    const [modal_on, modalToggle] = useState(false);
    const [modal_hypothesis_on, modalHypothesisToggle] = useState(false);

    return (
        <Grid className="top-relief">
            <Column lg={14} md={4} sm={4}>
                <Theme theme="g10">
                    <TabsVertical defaultSelectedIndex={0} height="90vh">
                        <TabListVertical size="lg" className="bottomless">
                            <Tab>Forgotten activity per time of day</Tab>
                            <Tab>Forgotten activity over time</Tab>
                            <Tab>
                                Do jumps to the frontline trigger attacks?
                            </Tab>
                            <Tab>
                                Honeypot I - Decoy bases for the Forgotten
                            </Tab>
                            <Tab disabled className="flex-tab">
                                <span>Honeypot II - Attractor plots</span>
                                <Tag
                                    className="square-tag"
                                    size="sm"
                                    role="status"
                                    type="cool-gray"
                                    aria-label="">
                                    Coming Soon
                                </Tag>
                            </Tab>
                            <Tab disabled className="flex-tab">
                                <span>A production model for FG attacks</span>
                                <div>
                                    <Tag
                                        style={{ marginRight: '10px' }}
                                        className="square-tag"
                                        size="sm"
                                        role="status"
                                        type="purple"
                                        aria-label="">
                                        AI
                                    </Tag>
                                    <Tag
                                        className="square-tag"
                                        size="sm"
                                        role="status"
                                        type="cool-gray"
                                        aria-label="">
                                        Coming Soon
                                    </Tag>
                                </div>
                            </Tab>

                            <img
                                alt="serenity"
                                src="images/serenity.png"
                                style={{ paddingRight: '4px' }}
                            />
                            <br />
                            <Button
                                className="ghostish"
                                size="md"
                                kind="ghost"
                                renderIcon={Chemistry}
                                iconDescription="Hypothesis"
                                onClick={() =>
                                    modalHypothesisToggle(!modal_hypothesis_on)
                                }>
                                Hypothesis
                            </Button>
                            <br />
                            <Button
                                className="ghostish"
                                size="md"
                                kind="ghost"
                                renderIcon={Documentation}
                                iconDescription="Disclaimer"
                                onClick={() => modalToggle(!modal_on)}>
                                Disclaimer
                            </Button>
                            <br />
                            <Button
                                className="ghostish"
                                size="md"
                                kind="ghost"
                                href="https://www.youtube.com/watch?v=5Rs2m3lhg-k"
                                target="_blank"
                                renderIcon={LogoYoutube}
                                iconDescription="Music">
                                <span style={{ paddingRight: '20px' }}>
                                    A song about The Forgotten
                                </span>
                            </Button>
                            <br />
                            <Button
                                size="xs"
                                kind="secondary"
                                hasIconOnly
                                renderIcon={EarthAmericasFilled}
                                href="/migration"
                                iconDescription="Migration"
                            />
                        </TabListVertical>
                        <TabPanels>
                            <TabPanel>
                                <DailyDistribution />
                            </TabPanel>
                            <TabPanel>
                                <MonthlyDistribution />
                            </TabPanel>
                            <TabPanel>
                                <JumpAnalysis />
                            </TabPanel>
                            <TabPanel>
                                <Honeypot />
                            </TabPanel>
                            <TabPanel />
                            <TabPanel />
                        </TabPanels>
                    </TabsVertical>

                    <Modal
                        isFullWidth
                        passiveModal
                        aria-label="Modal content"
                        open={modal_on}
                        onRequestClose={() => modalToggle(false)}>
                        <ModalContentDisclaimer />
                    </Modal>

                    <Modal
                        isFullWidth
                        passiveModal
                        size="lg"
                        aria-label="Modal content"
                        modalHeading={<>We think thoughts &#128526;</>}
                        modalLabel="From musings to facts"
                        open={modal_hypothesis_on}
                        onRequestClose={() => modalHypothesisToggle(false)}>
                        <HypothesisModalContent />
                    </Modal>
                </Theme>
            </Column>
        </Grid>
    );
};

export default ForgottenPage;
