import typescript from '@rollup/plugin-typescript'
//import pkg from '../package.json'

export default {
    input: 'src/index.ts',
    external: ['cheerio', 'json2csv', 'chrisweb-utilities', 'fs', 'https', 'path'],
    output: [
        {
            dir: 'dist',
            format: 'esm',
            sourcemap: true,
        }
    ],
    plugins: [
        typescript()
    ],
}
