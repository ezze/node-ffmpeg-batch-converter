#!/usr/bin/env node
const yargs = require('yargs');
const { convertVideoDirectory } = require('..');

const onError = e => console.error(e);

yargs
  .wrap(null)
  .usage('Usage: $0 <command> [options]')
  .strict(true)
  .command('*', 'Watch and process incoming data files', yargs => {
    return yargs
      .option('input', {
        describe: 'Path to input directories',
        type: 'array',
        required: true
      })
      .option('input-extension', {
        describe: 'Extensions to filter input files by',
        type: 'array'
      })
      .option('output', {
        describe: 'Path to output directory',
        type: 'string'
      })
      .option('output-extension', {
        describe: 'Desired output extension',
        type: 'string',
        required: true
      })
      .option('recursive', {
        describe: 'Process input directories recursively',
        type: 'boolean'
      })
      .option('ffmpeg-args', {
        describe: 'Additional ffmpeg arguments',
        type: 'string'
      })
      .version(false);
  }, async options => {
    try {
      const { input, output, ...restOptions } = options;
      for (let i = 0; i < input.length; i++) {
        const inputDirectoryPath = input[i];
        const outputDirectoryPath = output ? output : inputDirectoryPath;
        await convertVideoDirectory(inputDirectoryPath, outputDirectoryPath, restOptions);
      }
    }
    catch (e) {
      onError(e);
    }
  })
  .help('help', 'Show help')
  .demandCommand()
  .parse();
