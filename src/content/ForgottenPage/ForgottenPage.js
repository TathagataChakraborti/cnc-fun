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
                    <TabsVertical height="">
                        <TabListVertical size="xl" className="bottomless">
                            <Tab>Forgotten activity per time of day</Tab>
                            <Tab>Forgotten activity over a month</Tab>
                            <Tab>Honeypot strategy</Tab>
                            <Tab>Attractor plots by neighborhood roughness</Tab>
                            <Tab>
                                Do jumps to the frontline trigger attacks?
                            </Tab>
                            <Tab>Production model for forgotten attacks</Tab>

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
                        </TabPanels>
                    </TabsVertical>
                </Theme>
            </Column>
        </Grid>
    );
};

export default ForgottenPage;
