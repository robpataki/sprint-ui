/* global $, window, document */

import 'core-js/stable';
import 'regenerator-runtime/runtime';

import govukAll from 'govuk-frontend/govuk/all';
import todaysDate from './modules/todaysDate';

// Expose $ on window
window.$ = $;

// Initialise GOVUK components
govukAll.initAll();

// Render today's date into the appropriate elements on the page
const todaysDateEls = document.querySelectorAll('[data-module="todays-date"]');
todaysDateEls.forEach((el) => {
  el.innerText = todaysDate();
});
