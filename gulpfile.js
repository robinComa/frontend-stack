'use strict';

var gulp = require('gulp');

var jshint = require('gulp-jshint');
var plumber = require('gulp-plumber');
var concat = require('gulp-concat');
var stripDebug = require('gulp-strip-debug');
var uglify = require('gulp-uglify');
var livereload = require('gulp-livereload');
var openBrowser = require('gulp-open');
var karma = require('gulp-karma');
var replace = require('gulp-replace');
var clean = require('gulp-clean');
var sass = require('gulp-sass');
var templateCache = require('gulp-angular-templatecache');

var bower = require('./bower.json');

gulp.task('clean', function() {
    return gulp.src('./dist', {read: false})
        .pipe(clean());
});

gulp.task('vendor', function() {
    gulp.src([
        'app/bower_components/modernizr/modernizr.js',
        'app/bower_components/jquery/dist/jquery.min.js',
        'app/bower_components/angular/angular.js',
        'app/bower_components/angular-resource/angular-resource.js',
        'app/bower_components/angular-route/angular-route.js'
    ])
        .pipe(concat('vendor.js'))
        .pipe(uglify())
        .pipe(gulp.dest('dist'));
    gulp.src([
        'app/bower_components/es5-shim/es5-shim.min.js',
        'app/bower_components/json3/lib/json3.min.js',
        'app/bower_components/respond/src/respond.js'
    ])
        .pipe(concat('vendor-ie8-shim.js'))
        .pipe(uglify())
        .pipe(gulp.dest('dist'));
});

gulp.task('scripts', function() {
    gulp.src('app/scripts/**/**')
        .pipe(concat('script.js'))
        .pipe(jshint())
        .pipe(uglify())
        .pipe(plumber())
        .pipe(stripDebug())
        .pipe(gulp.dest('dist'));
});

gulp.task('views', function() {
    gulp.src('app/views/**/**')
        .pipe(templateCache({root:'views/'}))
        .pipe(gulp.dest('dist'));
});

gulp.task('pages', function() {
    gulp.src([
        'app/*.html'
    ])
        .pipe(gulp.dest('dist'));
});

gulp.task('styles', function() {
    gulp.src('app/styles/**/**')
        .pipe(sass())
        .pipe(concat('style.css'))
        .pipe(gulp.dest('dist'));
});

gulp.task('staticsvr', function(next) {
    var staticS = require('node-static'),
        server = new staticS.Server('./dist'),
        port = 9000;
    require('http').createServer(function (request, response) {
        request.addListener('end', function () {
            server.serve(request, response);
        }).resume();
    }).listen(port, function() {
        next();
    });
});

gulp.task('watch', function() {
    var lr = livereload();
    gulp.watch('app/scripts/**').on('change', function(file) {
        gulp.run('scripts');
        lr.changed(file.path);
    });
    gulp.watch('app/views/**').on('change', function(file) {
        gulp.run('views');
        lr.changed(file.path);
    });
    gulp.watch('app/*.html').on('change', function(file) {
        gulp.run('pages');
        lr.changed(file.path);
    });
    return gulp.watch('app/styles/**').on('change', function(file) {
        gulp.run('styles');
        lr.changed(file.path);
    });
});

gulp.task('open', function(){
    gulp.src('./dist/index.html')
        .pipe(openBrowser('', {
            url: 'http://localhost:9000/',
            app: 'google-chrome'
        }));
});

gulp.task('karma', function(){
    gulp.src([
        'test/spec/**/*.js'
    ])
        .pipe(karma({configFile: 'karma.conf.js'}));
});

gulp.task('dist', ['clean', 'vendor', 'scripts', 'pages', 'views', 'styles']);
gulp.task('serve', ['dist', 'staticsvr', 'watch', 'open']);
gulp.task('test', ['karma']);
