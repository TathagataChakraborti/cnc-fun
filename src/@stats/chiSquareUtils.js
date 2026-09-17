/**
 * AI-generated
 * Chi-Square Test of Independence for a 2x2 Contingency Table (with Yates' Correction)
 *
 * Matrix Layout:
 *                     [ Short Interval ]   [ Long Interval ]
 * [ Event B Occurred ]        a                   b
 * [ No Event B       ]        c                   d
 */
export function chiSquareTest2x2(a, b, c, d) {
    const n = a + b + c + d;

    // 1. Calculate Expected Counts under the Null Hypothesis
    const row1 = a + b;
    const row2 = c + d;
    const col1 = a + c;
    const col2 = b + d;

    const expectedA = (row1 * col1) / n;
    const expectedB = (row1 * col2) / n;
    const expectedC = (row2 * col1) / n;
    const expectedD = (row2 * col2) / n;

    // 2. Minimum Expected Count Check
    const minExpected = Math.min(expectedA, expectedB, expectedC, expectedD);
    if (minExpected < 5) {
        console.warn(
            `Warning: Minimum expected cell count is ${minExpected.toFixed(
                2
            )} (< 5). ` +
                `Fisher's Exact Test is recommended for small sample sizes.`
        );
    }

    // 3. Chi-Square Statistic with Yates' Continuity Correction:
    // Formula: N * (|a*d - b*c| - N/2)^2 / [(a+b)(c+d)(a+c)(b+d)]
    const numerator = n * Math.pow(Math.abs(a * d - b * c) - n / 2, 2);
    const denominator = row1 * row2 * col1 * col2;
    const chi2Stat = denominator === 0 ? 0 : numerator / denominator;

    // 4. Two-Tailed p-value calculation for df = 1 (using error function approximation)
    const twoTailedPValue = chi2ToPValueDF1(chi2Stat);

    // 5. Convert to One-Tailed (Right-Tailed) p-value for your hypothesis:
    // We check if cell 'a' is greater than its expected count
    let rightPValue;
    if (a > expectedA) {
        rightPValue = twoTailedPValue / 2;
    } else {
        rightPValue = 1 - twoTailedPValue / 2;
    }

    return { chi2Stat, minExpected, twoTailedPValue, rightPValue };
}

// AI-generated
// Helper: Approximate Chi-Square p-value for df = 1
export function chi2ToPValueDF1(chi2) {
    if (chi2 <= 0) return 1.0;
    const z = Math.sqrt(chi2);

    // Complementary Error Function (erfc) approximation
    const t = 1.0 / (1.0 + 0.2316419 * z);
    const poly =
        t *
        (0.31938153 +
            t *
                (-0.356563782 +
                    t * (1.781477937 + t * (-1.821255978 + t * 1.330274429))));
    const twoTailedP =
        (2.0 / Math.sqrt(2.0 * Math.PI)) * Math.exp(-0.5 * chi2) * poly;

    return Math.min(1.0, Math.max(0.0, twoTailedP));
}
