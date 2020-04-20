#!/usr/bin/env/ node

(() => {

  'use strict';

  const CURR_DIR = process.cwd();
  const TEST_DIR = `${CURR_DIR}/test`;
  
  const fs = require('fs');
  const fse = require('fs-extra');
  const prompts = require('prompts');
  prompts.override(require('yargs').argv);

  const CONFIG = require('./config.json');
 
  (async () => {
    const response = await prompts([
      {
        type: 'text',
        name: 'appName',
        message: 'Application name'
      }, {
        type: 'text',
        name: 'authorName',
        message: 'Author name'
      }, {
        type: 'text',
        name: 'authorEmail',
        message: 'Author email'
      }, {
        type: 'select',
        name: 'frontEndLib',
        message: 'Select front-end library',
        choices: [
          { title: 'GOV.UK front-end', value: 'govuk' },
          { title: 'NHS.UK front-end', value: 'nhsuk' },
          { title: 'Vanilla, I want to start fresh!', value: 'vanilla' }
        ],
      }
    ]);
   
    let projectConfig = {
      name: response.appName || 'my-awesome-app',
      author: (response.authorName || '') + (response.authorEmail ? ` <${response.authorEmail}>` : ''),
      description: 'Static site and asset generator${descNotes}. Built with the power of Gulp 4, Webpack 4, Babel 7, Node Sass and Nunjucks.',
      licence: 'MIT'
    };

    switch (response.frontEndLib) {
      case 'govuk':
      case 'nhsuk':
        projectConfig.type = 'ext';
        projectConfig.ext = response.frontEndLib;
        projectConfig.package = `${response.frontEndLib}-frontend`;
        projectConfig.descNotes = ` using the ${response.frontEndLib === 'nhsuk' ? 'NHSUK' : 'GOVUK'} front-end toolkit`;
        break;
      default:
        projectConfig.type = 'vanilla';
        projectConfig.descNotes = '';
        break;
    }

    // Prepare the working folder with the necessary folders and files
    createProjectFiles(projectConfig);
    
    // Update the working file contents
    updateProjectFiles(projectConfig);
  })();

  function createProjectFiles(config) {
    // Copy everything
    fse.copySync(`${__dirname}/templates/`, `${TEST_DIR}/`);

    // Then delete the obsolete files
    fse.removeSync(`${TEST_DIR}/projects`);

    const projectFiles = [
      `${TEST_DIR}/gulpfile-[XXX].js`,
      `${TEST_DIR}/lib/config-[XXX].js`,
      `${TEST_DIR}/package-[XXX].json`
    ];
    const obsoleteType = config.type === 'vanilla' ? 'ext' : 'vanilla';

    // Remove the obsolete project files
    projectFiles.forEach((item) => {
      const filePath = item.replace('[XXX]', obsoleteType);
      fse.removeSync(filePath);
    });

    // Rename the project files we will use
    projectFiles.forEach((item) => {
      const oldFilePath = item.replace('[XXX]', config.type);
      const newFilePath = item.replace('-[XXX]', '');
      fse.moveSync(oldFilePath, newFilePath, {overwrite: true});
    });
  }

  function updateProjectFiles(config) {
    // Package.json
    let content = fs.readFileSync(`${TEST_DIR}/package.json`, 'utf8');
    content = content.replace('${name}', config.name);
    content = content.replace('${description}', config.description);
    content = content.replace('${descNotes}', config.descNotes);
    content = content.replace('${author}', config.author);
    content = content.replace('${licence}', config.licence);

    if (config.type === 'ext') {
      content = content.replace('${extDepName}', CONFIG.ext[config.ext].npm.name);
      content = content.replace('${extDepVersion}', CONFIG.ext[config.ext].npm.version);
    }

    fs.writeFileSync(`${TEST_DIR}/package.json`, content, 'utf8');

    if (config.type === 'ext') {
      // Config.js
      content = fs.readFileSync(`${TEST_DIR}/lib/config.js`, 'utf8');
      content = content.replace('${dependencyAssets}', CONFIG.ext[config.ext].paths.assets);
      fs.writeFileSync(`${TEST_DIR}/lib/config.js`, content, 'utf8');
    }
  }
})();