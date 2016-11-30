(function() {

  var TWO_PI = Math.PI * 2;
  var HALF_PI = Math.PI / 2;

  var two = new Two({
    type: Two.Types.canvas,
    width: 512,
    height: 512,
    overdraw: true,
    ratio: 1
  });

  var Grass = Forest.Grass = function() {

    var geometry = Grass.Geometry;
    var material = Grass.Material.clone();

    THREE.Mesh.call(this, geometry, material);

    this.material.uniforms.map.value = new THREE.Texture(two.renderer.domElement);

    Grass.updateTexture(this);

  };

  var amount = 16;

  Grass.Geometry = new THREE.PlaneBufferGeometry(amount, 1, amount * 6, 3);
  Grass.Material = new THREE.ShaderMaterial({

    // side: THREE.DoubleSide,
    transparent: true,
    // wireframe: true,

    uniforms: {

      cursor: { type: 'v2', value: new THREE.Vector2() },
      time: { type: 'f', value: 0 },
      variance: { type: 'f', value: 3 },
      amplitude: { type: 'f', value: 16 },
      billboard: { type: 'v2', value: new THREE.Vector2(amount, 1) },
      resolution: { type: 'v2', value: new THREE.Vector2(amount * 6, 3) },
      map: { type: 't', value: null },
      color: { type: 'c', value: new THREE.Color(0x8cc63f) }

    },

    vertexShader: [

      ['const float TWO_PI = ', TWO_PI, ';'].join(''),
      ['const float PI = ', Math.PI, ';'].join(''),
      ['const float HALF_PI = ', HALF_PI, ';'].join(''),

      'uniform vec2 cursor;',

      'uniform float time;',
      'uniform float variance;',
      'uniform float amplitude;',
      'uniform vec2 billboard;',

      'varying vec2 vUv;',

      'float displace(float x) {',
        Forest.Floor.DisplacementAlgorithm.toString()
          .replace(/[\n\r]/ig, '')
          .replace(/\s+/ig, ' ')
          .replace(/Math.sin/ig, 'sin')
          .replace(/^.*(return\s.*)\s\}$/, '$1'),
      '}',

      'void main() {',

        'vUv = uv;',

        'vec3 pos = vec3( position );',

        'float index = floor( pos.x + billboard.x / 2.0 );',
        'float pct = index / billboard.x;',
        'float sway = ( pos.y + billboard.y / 2.0 );',
        'float t = time + index * variance;',

        'pos.x -= billboard.x * ( pct - 0.5 ) + 0.5 - 0.5 / billboard.x;',
        'pos.x += pow( sway, 2.0 ) * sin( t ) / amplitude;',

        'float theta = pct * TWO_PI;',
        'float r = PI / 4.0;',  // From forest-floor.js

        'vec3 placement = vec3( r * cos( theta ), 0.0, r * sin( theta ) );',
        // 'placement.y = displace( placement.x + cursor.x ) * displace( placement.y + cursor.y );',
        // 'placement.y += displace( cursor.x ) * displace( cursor.y );',

        // 'pos += placement;',

        'gl_Position = projectionMatrix * modelViewMatrix * vec4( pos, 1.0 );',

      '}'

    ].join('\n'),

    fragmentShader: [

      'uniform vec2 billboard;',
      'uniform vec2 resolution;',
      'uniform sampler2D map;',
      'uniform vec3 color;',

      'varying vec2 vUv;',

      'void main() {',

        'float index = floor( vUv.x * billboard.x );',
        'vec2 uv = vec2( mod( vUv.x * billboard.x, 1.0 ), vUv.y );',

        'float limit = 1.0 / ( resolution.x / billboard.x );',
        'if ( uv.x >= 1.0 - limit || uv.x <= 0.01 ) {',
          'gl_FragColor = vec4( 0.0, 0.0, 0.0, 0.0 );',
          'return;',
        '}',

        'vec4 texel = texture2D( map, uv );',
        'float t = ( texel.r + texel.g + texel.b ) / 3.0;',
        'vec3 c = mix( color, pow( color, vec3( 4.0 ) ), vUv.y );',

        'c.r *= index;',

        'gl_FragColor = vec4( mix( texel, vec4( c, 1.0 ), t ) );',

      '}'

    ].join('\n')
  });

  Grass.updateTexture = function(grass) {

    two.renderer.ctx.clearRect(
      0, 0, two.renderer.domElement.width, two.renderer.domElement.height);

    var amount = Math.floor(Math.random() * 8) + 8;
    var range = Two.Utils.range(16);
    var trail = new Two.Trail(Two.Utils.map(range, function(i) {
      return new Two.Vector();
    }));

    trail.curved = true;
    trail.closed = true;
    trail.noStroke();

    two.add(trail);

    for (var i = 0; i < amount; i++) {

      var points = trail.destinations;
      var step = Math.floor(
        Math.sqrt(Math.random()) * two.height / points.length// (points.length - 3)
      );
      var phi = Math.random() * Math.PI / 4;

      for (var j = 0; j < points.length; j++) {

        var pct = j / (points.length - 1);
        var p = points[j - 1];
        var theta = pct * phi - Math.PI / 2;

        var x = 0;
        var y = 0;

        if (p) {
          x = step * Math.cos(theta) + p.x;
          y = step * Math.sin(theta) + p.y;
        }

        points[j].set(x, y);

      }

      trail.distance = (0.5 * Math.random() + 0.2) * step * 2;

      var seed = Math.floor(200 * Math.random() + 55);
      trail.fill = 'rgb('
        + seed + ','
        + seed + ','
        + seed + ')';

      trail.update();

      var rect = trail.getBoundingClientRect(true);
      var limit = grass.material.uniforms.resolution.value.x / grass.material.uniforms.billboard.value.x;

      var ox = Math.random() * (two.width * ((limit - 1) / limit) - rect.width);
      var oy = two.height + step;

      ox += trail.distance;
      trail.translation.set(ox, oy);


      two.update();

    }

    grass.material.uniforms.map.value.needsUpdate = true;

    trail.remove();
    Two.Utils.release(trail);

  };

  Grass.prototype = Object.create(THREE.Mesh.prototype);
  Grass.prototype.constructor = Grass;

})();
