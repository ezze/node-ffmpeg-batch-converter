const path = require('path');
const fs = require('fs-extra');
const execa = require('execa');
const moment = require('moment');
const { sprintf } = require('sprintf-js');

const extRegExp = /(\.[^.]+)$/;

async function convertVideoDirectory(inputDirectoryPath, outputDirectoryPath, options = {}) {
  console.log(`Converting directory "${inputDirectoryPath}"...`);

  const { outputNaming, ffmpegArgs, dry = false } = options;

  const tasks = await prepareTasks(inputDirectoryPath, outputDirectoryPath, options);

  tasks.sort((task1, task2) => {
    const result = task1.outputFilePath.localeCompare(task2.outputFilePath);
    return result === 0 ? task1.inputFilePath.localeCompare(task2.inputFilePath) : result;
  });

  if (outputNaming === 'date') {
    const count = {};
    tasks.forEach(task => {
      const { outputFilePath } = task;
      if (!count[outputFilePath]) {
        count[outputFilePath] = 1;
      }
      else {
        count[outputFilePath]++;
      }
    });

    const ids = {};
    tasks.forEach(task => {
      const { outputFilePath } = task;
      const outputCount = count[outputFilePath];
      if (outputCount === 1) {
        return;
      }
      if (!ids[outputFilePath]) {
        ids[outputFilePath] = 0;
      }
      const id = ++ids[outputFilePath];
      task.outputFilePath = outputFilePath.replace(extRegExp, `-${sprintf(`%0${`${outputCount}`.length}d`, id)}$1`);
    });
  }

  const outputDirectoryStat = await fs.stat(outputDirectoryPath);
  if (!dry && !outputDirectoryStat.isDirectory()) {
    await fs.ensureDir(outputDirectoryPath);
  }

  for (let i = 0; i < tasks.length; i++) {
    const task = tasks[i];
    const { inputFilePath, outputFilePath } = task;
    if (inputFilePath === outputFilePath) {
      console.warn(`Input and output files' paths are the same ("${inputFilePath}"), skipping...`);
      continue;
    }
    await convertVideo(inputFilePath, outputFilePath, { ffmpegArgs, dry });
  }
}

async function convertVideo(inputFilePath, outputFilePath, options = {}) {
  const { ffmpegArgs, dry = false } = options;
  console.log(`Converting video "${inputFilePath}" to "${outputFilePath}"...`);
  if (dry) {
    return;
  }
  try {
    const commandArgs = ['-i', inputFilePath];
    if (ffmpegArgs) {
      Array.prototype.push.apply(commandArgs, ffmpegArgs.split(' '));
    }
    commandArgs.push(outputFilePath);
    const pr = execa('ffmpeg', commandArgs);
    pr.stdout.pipe(process.stdout);
    pr.stderr.pipe(process.stderr);
    await pr;
  }
  catch (e) {
    console.error(e);
  }
}

async function prepareTasks(inputDirectoryPath, outputDirectoryPath, options = {}) {
  const { inputExtension: inputExtensions, outputNaming, recursive = false } = options;
  let { outputExtension } = options;

  if (Array.isArray(inputExtensions)) {
    inputExtensions.forEach((inputExtension, i) => {
      if (!inputExtension.startsWith('.')) {
        inputExtensions[i] = `.${inputExtension}`;
      }
    });
  }

  if (!outputExtension.startsWith('.')) {
    outputExtension = `.${outputExtension}`;
  }

  const tasks = [];

  const itemNames = await fs.readdir(inputDirectoryPath);
  for (let i = 0; i < itemNames.length; i++) {
    const itemName = itemNames[i];
    const itemPath = path.resolve(inputDirectoryPath, itemName);
    const itemStat = await fs.stat(itemPath);

    if (itemStat.isDirectory()) {
      if (recursive) {
        const nestedTasks = await prepareTasks(itemPath, path.resolve(outputDirectoryPath, itemName), options);
        Array.prototype.push.apply(tasks, nestedTasks);
      }
      continue;
    }

    let baseName = '';
    if (Array.isArray(inputExtensions)) {
      for (let j = 0; j < inputExtensions.length; j++) {
        const inputExtension = inputExtensions[j];
        const possibleBaseName = path.basename(itemName, inputExtension);
        if (possibleBaseName.length < itemName.length) {
          baseName = possibleBaseName;
          break;
        }
      }
    }
    else {
      baseName = itemName.replace(extRegExp, '');
    }
    if (!baseName) {
      continue;
    }

    let outputBaseName = baseName;
    if (outputNaming === 'date') {
      outputBaseName = moment(itemStat.mtimeMs).local().format('YYYY-MM-DD');
    }

    tasks.push({
      inputFilePath: itemPath,
      outputFilePath: path.resolve(outputDirectoryPath, `${outputBaseName}${outputExtension}`)
    });
  }

  return tasks;
}

module.exports = {
  convertVideoDirectory,
  convertVideo
};
