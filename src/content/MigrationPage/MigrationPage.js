import { Grid, Column, ToastNotification } from '@carbon/react';

const MigrationPage = _ => {
    return (
        <Grid className="top-relief">
            <Column lg={14} md={4} sm={4}>
                <ToastNotification
                    lowContrast
                    hideCloseButton
                    aria-label="closes notification"
                    caption="Coming soon!"
                    kind="info-square"
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
