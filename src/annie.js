(function() {

  var root = this;
  var TWO_PI = Math.PI * 2;
  var euler = new THREE.Euler(0, 0, 0, 'YXZ');

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

    var condition = !navigator.getVRDisplays;

    this.ghost = new THREE.Object3D();
    this.ghost.rotation.previous = new THREE.Euler();

    this.heading = new THREE.Vector2();
    this.controls = new THREE[condition ? 'DeviceOrientationControls' : 'VRControls'](this.ghost);

    this.ghost.theta = 0;
    this.rotation.order = this.ghost.rotation.order = 'YXZ';

  };

  Annie.prototype = Object.create(THREE.Group.prototype);
  Annie.prototype.constructor = Annie;

  Annie.Drag = 0.125;

  Annie.Geometry = new THREE.CylinderGeometry(0, 1, 3, 16);
  Annie.Material = new THREE.MeshBasicMaterial({
    color: 0xffffff
  });

  Annie.prototype.headingNeedsUpdate = true;
  Annie.prototype._step = 0.02;
  Annie.prototype.step = Annie.prototype._step;

  Annie.prototype.update = function() {

    this.controls.update();

    euler.x = this.ghost.rotation.x - this.ghost.rotation.previous.x;
    euler.y = this.ghost.rotation.y - this.ghost.rotation.previous.y;
    euler.z = this.ghost.rotation.z - this.ghost.rotation.previous.z;

    var theta = mod(this.ghost.rotation.y, TWO_PI);

    this._step += (this.step - this._step) * Annie.Drag;

    this.rotation.y = theta;

    this.heading.set(
      - this._step * Math.sin(theta),
      this._step * Math.cos(theta)
    );

    this.ghost.rotation.previous.copy(this.ghost.rotation);

    return this;

  };

  function mod(v, l) {
    while (v < l) {
      v += l;
    }
    return v % l;
  }

})();
