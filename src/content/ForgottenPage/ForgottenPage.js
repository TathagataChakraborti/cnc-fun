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
                            <Tab>
                                Do jumps to the frontline trigger attacks?
                            </Tab>
                            <Tab>Attractor plots by neighborhood roughness</Tab>
                            <Tab>Production model for forgotten attacks</Tab>
                        </TabListVertical>
                        <TabPanels>
                            <TabPanel></TabPanel>
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
