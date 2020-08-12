import typescript from '@rollup/plugin-typescript';
//import pkg from '../package.json';

export default {
  input: 'src/index.ts',
  external: [ 'cheerio', 'json2csv', 'chrisweb-utilities', 'fs', 'https', 'path' ],
  output: [
    {
      //file: pkg.module,
      dir: 'dist',
      //format: 'esm', // use when less problems external modules that are not esm but cjs only
      format: 'cjs',
      sourcemap: true,
    },
  ],
  plugins: [
    typescript(),
  ],
}