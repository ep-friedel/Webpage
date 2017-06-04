// include gulp
var gulp = require('gulp');

// include plug-ins
var autoprefix = require('gulp-autoprefixer'),
    minifyCSS = require('gulp-minify-css');

gulp.task('css', function() {
  gulp.src('./Public/css/*.css')
    .pipe(autoprefix())
    .pipe(minifyCSS())
    .pipe(gulp.dest('./Public/css-min/'));
});

gulp.task('watch', function() {
	gulp.watch('./Public/css/*.css', ['css']);
});