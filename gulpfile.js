'use strict'

const gulp = require('gulp'),
			htmlhint = require("gulp-htmlhint"),
			scss = require('gulp-sass'),
			sourcemaps = require('gulp-sourcemaps'),
			postcss = require('gulp-postcss'),
			autoprefixer = require('autoprefixer'),
			cssnext = require('cssnext'),
			stylelint = require('gulp-stylelint'),
			csslint = require('gulp-csslint'),
			uncss = require('gulp-uncss'),
			csscomb = require('gulp-csscomb'),
			csso = require('gulp-csso'),
			eslint = require('gulp-eslint'),
			uglify = require('gulp-uglify'),
			pump = require('pump'),
			imagemin = require('gulp-imagemin'),
			pngquant = require('imagemin-pngquant'),
			rigger = require('gulp-rigger'),
			watch = require('gulp-watch'),
			rimraf = require('rimraf'),
			browserSync = require('browser-sync').create();

var path = {
	build: {
		html: 'build/',
		js: 'build/js/',
		css: 'build/css/',
		img: 'build/images/',
		fonts: 'build/fonts/'
	},
	src: {
		html: 'src/**/*.html',
		js: 'src/js/**/*.js',
		style: 'src/scss/styles.scss',
		img: 'src/images/**/*.*',
		fonts: 'src/fonts/**/*.*'
	},
	watch: {
		html: 'src/**/*.html',
		js: 'src/js/**/*.js',
		style: 'src/scss/**/*.scss',
		img: 'src/images/**/*.*',
		fonts: 'src/fonts/**/*.*'
	},
	clean: './build'
};

var config = {
	server: {
		baseDir: './build'
	},
	// tunnel: true,
	host: 'localhost',
	port: 9000,
	logPrefix: 'Alex',
	notify: false
};

gulp.task('webserver', function () {
	browserSync.init(config);

	browserSync.watch('build/**/*.*').on('change', browserSync.reload);
});

gulp.task('clean', function (cb) {
	rimraf(path.clean, cb);
});

gulp.task('html:build', function () {
	return gulp.src(path.src.html)
		.pipe(rigger())
		.pipe(htmlhint())
		.pipe(gulp.dest(path.build.html));
});

gulp.task('style:build', function () {
	var postCssProcessors = [
		autoprefixer,
		cssnext
	];

	return	gulp.src(path.src.style)
		.pipe(sourcemaps.init())
		.pipe(scss().on('error', scss.logError))
		// .pipe(stylelint({
		// 	failAfterError: false,
		// 	reporters: [
    //     {formatter: 'string', console: true}
    //   ]
    // }))
		// .pipe(csslint())
		// .pipe(csslint.formatter())
		.pipe(postcss(postCssProcessors))
		// .pipe(unCSS({
			// html: [path.src.html]
		// }))
		.pipe(csscomb())
		// .pipe(csso())
		.pipe(sourcemaps.write())
		.pipe(gulp.dest(path.build.css));
});

gulp.task('js:build', function (cb) {
	pump([
		gulp.src(path.src.js),
		rigger(),
		sourcemaps.init(),
		// eslint({
	  //   'rules':{
	  //       'quotes': [1, 'single'],
	  //   }
	  // }),
		// eslint.format(),
		// eslint.failAfterError(),
		// uglify(),
		sourcemaps.write(),
		gulp.dest(path.build.js)
		],
		cb
	);
});

gulp.task('image:build', function () {
	return gulp.src(path.src.img)
		.pipe(imagemin({
			progressive: true,
			svgoPlugins: [{removeViewBox: false}],
			use: [pngquant()],
			interlaced: true
		}))
		.pipe(gulp.dest(path.build.img));
});

gulp.task('fonts:build', function() {
	return gulp.src(path.src.fonts)
		.pipe(gulp.dest(path.build.fonts))
});

gulp.task('build', gulp.series(
	'clean',
	gulp.parallel(
		'html:build',
		'style:build',
		'js:build',
		'image:build')
));

gulp.task('watch', function() {
	gulp.watch(path.watch.html, gulp.series('html:build'));
	gulp.watch(path.watch.style, gulp.series('style:build'));
	gulp.watch(path.watch.js, gulp.series('js:build'));
	gulp.watch(path.watch.img, gulp.series('image:build'));
});

gulp.task('default', gulp.series('build', gulp.parallel('watch', 'webserver')));
