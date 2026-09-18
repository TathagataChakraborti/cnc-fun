// AI-generated
/**
 * Calculates the Empirical Cumulative Distribution Function (ECDF)
 * for a sample set across a discrete domain.
 */
export function calculateECDF(samples, domain) {
    const n = samples.length;
    return domain.map(x => {
        const count = samples.filter(val => val <= x).length;
        return count / n;
    });
}

/**
 * Calculates the Cumulative Sum of an array to convert PMF to CDF.
 */
export function pmfToCDF(pmf) {
    let sum = 0;
    return pmf.map(p => {
        sum += p;
        return sum;
    });
}

/**
 * Runs a windowed Kolmogorov-Smirnov test across a non-stationary sequence.
 *
 * @param {Array<number>} samples - Array of observed discrete samples
 * @param {Function} cdfA - Function(t, domain) returning CDF array for Model A at step t
 * @param {Function} cdfB - Function(t, domain) returning CDF array for Model B at step t
 * @param {Array<number>} domain - Sorted list of discrete outcome values (e.g., [0, 1, 2])
 * @param {number} windowSize - Size of the rolling sample window
 */
export function windowedKSTest(data, cdfA, cdfB, domain, windowSize = 20) {
    const results = [];
    const samples = data.map(item => item.defending_base);

    for (let t = windowSize; t < samples.length; t++) {
        // Extract recent sample window
        const windowSamples = samples.slice(t - windowSize, t);

        // Compute empirical CDF from window
        const empCDF = calculateECDF(windowSamples, domain);

        // Evaluate theoretical CDFs at current step t
        const theoCDFA = cdfA(data[t], domain);
        const theoCDFB = cdfB(data[t], domain);

        // Compute K-S Statistic D: max absolute difference |ECDF - Theoretical CDF|
        const statA = Math.max(
            ...domain.map((_, i) => Math.abs(empCDF[i] - theoCDFA[i]))
        );
        const statB = Math.max(
            ...domain.map((_, i) => Math.abs(empCDF[i] - theoCDFB[i]))
        );

        results.push({
            step: t,
            distanceA: statA,
            distanceB: statB,
            closerModel: statA < statB ? 'Distribution A' : 'Distribution B',
        });
    }

    return results;
}

/**
 * Computes Empirical CDF over a dynamic, sorted domain array.
 */
export function calculateDynamicECDF(windowSamples, dynamicDomain) {
    const n = windowSamples.length;
    return dynamicDomain.map(x => {
        const count = windowSamples.filter(val => val <= x).length;
        return count / n;
    });
}

/**
 * Windowed K-S Test supporting an expanding outcome domain over time.
 *
 * @param {Array<number>} samples - Sequence of observed discrete samples
 * @param {Function} getCDFA - Function(t, domainArray) returning theoretical CDF array for Model A
 * @param {Function} getCDFB - Function(t, domainArray) returning theoretical CDF array for Model B
 * @param {number} windowSize - Size of rolling evaluation window
 */
export function windowedExpandingKSTest(
    data,
    getCDFA,
    getCDFB,
    windowSize = 20
) {
    const results = [];
    const knownDomainSet = new Set();
    const samples = data.map(item => item.defending_base);

    for (let t = 0; t < samples.length; t++) {
        // 1. Dynamically expand known domain set as new items arrive
        knownDomainSet.add(samples[t]);

        // Only start testing once we reach the minimum window size
        if (t < windowSize - 1) continue;

        // 2. Extract current sample window
        const windowSamples = samples.slice(t - windowSize + 1, t + 1);

        // 3. Construct a sorted, unique dynamic domain array for step t
        const currentDomain = Array.from(knownDomainSet).sort((a, b) => a - b);

        // 4. Calculate Empirical CDF across the current expanded domain
        const empCDF = calculateDynamicECDF(windowSamples, currentDomain);

        // 5. Evaluate theoretical CDFs against the exact same dynamic domain array
        const theoCDFA = getCDFA(data[t], currentDomain);
        const theoCDFB = getCDFB(data[t], currentDomain);

        // 6. Compute K-S Distance D = max|Empirical - Theoretical|
        const statA = Math.max(
            ...currentDomain.map((_, i) => Math.abs(empCDF[i] - theoCDFA[i]))
        );
        const statB = Math.max(
            ...currentDomain.map((_, i) => Math.abs(empCDF[i] - theoCDFB[i]))
        );

        results.push({
            step: t + 1,
            datetime: data[t].datetime,
            domainSize: currentDomain.length,
            distanceA: statA,
            distanceB: statB,
            closerModel: statA < statB ? 'Distribution A' : 'Distribution B',
        });
    }

    return results;
}
