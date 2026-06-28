import { Grid, Column, ToastNotification } from '@carbon/react';

const MigrationPage = _ => {
    return (
        <Grid
            className="top-relief"
            style={{
                backgroundImage: `url('/images/serenity.png')`,
                backgroundPosition: 'center',
                backgroundSize: 'cover',
                backgroundRepeat: 'no-repeat',
                width: '100vw',
                height: '100vh',
            }}>
            <Column lg={14} md={4} sm={4}>
                <ToastNotification
                    lowContrast
                    hideCloseButton
                    aria-label="closes notification"
                    caption="Coming soon! When we reach the center &#128513;"
                    kind="error"
                    role="status"
                    statusIconDescription="notification"
                    subtitle="This page visualizes Serenity's migration to the center on Tiberian 72."
                    title="Serenity Migration"
                />
            </Column>
        </Grid>
    );
};

export default MigrationPage;
