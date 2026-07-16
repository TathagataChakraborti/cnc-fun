import './app.scss';

import { Component } from 'react';
import { Route, Switch, useLocation } from 'react-router-dom';
import { Grid, Column, Content, Tile } from '@carbon/react';
import { PageHeader } from './components/PageHeader';
import {
    BuyMeACoffeeWidget,
    BuyMeACoffeeButton,
} from './components/BasicElements';

import ForgottenPage from './content/ForgottenPage';
import MigrationPage from './content/MigrationPage';
import GitHubButton from 'react-github-btn';

function withRouter(Component) {
    return function WrappedComponent(props) {
        const location = useLocation();
        return <Component {...props} router={{ location }} />;
    };
}

class App extends Component {
    render() {
        const activeRoute = this.props.router.location.pathname;

        return (
            <Content>
                <PageHeader />
                <BuyMeACoffeeWidget />
                <Grid className="main">
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
                        <Tile
                            className={
                                activeRoute === '/migration' ? 'dim-tile' : ''
                            }>
                            I build stuff that sparks joy! I am trying to start
                            a new life as a freelance developer.
                            <br />
                            <br />
                            If this app has sparked joy in you, and you would
                            like to support my journey, consider buying me a
                            coffee!
                            <br />
                            <br />
                            <BuyMeACoffeeButton />
                        </Tile>

                        <br />
                        <br />

                        <Tile
                            className={
                                activeRoute === '/migration' ? 'dim-tile' : ''
                            }>
                            This little project is open source! Contribute your
                            feedback, comments, critiques, and even code.
                            &#129303;
                            <br />
                            <br />
                            The data collection for this work has been largely
                            manual: needs to become a script. Looking for some
                            cool ideas for the next server as well.
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

export default withRouter(App);
