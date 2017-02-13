# Under Neon Lights
A WebVR interactive music video only on Within. With music by The Chemical Brothers.

## Environment

There are three main resources for this project:
+ [/release](./release/): The current build for the project
+ [/editor](./editor): A WYSIWYG timeline editor for the project
+ [/asset-viewer](./asset-viewer/): A WYSIWYG model viewer for the project

These folders all require you run a local server on your computer. A good cross-platform way to get that started is by installing [Node.js](https://nodejs.org/en/), opening up a command line prompt, and typing `npm install -g http-server`. Once you have that, point your command line to this project's root directory and type `http-server`. This will create a local server at `http://localhost:8080`. The following instructions will use this local server's details as the example.

Below are more details for each of the pages and how to use them.

### /release
[http://localhost:8080/release/](http://localhost:8080/release/) is the most current place to see our current build of the project.

### /editor
[http://localhost:8080/editor/](http://localhost:8080/editor/) gives you an empty viewport to see and manipulate how we're choreographing Neon Lights. Once this is open in your web browser go to `File > New` to make a blank project. Then drag `/release/neon-lights.json` over the window to load timeline data to the project. Similar to video editing software you can hit the spacebar to play and pause the video with some additional controls to see how animations are laid out.

### /asset-viewer
[http://localhost:8080/asset-viewer/](http://localhost:8080/asset-viewer/) gives you an empty viewport to see and manipulate 3D models. It's open to any model, but it's really meant for vertex color FBX's with animations — the basis of Neon Lights' assets. Once open click `Add > Ambient Light` from the file menu. Next disable (uncheck) `autosave` in the upper-right hand corner. Now, drag any FBX file over the window and it should load with any animations running. N.B: for the asset viewer we only run the first animation. Please ask Jono or Ricardo if your model has more than one animation and we can figure out quick way to support that.

For further questions ask in our [Slack Channel](https://with-in.slack.com/archives/neon-lights).
