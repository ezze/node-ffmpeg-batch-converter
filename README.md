# node-ffmpeg-batch-converter

Node.js script for batch video conversions with [ffmpeg](https://www.ffmpeg.org/).

## Installation

1. Install `ffmpeg` first:

    - Ubuntu
    
        ```bash
        $ sudo apt install ffmpeg
        ```

2. Install this package globally:

    ```bash
    $ npm install -g ffmpeg-batch-converter
    ```

3. Convert video files:

    ```bash
    $ ffmpeg-batch-converter --input /path/to/input/directory --input-extension avi --output-extension mkv
    ```

## Examples

- Convert `avi` files to `mkv`:

    ```bash
    $ ffmpeg-batch-converter --input /path/to/input/directory --input-extension avi --output-extension mkv
    ```
  
- Convert files recursively:

    ```bash
    $ ffmpeg-batch-converter --input /path/to/input/directory --input-extension avi --output-extension mkv --recursive
    ```
  
- Convert files to another output directory:

    ```bash
    $ ffmpeg-batch-converter --input /path/to/input/directory --input-extension avi --output-extension mkv --output /path/to/output/directory
    ```
  
- Convert files naming output files by their modification date:

    ```bash
    $ ffmpeg-batch-converter --input /path/to/input/directory --input-extension avi --output-extension mkv --output-naming date
    ```
  
- Convert few input directories at once:

    ```bash
    $ ffmpeg-batch-converter --input /path/to/input/directory1 /path/to/input/directory2 --input-extension avi --output-extension mkv
    ```
  
- Provide additional [ffmpeg options](https://www.ffmpeg.org/ffmpeg.html).

    ```bash
    $ ffmpeg-batch-converter --input /path/to/input/directory --input-extension avi --output-extension mkv --ffmpeg-args="-r 25 -b:v 6000k -b:a 192k"
    ```

- Display conversions without actually doing them:

    ```bash
    $ ffmpeg-batch-converter --input /path/to/input/directory --input-extension avi --output-extension mkv --dry
    ```
