THREE.neonShader = {
	globals: {
		saturation: { type: 'f', value: url.number( 'saturation', 0.5 ) },
		sepia: { type: 'f', value: url.number( 'sepia', 0 ) },
		opacity: { type: 'f', value: url.number( 'opacity', 1 ) },
		neon: { type: 'f', value: url.number( 'neon', 0 ) }
	}
}

THREE.neonShader.loadTextFile = function( url ) {
	var result;
	var req = new XMLHttpRequest();
	req.onerror = function() {
		console.log( "Error: request error on " + url );
	};
	req.onload = function() {
		result = this.responseText;
	};
	req.open( "GET", url, false );
	req.send();
	return result;
};

THREE.neonShader.loadTextFileInject = function( url ) {
	var fileStr = THREE.neonShader.loadTextFile( url );
	var matches = fileStr.match( /#inject .+/g );
	if ( !matches ) return fileStr;
	for ( var i = 0; i < matches.length; i++ ) {
		var injectLine = matches[i];
		var injectUrl = injectLine.split( " " )[1];
		var injectFileStr = THREE.neonShader.loadTextFileInject( injectUrl );
		fileStr = fileStr.replace( injectLine, injectFileStr );
	}
	return fileStr;
};

THREE.neonShader.load = function( url ) {
	var src = THREE.neonShader.loadTextFileInject( url );
	var lines = src.match( /.+/g );
	var srcFormatted = '';
	for ( var i = 0; i < lines.length; i++ ) {
		var line = '"' + lines[i] + '",';
		srcFormatted += line;
		srcFormatted += '\r\n';
	}
	console.log( url, ':\n' );
	console.log( srcFormatted );
	return src;
}

THREE.neonShader._vert = [
	"varying vec2 vUv;",
	"varying vec4 mPosition;",
	"varying vec4 mvPosition;",
	"varying vec3 vColor;",
	"uniform float time;",
	"uniform float curvature;",
	"uniform float size;",
	"#ifndef USE_COLOR",
	"	uniform vec3 color;",
	"#endif",
	"float PI = 3.141592653589793;",
	"#ifdef USE_SKINNING",
	"	uniform mat4 bindMatrix;",
	"uniform mat4 bindMatrixInverse;",
	"#ifdef BONE_TEXTURE",
	"  uniform sampler2D boneTexture;",
	"  uniform int boneTextureSize;",
	"  mat4 getBoneMatrix( const in float i ) {",
	"    float j = i * 4.0;",
	"    float x = mod( j, float( boneTextureSize ) );",
	"    float y = floor( j / float( boneTextureSize ) );",
	"    float dx = 1.0 / float( boneTextureSize );",
	"    float dy = 1.0 / float( boneTextureSize );",
	"    y = dy * ( y + 0.5 );",
	"    vec4 v1 = texture2D( boneTexture, vec2( dx * ( x + 0.5 ), y ) );",
	"    vec4 v2 = texture2D( boneTexture, vec2( dx * ( x + 1.5 ), y ) );",
	"    vec4 v3 = texture2D( boneTexture, vec2( dx * ( x + 2.5 ), y ) );",
	"    vec4 v4 = texture2D( boneTexture, vec2( dx * ( x + 3.5 ), y ) );",
	"    mat4 bone = mat4( v1, v2, v3, v4 );",
	"    return bone;",
	"  }",
	"#else",
	"  uniform mat4 boneMatrices[ MAX_BONES ];",
	"  mat4 getBoneMatrix( const in float i ) {",
	"    mat4 bone = boneMatrices[ int(i) ];",
	"    return bone;",
	"  }",
	"#endif",
	"#endif",
	"#ifdef USE_INSTANCING",
	"	attribute vec3 instancedTranslation;",
	"	attribute vec3 instancedScale;",
	"#endif",
	"void main() {",
	"	vUv = uv;",
	"	vColor = color;",
	"	vec3 pos = vec3( position );",
	"	#ifdef USE_SKINNING",
	"		/* skinbase_vertex */",
	"mat4 boneMatX = getBoneMatrix( skinIndex.x );",
	"mat4 boneMatY = getBoneMatrix( skinIndex.y );",
	"mat4 boneMatZ = getBoneMatrix( skinIndex.z );",
	"mat4 boneMatW = getBoneMatrix( skinIndex.w );",
	"vec4 skinVertex = bindMatrix * vec4( position.xyz, 1.0 );",
	"vec4 skinned = vec4( 0.0 );",
	"skinned += boneMatX * skinVertex * skinWeight.x;",
	"skinned += boneMatY * skinVertex * skinWeight.y;",
	"skinned += boneMatZ * skinVertex * skinWeight.z;",
	"skinned += boneMatW * skinVertex * skinWeight.w;",
	"pos = ( bindMatrixInverse * skinned ).xyz;",
	"	#endif",
	"	#ifdef USE_GRASS",
	"		float pct = clamp( pos.y, 0.0, 1.0 );",
	"		float taper = sin( pow( pct, 0.5 ) * PI );",
	"		pos.x *= taper;",
	"		pos.z *= taper;",
	"	#endif",
	"	#ifdef USE_ROAD",
	"		float x = pos.x / size;",
	"		float y = pos.y / size;",
	"		float x2 = x * 2.0;",
	"		float y2 = y * 2.0;",
	"		float dist = curvature * sqrt( x2 * x2 + y2 * y2 );",
	"		pos.z = size * ( dist * dist ) / 2.0;",
	"	#endif",
	"	#ifdef USE_WAVE",
	"		vec4 t = projectionMatrix * vec4( 1.0 );",
	"		float osc = ( 1.0 + sin( time + PI * ( t.x + t.y + t.z ) / 3.0 ) ) / 2.0;",
	"		float sway = pow( pos.y, 2.0 ) * osc;",
	"		pos.x += sway / 100.0;",
	"	#endif",
	"	#ifdef USE_INSTANCING",
	"		pos *= instancedScale;",
	"		pos += instancedTranslation;",
	"	#endif",
	"	mPosition = modelMatrix * vec4( pos, 1.0 );",
	"	mvPosition = viewMatrix * mPosition;",
	"	gl_Position = projectionMatrix * mvPosition;",
	"}",
].join( '\n' );
// NOTE: Uncomment line below to use glsl shader source.
// THREE.neonShader._vert = THREE.neonShader.load( '../release/src/shaders/_vert.glsl' );

THREE.neonShader._frag = [
	"float PI = 3.141592653589793;",
	"uniform vec3 sepia;",
	"uniform vec3 fogColor;",
	"uniform float fogNear;",
	"uniform float fogFar;",
	"uniform float saturation;",
	"uniform float neon;",
	"uniform float time;",
	"uniform float size;",
	"uniform vec3 base;",
	"uniform vec3 top;",
	"uniform vec2 cursor;",
	"uniform vec2 clip;",
	"varying vec2 vUv;",
	"varying vec3 vColor;",
	"varying vec4 mPosition;",
	"varying vec4 mvPosition;",
	"/*",
	" * Description : Array and textureless GLSL 2D/3D/4D simplex noise functions.",
	" *      Author : Ian McEwan, Ashima Arts.",
	" *  Maintainer : ijm",
	" *     Lastmod : 20110822 (ijm)",
	" *     License : Copyright (C) 2011 Ashima Arts. All rights reserved.",
	" *               Distributed under the MIT License. See LICENSE file.",
	" *               https://github.com/ashima/webgl-noise",
	" */",
	"vec4 _mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }",
	"vec3 _mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }",
	"vec2 _mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }",
	"float _mod289(float x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }",
	"vec4 _permute(vec4 x) { return _mod289(((x*34.0)+1.0)*x); }",
	"vec3 _permute(vec3 x) { return _mod289(((x*34.0)+1.0)*x); }",
	"float _permute(float x) { return _mod289(((x*34.0)+1.0)*x); }",
	"vec4 _taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }",
	"float _taylorInvSqrt(float r) { return 1.79284291400159 - 0.85373472095314 * r; }",
	"vec4 _grad4(float j, vec4 ip) {",
	"  const vec4 ones = vec4(1.0, 1.0, 1.0, -1.0);",
	"  vec4 p,s;",
	"  p.xyz = floor( fract (vec3(j) * ip.xyz) * 7.0) * ip.z - 1.0;",
	"  p.w = 1.5 - dot(abs(p.xyz), ones.xyz);",
	"  s = vec4(lessThan(p, vec4(0.0)));",
	"  p.xyz = p.xyz + (s.xyz*2.0 - 1.0) * s.www;",
	"  return p;",
	"}",
	"/*",
	" * Implemented by Ian McEwan, Ashima Arts, and distributed under the MIT License.  {@link https://github.com/ashima/webgl-noise}",
	" */",
	"float snoise(vec2 v) {",
	"  const vec4 C = vec4(",
	"    0.211324865405187,",
	"    0.366025403784439,",
	"   -0.577350269189626,",
	"    0.024390243902439);",
	"  vec2 i  = floor(v + dot(v, C.yy) );",
	"  vec2 x0 = v -   i + dot(i, C.xx);",
	"  vec2 i1;",
	"  i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);",
	"  vec4 x12 = x0.xyxy + C.xxzz;",
	"  x12.xy -= i1;",
	"  i = _mod289(i);",
	"  vec3 p = _permute( _permute( i.y + vec3(0.0, i1.y, 1.0 )) + i.x + vec3(0.0, i1.x, 1.0 ));",
	"  vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);",
	"  m = m*m ;",
	"  m = m*m ;",
	"  vec3 x = 2.0 * fract(p * C.www) - 1.0;",
	"  vec3 h = abs(x) - 0.5;",
	"  vec3 ox = floor(x + 0.5);",
	"  vec3 a0 = x - ox;",
	"  m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );",
	"  vec3 g;",
	"  g.x  = a0.x  * x0.x  + h.x  * x0.y;",
	"  g.yz = a0.yz * x12.xz + h.yz * x12.yw;",
	"  return 130.0 * dot(m, g);",
	"}",
	"float snoise(vec3 v) {",
	"  const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;",
	"  const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);",
	"  vec3 i  = floor(v + dot(v, C.yyy) );",
	"  vec3 x0 =   v - i + dot(i, C.xxx) ;",
	"  vec3 g = step(x0.yzx, x0.xyz);",
	"  vec3 l = 1.0 - g;",
	"  vec3 i1 = min( g.xyz, l.zxy );",
	"  vec3 i2 = max( g.xyz, l.zxy );",
	"  vec3 x1 = x0 - i1 + C.xxx;",
	"  vec3 x2 = x0 - i2 + C.yyy;",
	"  vec3 x3 = x0 - D.yyy;",
	"  i = _mod289(i);",
	"  vec4 p = _permute( _permute( _permute(",
	"    i.z + vec4(0.0, i1.z, i2.z, 1.0 ))",
	"    + i.y + vec4(0.0, i1.y, i2.y, 1.0 ))",
	"    + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));",
	"  float n_ = 0.142857142857;",
	"  vec3  ns = n_ * D.wyz - D.xzx;",
	"  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);",
	"  vec4 x_ = floor(j * ns.z);",
	"  vec4 y_ = floor(j - 7.0 * x_ );",
	"  vec4 x = x_ *ns.x + ns.yyyy;",
	"  vec4 y = y_ *ns.x + ns.yyyy;",
	"  vec4 h = 1.0 - abs(x) - abs(y);",
	"  vec4 b0 = vec4( x.xy, y.xy );",
	"  vec4 b1 = vec4( x.zw, y.zw );",
	"  vec4 s0 = floor(b0)*2.0 + 1.0;",
	"  vec4 s1 = floor(b1)*2.0 + 1.0;",
	"  vec4 sh = -step(h, vec4(0.0));",
	"  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;",
	"  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;",
	"  vec3 p0 = vec3(a0.xy,h.x);",
	"  vec3 p1 = vec3(a0.zw,h.y);",
	"  vec3 p2 = vec3(a1.xy,h.z);",
	"  vec3 p3 = vec3(a1.zw,h.w);",
	"  vec4 norm = _taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));",
	"  p0 *= norm.x;",
	"  p1 *= norm.y;",
	"  p2 *= norm.z;",
	"  p3 *= norm.w;",
	"  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);",
	"  m = m * m;",
	"  return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3) ) );",
	"}",
	"vec3 snoiseVec3( vec3 x ) {",
	"  float s  = snoise(vec3( x ));",
	"  float s1 = snoise(vec3( x.y - 19.1 , x.z + 33.4 , x.x + 47.2 ));",
	"  float s2 = snoise(vec3( x.z + 74.2 , x.x - 124.5 , x.y + 99.4 ));",
	"  vec3 c = vec3( s , s1 , s2 );",
	"  return c;",
	"}",
	"vec3 curlNoise( vec3 p ) {",
	"  const float e = 1e-1;",
	"  vec3 dx = vec3( e   , 0.0 , 0.0 );",
	"  vec3 dy = vec3( 0.0 , e   , 0.0 );",
	"  vec3 dz = vec3( 0.0 , 0.0 , e   );",
	"  vec3 p_x0 = snoiseVec3( p - dx );",
	"  vec3 p_x1 = snoiseVec3( p + dx );",
	"  vec3 p_y0 = snoiseVec3( p - dy );",
	"  vec3 p_y1 = snoiseVec3( p + dy );",
	"  vec3 p_z0 = snoiseVec3( p - dz );",
	"  vec3 p_z1 = snoiseVec3( p + dz );",
	"  float x = p_y1.z - p_y0.z - p_z1.y + p_z0.y;",
	"  float y = p_z1.x - p_z0.x - p_x1.z + p_x0.z;",
	"  float z = p_x1.y - p_x0.y - p_y1.x + p_y0.x;",
	"  const float divisor = 1.0 / ( 2.0 * e );",
	"  return normalize( vec3( x , y , z ) * divisor );",
	"}",
	"vec3 neonFog( vec3 col ) {",
	"  float fogDepth = length( mPosition.xz );",
	"	float fogFactor = smoothstep( fogNear, fogFar, fogDepth );",
	"  return mix( col, fogColor, fogFactor );",
	"}",
	"float neonNoise( vec3 pos, float phase ) {",
	"  float noise = snoise( pos * 0.1 );",
	"  noise = max( 0.0, sin( noise * 16.0 + time * 0.0 ) + phase );",
	"  return noise;",
	"}",
	"vec3 neonColor( vec3 col ) {",
	"	vec3 p = mPosition.xyz + vec3( cursor.y, 0.0, cursor.x );",
	"  // p.y += time;",
	"  vec3 neonFactor = vec3(",
	"    neonNoise( p, 0.3 ),",
	"    neonNoise( p, 0.0 ),",
	"    neonNoise( p, -0.3 )",
	"  );",
	"	float fogDepth = length( mPosition.xz );",
	"	float fogFactor = smoothstep( fogNear, fogFar, fogDepth );",
	"  vec3 nCol = mix( mix( col, fogColor, fogFactor ), col, neonFactor );",
	"  nCol = clamp( nCol, fogColor, vec3( 1.0 ) );",
	"  return mix( col, nCol, neon );",
	"}",
	"#ifndef USE_COLOR",
	"	uniform vec3 color;",
	"#endif",
	"#ifdef USE_ROAD",
	"	uniform float subdivisions;",
	"uniform vec3 median;",
	"vec3 roadFunc() {",
	"	float threshold = 6.0 / size;",
	"  vec2 pos = vec2( cursor.x + vUv.x, - cursor.y + vUv.y );",
	"  pos = mod( subdivisions * pos, 1.0 );",
	"  vec2 isMedian = vec2( sin( pos * PI ) );",
	"  vec2 isIntersection = vec2( 1.0 - isMedian.y, 1.0 - isMedian.x );",
	"  isMedian = step( vec2( threshold ), isMedian );",
	"  isIntersection = step( vec2( 0.66 ), isIntersection );",
	"  float t = clamp( isMedian.x + isIntersection.x, 0.0, 1.0 );",
	"  vec3 layer = mix( median, color, t );",
	"  t = clamp( isMedian.y + isIntersection.y, 0.0, 1.0 );",
	"  layer = mix( median, layer, t );",
	"	return layer;",
	"}",
	"#endif",
	"void main() {",
	"	vec3 col = vColor;",
	"	#ifdef USE_GRASS",
	"		col = mix( base, top, abs( vUv.y ) );",
	"	#endif",
	"	#ifdef USE_ROAD",
	"		col = roadFunc();",
	"	#endif",
	"	#ifdef USE_FAKE_SHADOW",
	"		float dist = length( mPosition.xyz ) * .06;",
	"		dist = clamp( dist, 0.0, 1.0 );",
	"		float shadow = smoothstep( 0.09, 0.15, pow( dist, 0.5 ) );",
	"		col = mix( col * 0.75, col, shadow );",
	"	#endif",
	"	#ifdef USE_SKINNING",
	"		if ( mPosition.y < clip.x || mPosition.y > clip.y ) discard;",
	"	#endif",
	"	#ifdef USE_FOG",
	"		col = neonFog( col );",
	"	#endif",
	"	col = mix( col.rrr, col, saturation );",
	"  col = neonColor( col );",
	"  gl_FragColor = vec4( col, 1.0 );",
	"}",
].join( '\n' );
// NOTE: Uncomment line below to use glsl shader source.
// THREE.neonShader._frag = THREE.neonShader.load( '../release/src/shaders/_frag.glsl' );

THREE.neonShader._uniforms = {
	color: { type: 'c', value: new THREE.Color( 0xffffff ) },
	fogColor: { type: 'c', value: new THREE.Color( 0x000000 ) },
	fogNear: { type: 'f', value: 0 },
	fogFar: { type: 'f', value: 1 },
	neon: { type: 'f', value: 0 },
	time: { type: 'f', value: 0 },
	cursor: { type: "v2", value: new THREE.Vector2() },
	saturation: { type: 'f', value: 1 }
};

THREE.neonShader.basicShader = new THREE.ShaderMaterial( {
	fog: true,
	side: THREE.FrontSide,
	uniforms: THREE.UniformsUtils.clone( THREE.neonShader._uniforms ),
	vertexShader: THREE.neonShader._vert,
	fragmentShader: THREE.neonShader._frag
} );

THREE.neonShader.floorShader = THREE.neonShader.basicShader.clone();
THREE.neonShader.floorShader.setValues( {
	defines: {
		USE_FAKE_SHADOW: ''
	}
	// uniforms: THREE.UniformsUtils.merge( [
	// 	THREE.neonShader._uniforms, {
	// 		size: { type: 'f', value: 1 }
	// 	}
	// ] )
} );

THREE.neonShader.grassShader = THREE.neonShader.basicShader.clone();
THREE.neonShader.grassShader.setValues( {
	defines: {
		USE_GRASS: '',
		USE_INSTANCING: ''
	},
	uniforms: THREE.UniformsUtils.merge( [
		THREE.neonShader._uniforms, {
			size: { type: 'f', value: 1 },
			base: { type: 'c', value: new THREE.Color( 0xffffff ) },
			top: { type: 'c', value: new THREE.Color( 0x8cc63f ) },
		}
	] )
} );

THREE.neonShader.roadShader = THREE.neonShader.basicShader.clone();
THREE.neonShader.roadShader.setValues( {
	defines: {
		USE_ROAD: '',
		USE_FAKE_SHADOW: ''
	},
	uniforms: THREE.UniformsUtils.merge( [
		THREE.neonShader._uniforms, {
			subdivisions: { type: 'f', value: 32 },
			curvature: { type: 'f', value: 1 },
			size: { type: 'f', value: 1 },
			median: { type: 'c', value: new THREE.Color( 'red' ) }
		}
	] )
} );

THREE.neonShader.sepiaShader = new THREE.ShaderMaterial( {
	transparent: true,
	blending: THREE.SubtractiveBlending,
	fog: false,
	uniforms: {
		opacity: { type: 'f', value: 1 }
	},
	vertexShader: THREE.neonShader._vert,
	fragmentShader: [
		"uniform float opacity;",
		"float t;",
		"const vec3 b = vec3( 0.0, 69.0, 116.0 );",
		"const vec3 a = vec3( 89.0, 188.0, 255.0 );",
		"/*",
		"const vec3 a = vec3( 61.0, 44.0, 32.00 );",
		"const vec3 b = vec3( 79.0, 54.0, 33.0 );",
		"const vec3 c = vec3( 155.0, 121.0, 68.0 );",
		"const vec3 d = vec3( 208.0, 174.0, 111.0 );",
		"const vec3 e = vec3( 250.0, 244.0, 205.0 );",
		"*/",
		"varying vec2 vUv;",
		"float average ( vec3 v ) {",
		"    return ( v.x + v.y + v.z ) / 3.0;",
		"}",
		"void main () {",
		"    float reduction = 1.4;",
		"    float amount = 2.0;",
		"    float radius = length( vUv - 0.5 ) * reduction;",
		"    float magnitude = ( 1.0 - radius ) * ( amount - 1.0 );",
		"    float space = 255.0;",
		"    vec3 layer = a.xyz / space;",
		"    t = magnitude;",
		"    layer = mix( layer, b.xyz / space, clamp( t, 0.0, 1.0 ) );",
		"/*",
		"    t = magnitude - 1.0;",
		"    layer = mix( layer, c.xyz / space, clamp( t, 0.0, 1.0 ) );",
		"    t = magnitude - 2.0;",
		"    layer = mix( layer, d.xyz / space, clamp( t, 0.0, 1.0 ) );",
		"    t = magnitude - 3.0;",
		"    layer = mix( layer, e.xyz / space, clamp( t, 0.0, 1.0 ) );",
		"*/",
		"    gl_FragColor = vec4( layer * opacity, 1.0 );",
		"}",
	].join( '\n' ),
	// NOTE: Uncomment line below to use glsl shader source.
	// fragmentShader: THREE.neonShader.load( '../release/src/shaders/sepia.frag.glsl' ),
} );

THREE.neonShader.skinnedShader = THREE.neonShader.basicShader.clone();
THREE.neonShader.skinnedShader.setValues( {
	side: THREE.DoubleSide,
	vertexColors: true,
	skinning: true,
	fog: false,
	uniforms: THREE.UniformsUtils.merge( [
		THREE.neonShader._uniforms, {
			clip: { type: 'v2', value: new THREE.Vector2( -1e10, 1e10 ) }
		}
	] )
} );

THREE.neonShader.waveShader = THREE.neonShader.basicShader.clone();
THREE.neonShader.waveShader.defines = { USE_WAVE: '' };
THREE.neonShader.waveShader.vertexColors = true;

THREE.neonShader.backSided = THREE.neonShader.basicShader.clone();
THREE.neonShader.backSided.side = THREE.BackSide;

THREE.neonShader.vertexColoredDoubleSided = THREE.neonShader.basicShader.clone();
THREE.neonShader.vertexColoredDoubleSided.vertexColors = true;
THREE.neonShader.vertexColoredDoubleSided.defines = { USE_FAKE_SHADOW: '' };
THREE.neonShader.vertexColoredDoubleSided.side = THREE.DoubleSide;

THREE.neonShader.vertexColored = THREE.neonShader.basicShader.clone();
THREE.neonShader.vertexColored.vertexColors = true;
THREE.neonShader.vertexColored.defines = { USE_FAKE_SHADOW: '' };

THREE.neonShader.doubleSided = THREE.neonShader.roadShader.clone();
THREE.neonShader.doubleSided.side = THREE.DoubleSide;

for ( var i in THREE.neonShader  ) {
	if ( THREE.neonShader[i] instanceof THREE.ShaderMaterial ) {
		for ( var j in THREE.neonShader.globals ) {
			THREE.neonShader[i].uniforms[j] = THREE.neonShader.globals[j];
		}
	}
}
