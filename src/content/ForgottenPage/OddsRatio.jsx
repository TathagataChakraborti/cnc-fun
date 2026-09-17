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
import { fisherExactRightTail } from '../../@stats/fisherUtils';
import { chiSquareTest2x2 } from '../../@stats/chiSquareUtils';

const cell_constructor = (data, i, j) => (
    <StructuredListCell head>
        {data.find(item => item.row === i && item.column === j).value}
    </StructuredListCell>
);

const OddsRatio = props => {
    const [a, b, c, d] = props.data.data.map(item => item.value);
    const { _, rightPValue } = fisherExactRightTail(a, b, c, d);
    const res = chiSquareTest2x2(a, b, c, d);

    return (
        <>
            <StructuredListWrapper isFlush isCondensed>
                <StructuredListHead>
                    <StructuredListRow head>
                        <StructuredListCell>
                            <span className="note note-reference">
                                {props.data.total}
                            </span>{' '}
                            {props.data.title}
                        </StructuredListCell>
                        {cell_constructor(props.data.headers, 0, 1)}
                        {cell_constructor(props.data.headers, 0, 2)}
                    </StructuredListRow>
                </StructuredListHead>
                <StructuredListBody>
                    <StructuredListRow>
                        {cell_constructor(props.data.headers, 1, 0)}
                        <StructuredListCell>
                            {cell_constructor(props.data.data, 1, 1)}
                        </StructuredListCell>
                        <StructuredListCell>
                            {cell_constructor(props.data.data, 1, 2)}
                        </StructuredListCell>
                    </StructuredListRow>
                    <StructuredListRow>
                        {cell_constructor(props.data.headers, 2, 0)}
                        <StructuredListCell>
                            {cell_constructor(props.data.data, 2, 1)}
                        </StructuredListCell>
                        <StructuredListCell>
                            {cell_constructor(props.data.data, 2, 2)}
                        </StructuredListCell>
                    </StructuredListRow>
                </StructuredListBody>
            </StructuredListWrapper>
            {(props.data.notes || []).map((item, index) => (
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
                    type={rightPValue < 0.05 ? 'magenta' : 'green'}>
                    {rightPValue.toFixed(2)}
                </Tag>
                <Button
                    kind="secondary"
                    size="xs"
                    iconDescription="Fisher's Exact Test Result"
                    hasIconOnly
                    renderIcon={InformationSquareFilled}
                    href="https://en.wikipedia.org/wiki/Fisher%27s_exact_test"
                    target="_blank"
                />
            </div>
            <br />

            <div style={{ display: 'flex' }}>
                <Tag className="square-tag p-value-tag">Chi-Squared Test</Tag>
                <Tag
                    className="square-tag"
                    type={res.rightPValue < 0.05 ? 'magenta' : 'green'}>
                    {res.rightPValue.toFixed(2)}
                </Tag>
                <Button
                    kind="secondary"
                    size="xs"
                    iconDescription="Chi-Squared Test Result"
                    hasIconOnly
                    renderIcon={InformationSquareFilled}
                    href="https://en.wikipedia.org/wiki/Chi-squared_test"
                    target="_blank"
                />
            </div>
        </>
    );
};

export { OddsRatio };
