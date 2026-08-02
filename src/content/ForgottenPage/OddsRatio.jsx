import {
    StructuredListWrapper,
    StructuredListHead,
    StructuredListBody,
    StructuredListRow,
    StructuredListCell,
    Tag,
    Button,
} from '@carbon/react';
import { InformationSquareFilled } from '@carbon/icons-react';

const cell_constructor = (headers, index) => (
    <StructuredListCell head>{headers[index].header}</StructuredListCell>
);

const OddsRatio = props => {
    return (
        <>
            <StructuredListWrapper isFlush isCondensed>
                <StructuredListHead>
                    <StructuredListRow head>
                        <StructuredListCell>
                            <span className="note note-reference">
                                {props.props.data.length}
                            </span>{' '}
                            {props.props.type} Attacks
                        </StructuredListCell>
                        {cell_constructor(props.props.headers, 0)}
                        {cell_constructor(props.props.headers, 1)}
                    </StructuredListRow>
                </StructuredListHead>
                <StructuredListBody>
                    <StructuredListRow>
                        {cell_constructor(props.props.headers, 2)}
                        <StructuredListCell></StructuredListCell>
                        <StructuredListCell></StructuredListCell>
                    </StructuredListRow>
                    <StructuredListRow>
                        {cell_constructor(props.props.headers, 3)}
                        <StructuredListCell></StructuredListCell>
                        <StructuredListCell></StructuredListCell>
                    </StructuredListRow>
                </StructuredListBody>
            </StructuredListWrapper>
            {props.props.notes.map((item, index) => (
                <div key={index} className="note">
                    <span className="note-reference">*</span>
                    {item}
                </div>
            ))}
            <br />

            <div style={{ display: 'flex' }}>
                <Tag className="square-tag p-value-tag">
                    Fisher's Exact Test
                </Tag>
                <Tag
                    className="square-tag"
                    type={0.05 < 0.05 ? 'magenta' : 'green'}>
                    0.05
                </Tag>
                <Button
                    kind="secondary"
                    size="xs"
                    iconDescription="K-S Test Result"
                    hasIconOnly
                    renderIcon={InformationSquareFilled}
                />
            </div>
            <br />

            <div style={{ display: 'flex' }}>
                <Tag className="square-tag p-value-tag">Chi-Square Test</Tag>
                <Tag
                    className="square-tag"
                    type={0.05 < 0.05 ? 'magenta' : 'green'}>
                    0.05
                </Tag>
                <Button
                    kind="secondary"
                    size="xs"
                    iconDescription="K-S Test Result"
                    hasIconOnly
                    renderIcon={InformationSquareFilled}
                />
            </div>
        </>
    );
};

export { OddsRatio };
