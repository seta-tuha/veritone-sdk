import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import babel from 'rollup-plugin-babel';
import json from 'rollup-plugin-json';
import replace from 'rollup-plugin-replace';
import url from 'rollup-plugin-url';
import analyze from 'rollup-analyzer-plugin';
import postcss from 'rollup-plugin-postcss';
import { snakeCase } from 'lodash';

import * as mui from '@material-ui/core';
import * as muiIcons from '@material-ui/icons';
import * as datefns from 'date-fns';
import * as lodash from 'lodash';
import sass from './rollup-postcss-sass-loader';

export default {
  input: 'src/index.js',
  external: [
    'classnames',
    ...Object.keys(datefns).map(name => `date-fns/${snakeCase(name)}`),
    ...Object.keys(lodash).map(name => `lodash/${name}`),
    ...Object.keys(lodash).map(name => `lodash/fp/${name}`),
    ...Object.keys(muiIcons).map(name => `@material-ui/icons/${name}`),
    ...Object.keys(mui).map(name => `@material-ui/core/${name}`),
    ...Object.keys(mui.colors).map(name => `@material-ui/core/colors/${name}`),
    '@material-ui/core/styles',
    'mime-types',
    'pluralize',
    'prop-types',
    'react',
    'react-dnd',
    'react-dnd-html5-backend',
    'react-dom',
    'react-infinite-calendar',
    'react-redux',
    'recompose',
    'redux',
    'redux-form',
    'react-dotdotdot',
    'video-react',
    'shaka-player'
  ],
  plugins: [
    replace({
      'process.env.NODE_ENV': JSON.stringify('production')
    }),

    babel({
      include: ['src/**/*.js']
    }),

    resolve({
      module: true,
      jsnext: true,
      main: true,
      browser: true,
      preferBuiltins: false,
      customResolveOptions: {
        moduleDirectory: ['../../node_modules', 'node_modules']
      }
      // modulesOnly: true
    }),
    commonjs({
      include: ['../../node_modules/**', 'node_modules/**', '../**']
    }),

    postcss({
      modules: true,
      loaders: [sass]
    }),

    json(),

    url(),

    // uglify({
    //   compress: { passes: 4, toplevel: true },
    // }),

    analyze({
      limit: 5,
      stdout: true
    })
  ]
};
