/**
 * Fisher's Exact Test (One-Tailed: Right/Upper Tail)
 *
 * Matrix Layout:
 *                     [ Short Interval ]   [ Long Interval ]
 * [ Event B Occurred ]        a                   b
 * [ No Event B       ]        c                   d
 *
 * Tests if cell 'a' is significantly LARGER than expected by chance.
 */

export function fisherExactRightTail(a, b, c, d) {
    const n = a + b + c + d;

    // Log-factorial cache to prevent numerical overflow with large samples
    const logFactCache = [0, 0];
    function logFactorial(k) {
        if (k < 0) return 0;
        while (logFactCache.length <= k) {
            const lastIdx = logFactCache.length - 1;
            logFactCache.push(
                logFactCache[lastIdx] + Math.log(logFactCache.length)
            );
        }
        return logFactCache[k];
    }

    // Hypergeometric probability in log space: P(X = x)
    function logHypergeometricProb(x) {
        const row1 = a + b;
        const row2 = c + d;
        const col1 = a + c;

        const logP =
            logFactorial(row1) +
            logFactorial(row2) +
            logFactorial(col1) +
            logFactorial(n - col1) -
            (logFactorial(x) +
                logFactorial(row1 - x) +
                logFactorial(col1 - x) +
                logFactorial(row2 - col1 + x) +
                logFactorial(n));

        return Math.exp(logP);
    }

    // 1. Calculate Odds Ratio: (a * d) / (b * c)
    const oddsRatio = b * c === 0 ? Infinity : (a * d) / (b * c);

    // 2. Sum hypergeometric probabilities for observed 'a' and all MORE EXTREME values (up to max possible 'a')
    let rightPValue = 0;
    const maxA = Math.min(a + b, a + c);

    for (let x = a; x <= maxA; x++) {
        rightPValue += logHypergeometricProb(x);
    }

    // Bound p-value within [0, 1]
    rightPValue = Math.min(1, Math.max(0, rightPValue));

    return { oddsRatio, rightPValue };
}

// ==========================================
// EXAMPLE WORKFLOW
// ==========================================

// Input data
const eventATimestamps = [10, 45, 60, 115, 130, 185, 200, 250, 262, 310];
const eventBOccurred = [
    false,
    true,
    false,
    false,
    true,
    false,
    false,
    true,
    false,
];

// 1. Calculate intervals
const intervals = [];
for (let i = 0; i < eventATimestamps.length - 1; i++) {
    intervals.push(eventATimestamps[i + 1] - eventATimestamps[i]);
}

// 2. Calculate median threshold
const sorted = [...intervals].sort((x, y) => x - y);
const mid = Math.floor(sorted.length / 2);
const medianDuration =
    sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;

// 3. Construct (a, b, c, d) matching the table structure
let a = 0; // Row 1, Col 1: Event B = Yes, Interval = Short
let b = 0; // Row 1, Col 2: Event B = Yes, Interval = Long
let c = 0; // Row 2, Col 1: Event B = No,  Interval = Short
let d = 0; // Row 2, Col 2: Event B = No,  Interval = Long

for (let i = 0; i < intervals.length; i++) {
    const isShort = intervals[i] < medianDuration;
    const hasB = eventBOccurred[i];

    if (hasB && isShort) a++;
    else if (hasB && !isShort) b++;
    else if (!hasB && isShort) c++;
    else if (!hasB && !isShort) d++;
}
