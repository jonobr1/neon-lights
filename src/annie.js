(function() {

  var root = this;
  var TWO_PI = Math.PI * 2;

  var Annie = root.Annie = function() {

    var geometry = Annie.Geometry;
    var material = Annie.Material;

    THREE.Group.call(this);

    var cone = new THREE.Mesh(geometry, material);
    cone.rotation.x = Math.PI / 2;
    cone.rotation.z = Math.PI;
    cone.position.y += 20;

    cone.scale.set(2, 2, 2);
    this.add(cone);

    this.heading = new THREE.Vector2();

    this.camera = new THREE.PerspectiveCamera(75);
    this.camera.position.z = 40;
    this.camera.position.y += 40;
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
  Annie.prototype.step = 0.005;

  Annie.prototype.update = function() {

    if (this.headingNeedsUpdate) {

      var theta = mod(this.rotation.y, TWO_PI);

      this.heading.set(
        - this.step * Math.sin(theta),
        this.step * Math.cos(theta)
      );

      this.headingNeedsUpdate = false;

    }

    return this;

  };

  function mod(v, l) {
    while (v < l) {
      v += l;
    }
    return v % l;
  }

})();