import {
    StructuredListWrapper,
    StructuredListHead,
    StructuredListBody,
    StructuredListRow,
    StructuredListCell,
    Tag,
} from '@carbon/react';

import { in_practice_note } from './Disclaimer';

const hypothesis_list = [
    {
        hypothesis:
            'There are times during the day when the Forgotten attack more.',
        who: 'Butchers_Sohn79',
        status: true,
        outcome: false,
    },
    {
        hypothesis: <em>"I will get attacked immediately when I jump."</em>,
        who: 'Butchers_Sohn79',
        status: true,
        outcome: false,
    },
    {
        hypothesis:
            'You can put bases in vulnerable positions to act as decoys.',
        who: '--',
        status: true,
        outcome: true,
    },
    {
        hypothesis: 'A base being attacked can get angry and attack back!',
        who: 'paladinstr8',
        status: false,
        note: (
            <>
                But <span className="text-alert">Mutzu</span> says{' '}
                <em>"Nothing like that!"</em>.
            </>
        ),
    },
    {
        hypothesis:
            'Number of waves and not the absolute number of Forgotten bases in range determine the probability of attack.',
        who: 'paladinstr8',
        status: true,
        outcome: true,
    },
    {
        hypothesis:
            'The absolute number and waves, and not the level, of forgotten bases in range determines the probability of attack.',
        who: 'paladinstr8',
        status: true,
        outcome: false,
    },
    {
        hypothesis: (
            <>
                <em>
                    "I am waiting for two days for my main to get attacked."
                </em>{' '}
                Attack on a base decreases the probability of that base being
                attacked.
            </>
        ),
        who: 'Tob1kanob1',
        status: false,
    },
    {
        hypothesis:
            'We can use Garys to attack ourselves and delay Forgotten attacks.',
        who: 'Butchers_Sohn79',
        status: false,
    },
];

const HypothesisModalContent = _ => {
    return (
        <>
            <StructuredListWrapper>
                <StructuredListHead>
                    <StructuredListRow head>
                        <StructuredListCell head>Hypothesis</StructuredListCell>
                        <StructuredListCell head>Who</StructuredListCell>
                        <StructuredListCell head>Status</StructuredListCell>
                        <StructuredListCell head>
                            Statistically Significant?
                        </StructuredListCell>
                    </StructuredListRow>
                </StructuredListHead>
                <StructuredListBody>
                    {hypothesis_list.map((item, key) => (
                        <StructuredListRow key={key}>
                            <StructuredListCell>
                                {item.hypothesis}
                            </StructuredListCell>
                            <StructuredListCell className="text-alert">
                                {item.who}
                            </StructuredListCell>
                            <StructuredListCell>
                                {item.status ? (
                                    <Tag
                                        size="sm"
                                        type="green"
                                        className="square-tag">
                                        TESTED
                                    </Tag>
                                ) : (
                                    <Tag size="sm" className="square-tag">
                                        UNTESTED
                                    </Tag>
                                )}
                                {item.note && (
                                    <p className="note">{item.note}</p>
                                )}
                            </StructuredListCell>
                            <StructuredListCell>
                                {item.status ? (
                                    item.outcome ? (
                                        <Tag
                                            size="sm"
                                            type="green"
                                            className="square-tag">
                                            YES
                                        </Tag>
                                    ) : (
                                        <Tag
                                            size="sm"
                                            type="magenta"
                                            className="square-tag">
                                            NO
                                        </Tag>
                                    )
                                ) : (
                                    <>--</>
                                )}
                            </StructuredListCell>
                        </StructuredListRow>
                    ))}
                </StructuredListBody>
            </StructuredListWrapper>
            <div className="footnote">{in_practice_note}</div>
        </>
    );
};

export { HypothesisModalContent };
