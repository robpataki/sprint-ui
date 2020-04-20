const basicAuth = require('basic-auth');
const fs = require('fs');
const path = require('path');

const config = require('../config');
const env = require('../env');

module.exports = (req, res, next) => {
  let authorised = false;
  const username = process.env.USERNAME;
  const password = process.env.PASSWORD;

  const isAuthEnabled = typeof username !== 'undefined' && typeof password !== 'undefined';
  const isAuthRequired = config.ENFORCE_AUTH || (env.IS_PROD && config.USE_AUTH);

  if (isAuthRequired && !authorised) {
    if (!isAuthEnabled) {
      return res.end('Username or password is not set in Heroku. Check the README file for more information on how to set up basic authentication for this app.');
    }
    
    const user = basicAuth(req);

    if (!user || user.name !== username || user.pass !== password) {
      res.writeHead(401, {'WWW-Authenticate': 'Basic realm=Authorization Required'});
      return res.end(`You're not authorised to access this content.`);
    }

    authorised = true;
  }

  next();
}
