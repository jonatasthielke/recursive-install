#!/usr/bin/env node

const path = require('path');
const shell = require('shelljs');
const { exec } = require('child_process');
const { promisify } = require('util');
const argv = require('yargs')
  .options({
    production: {
      type: 'boolean',
      describe: 'Install only production dependencies',
    },
    rootDir: {
      type: 'string',
      describe: 'Root directory for recursive installation',
    },
    skipRoot: {
      type: 'boolean',
      describe: 'Skip root package.json',
    },
    remove: {
      type: 'boolean',
      describe: 'Remove existing node_modules directories before installation',
    },
    concurrent: {
      type: 'number',
      describe: 'Number of concurrent installations',
      default: 5,
    },
    clean: {
      type: 'boolean',
      describe: 'Remove existing node_modules directories without installation',
    },
    yarn: {
      type: 'boolean',
      describe: 'Use yarn instead of npm',
    },
  })
  .help()
  .argv;

const ProgressBar = require('progress');
const async = require('async');

const CONCURRENT_FOLDERS = argv.concurrent;

const execAsync = promisify(exec);

function noop(x) {
  return x;
}

function getPackageJsonLocations(dirname) {
  return shell
    .find(dirname)
    .filter((fname) => {
      return !(fname.indexOf('node_modules') > -1 || fname[0] === '.') &&
        path.basename(fname) === 'package.json';
    })
    .map((fname) => {
      return path.dirname(fname);
    });
}

async function installDependencies(dir) {
  try {
    const command = argv.yarn ? 'yarn' : argv.production ? 'npm install --production' : 'npm install';
    await execAsync(command, { cwd: dir });
    return {
      dirname: dir,
      exitCode: 0,
    };
  } catch (err) {
    return {
      dirname: dir,
      exitCode: err.status || 1,
    };
  }
}

async function removeNodeModules(dir) {
  try {
    await execAsync('rm -rf node_modules', { cwd: dir });
    return {
      dirname: dir,
      exitCode: 0,
    };
  } catch (err) {
    return {
      dirname: dir,
      exitCode: err.status || 1,
    };
  }
}

function filterRoot(dir) {
  return path.normalize(dir) !== path.normalize(process.cwd());
}

console.log('Arguments passed:');
const argumentDetails = [
  { name: 'remove', description: 'Remove existing node_modules directories before installation' },
  { name: 'concurrent', description: 'Number of concurrent installations' },
  { name: 'clean', description: 'Remove existing node_modules directories without installation' },
  { name: 'yarn', description: 'Use yarn instead of npm' },
];

argumentDetails.forEach(({ name, description }) => {
  if (name in argv) {
    console.log(`${name}: ${JSON.stringify(argv[name])}`);
    console.log(`  ${description}`);
  }
});

console.log('\nMissing arguments:');
const missingArgs = [
  { name: 'rootDir', description: 'Root directory for recursive installation' },
  { name: 'skipRoot', description: 'Skip root package.json' },
];
const missing = missingArgs.filter((arg) => !(arg.name in argv));
if (missing.length > 0) {
  missing.forEach((arg) => {
    console.log(`- ${arg.name}: ${arg.description}`);
  });
} else {
  console.log('None');
}

if (require.main === module) {
  const rootDir = argv.rootDir ? argv.rootDir : process.cwd();
  const packageJsonLocations = getPackageJsonLocations(rootDir)
    .filter(argv.skipRoot ? filterRoot : noop);

  const progressBar = new ProgressBar('[:bar] :current/:total :percent :etas :dir', {
    total: packageJsonLocations.length,
    width: 20,
    complete: '=',
    incomplete: ' ',
  });

  console.log('\nInstallation progress:');

  async.mapLimit(
    packageJsonLocations,
    CONCURRENT_FOLDERS,
    async (dir) => {
      if (argv.clean) {
        await removeNodeModules(dir);
        progressBar.tick({ dir: dir });
        return { dirname: dir, exitCode: 0 };
      } else {
        if (argv.remove) {
          await removeNodeModules(dir);
        }
        const result = await installDependencies(dir);
        progressBar.tick({ dir: dir });
        return result;
      }
    },
    (err, results) => {
      if (err) {
        console.error('\nError occurred during installation:', err);
        process.exit(1);
      } else {
        console.log('\nAll installations complete.');
        const exitCode = results.reduce((code, result) => Math.max(code, result.exitCode), 0);
        process.exit(exitCode);
      }
    }
  );
}
