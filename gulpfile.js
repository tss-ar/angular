'use strict';

var autoprefixer = require('gulp-autoprefixer');
var del = require('del');
var gulp = require('gulp');
var path = require('path');
var sass = require('gulp-sass');
var runSequence = require('run-sequence');
var sourcemaps = require('gulp-sourcemaps');
var ngTemplates = require('gulp-ng-templates');
var htmlmin = require('gulp-htmlmin');
var watch = require('gulp-watch');
var batch = require('gulp-batch');
var ts = require('gulp-typescript');
var merge = require('merge2');
var dts = require('dts-bundle');
var ngAnnotate = require('gulp-ng-annotate');
var config = require('./gulp.conf');

var packageName = 'tss-angular';

var tsProjectSrc = ts.createProject('./src/tsconfig.json');

function sequenceComplete(done) {
    return function (err) {
        if (err) {
            var error = new Error('build sequence failed');
            error.showStack = false;
            done(error);
        } else {
            done();
        }
    };
}

gulp.task('clean', [
    'clean.css',
    'clean.js'
]);

gulp.task('clean.css', () => {
    del(path.join(config.dest.app.css, '**/*.css'));
});

gulp.task('clean.js', () => {
    del(path.join(config.dest.app.js, '**/*.{js,js.map,d.ts}'));
});

gulp.task('build', (done) => {
    runSequence(
        'build.css',
        'build.html',
        'build.js',
        'build.jsDts',
        sequenceComplete(done));
});

gulp.task('rebuild', (done) => {
    runSequence('clean', 'build', sequenceComplete(done));
});

gulp.task('build.css', () => {
    return gulp.src(config.src.app.css)
        .pipe(sourcemaps.init())
        .pipe(sass().on('error', sass.logError))
        .pipe(autoprefixer())
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(config.dest.app.css));
});

gulp.task('build.html', function() {
    return gulp.src(config.src.app.html)
        .pipe(htmlmin({ collapseWhitespace: true }))
        .pipe(ngTemplates({
            filename: 'templates.js',
            module: 'app.templates',
            path: function(path, base) {
                return path.replace(base, '/app/');
            }
        }))
        .pipe(gulp.dest(config.dest.app.html));
});

gulp.task('build.js', function () {
    var tsResult = gulp.src([config.src.app.js, config.src.app.jsTds])
        .pipe(sourcemaps.init())
        .pipe(ts(tsProjectSrc, {
            typescript: require('typescript')
        }));

    let jsStream = tsResult.js
        .pipe(ngAnnotate({ single_quotes: true }))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(config.dest.app.js));

    return merge([
        tsResult.dts.pipe(gulp.dest(config.dest.app.jsTds)),
        jsStream
    ]);
});

gulp.task('build.jsDts', function () {
    dts.bundle({
        name: packageName,
        main: path.join(config.dest.app.jsTds, 'index.d.ts'),
        out: path.join(__dirname, config.dest.app.js, 'index.d.ts')
    });
});

gulp.task('watch.css', () => {
    watch(config.src.app.css, batch(function(events, done) {
        gulp.start('build.css', done);
    }));
});

gulp.task('watch.html', () => {
    watch(config.src.app.html, batch(function(events, done) {
        gulp.start('build.html', done);
    }));
});

gulp.task('watch.js', () => {
    watch([config.src.app.js], {
        readDelay: 2000
    }, batch(function (events, done) {
        gulp.start('build.js', done);
    }));
});

gulp.task('watch', (done) => {
    runSequence(
        'clean',
        'build',
        [
            'watch.css',
            'watch.html',
            'watch.js'
        ],
        done);
});