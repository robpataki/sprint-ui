# Sprint UI ❯❯❯👟❯❯👟❯

Blazing fast, production ready UI development kit for GOVUK, NHSUK or vanilla projects.

## ❯❯❯ Disclaimer

This is an experimental and work in progress package, please use it with caution. As soon as I learn how to do NPM properly, I'll add tests and proper documentation.

## ❯❯❯ Install

```
$ npm install sprint-ui -g
```

## ❯❯❯ Create a new project

Create a new folder, and in the folder's root call `sprint-ui` to generate the project files.

```
$ mkdir my-sprint-ui-project
$ cd my-sprint-ui-project
$ sprint-ui
```

The `sprint-ui` command will write project files into the new project folder.

> Please note that the project will not check if the folder is empty, and will copy the files regardless. The project generation process can be stopped at any point before the last step (step 3). **The generator will not delete existing files in the folder it is called from - this is to avoid any accitental data loss.**

Once your project is installed, you will get a fully structured, ready to go static website, which you can start developing using

```
$ yarn|npm run dev
```

The projects come with a README.md file, which is a great place to start getting familiar with the setup and how to do things.

## ❯❯❯ Project types

Currently **NHSUK** and **GOVUK** projects can be created with the generator.

A third - vanilla project is coming soon.

## ❯❯❯ Roadmap

- Document everything
- Add project asset revving
- Add NPM package tests
- Add Vanilla project templates
- Make the project generation logs pretty and <span style="background: black">&nbsp;<i style="color:yellow">c</i><i style="color:red">o</i><i style="color:green">l</i><i style="color:orange">o</i><i style="color:pink">u</i><i style="color:grey">r</i><i style="color:magenta">f</i><i style="color:lightblue">u</i><i style="color:lightgreen">l</i>&nbsp;</span>




  
