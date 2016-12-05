(function() {

  var Grass = Forest.Grass = function(cursor, stage, wind) {

    Grass.Instances.push(this);

    var geometry = Grass.Geometry;
    var material = Grass.Instances.length <= 1
      ? Grass.Material : Grass.Material.clone();

    THREE.Mesh.call(this, geometry, material);

    this.material.uniforms.stage.value = stage;
    this.material.uniforms.cursor.value = cursor;
    this.material.uniforms.wind.value = wind;

    this.material.uniforms.origin.value.set(
      Math.random() - 0.5,
      Math.random() - 0.5
    );
    this.material.uniforms.size.value = Math.random() * 150 + 10;

  };

  Grass.prototype = Object.create(THREE.Mesh.prototype);
  Grass.prototype.constructor = Grass;

  Grass.Instances = [];

  Grass.Geometry = new THREE.CylinderBufferGeometry(0.1, 0.1, 1, 16, 16, true);
  Grass.Material = new THREE.ShaderMaterial({

    // wireframe: true,

    uniforms: {

      stage: { type: 'v2', value: new THREE.Vector2(Forest.defaultSize, Forest.defaultSize) },
      cursor: { type: 'v3', value: new THREE.Vector3() },
      wind: { type: 'v3', value: new THREE.Vector3(1, 0, 1) },

      size: { type: 'f', value: 10 },
      origin: { type: 'vec2', value: new THREE.Vector2() }, // Math.random() - 0.5


      top: { type: 'c', value: new THREE.Color(0x8cc63f) },
      bottom: { type: 'c', value: new THREE.Color(0xffffff) },
      fog: { type: 'c', value: new THREE.Color(0x000000) }

    },

    vertexShader: [

      ['const float TWO_PI = ', Math.PI * 2, ';'].join(''),
      ['const float PI = ', Math.PI, ';'].join(''),

      'uniform vec2 stage;',
      'uniform vec3 cursor;',
      'uniform vec3 wind;',

      'uniform float size;',
      'uniform vec2 origin;',

      'varying vec2 vUv;',
      'varying vec2 placement;',

      'float displace(float x) {',
        Forest.DisplacementAlgorithm.toString()
          .replace(/[\n\r]/ig, '')
          .replace(/\s+/ig, ' ')
          .replace(/Math.sin/ig, 'sin')
          .replace(/^.*(return\s.*)\s\}$/, '$1'),
      '}',

      'void main() {',

        'vUv = uv;',

        'vec3 pos = vec3( position );',
        'float y = pos.y + 0.5;',
        'float pct = y;',
        'float taper = sin( pow( pct, 0.5 ) * PI );',

        'pos.x *= taper;',
        'pos.z *= taper;',

        'vec3 p = vec3( 0.0 );',
        'p.x = mod( origin.x - cursor.x / TWO_PI + 0.5, 1.0 ) - 0.5;',
        'p.z = mod( origin.y - cursor.y / TWO_PI + 0.5, 1.0 ) - 0.5;',

        'p.y = displace( p.x * TWO_PI + cursor.x ) * displace( p.z * TWO_PI + cursor.y );',
        'p.y -= displace( cursor.x ) * displace( cursor.y );',

        'placement = vec2( p.xz );',
        // 'float proximity = pow( 1.0 - distance( vec2( 0.0 ), placement ), 24.0 );',

        'float time = TWO_PI * cursor.z * ( size / 100.0 + 1.0 );',
        'float osc = ( 1.0 + sin( time + ( origin.x + origin.y ) * TWO_PI ) ) / 2.0;',
        // 'float osc = sin( time + ( origin.x + origin.y ) * TWO_PI );',
        'float sway = wind.z * pow( pct, 2.0 ) * osc / size;',

        'pos.x += wind.x * sway;',
        'pos.y += 0.4;',
        'pos.z += wind.y * sway;',

        'p.xz *= stage;',
        'p.y *= 0.125 * ( stage.x + stage.y ) / 2.0;',

        'pos *= size;',

        'pos.x += p.x;',
        'pos.y += p.y;',
        'pos.z -= p.z;',

        'gl_Position = projectionMatrix * modelViewMatrix * vec4( pos, 1.0 );',

      '}'

    ].join('\n'),

    fragmentShader: [

      'uniform vec3 top;',
      'uniform vec3 bottom;',
      'uniform vec3 fog;',

      'varying vec2 vUv;',
      'varying vec2 placement;',

      'void main() {',

        'vec2 origin = vec2( 0.0 );',

        'vec3 layer = mix( bottom, top, 1.0 - pow( 1.0 - vUv.y, 3.0 ) );',
        'float t = 1.0 - 2.0 * distance( placement, origin );',
        'layer = mix( fog, layer, t);',

        'gl_FragColor = vec4( layer, 1.0 );',

      '}'

    ].join('\n')

  });

})();
