import { Component } from 'react';
import './app.scss';

import { Content, Tile } from '@carbon/react';
import { Route, Switch } from 'react-router-dom';

import { PageHeader } from './components/PageHeader';
import ForgottenPage from './content/ForgottenPage';
import MigrationPage from './content/MigrationPage';

import { Grid, Column } from '@carbon/react';
import {
    BuyMeACoffeeWidget,
    BuyMeACoffeeButton,
} from './components/BasicElements';

import GitHubButton from 'react-github-btn';

class App extends Component {
    render() {
        return (
            <Content>
                <PageHeader />
                <BuyMeACoffeeWidget />
                <Grid>
                    <Column lg={14} md={8} sm={4}>
                        <Switch>
                            <Route exact path="/" component={ForgottenPage} />
                            <Route
                                exact
                                path="/migration"
                                component={MigrationPage}
                            />
                        </Switch>
                    </Column>
                    <Column lg={2} md={4} sm={4}>
                        <br />
                        <br />

                        <Tile>
                            I build stuff that sparks joy. I am currently trying
                            to start a new life as a freelance developer.
                            <br />
                            <br />
                            If this app has sparked joy in you in any way, and
                            you would like to support my journey, consider
                            buying me a coffee!
                            <br />
                            <br />
                            <BuyMeACoffeeButton />
                        </Tile>

                        <br />
                        <br />

                        <Tile>
                            This little project is open source! Consider
                            contributing your feedback, comments, critiques, and
                            even code. &#129303;
                            <br />
                            <br />
                            The data collection for this work has been largely
                            manual: needs to become a script. Looking for some
                            fresh cool ideas for the next server as well.
                            <br />
                            <br />
                            <GitHubButton
                                href="https://github.com/TathagataChakraborti/cnc-fun"
                                data-size="large"
                                data-show-count="true"
                                aria-label="Stars on GitHub">
                                Star
                            </GitHubButton>
                        </Tile>
                    </Column>
                </Grid>
            </Content>
        );
    }
}

export default App;
