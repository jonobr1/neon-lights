(function() {

  var HALF_PI = Math.PI / 2;
  var TWO_PI = Math.PI * 2;

  var root = this;
  var previousForest = root.Forest || {};

  var Forest = root.Forest = function(s) {

    var size = s || 1024;

    THREE.Group.call(this);

    this.floor = new Floor();
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

    this.floor.material.uniforms.cursor.value.add(step);
    return this;

  };

  var Floor = Forest.Floor = function() {

    var geometry = Floor.Geometry;
    var material = Floor.Material;

    THREE.Mesh.call(this, geometry, material);

    this.rotation.x = - Math.PI / 2;

  };

  Floor.prototype = Object.create(THREE.Mesh.prototype);
  Floor.prototype.constructor = Floor;

  Floor.DisplacementAlgorithm = function() {
    return (Math.sin(x) + Math.sin(2.2 * x + 5.52) + Math.sin(2.9 * x + 0.93)
      + Math.sin(4.6 * x + 8.94)) / 4.0;
  };

  Floor.Geometry = new THREE.PlaneBufferGeometry(TWO_PI, TWO_PI, 128, 128);
  Floor.Material = new THREE.ShaderMaterial({

    uniforms: {

      color: { type: 'c', value: new THREE.Color(0x8cc63f) },
      fog: { type: 'c', value: new THREE.Color(0x000000) },
      cursor: { type: 'v2', value: new THREE.Vector2() }

    },

    vertexShader: [

      ['const float TWO_PI = ', TWO_PI, ';'].join(''),
      ['const float PI = ', Math.PI, ';'].join(''),
      ['const float HALF_PI = ', HALF_PI, ';'].join(''),

      'uniform vec2 cursor;',

      'varying vec2 vUv;',

      'float displace(float x) {',
        Floor.DisplacementAlgorithm.toString()
          .replace(/[\n\r]/ig, '')
          .replace(/\s+/ig, ' ')
          .replace(/Math.sin/ig, 'sin')
          .replace(/^.*(return\s.*)\s\}$/, '$1'),
      '}',

      'void main() {',

        'vUv = uv;',
        'vec3 pos = vec3( position );',

        'vec2 origin = vec2( 0.0, 0.0 );',
        'vec2 p = vec2( pos.x, pos.y ) / TWO_PI;',
        'float d = distance( origin, p );',

        'pos.z = displace( pos.x + cursor.x ) * displace( pos.y + cursor.y );',
        'pos.z -= displace( cursor.x ) * displace( cursor.y );',

        'gl_Position = projectionMatrix * modelViewMatrix * vec4( pos, 1.0 );',

      '}'

    ].join('\n'),

    fragmentShader: [

      'uniform vec3 color;',
      'uniform vec3 fog;',
      'uniform vec2 cursor;',

      'varying vec2 vUv;',

      'void main() {',

        'vec2 origin = vec2( 0.5, 0.5 );',
        'float t = 1.0 - 2.0 * distance( vUv, origin );',

        'vec3 c = mix( fog, color, t );',
        'gl_FragColor = vec4( c, 1.0 );',

      '}'

    ].join('\n')

  });

})();