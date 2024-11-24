import { vec2 } from 'gl-matrix';

/**
 * Generates a halton sequence, useful e.g. for TAA samples.
 * https://en.wikipedia.org/wiki/Halton_sequence
 * @param base base of the halton sequence
 * @param count number of values to generate
 * @param skip number of values to skip at the start of the sequence
 * @returns the calculated sequence
 */
export function halton1d(base: number, count: number, skip = 0) {
    if (base < 2) {
        const result = new Array<number>(count);
        result.fill(0);
        return result;
    }
    const results = new Array<number>();
    let numerator = 0;
    let denominator = 1;
    for (let i = 0; i < count + skip; i++) {
        const diff = denominator - numerator;
        if (diff === 1) {
            numerator = 1;
            denominator *= base;
        } else {
            let ratio = denominator / base;
            while (diff <= ratio)
                ratio = Math.trunc(ratio / base);
            numerator = (base + 1) * ratio - diff;
        }
        if (i >= skip)
            results.push(numerator / denominator);
    }
    return results;
}

/**
 * Calculates a set of two halton sequences, useful e.g. for TAA samples.
 * https://en.wikipedia.org/wiki/Halton_sequence
 * @param base1 base of the first halton sequence
 * @param base2 base of the second halton sequence
 * @param count number of values to generate
 * @param skip number of values to skip at the start of the sequence
 * @returns merged sequences as array of vec2
 */
export function halton2d(base1: number, base2: number, count: number, skip = 0) {
    const h1 = halton1d(base1, count, skip);
    const h2 = halton1d(base2, count, skip);
    return h1.map((v, i) => vec2.fromValues(v, h2[i]));
}
