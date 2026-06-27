import {
    Header,
    HeaderMenuButton,
    HeaderName,
    HeaderContainer,
    HeaderNavigation,
    HeaderMenuItem,
    SkipToContent,
    SideNav,
    SideNavItems,
    SideNavLink,
} from '@carbon/react';

const route_map = [
    {
        to: '',
        map: 'Forgotten',
    },
    {
        to: 'migration',
        map: 'Migration',
    },
];

const PageHeader = _ => (
    <HeaderContainer
        render={({ isSideNavExpanded, onClickSideNavExpand }) => (
            <>
                <Header>
                    <SkipToContent />
                    <HeaderMenuButton
                        onClick={onClickSideNavExpand}
                        isActive={isSideNavExpanded}
                        aria-label="Header Area"
                    />

                    <HeaderName prefix="Command & Conquer: Tiberian Alliances">
                        Tiberian 72
                    </HeaderName>

                    <HeaderNavigation aria-label="Navigation">
                        {route_map.map((item, id) => (
                            <HeaderMenuItem key={id} href={'/' + item.to}>
                                {item.map}
                            </HeaderMenuItem>
                        ))}
                    </HeaderNavigation>

                    {isSideNavExpanded && (
                        <SideNav
                            aria-label="Navigation"
                            expanded={isSideNavExpanded}>
                            <SideNavItems>
                                {route_map.map((item, id) => (
                                    <SideNavLink
                                        key={id}
                                        href={'/' + item.to}
                                        large={true}>
                                        {item.map}
                                    </SideNavLink>
                                ))}
                            </SideNavItems>
                        </SideNav>
                    )}
                </Header>
            </>
        )}
    />
);

export { PageHeader };
