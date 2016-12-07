window.NeonLights = (function() {

  var DEBUG = url.boolean('debug', false);

  var $elems = new Elements({
    play: document.createElement('div')
  }).appendTo(document.body);

  var renderer = new THREE.WebGLRenderer({ antialias: true });
  var scene = new THREE.Scene();
  var cameras = new CameraAngles(
    new THREE.PerspectiveCamera(), new THREE.PerspectiveCamera());

  var annie = new Annie();
  var forest = new Forest();

  var timeline = new Equalizer.Timeline();

  var isLocal = /localhost/i.test(window.location.href)
  var root = isLocal ? './assets' : '//player-dev.cabrilleros.com/NEON_LIGHTS/assets';

  var sound = new Sound(root + '/audio/03 Under Neon Lights.mp3', function() {

    xhr.get(root + '/json/03 Under Neon Lights 16.json', function(resp) {
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

    $elems.append(renderer.domElement);

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
      $elems.append(timeline.container);

    }

    $elems.forEach(function(elem, property) {
      if (elem.isContainer) {
        return;
      }
      elem.classList.add(property);
      $elems.append(elem);
    });

    $elems.play.addEventListener('click', play, false);

    Two.Utils.extend(renderer.domElement.style, {
      display: 'block',
      position: 'absolute',
      top: 0,
      left: 0
    });

    if (has.mobile) {
      this.controls.connect();
    }

    window.addEventListener('resize', resize, false);
    resize();

    renderer.domElement.addEventListener('touchend', function() {
      cameras.next();
    }, false);
    renderer.domElement.addEventListener('click', function() {
      cameras.next();
    }, false);

    renderer.render(scene, cameras[cameras.index]);
    $elems.content.classList.add('loaded');

  }

  function play() {
    if (sound.playing) {
      return;
    }
    $elems.play.classList.add('hidden');
    sound.play();
    if (!loop.init) {
      loop();
      loop.init = true;
    }
  }

  function pause() {
    sound.pause();
  }

  function loop() {

    var track, unit;

    requestAnimationFrame(loop);

    if (DEBUG) {
      timeline.update();
    } else {
      // TODO: Update timeline track data based on current time...
      // Maybe not necessary?
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

  return {
    cameras: cameras,
    forest: forest,
    timeline: timeline
  }

})();
