(function() {

  var root = this;
  var TWO_PI = Math.PI * 2;

  var Annie = root.Annie = function() {

    var geometry = Annie.Geometry;
    var material = Annie.Material;

    THREE.Group.call(this);

    var cone = this.cone = new THREE.Mesh(geometry, material);
    cone.rotation.x = Math.PI / 2;
    cone.rotation.z = Math.PI;
    cone.position.y += 20;

    cone.outline = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({
      transparent: true,
      color: 'white',
      depthTest: false,
      depthWrite: false,
      opacity: 0.33
    }));

    cone.add(cone.outline);
    cone.scale.set(5, 5, 5);
    this.add(cone);

    this.controls = new THREE.DeviceOrientationControls(this);
    this.heading = new THREE.Vector2();

    this.camera = new THREE.PerspectiveCamera(75);
    this.camera.position.z = 100;
    this.camera.position.y += this.camera.position.z * 0.75;
    this.camera.lookAt(cone.position);
    this.add(this.camera);

    this.rotation.order = 'YXZ';

  };

  Annie.prototype = Object.create(THREE.Group.prototype);
  Annie.prototype.constructor = Annie;

  Annie.Geometry = new THREE.CylinderGeometry(0, 1, 3, 16);
  Annie.Material = new THREE.MeshBasicMaterial({
    color: 0xffffff
  });

  Annie.prototype.headingNeedsUpdate = true;
  Annie.prototype._step = 0.005;

  Object.defineProperty(Annie.prototype, 'step', {

    enumerable: true,

    get: function() {
      return this._step;
    },

    set: function(v) {
      if (v === this._step) {
        return;
      }
      this._step = v;
      this.headingNeedsUpdate = true;
    }

  });

  Annie.prototype.update = function() {

    this.controls.update();

    var theta = mod(this.rotation.y, TWO_PI);

    this.heading.set(
      - this.step * Math.sin(theta),
      this.step * Math.cos(theta)
    );

    return this;

  };

  function mod(v, l) {
    while (v < l) {
      v += l;
    }
    return v % l;
  }

})();
