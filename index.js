#!/usr/bin/env/ node

(() => {

  'use strict';

  const CURR_DIR = process.cwd();
  const WORK_DIR = `${CURR_DIR}`;

  const CONFIG = require('./config.json');
  
  const util = require('util');
  const fs = require('fs');
  const fse = require('fs-extra');
  const prompts = require('prompts');
  prompts.override(require('yargs').argv);

  const { exec } = require('child_process');

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
        projectConfig.extType = response.frontEndLib;
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

    // Finish the installation
    postInstall();
  })();

  function createProjectFiles(config) {
    // Copy everything
    fse.copySync(`${__dirname}/templates/`, `${WORK_DIR}/`);

    // Then delete the obsolete files
    fse.removeSync(`${WORK_DIR}/projects`);
    fse.removeSync(`${WORK_DIR}/yarn.lock`);

    const projectConfigFiles = [
      `${WORK_DIR}/gulpfile-[XXX].js`,
      `${WORK_DIR}/lib/config-[XXX].js`,
      `${WORK_DIR}/package-[XXX].json`
    ];
    const obsoleteType = config.type === 'vanilla' ? 'ext' : 'vanilla';

    // Remove the obsolete config files
    projectConfigFiles.forEach((item) => {
      const filePath = item.replace('[XXX]', obsoleteType);
      fse.removeSync(filePath);
    });

    // Rename the config files we will use
    projectConfigFiles.forEach((item) => {
      const oldFilePath = item.replace('[XXX]', config.type);
      const newFilePath = item.replace('-[XXX]', '');
      fse.moveSync(oldFilePath, newFilePath, {overwrite: true});
    });

    // Copy project folder
    const projectFolder = config.type === 'vanilla' ? `vanilla` : `ext/${config.extType}`;
    fse.copySync(`${__dirname}/templates/projects/${projectFolder}`, `${WORK_DIR}/src`);
  }

  function updateProjectFiles(config) {
    // Package.json
    let content = fs.readFileSync(`${WORK_DIR}/package.json`, 'utf8');
    content = content.replace('${name}', config.name);
    content = content.replace('${description}', config.description);
    content = content.replace('${descNotes}', config.descNotes);
    content = content.replace('${author}', config.author);
    content = content.replace('${licence}', config.licence);

    if (config.type === 'ext') {
      content = content.replace('${extDepName}', CONFIG.ext[config.extType].npm.name);
      content = content.replace('${extDepVersion}', CONFIG.ext[config.extType].npm.version);
    }

    fs.writeFileSync(`${WORK_DIR}/package.json`, content, 'utf8');

    if (config.type === 'ext') {
      // Config.js
      content = fs.readFileSync(`${WORK_DIR}/lib/config.js`, 'utf8');
      content = content.replace('${dependencyRoot}', CONFIG.ext[config.extType].paths.root);
      content = content.replace('${dependencyAssets}', CONFIG.ext[config.extType].paths.assets);
      fs.writeFileSync(`${WORK_DIR}/lib/config.js`, content, 'utf8');
    }
  }

  function postInstall() {
    // const { exec } = require('child_process');
    // exec('yarn && yarn run dev', (err) => { console.log('postInstall error: ', err); });
  }
})();