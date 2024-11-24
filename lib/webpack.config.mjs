'use strict';

import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * @returns {import("webpack").Configuration}
 */
export default function () {
    const baseDir = dirname(fileURLToPath(import.meta.url));
    const buildDir = resolve(baseDir, 'build');

    return {
        entry: {
            index: './src/index.ts',
        },
        output: {
            clean: true,
            path: buildDir,
            filename: 'webgl-toolkit.js',
            library: {
                name: 'webgl-toolkit',
                type: 'umd',
            },
        },
        resolve: {
            extensions: ['.ts', '...'],
        },
        module: {
            rules: [
                {
                    test: /\.ts$/,
                    use: { loader: 'ts-loader' },
                },
                {
                    test: /\.(glsl|vert|frag)$/,
                    use: {
                        loader: 'webpack-glsl-loader',
                    },
                },
            ],
        },
        externals: {
            'gl-matrix': 'gl-matrix',
        },
    };
}
