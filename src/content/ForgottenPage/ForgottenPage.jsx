import {
    Grid,
    Column,
    TabsVertical,
    TabListVertical,
    Tab,
    TabPanels,
    TabPanel,
    Theme,
} from '@carbon/react';

import { generateUrl } from '../../components/Info';
import { DailyDistribution } from './DailyDistribution';
import { MonthlyDistribution } from './MonthlyDistribution';

const ForgottenPage = _ => {
    return (
        <Grid className="top-relief">
            <Column lg={14} md={4} sm={4}>
                <Theme theme="g10">
                    <TabsVertical defaultSelectedIndex={1} height="">
                        <TabListVertical size="lg" className="bottomless">
                            <Tab>Forgotten activity per time of day</Tab>
                            <Tab>Forgotten activity over time</Tab>
                            <Tab>
                                Do jumps to the frontline trigger attacks?
                            </Tab>
                            <Tab>Honeypot strategy I -  Decoy bases for the Forgotten</Tab>
                            <Tab>Honeypot strategy II - Forgotten level versus numbers</Tab>
                            <Tab>Honeypot strategy III - Attractor plots</Tab>
                            <Tab>A production model for forgotten attacks</Tab>

                            <img
                                alt="serenity"
                                src={generateUrl('images/serenity.png')}
                                style={{ paddingRight: '4px' }}
                            />
                        </TabListVertical>
                        <TabPanels>
                            <TabPanel>
                                <DailyDistribution />
                            </TabPanel>
                            <TabPanel>
                                <MonthlyDistribution />
                            </TabPanel>
                            <TabPanel></TabPanel>
                            <TabPanel></TabPanel>
                            <TabPanel></TabPanel>
                            <TabPanel></TabPanel>
                            <TabPanel></TabPanel>
                        </TabPanels>
                    </TabsVertical>
                </Theme>
            </Column>
        </Grid>
    );
};

export default ForgottenPage;
