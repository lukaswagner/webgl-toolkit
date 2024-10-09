/**
 * Helper for replacing defines if shader programs with custom values.
 *
 * Example - glsl:
 * ```
 * #define DATA_SIZE 1u
 * vec4 data[DATA_SIZE];
 * ```
 *
 * Example - js:
 * ```
 * replaceDefines(src, [ { key: 'DATA_SIZE', value: 10, suffix: 'u' } ]);
 * ```
 * @param src shader source code to be modified
 * @param values entries to replace
 * @returns modified shader source code
 */
export function replaceDefines(
    src: string,
    values: { key: string, value: { toString(): string }, suffix?: string}[]
) {
    let result = src;
    values.forEach((v) => {
        result = result.replace(
            new RegExp(`(?<=#define ${v.key} ).*`),
            `${v.value}${v.suffix ?? ''}`);
    });
    return result;
}
