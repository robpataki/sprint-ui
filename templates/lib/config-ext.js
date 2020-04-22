module.exports = (() => {
  // Path config
  const SOURCE_PATH = './src';
  const DESTINATION_PATH = './public';
  const PATHS = {
    source: {
      root: SOURCE_PATH,
      sass: `${SOURCE_PATH}/assets/sass/**/*.scss`,
      fonts: `${SOURCE_PATH}/assets/fonts/**/*.*`,
      js: `${SOURCE_PATH}/assets/js/**/*.*`,
      appJS: `${SOURCE_PATH}/assets/js/application.js`,
      images: `${SOURCE_PATH}/assets/images/**/*.*`,
      htmlPages: `${SOURCE_PATH}/html/pages/**/*.+(html|nunjucks|njk)`,
      html: `${SOURCE_PATH}/html/**/*.+(html|nunjucks|njk)`,
      nunjucks: `${SOURCE_PATH}/html`,
      frontEndLibRoot: `${frontEndLibRoot}`,
      frontEndLibAssets: `${frontEndLibAssets}`
    },

    destination: {
      root: DESTINATION_PATH,
      css: `${DESTINATION_PATH}/assets/css`,
      fonts: `${DESTINATION_PATH}/assets/fonts`,
      js: `${DESTINATION_PATH}/assets/js`,
      appJSFileName: `application.js`,
      images: `${DESTINATION_PATH}/assets/images`,
      html: `${DESTINATION_PATH}`,
      frontEndLibAssets: `${DESTINATION_PATH}/assets`
    }
  };

  // Return app configuration
  return {
    USE_AUTH: true,
    ENFORCE_AUTH: false,
    PATHS: PATHS
  }
})();
