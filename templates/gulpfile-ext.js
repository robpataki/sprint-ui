(() => {

  'use strict';

  /**************** Gulp.js 4 configuration ****************/
  const gulp = require('gulp');
  const fs = require('fs');
  const path = require('path');
  const del = require('del');
  const eol = require('gulp-eol');
  const watch = require('gulp-watch');
  const gulpIf = require('gulp-if');
  const nunjucksRender = require('gulp-nunjucks-render');
  const sass = require('gulp-sass');
  const eslint = require('gulp-eslint');
  const sassLint = require('gulp-sass-lint');
  const sourcemaps = require('gulp-sourcemaps');
  const uglify = require('gulp-uglify-es').default;
  const autoprefixer = require('gulp-autoprefixer');
  const csso = require('gulp-csso');
  const imagemin = require('gulp-imagemin');
  const pngquant = require('imagemin-pngquant');
  const webpackStream = require('webpack-stream');
  
  const browserSync = require('browser-sync').create();
  const reload = browserSync.reload;

  /**************** Modularised code ****************/
  const env = require('./lib/env');
  const config = require('./lib/config');
  const PATHS = config.PATHS;

  /**************** Environment config ****************/
  console.log('\x1b[43m\x1b[35m%s\x1b[0m', 'Gulp runs in PROD mode by default. To run gulp in DEV mode, use `-env=dev`!\nCheck out README.md for more information.');

  /**************** Server config ****************/
  // Server config is based on the environment
  const SERVER_PORT = env.IS_DEV ? 3000 : (process.env.PORT || 8080);
  const OPEN_BROWSER = env.IS_DEV ? 'local' : false;
  const serverConfig = {
    server: {
      baseDir: PATHS.destination.root,
      serveStaticOptions: {
        extensions: ['html']
      }
    },
    tunnel: false,
    host: 'localhost',
    open: OPEN_BROWSER,
    port: SERVER_PORT,
    logPrefix: "statik-ui",
    middleware: [
      require('./lib/middleware/auth')
    ]
  };

  /**************** Processing tasks ****************/
  // Wipe the public folder
  function cleanDestination(done) {
    del.sync([PATHS.destination.root]);
    done();
  }

  // Convert Nunjucks templates into static HTML
  function processHTML(done) {
    return gulp.src(PATHS.source.htmlPages)
      .pipe(nunjucksRender({
        path: [
          PATHS.source.nunjucks,
          PATHS.source.frontEndLibRoot
        ],
        autoescape: true,
        data: {}
      }))
      .pipe(gulp.dest(PATHS.destination.html))
      .pipe(reload({
        stream: true
      }));
    done();
  }

  // Process image assets
  function processImages(done) {
    return gulp.src(PATHS.source.images)
      .pipe(gulpIf(env.IS_PROD, imagemin({
        progressive: true,
        svgoPlugins: [{
          removeViewBox: false
        }],
        use: [pngquant()],
        interlaced: true
      })))
      .pipe(gulp.dest(PATHS.destination.images))
      .pipe(reload({
        stream: true
      }));
    done();
  }

  // Process fonts
  function processFonts(done) {
    return gulp.src(PATHS.source.fonts)
      .pipe(gulp.dest(PATHS.destination.fonts));
    done();
  }


  /**************** Stylesheet processing ****************/
  // Cleans the destination CSS folder
  function cleanCSS(done) {
    del.sync([PATHS.destination.css]);
    done();
  }

  // Lints our SASS code based on rules set inside sass-lint.yml file
  function lintSass(done) {
    return gulp.src([PATHS.source.sass])
      .pipe(sassLint({ configFile: './.sass-lint.yml' }))
      .pipe(sassLint.format())
      .pipe(gulpIf(env.IS_PROD, sassLint.failOnError()));
    done();
  }

  // Process the SASS files
  function processSass() {
    return gulp.src(PATHS.source.sass)
      .pipe(gulpIf(env.IS_DEV, sourcemaps.init()))
      .pipe(sass({
        includePaths: ['node_modules'],
        outputStyle: env.IS_PROD ? 'compressed' : 'expanded',
      }).on('error', sass.logError))
      .pipe(gulpIf(env.IS_PROD, csso()))
      .pipe(autoprefixer())
      .pipe(gulpIf(env.IS_DEV, sourcemaps.write('./')))
      .pipe(gulp.dest(PATHS.destination.css))
      .pipe(reload({
        stream: true
      }));
  }

  
  /**************** JavaScript processing ****************/
  // Clean JS directory
  function cleanJS(done) {
    del.sync([PATHS.destination.js]);
    done();
  }

  // Lints our JS code based on Airbnb JS rules
  function lintJS() {
    return gulp.src([PATHS.source.js, '!node_modules/**'])
      .pipe(eslint())
      .pipe(eslint.format())
      .pipe(gulpIf(env.IS_PROD, eslint.failAfterError()));
  }


  function processAppJS () {
    return gulp.src(PATHS.source.appJS)
      .pipe(gulpIf(env.IS_DEV, sourcemaps.init({ loadMaps: true })))
      .pipe(webpackStream({
        mode: env.IS_PROD ? 'production' : 'development',
        output: {
          filename: PATHS.destination.appJSFileName
        },
        plugins: [
          new webpackStream.webpack.ProvidePlugin({
            $: 'jquery',
            jQuery: 'jquery'
          })
        ],
        module: {
          rules: [
            {
              test: /\.(js)$/,
              exclude: /(node_modules)/,
              loader: 'babel-loader',
              query: {
                presets: ['babel-preset-env']
              }
            }
          ]
        }
      }))
      .pipe(gulpIf(env.IS_DEV, sourcemaps.write('.')))
      .pipe(gulpIf(env.IS_PROD, uglify()))
      .pipe(eol())
      .pipe(gulp.dest(PATHS.destination.js))
      .pipe(reload({
        stream: true
      }));
  }


  // Copies govuk assets from npm folder inside local assets folder
  function copyFrontEndLibAssets() {
    return gulp.src([PATHS.source.frontEndLibAssets])
      .pipe(gulp.dest(PATHS.destination.frontEndLibAssets));
  }


  /**************** Watch tasks ****************/
  function watchFiles(done) {
    // Only watch for file changes in `development` mode
    if (env.IS_DEV) {
      gulp.watch(PATHS.source.images, gulp.series(processImages));
      gulp.watch(PATHS.source.fonts, gulp.series(processFonts));
      gulp.watch(PATHS.source.html, gulp.series(processHTML));
      gulp.watch(PATHS.source.sass, gulp.series(exports.styles));
      gulp.watch(PATHS.source.js, gulp.series(exports.scripts));
    }
    done();
  }

  function runWebServer (done) {
    // Server config is based on the environment
    browserSync.init(serverConfig, 
      // Middleware to handle errors
      (err, bs) => {
        bs.addMiddleware("*", (req, res) => {
          const errorHTMLFile = fs.readFileSync(path.join(PATHS.destination.root, '404.html'));
          res.write(errorHTMLFile);
          res.writeHead(404);
          res.end();
        });
      }
    );
    done();
  }

  /**************** Final exports ****************/
  exports.assets = gulp.series(copyFrontEndLibAssets, processFonts, processImages);
  exports.styles = gulp.series(lintSass, cleanCSS, processSass);
  exports.scripts = gulp.series(lintJS, cleanJS , processAppJS);
  exports.build = gulp.series(
    cleanDestination,
    exports.assets,
    exports.styles,
    exports.scripts,
    processHTML
  );
  exports.serve = gulp.parallel(runWebServer, watchFiles);
  
  exports.default = gulp.series(exports.build, exports.serve);
})();