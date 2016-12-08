window.NeonLights = (function() {

  var DEBUG = url.boolean('debug', false);

  var $elems = new Elements({
    play: document.createElement('div')
  }).appendTo(document.body);

  var renderer = new THREE.WebGLRenderer({ antialias: true });
  var scene = new THREE.Scene();
  var cameras = new CameraAngles(
    new THREE.PerspectiveCamera(),
    new THREE.PerspectiveCamera());

  var annie = new Annie();
  var forest = new Forest();

  Equalizer.Resolution = 16;
  var timeline = new Equalizer.Timeline();

  var isLocal = /localhost/i.test(window.location.href)
  var root = isLocal ? './assets' : '//player-dev.cabrilleros.com/NEON_LIGHTS/assets';

  var sound = new Sound(root + '/audio/03 Under Neon Lights.mp3', function() {

    xhr.get(root + '/json/03 Under Neon Lights ' + Equalizer.Resolution + '.json', function(resp) {
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

    // if (has.mobile || navigator.getVRDisplays) {
    //   annie.controls.connect();
    // }

    window.addEventListener('resize', resize, false);
    resize();

    // Elements.onTap(renderer.domElement, function() {
    //   cameras.next();
    // });

    renderer.effect = renderer;

    renderer.render(scene, cameras[cameras.index]);
    $elems.content.classList.add('loaded');

  }

  function play() {

    if (sound.playing) {
      return;
    }

    requestStereo();

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

    var track, unit, currentTime = sound.currentTime;

    if (renderer.effect.requestAnimationFrame) {
      renderer.effect.requestAnimationFrame(loop);
    } else {
      requestAnimationFrame(loop);
    }

    if (DEBUG) {
      timeline.update();
    } else {
      // TODO: Update timeline track data based on current time...
      // Maybe not necessary?
    }

    // annie.update();
    forest.update(annie.heading);

    var theta = forest.cursor.theta;

    track = timeline.tracks[2];

    // annie.step = sound.playing
    //   ? (track.isOn(currentTime) ? 0.08 : 0.02)
    //   : 0;
    annie.step = 0;

    track = timeline.tracks[6];

    forest.speed.destination = sound.playing
      ? (track.isOn(currentTime) ? 3 : 1)
      : 1;

    annie.rotation.x = theta * 0.2;
    annie.cone.rotation.x = theta * 0.5 + Math.PI / 2;

    // renderer.effect.render(scene, annie.camera);
    renderer.render(scene, annie.camera);

  }

  function resize() {

    var width = window.innerWidth;
    var height = window.innerHeight;

    renderer.setSize(width, height);
    if (renderer.effect && renderer.effect.setSize) {
      renderer.effect.setSize(width, height);
    }

    renderer.width = width;
    renderer.height = height;

    cameras.aspect = width / height;

  }

  function requestStereo() {

    if (has.mobile && has.Android) {
      screenfull.request(renderer.domElement);
    }

    if (has.iOS || !navigator.getVRDisplays && !has.mobile) {
      return;
    }

    renderer.effect = new THREE[!navigator.getVRDisplays ? 'StereoEffect' : 'VREffect'](renderer);

    if (renderer.effect instanceof THREE.VREffect) {
      renderer.effect.setFullScreen(true);
    } else {
      resize();
    }

  }

  return {
    cameras: cameras,
    forest: forest,
    timeline: timeline
  };

})();
