# UI Toolkit

## This UI tookit is a UI dev's best friend - seriously!

The main scope of this project is to streamline traditional UI stack (**HTML + CSS + JS**) workflows and incorporate best practices for both UI development and UX research.

The project uses [Gulp 4](https://gulpjs.com/), [Webpack 4](https://webpack.js.org/), [Node SASS](https://github.com/sass/node-sass) and [Babel](https://babeljs.io/docs/en/) to build production-ready front-end assets using the NHSUK or GOVUK front-end toolkit (or no toolkit at all if you just fancy vanilla 🍦). The project is also a static site gerenator - creating HTML pages from [Nunjucks](https://mozilla.github.io/nunjucks/templating.html) templates, so it can be used for prototyping.

> The great thing about this app is that it can function both as a lean, standalone application (e.g. a Node app for prototyping locally and user testing via Heroku), but it can also be added to a larger, more robust application (such as a Spring Java app) - and be used just to generate assets for production environment.

## Demo 

[https://statik-ui.herokuapp.com/](https://statik-ui.herokuapp.com/)

- **USERNAME:** bruceWayne
- **PASSWORD:** iWearTights

## Production-ready asset generation

The criteria for production-ready assets are:
- Multiple source-files (to encourage modular coding) for stylesheets and javascript coding
- Single CSS and JavaScript output generated from those source files
- The output files are minified, uglified and (potentially revved for no-cache purposes)
- We do this to reduce the amount of HTTP requests the application makes in the production environment. Less HTTP requests = quicker page loading time

## Current status of the project

Currently the app can be used to prototype an NHSUK application, and to build production-ready static assets for it. The prototype can be developed and used both locally, or remotely by deploying to Heroku, where password protection is supported via basic authentication.

Check the developer notes below for planned future improvements.

## Installing the project

Better/faster/more reliable with [yarn](https://yarnpkg.com), but you can just use npm if you want...

	$ yarn
	OR
	$ npm install
	
## Generate production ready files

	$ yarn|npm build-prod
	
The output will be minified, uglified, concatenated into the lest amount of files - ready for production.
	
The generated files are spit out into the following structure:

	public
	|_assets
	  |_css
	  |_favicons (from NHSUK front-end)
	  |_fonts (from NHSUK front-end)
	  |_icons (from NHSUK front-end)
	  |_images
	  |_js
	  |_logos (from NHSUK front-end)
  	|_html (static HTML files)

## Build things locally

This is great, if you want to develop something. This command will launch the site on (localhost:3000)[http://localhost:3000] with [BrowserSync](https://www.browsersync.io/docs), so you can build things ⚡ quickly, and test the site across multiple devices at once.

	$ yarn|npm dev
	
## Generate files in local development mode

The output in dev mode will be still single files, but with source maps and human readable - perfect for debugging!

	$ yarn|npm build-dev
	
## Deploying to Heroku

### Setting up Heroku

You will need a [Heroku account](https://www.heroku.com/) first.

Then you'll need to install [Heroku CLI](https://devcenter.heroku.com/articles/heroku-cli#download-and-install).

Once you [authenticated yourself](https://devcenter.heroku.com/articles/authentication) you're ready to create your Heroku app using Heroku CLI (or just use the Heroku dashboard in the browser).

### Create new Heroku app

You can create a new application in the Heroku web dashboard, or using the command line:

	$ heroku apps:create my-heroku-app -r heroku --region eu

### Push to Heroku using master branch

	$ git push heroku master

### Push to Heroku using feature branch

	$ git push -f heroku featureBranchName:master
	
## Debugging Heroku

To see the logs you can use HerokuCLI:

	$ heroku logs --tail
	
	
## Protecting your Heroku site

It is important to remember, that [you MUST protect your Heroku site](https://govuk-prototype-kit.herokuapp.com/docs/publishing-on-heroku#6-set-a-username-and-password) if your site or prototype uses any ports of the NHSUK or GOVUK front-end libraries to make sure that noone from the public mistakens your site for an actual public service site.

### Set up the environment variables for the basic authentication

	$ heroku config:set USERNAME=BRUCE_WAYNE
	$ heroku config:set PASSWORD=I_WEAR_TIGHTS_AT_NIGHT
	

## Developer notes
- **Imagemin** has a dependency called `jpegtran`, which is a little flaky, and occassionally it can fail the image processing [https://gist.github.com/welcoMattic/9f0991fa81a80096a3877ee42562c504](https://gist.github.com/welcoMattic/9f0991fa81a80096a3877ee42562c504).
If you see a Gulp error caused by `jpegtran`, just rebuild the binary:

		$ npm rebuild jpegtran-bin
		
- Node SASS can lose its binding to the operating system. When that ocassionally happens rebuild the binary to resolve the issue by running:

		$ npm rebuild node-sass
		
- There are SASS and ES (JavaScript) linting tasks in the Gulp file, but to keep things streamlined and to be able to iterate rapidly these are switched off for now.


## Planned actions (to do)

- Add configurable basic authentication for Heroku deployments ✅
- Document Heroku deployment process ✅
- Replace unmaintained [SASS-Lint](https://github.com/sasstools/sass-lint) with [SCSS-Lint](https://github.com/sds/scss-lint)
- Configure SCSS-lint using sensible defaults
- Configure ESLint using sensible defaults
- Clean up NPM dependencies ✅
- Tidy up the Gulp file
- Enable the direct use of underlying (NHSUK) front-end toolkit macros and other resources ✅
- Add data and routing to the server
- Add setup script, so that the developer can chose between GOVU and NHSUK design system