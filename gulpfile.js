
'use strict';

const gulp = require('gulp');
const ts = require('gulp-typescript');
const merge = require('merge2');  // Requires separate installation 
const tsProject = ts.createProject('./tsconfig.json');

// check the coding standards and programming errors
gulp.task('lint', gulp.series(() => {
  const tslint = require('gulp-tslint');
  // Built-in rules are at
  // https://github.com/palantir/tslint#supported-rules
  return gulp
      .src([
        'src/**/*.ts'
      ])
      .pipe(tslint({
        tslint: require('tslint').default,
        configuration: './tslint.json',
        formatter: 'prose',
      }))
      .pipe(tslint.report({emitError: true}));
}));

gulp.task('build', gulp.series(() => {
    var tsResult = tsProject.src()
        .pipe(tsProject());
    
    return merge([ // merge the two output streams, so this task is finished when the IO of both operations is done. 
        tsResult.dts.pipe(gulp.dest('dist/@types')),
        tsResult.js.pipe(gulp.dest('dist'))
    ]);
}));

gulp.task('watch', gulp.series('build', () => {
    gulp.watch('src/**/*.ts', ['build']);
}));

gulp.task('default', gulp.series(['lint', 'build'], (cb) => {
  cb();
}));
