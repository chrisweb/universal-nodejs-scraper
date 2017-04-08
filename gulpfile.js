
'use strict';

const gulp = require('gulp');
const ts = require('gulp-typescript');
const tsProject = ts.createProject('tsconfig.json');
const merge = require('merge2');  // Requires separate installation 

// Check the coding standards and programming errors
gulp.task('lint', ['check-tests', 'format:enforce', 'tools:build'], () => {
  const tslint = require('gulp-tslint');
  // Built-in rules are at
  // https://github.com/palantir/tslint#supported-rules
  return gulp
      .src([
        'source/**/*.ts'
      ])
      .pipe(tslint({
        tslint: require('tslint').default,
        configuration: './tslint.json',
        formatter: 'prose',
      }))
      .pipe(tslint.report({emitError: true}));
});

gulp.task('build', function () {
    var tsResult = tsProject.src()
        .pipe(tsProject());
    
    return merge([ // Merge the two output streams, so this task is finished when the IO of both operations is done. 
        tsResult.dts.pipe(gulp.dest('build/definitions')),
        tsResult.js.pipe(gulp.dest('build'))
    ]);
});

gulp.task('watch', ['build'], function () {
    gulp.watch('source/**/*.ts', ['build']);
});
