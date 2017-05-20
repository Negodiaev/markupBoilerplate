'use strict'

const gulp = require('gulp');
const htmlhint = require('gulp-htmlhint');
const scss = require('gulp-sass');
const sourcemaps = require('gulp-sourcemaps');
const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const cssnext = require('cssnext');
const stylelint = require('gulp-stylelint');
const csslint = require('gulp-csslint');
const uncss = require('gulp-uncss');
const csscomb = require('gulp-csscomb');
const csso = require('gulp-csso');
const eslint = require('gulp-eslint');
const uglify = require('gulp-uglify');
const pump = require('pump');
const imagemin = require('gulp-imagemin');
const imageminJpegtran = require('imagemin-jpegtran');
const imageminOptipng = require('imagemin-optipng');
const rigger = require('gulp-rigger');
const watch = require('gulp-watch');
const rimraf = require('rimraf');
const browserSync = require('browser-sync').create();

var path = {
	build: {
		html: 'build/',
		js: 'build/js/',
		css: 'build/css/',
		img: 'build/images/',
		otherImages: 'build/',
		fonts: 'build/fonts/'
	},
	src: {
		html: 'src/**/*.html',
		js: 'src/js/**/*.js',
		style: 'src/scss/styles.scss',
		img: 'src/images/**/*.*',
		otherImages: 'src/*.+(png|jpg|jpeg|svg|gif|ico)',
		fonts: 'src/fonts/**/*.*'
	},
	watch: {
		html: 'src/**/*.html',
		js: 'src/js/**/*.js',
		style: 'src/scss/**/*.scss',
		img: 'src/images/**/*.*',
		otherImages: 'src/*.+(png|jpg|jpeg|svg|gif|ico)',
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
		// .pipe(uncss({
		// 	html: [path.src.html]
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
		.pipe(imagemin([
			imagemin.jpegtran({progressive: true}),
			imagemin.optipng({optimizationLevel: 6}),
			imagemin.svgo({plugins: [{removeViewBox: true}]})
		], {
			verbose: true
		}
	))
		.pipe(gulp.dest(path.build.img));
});

gulp.task('otherImages:build', function () {
	return gulp.src(path.src.otherImages)
		.pipe(imagemin([
			imagemin.jpegtran({progressive: true}),
			imagemin.optipng({optimizationLevel: 6}),
			imagemin.svgo({plugins: [{removeViewBox: true}]})
		], {
			verbose: true
		}
	))
		.pipe(gulp.dest(path.build.otherImages));
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
		'fonts:build',
		'image:build',
		'otherImages:build')
));

gulp.task('watch', function() {
	gulp.watch(path.watch.html, gulp.series('html:build'));
	gulp.watch(path.watch.style, gulp.series('style:build'));
	gulp.watch(path.watch.js, gulp.series('js:build'));
	gulp.watch(path.watch.fonts, gulp.series('fonts:build'));
	gulp.watch(path.watch.img, gulp.series('image:build'));
	gulp.watch(path.watch.otherImages, gulp.series('otherImages:build'));
});

gulp.task('default', gulp.series('build', gulp.parallel('watch', 'webserver')));
