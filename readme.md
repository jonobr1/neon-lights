# Under Neon Lights
A WebVR interactive music video only on Within. With music by Cheimcal Brothers.

## Development Instructions

### Overview

1. Download and install Git (Windows Only)
2. Download and install Node.js and `npm` on your computer
3. Clone this project
4. Go to your project in a CLI and run `npm install -g http-server`
5. Remotely sync with s3 bucket for assets
6. Go to your project in a CLI and run `http-server`
7. Go to `localhost:8080/` in a web browser

### Expanded

1. Install Git (Windows Only) by clicking [here](https://git-for-windows.github.io/) and follow the instructions
  __Make sure you install Git Bash when prompted in the instructions__
2. Install Node.js by clicking [here](https://nodejs.org/en/) and follow the instructions
  __"Recommended For Most Users"__ Download link should suffice
3. Clone the Neon Lights Github project
  1. Open up a Command-Line Interface (CLI)
    + On Mac open up the *Terminal* application
    + On Windows open up the *Git Bash* application
  2. Select a directory you'd like to place this project.
    __I like to put things in `~/Documents` for Mac or `/c/Documents` for Windows__
  3. Go to this in your Command-Line Interface
    This is done by opening the CLI and running `cd some-path` and hitting enter
  4. Clone the project by pasting: `git clone https://github.com/within-unlimited/neon-lights.git` into the CLI and hitting enter
4. Now run `npm install -g http-server` to install the local web server
5. Sync with s3 bucket
  1. Download the project assets by clicking [here](http://media-dev.vrse.com/NEON_LIGHTS/assets/assets.zip)
  2. Unzip file
  3. Place at the root of the Neon Lights project
6. Go to your project in a CLI and run `http-server`
7. Go to `localhost:8080/` in a web browser
  + For use with HTC Vive or Oculus Rift please download the specified version of Chrome from: https://webvr.info/get-chrome/
    Don't forget to follow the instructions! e.g: Enable WebVR and Gamepad Flags
8. _Extra:_ For web developers that want to edit sass
  1. Make sure Ruby is installed
  2. `gem install bourbon`
  3. `gem install sass`
  3. `cd neon-lights/styles`
  4. `bourbon install`
  5. `sass --watch .`

Once setup initially only steps 6 and 7 need to be run.