(() => {

  'use strict';

  const prompts = require('prompts');
  prompts.override(require('yargs').argv);
 
  (async () => {
    const response = await prompts([
      {
        type: 'select',
        name: 'frontEndLib',
        message: 'Select front-end library',
        choices: [
          { title: 'GOV.UK front-end', value: 'govuk' },
          { title: 'NHS.UK front-end', value: 'nhsuk' },
          { title: 'Vanilla, I know what I\'m doing!', value: 'vanilla' }
        ],
      }
    ]);
   
    console.log(response);
  })();
})();