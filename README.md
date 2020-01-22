# node-ffmpeg-batch-converter

Node.js script for batch video conversions with ffmpeg

## Usage

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
