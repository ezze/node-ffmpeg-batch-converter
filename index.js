const path = require('path');
const fs = require('fs-extra');
const execa = require('execa');

async function convertVideoDirectory(inputDirectoryPath, outputDirectoryPath, options = {}) {
  console.log(`Converting directory "${inputDirectoryPath}"...`);
  const { recursive = false, inputExtension: inputExtensions = [], ffmpegArgs } = options;
  let { outputExtension } = options;

  inputExtensions.forEach((inputExtension, i) => {
    if (!inputExtension.startsWith('.')) {
      inputExtensions[i] = `.${inputExtension}`;
    }
  });
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
        await convertVideoDirectory(itemPath, path.resolve(outputDirectoryPath, itemName), options);
      }
      continue;
    }

    let baseName = '';
    for (let j = 0; j < inputExtensions.length; j++) {
      const inputExtension = inputExtensions[i];
      baseName = path.basename(itemName, inputExtension);
      if (baseName.length < itemName.length) {
        break;
      }
    }
    if (!baseName) {
      continue;
    }

    tasks.push({
      inputFilePath: itemPath,
      outputFilePath: path.resolve(outputDirectoryPath, `${baseName}${outputExtension}`)
    });
  }

  const outputDirectoryStat = await fs.stat(outputDirectoryPath);
  if (!outputDirectoryStat.isDirectory()) {
    await fs.ensureDir(outputDirectoryPath);
  }

  for (let i = 0; i < tasks.length; i++) {
    const task = tasks[i];
    const { inputFilePath, outputFilePath } = task;
    if (inputFilePath === outputFilePath) {
      console.warn('Input and output files\' paths are the same, skipping...');
      continue;
    }
    await convertVideo(inputFilePath, outputFilePath, { ffmpegArgs });
  }
}

async function convertVideo(inputFilePath, outputFilePath, options = {}) {
  const { ffmpegArgs } = options;
  console.log(`Converting video "${inputFilePath}" to "${outputFilePath}"...`);
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

module.exports = {
  convertVideoDirectory,
  convertVideo
};
