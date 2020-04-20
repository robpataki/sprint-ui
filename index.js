(() => {

  'use strict';

  const CURR_DIR = process.cwd();
  
  const fs = require('fs');
  const prompts = require('prompts');
  prompts.override(require('yargs').argv);
 
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
        projectConfig.type = 'thirdparty';
        projectConfig.package = `${response.frontEndLib}-frontend`;
        projectConfig.descNotes = ` using the ${response.frontEndLib === 'nhsuk' ? 'NHSUK' : 'GOVUK'} front-end toolkit`;
        break;
      default:
        projectConfig.type = 'vanilla';
        projectConfig.descNotes = '';
        break;
    }

    createProjectFiles();
    updateProjectFiles(projectConfig);
  })();

  function createProjectFiles() {
    const templatePath = `${__dirname}/templates`;
    const filesToCreate = fs.readdirSync(templatePath);

    filesToCreate.forEach(file => {
      const origFilePath = `${templatePath}/${file}`;
      
      // get stats about the current file
      const stats = fs.statSync(origFilePath);

      if (stats.isFile()) {
        const contents = fs.readFileSync(origFilePath, 'utf8');
        
        const writePath = `${CURR_DIR}/${file}`;
        fs.writeFileSync(writePath, contents, 'utf8');
      }
    });
  }1

  function updateProjectFiles(config) {
    var data = fs.readFileSync(`${CURR_DIR}/package.json`, 'utf8');
    data = data.replace('${name}', config.name);
    data = data.replace('${description}', config.description);
    data = data.replace('${descNotes}', config.descNotes);
    data = data.replace('${author}', config.author);
    data = data.replace('${licence}', config.licence);
    fs.writeFileSync(`${CURR_DIR}/package.json`, data, 'utf8');
  }
})();