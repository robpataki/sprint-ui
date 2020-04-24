#!/usr/bin/env/ node

(() => {

  'use strict';
  
  // Import dependencies
  const util = require('util');
  const fs = require('fs');
  const fse = require('fs-extra');
  const prompts = require('prompts');
  prompts.override(require('yargs').argv);

  // Import config file
  const CONFIG = require('./config.json');

  // Local constants
  const TOTAL_STEPS = 3;
  const CURR_DIR = process.cwd();
  const WORK_DIR = `${CURR_DIR}`;

  // Generate project config based on user input from prompts
  function getProjectConfig() {
    return new Promise((resolve, reject) => {      
      (async () => {
        const questions = [
          {
            type: 'text',
            name: 'appName',
            message: 'Enter application name',
            validate: name => name.match(/^[a-z0-9\_\-]*$/g) === null ? 'Application name can only contain lowercase letters; numbers; `-` and `_`.' : true
          }, {
            type: 'text',
            name: 'authorName',
            message: 'Enter author\'s name'
          }, {
            type: 'select',
            name: 'frontEndLib',
            message: 'Select Front-end library to use',
            choices: [
              { title: 'GOV.UK front-end', value: 'govuk' },
              { title: 'NHS.UK front-end', value: 'nhsuk' }/*,
              { title: 'Vanilla, I want to start fresh!', value: 'vanilla' }*/
            ]
          }, {
            type: 'select',
            name: 'packageManager',
            message: 'Select your preferred package manager',
            choices: [
              { title: 'Yarn', value: 'yarn' },
              { title: 'NPM', value: 'npm' }
            ]
          }
        ];

        const onCancel = (prompt) => {
          reject('Project creation interrupted. No kittens were harmed!');
          return false;
        };

        const response = await prompts(questions, { onCancel });
       
        let config = {
          name: response.appName || 'my-awesome-app',
          author: response.authorName || '',
          description: 'Static site and asset generator${descNotes}. Built with the power of Gulp 4, Webpack 4, Babel 7, Node Sass and Nunjucks.',
          licence: 'MIT',
          packageManager: response.packageManager
        };

        switch (response.frontEndLib) {
          case 'govuk':
          case 'nhsuk':
            config.type = 'ext';
            config.extType = response.frontEndLib;
            config.package = `${response.frontEndLib}-frontend`;
            config.descNotes = ` using the ${response.frontEndLib === 'nhsuk' ? 'NHSUK' : 'GOVUK'} front-end toolkit`;
            break;
          default:
            config.type = 'vanilla';
            config.descNotes = '';
            break;
        }

        resolve(config);
      })();
    });
  }

  /* 
    Copy appropriate project files from the templates based 
    on project type selected by the user
  */
  function copyProjectFiles(config) {
    log(`Step 1/${TOTAL_STEPS}: Creating project files...`);

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
    log(`Step 1/${TOTAL_STEPS}: 💥`);
  }

  /* 
    Set up project files based on project type selected by the user
  */
  function setupProjectFiles(config) {
    log(`Step 2/${TOTAL_STEPS}: Applying "${config.type.toUpperCase()}" config...`);

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
      content = content.replace('${frontEndLibRoot}', CONFIG.ext[config.extType].paths.root);
      content = content.replace('${frontEndLibAssets}', CONFIG.ext[config.extType].paths.assets);
      fs.writeFileSync(`${WORK_DIR}/lib/config.js`, content, 'utf8');
    }
    log(`Step 2/${TOTAL_STEPS}: 💥`);
  }

  /* 
    Install NPM dependencies from the new project's package.json file
  */
  function installDependencies(config) {
    log(`Step 3/${TOTAL_STEPS}: Installing project dependencies using ${config.packageManager}...`);
    
    const pmInstallCommand = config.packageManager === 'yarn' ? 'yarn' : 'npm install';
    const child = require('child_process').exec(`${pmInstallCommand}`); 
    child.stdout.on('data', (data) => {
      console.log(data.toString());
    });
    child.stdout.on('close', () => {
      log(`Step 3/${TOTAL_STEPS}: 💥`);
      log(`Your new project is ready, go get get them 🐅!`);
      log(`You can start building things by running "$ yarn run dev"`);
    });
  }

  /* 
    Log custom formatted messages
  */
  function log(message, severity) {
    console.log(message);
  }

  getProjectConfig()
  .then((config) => {
      copyProjectFiles(config);
      setupProjectFiles(config);
      installDependencies(config);
  }, (error) => {
    log(`Error: ${error}`);
  });
})();