Recursive Install
=================

[![Build Status](https://travis-ci.org/emgeee/recursive-install.svg?branch=master)](https://travis-ci.org/emgeee/recursive-install)

A small utility to recursively run `npm install` or `yarn` in any child directory that has a `package.json` file, excluding subdirectories of `node_modules`.

Installation
------------

bashCopy code

`$ npm i -g recursive-install`

Usage
-----

bashCopy code

`$ recursive-install`

By default, the utility will start from the current working directory and install dependencies in all child directories that contain a `package.json` file.

### Options

You can use the following options to customize the installation behavior:

*   `--production`: Install only production dependencies.
*   `--rootDir=<directory>`: Specify a root directory for recursive installation. The utility will start from the specified directory instead of the current working directory.
*   `--skipRoot`: Skip installing dependencies in the root directory (current working directory).
*   `--remove`: Remove existing `node_modules` directories before installation.
*   `--concurrent=<number>`: Specify the number of concurrent installations (default: 5).
*   `--clean`: Remove existing `node_modules` directories without performing installation.
*   `--yarn`: Use Yarn instead of npm for installation.

### Example Usages

Install dependencies recursively starting from the current directory:

bashCopy code

`$ recursive-install`

Install only production dependencies:

bashCopy code

`$ recursive-install --production`

Install dependencies starting from a specific directory:

bashCopy code

`$ recursive-install --rootDir=lib`

Remove existing `node_modules` directories before installation:

bashCopy code

`$ recursive-install --remove`

Install dependencies concurrently with a maximum of 10 concurrent installations:

bashCopy code

`$ recursive-install --concurrent=10`

Remove existing `node_modules` directories without installation:

bashCopy code

`$ recursive-install --clean`

Use Yarn instead of npm for installation:

bashCopy code

`$ recursive-install --yarn`

License
-------

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.