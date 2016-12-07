(function() {

  var DEBUG = url.boolean('debug', false);

  var renderer = new THREE.WebGLRenderer({ antialias: true });
  var scene = new THREE.Scene();
  var cameras = new CameraAngles(
    new THREE.PerspectiveCamera(), new THREE.PerspectiveCamera());

  var annie = new Annie();
  var forest = new Forest();

  var timeline = window.timeline = new Equalizer.Timeline();

  var sound = new Sound('assets/audio/03 Under Neon Lights.mp3', function() {

    xhr.get('./assets/json/03 Under Neon Lights 16.json', function(resp) {
      var data = JSON.parse(resp);
      timeline.analyze(sound, data);
      setup();
    });

  });

  function setup() {

    cameras.add(annie.camera);

    scene.add(annie);
    scene.add(forest);

    cameras[0].position.z = 1024;
    cameras[0].position.y = 500;
    cameras[0].lookAt(forest.position);

    cameras[1].position.y = 1024 * 1.5;
    cameras[1].lookAt(forest.position);

    document.body.appendChild(renderer.domElement);

    if (DEBUG) {

      timeline.container = document.createElement('div');
      timeline.container.classList.add('timeline');

      Equalizer.Utils.extend(timeline.container.style, {
        position: 'absolute',
        top: 20 + 'px',
        left: 20 + 'px',
        paddingTop: 10 + 'px',
        background: Equalizer.Colors.white
      });

      timeline.appendTo(timeline.container, true);
      document.body.appendChild(timeline.container);

    }

    Two.Utils.extend(renderer.domElement.style, {
      display: 'block',
      position: 'absolute',
      top: 0,
      left: 0
    });

    window.addEventListener('resize', resize, false);
    resize();

    renderer.domElement.addEventListener('click', function() {
      cameras.next();
    }, false);

    loop();

  }

  function loop() {

    var track, unit;

    requestAnimationFrame(loop);

    if (DEBUG) {
      timeline.update();
    } else {
      // TODO: Update timeline track data based on current time...
    }

    annie.update();
    forest.update(annie.heading);

    var theta = forest.cursor.theta;

    track = timeline.tracks[0];

    annie.step = sound.playing
      ? (track.isOn(sound.currentTime) ? 0.05 : 0.005)
      : 0;

    annie.rotation.x = theta * 0.2;
    annie.cone.rotation.x = theta * 0.5 + Math.PI / 2;

    renderer.render(scene, cameras[cameras.index]);

  }

  function resize() {

    var width = window.innerWidth;
    var height = window.innerHeight;

    renderer.setSize(width, height);
    cameras.aspect = width / height;

  }

})();
