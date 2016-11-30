(function() {

  var HALF_PI = Math.PI / 2;
  var TWO_PI = Math.PI * 2;

  var root = this;
  var previousForest = root.Forest || {};

  var Forest = root.Forest = function(s) {

    var size = s || 1024;

    THREE.Group.call(this);

    this.floor = new Forest.Floor();
    this.floor.scale.set(size / TWO_PI, size / TWO_PI, size * 0.125);
    this.add(this.floor);

  };

  Forest.prototype = Object.create(THREE.Group.prototype);
  Forest.prototype.constructor = Forest;

  Forest.prototype.addTo = function(scene) {

    scene.add(this);
    return this;

  };

  Forest.prototype.update = function(step) {

    var displace = Forest.Floor.DisplacementAlgorithm;
    var cx, cy, y1, y2;

    cx = this.floor.material.uniforms.cursor.value.x;
    cy = this.floor.material.uniforms.cursor.value.y;

    y1 = displace(cx) * displace(cy);

    this.floor.material.uniforms.cursor.value.add(step);

    cx = this.floor.material.uniforms.cursor.value.x;
    cy = this.floor.material.uniforms.cursor.value.y;

    y2 = displace(cx) * displace(cy);

    this.floor.material.uniforms.cursor.theta = Math.atan2(y2 - y1, step.length());

    return this;

  };

})();
