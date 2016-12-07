(function() {

  var HALF_PI = Math.PI / 2;
  var TWO_PI = Math.PI * 2;

  var root = this;
  var previousForest = root.Forest || {};

  var Forest = root.Forest = function(s) {

    var size = s || Forest.defaultSize;

    THREE.Group.call(this);

    this.stage = new THREE.Vector2(size, size);
    this.cursor = new THREE.Vector3();
    this.wind = new THREE.Vector3(
      2 * Math.random() - 1, 2 * Math.random() - 1,
      10 * Math.random() + 5);

    this.floor = new Forest.Floor(this.cursor, this.stage);
    this.add(this.floor);

    for (var i = 0; i < 512; i++) {
      var Mesh = Forest.Meshes[Math.floor(Math.random() * Forest.Meshes.length)];
      var mesh = new Mesh(this.cursor, this.stage, this.wind);

      mesh.material.uniforms.origin.value.set(
        Math.random() - 0.5,
        Math.random() - 0.5
      );
      mesh.material.uniforms.size.value = Math.random() * 150 + 10;

      this.add(mesh);
    }

    this._then = Date.now();

  };

  Forest.prototype = Object.create(THREE.Group.prototype);
  Forest.prototype.constructor = Forest;

  Forest.defaultSize = 1024;

  Forest.DisplacementAlgorithm = function(x) {
    return (Math.sin(x) + Math.sin(2.2 * x + 5.52) + Math.sin(2.9 * x + 0.93)
      + Math.sin(4.6 * x + 8.94)) / 4.0;
  };

  Forest.Meshes = [];

  Forest.register = function(func) {

    Forest.Meshes.push(func);
    return Forest;

  };

  Forest.prototype.addTo = function(scene) {

    scene.add(this);
    return this;

  };

  Forest.prototype.update = function(step) {

    var displace = Forest.DisplacementAlgorithm;
    var cx, cy, y1, y2;
    var now = Date.now();

    cx = this.cursor.x;
    cy = this.cursor.y;

    y1 = displace(cx) * displace(cy);

    this.cursor.x += step.x;
    this.cursor.y += step.y;
    this.cursor.z += (now - this._then) / 1000;

    this._then = now;

    cx = this.cursor.x;
    cy = this.cursor.y;

    y2 = displace(cx) * displace(cy);

    this.cursor.theta = Math.atan2(y2 - y1, step.length());

    return this;

  };

})();
