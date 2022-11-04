# Scope of this project

- provide a local ThreeJS environment in which you can test your features

# How to use

You will need to have [nodejs](https://nodejs.org/) installed.

## Installation

> First, make sure that your node version is >= 14

Clone the repository on your machine and move to the directory

```sh
$ git clone https://github.com/mharribey/pipe_threejs_webpack.git your_folder && cd your_folder
```

Install the packages required for the local environment

```sh
$ yarn
```

## Start local environment

```sh
$ yarn start
```

This last command will start a local http server with [live reloading](https://webpack.js.org/configuration/dev-server/#devserverlivereload) enabled so that you can iterate faster on your projects. Open [http://localhost:8080](http://localhost:8080) to see your project in the browser.

## Build

```sh
$ yarn run build
```

Will bundle your js dependencies into a single minified `bundle.js` file, move your files from the `public/` to the `dist/` folder, and link the `bundle.js` with the `index.html`.

**Moreover, it will create a `dist-zipped/project.zip` file which can be directly use to share your project**.

# How to

Once the environment is started, you can edit the `src/index.js` file to start building your work. The `index.html` file is located in the `public/` folder.

You can import libraries using `yarn` or by adding the library file in the `public/` folder and link those using relative paths in the `index.html`.

Any file in the `public/` folder will be added to the final project.
