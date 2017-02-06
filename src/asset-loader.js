(function() {

  var renderer = new THREE.WebGLRenderer({ antialias: true });
  var scene = new THREE.Scene();
  var cameras = new CameraAngles(new THREE.PerspectiveCamera());

  var isLocal = /localhost/i.test(window.location.href);
  var root = isLocal ? '/assets' : '//player-dev.cabrilleros.com/NEON_LIGHTS/assets';
  var filetype = url.filetype || 'obj';
  var path = [root, '/models', '/', url.filename, '.', filetype].join('');

  var loaders = {
    obj: new THREE.OBJLoader(),
    fbx: new THREE.FBXLoader()
  };

  var controls = new THREE.OrbitControls(cameras.current);

  loaders[filetype].load(path, function(object) {
    scene.add(object);
    setup();
  });

  function setup() {

    document.body.appendChild(renderer.domElement);
    renderer.domElement.style.position = 'absolute';
    renderer.domElement.style.top = 0;
    renderer.domElement.style.left = 0;

    cameras.current.position.z = 5;
    cameras.current.position.y = 2.5;
    cameras.current.lookAt(new THREE.Vector3());

    var light = new THREE.PointLight();
    cameras.current.add(light);
    scene.add(cameras.current);

    window.addEventListener('resize', resize, false);
    resize();
    loop();

  }

  function resize() {

    var width = window.innerWidth;
    var height = window.innerHeight;

    renderer.setSize(width, height);
    for (var i = 0; i < cameras.length; i++) {
      var camera = cameras[i];
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    }

  }

  function loop() {

    requestAnimationFrame(loop);

    controls.update();

    for (var i = 0; i < scene.children.length; i++) {
      var child = scene.children[i];
      child.rotation.y += 0.01;
    }

    renderer.render(scene, cameras.current);

  }

})();