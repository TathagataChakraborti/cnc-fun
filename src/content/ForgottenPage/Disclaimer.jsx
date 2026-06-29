import { ContainedList, ContainedListItem } from '@carbon/react';

const in_practice_note = (
    <>
        The results indicate observations on the game in practice and NOT on the
        actual design of the game. For example, there might be machinations put
        in place by a developer to model a certain behavior of the Forgotten
        that actually exists in implementation but does not impact gameplay at
        statistically significant levels.
    </>
);

const ModalContentDisclaimer = _ => {
    return (
        <ContainedList kind="on-page" label="Disclaimer" size="lg">
            <ContainedListItem>
                This website is provided 'as is' without any representations or
                warranties, express or implied, including but not limited to the
                implied warranties of merchantability, fitness for a particular
                purpose, or non-infringement.
            </ContainedListItem>
            <ContainedListItem>{in_practice_note}</ContainedListItem>
            <ContainedListItem>
                About half-a-dozen reports are logged with a dead base, or a
                regenerated base under protection, as if it was in a 0-base
                region. This is quite small in number relative to the rest of
                the data being logged. Statistically insignificant.
            </ContainedListItem>
            <ContainedListItem>
                Some reports suffer from off-by-one, or in worst cases
                off-by-some, errors in determining number and level of Forgotten
                bases in range. This can occur, for example, when Forgotten
                bases regenerated while being offline or the timing of a
                Forgotten base in range being killed could not be determined
                because the killer got killed. This is small in number relative
                to the rest of the data being logged. Again, statistically
                insignificant.
            </ContainedListItem>
        </ContainedList>
    );
};

export { ModalContentDisclaimer, in_practice_note };
