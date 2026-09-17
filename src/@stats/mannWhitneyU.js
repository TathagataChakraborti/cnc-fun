// AI-generated
export function mannWhitneyU(sample1, sample2) {
    const n1 = sample1.length;
    const n2 = sample2.length;

    // Combine and rank
    const combined = [
        ...sample1.map(v => ({ val: v, group: 1 })),
        ...sample2.map(v => ({ val: v, group: 2 })),
    ].sort((a, b) => a.val - b.val);

    let rank1Sum = 0;
    combined.forEach((item, index) => {
        if (item.group === 1) rank1Sum += index + 1;
    });

    const U1 = rank1Sum - (n1 * (n1 + 1)) / 2;
    const U2 = n1 * n2 - U1;
    const U = Math.min(U1, U2);

    // Normal approximation for p-value (for larger samples)
    const mu = (n1 * n2) / 2;
    const sigma = Math.sqrt((n1 * n2 * (n1 + n2 + 1)) / 12);
    const z = (U - mu) / sigma;

    return { U, z };
}

// AI-generated
// Converts a Z-score to a one-tailed (left-tail) p-value
export function zToPValue(z) {
    if (z >= 0) return 1.0; // If Z >= 0, Group 1 is not shorter

    const absZ = Math.abs(z);
    const t = 1.0 / (1.0 + 0.2316419 * absZ);
    const poly =
        t *
        (0.31938153 +
            t *
                (-0.356563782 +
                    t * (1.781477937 + t * (-1.821255978 + t * 1.330274429))));
    const pOneTailed =
        (1.0 / Math.sqrt(2.0 * Math.PI)) * Math.exp(-0.5 * absZ * absZ) * poly;

    return pOneTailed;
}
