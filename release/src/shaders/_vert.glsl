varying vec2 vUv;
varying vec4 mPosition;
varying vec4 mvPosition;
varying vec3 vColor;

uniform float time;
uniform float curvature;
uniform float size;

#ifndef USE_COLOR
	uniform vec3 color;
#endif

float PI = 3.141592653589793;

#ifdef USE_SKINNING
	#inject ../release/src/shaders/chunks/SkinningParsVertex.glsl
#endif

void main() {

	vUv = uv;

	vColor = color;

	vec3 pos = vec3( position );

	#ifdef USE_SKINNING
		#inject ../release/src/shaders/chunks/SkinningVertex.glsl
	#endif

	#ifdef USE_GRASS
		float pct = clamp( pos.y, 0.0, 1.0 );
		float taper = sin( pow( pct, 0.5 ) * PI );
		pos.x *= taper;
		pos.z *= taper;
	#endif

	#ifdef USE_ROAD
		float x = pos.x / size;
		float y = pos.y / size;
		float x2 = x * 2.0;
		float y2 = y * 2.0;
		float dist = curvature * sqrt( x2 * x2 + y2 * y2 );
		pos.z = size * ( dist * dist ) / 2.0;
	#endif

	#ifdef USE_WAVE
		vec4 t = projectionMatrix * vec4( 1.0 );
		float osc = ( 1.0 + sin( time + PI * ( t.x + t.y + t.z ) / 3.0 ) ) / 2.0;
		float sway = pow( pos.y, 2.0 ) * osc;
		pos.x += sway / 100.0;
	#endif

	mPosition = modelMatrix * vec4( pos, 1.0 );
	mvPosition = viewMatrix * mPosition;
	gl_Position = projectionMatrix * mvPosition;

}
