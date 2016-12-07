(function() {

  var root = this;
  var previousCameraAngles = root.CameraAngles || {};

  var CameraAngles = root.CameraAngles = function() {

    Array.call(this);

    for (var i = 0; i < arguments.length; i++) {
      this.add(arguments[i]);
    }

  };

  CameraAngles.prototype = Object.create(Array.prototype);
  CameraAngles.constructor = CameraAngles;

  CameraAngles.prototype.index = 0;
  CameraAngles.prototype.aspect = 1;

  CameraAngles.prototype.add = function(el) {

    this.index = this.length;
    this.push(el);
    return this;

  };

  CameraAngles.prototype.next = function() {

    var index = this.index;
    this.index = (index + 1) % this.length;
    return this[index];

  };

  Object.defineProperty(CameraAngles.prototype, 'aspect', {

    get: function() {
      return this._aspect;
    },

    set: function(aspect) {

      this._aspect = aspect;

      for (var i = 0; i < this.length; i++) {
        var camera = this[i];
        camera.aspect = aspect;
        camera.updateProjectionMatrix();
      }

    }

  });

})();
