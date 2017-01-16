var gulp = require('gulp'),
	gutil = require('gulp-util'),
	rename = require('gulp-rename'),
	uglify = require("gulp-uglify");

gulp.task('copy-src',function(){
	
	gulp.src(['src/dom-helper.js'])
		.pipe(uglify().on('error', gutil.log))
		.pipe(rename({suffix:'.min'}))
		.pipe(gulp.dest('dist'));

});

gulp.task('watch',function(){
	
	gulp.watch(['src/*.js'], ['js']);
	
});

gulp.task('js', ['copy-src']);

gulp.task('build', ['js']);

gulp.task('default', ['watch']);
