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

    var condition = !navigator.getVRDisplays;

    this.controls = new THREE[condition ? 'DeviceOrientationControls' : 'VRControls'](this);
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

    var theta = mod(this.rotation.y, TWO_PI);

    this._step += (this.step - this._step) * Annie.Drag;

    this.heading.set(
      - this._step * Math.sin(theta),
      this._step * Math.cos(theta)
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
