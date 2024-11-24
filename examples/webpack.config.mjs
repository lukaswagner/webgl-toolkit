'use strict';

import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import PugPlugin from 'pug-plugin';
import { readdirSync } from 'node:fs';

/**
 * @returns {import("webpack").Configuration}
 */
export default function () {
    const baseDir = dirname(fileURLToPath(import.meta.url));
    const buildDir = resolve(baseDir, 'build');
    const srcDir = resolve(baseDir, 'src');

    const examples = readdirSync(srcDir, { withFileTypes: true })
        .filter((v) => v.isDirectory())
        .map((v) => v.name);
    const entry = {
        index: './src/index.pug',
    };
    examples.forEach((e) => entry[e] = `./src/${e}/index.pug`);

    return {
        entry,
        output: {
            clean: true,
            path: buildDir,
        },
        plugins: [
            new PugPlugin(),
        ],
        resolve: {
            extensions: ['.ts', '...'],
        },
        module: {
            rules: [
                {
                    test: /\.pug$/,
                    use: { loader: PugPlugin.loader },
                },
                {
                    test: /\.css$/,
                    use: [
                        { loader: 'css-loader' },
                        { loader: 'css-import-loader' },
                    ],
                },
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
                {
                    test: /\.obj$/,
                    type: 'asset/source',
                },
            ],
        },
        devServer: { hot: false },
        devtool: 'source-map',
    };
}
