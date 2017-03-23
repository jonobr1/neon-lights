/**
 * @author mrdoob / http://mrdoob.com/
 */

var FRAME = ( function () {

	var dom = null;
	var player = null;

	var resources = {};

	return {

		VERSION: 3,

		getDOM: function () {

			return dom;

		},

		setDOM: function ( value ) {

			dom = value;

		},

		addResource: function ( name, resource ) {

			resources[ name ] = resource;

		},

		getResource: function ( name ) {

			return resources[ name ];

		},

		//

		Player: function () {

			var audio = null;

			var isPlaying = false;

			var currentTime = 0;
			var playbackRate = 1;

			var loop = null;

			return {
				get isPlaying() {
					return isPlaying;
				},
				get currentTime() {
					if ( audio ) return audio.currentTime;
					return currentTime;
				},
				set currentTime( value ) {
					if ( audio ) audio.currentTime = value;
					currentTime = value;
				},
				get playbackRate() {
					if ( audio ) return audio.playbackRate;
					return playbackRate;
				},
				set playbackRate( value ) {
					playbackRate = value;
					if ( audio ) audio.playbackRate = value;
				},
				getAudio: function () {
					return audio;
				},
				setAudio: function ( value ) {
					if ( audio ) audio.pause();
					if ( value ) {
						value.currentTime = currentTime;
						if ( isPlaying ) value.play();
					}
					audio = value;
				},
				setLoop: function ( value ) {
					loop = value;
				},
				play: function () {
					if ( audio ) audio.play();
					isPlaying = true;
				},
				pause: function () {
					if ( audio ) audio.pause();
					isPlaying = false;
				},
				tick: function ( delta ) {
					if ( audio ) {
						currentTime = audio.currentTime;
					} else if ( isPlaying ) {
						currentTime += ( delta / 1000 ) * playbackRate;
					}
					if ( loop ) {
						if ( currentTime > loop[ 1 ] ) currentTime = loop[ 0 ];
					}
				}

			}

		},

		//

		/*
		Curves: {

			Linear: function ( points ) {

				function linear( p0, p1, t0, t1, t ) {

					return ( p1 - p0 ) * ( ( t - t0 ) / ( t1 - t0 ) ) + p0;

				}

				this.points = points;
				this.value = 0;

				this.update = function ( time ) {

					if ( time <= points[ 0 ] ) {

						this.value = points[ 1 ];

					} else if ( time >= points[ points.length - 2 ] ) {

						this.value = points[ points.length - 1 ];

					} else {

						for ( var i = 0, l = points.length; i < l; i += 2 ) {

							if ( time < points[ i + 2 ] ) {

								this.value = linear( points[ i + 1 ], points[ i + 3 ], points[ i ], points[ i + 2 ], time );
								break;

							}

						}

					}

				};

			},

			Sin: function () {

				var frequency = 10;

				this.value = 0;

				this.update = function ( time ) {

					this.value = Math.sin( time * frequency );

				};

			},

			Saw: function ( frequency, offset, min, max ) {

				var delta = max - min;

				this.frequency = frequency;
				this.offset = offset;
				this.min = min;
				this.max = max;
				this.value = 0;

				this.update = function ( time ) {

					this.value = ( ( ( time - offset ) % frequency ) / frequency ) * delta + min;

				};

			}

		},
		*/

		Parameters: {

			Boolean: function ( name, value ) {
				this.name = name;
				this.value = value !== undefined ? value : true;
			},

			Color: function ( name, value ) {
				this.name = name;
				this.value = value !== undefined ? value : 0xffffff;
			},

			Float: function ( name, value, min, max ) {
				this.name = name;
				this.value = value || 0.0;
				this.min = min !== undefined ? min : - Infinity;
				this.max = max !== undefined ? max : Infinity;
			},

			Integer: function ( name, value, min, max ) {
				this.name = name;
				this.value = value || 0;
				this.min = min !== undefined ? min : - Infinity;
				this.max = max !== undefined ? max : Infinity;
			},

			String: function ( name, value ) {
				this.name = name;
				this.value = value !== undefined ? value : '';
			},

			Vector2: function ( name, value ) {
				this.name = name;
				this.value = value !== undefined ? value : [ 0, 0 ];
			},

			Vector3: function ( name, value ) {
				this.name = name;
				this.value = value !== undefined ? value : [ 0, 0, 0 ];
			}

		},

		Effect: function ( name, source ) {

			this.name = name;
			this.source = source || 'var parameters = {\n\tvalue: new FRAME.Parameters.Float( \'Value\', 1.0 )\n};\n\n// function init(){}\n\nfunction start(){}\n\nfunction end(){}\n\nfunction update( progress ){}';
			this.program = null;
			this.compile = function ( player ) {

				this.program = ( new Function( 'player, parameters, init, start, end, update', this.source + '\nreturn { parameters: parameters, init: init, start: start, end: end, update: update };' ) )( player );

			};

		},

		Animation: function () {

			var id = 0;

			return function ( name, start, end, layer, effect, enabled ) {

				if ( enabled === undefined ) enabled = true; // TODO remove this

				this.id = id ++;
				this.name = name;
				this.start = start;
				this.end = end;
				this.layer = layer;
				this.effect = effect;
				this.enabled = enabled;

			};

		}(),

		Timeline: function () {

			var effects = [];

			var animations = [];
			var curves = [];

			var active = [];

			var next = 0, prevtime = 0;

			function layerSort( a, b ) { return a.layer - b.layer; }
			function startSort( a, b ) { return a.start === b.start ? layerSort( a, b ) : a.start - b.start; }

			function loadFile( url, onLoad ) {

				var request = new XMLHttpRequest();
				request.open( 'GET', url, true );
				request.addEventListener( 'load', function ( event ) {

					onLoad( event.target.response );

				} );
				request.send( null );

			}

			return {

				animations: animations,
				curves: curves,

				load: function ( url, onLoad ) {

					var scope = this;

					loadFile( url, function ( text ) {

						scope.parse( JSON.parse( text ), onLoad );

					} );

				},

				parse: function ( json, onLoad ) {

					function loadLibraries( libraries, onLoad ) {

						var count = 0;

						function loadNext() {

							if ( count === libraries.length ) {

								onLoad();
								return;

							}

							var url = libraries[ count ++ ];

							loadFile( url, function ( content ) {

								var script = document.createElement( 'script' );
								script.id = 'library-' + count;
								script.textContent = '( function () { ' + content + '} )()';
								document.head.appendChild( script );

								loadNext();

							} );

						}

						loadNext();

					}

					var scope = this;

					var libraries = json.libraries || [];

					loadLibraries( libraries, function () {

						for ( var i = 0; i < json.includes.length; i ++ ) {

							var data = json.includes[ i ];
							var source = data[ 1 ];

							if ( Array.isArray( source ) ) source = source.join( '\n' );

							var script = document.createElement( 'script' );
							script.id = 'library-' + i;
							script.textContent = '( function () { ' + source + '} )()';
							document.head.appendChild( script );

						}

						// Effects

						for ( var i = 0; i < json.effects.length; i ++ ) {

							var data = json.effects[ i ];

							var name = data[ 0 ];
							var source = data[ 1 ];

							if ( Array.isArray( source ) ) source = source.join( '\n' );

							effects.push( new FRAME.Effect( name, source ) );

						}

						for ( var i = 0; i < json.animations.length; i ++ ) {

							var data = json.animations[ i ];

							var animation = new FRAME.Animation(
								data[ 0 ],
								data[ 1 ],
								data[ 2 ],
								data[ 3 ],
								effects[ data[ 4 ] ],
								data[ 5 ]
							);

							animations.push( animation );

						}

						scope.sort();

						if ( onLoad ) onLoad();

					} );

				},

				add: function ( animation ) {

					animations.push( animation );
					this.sort();

				},

				remove: function ( animation ) {

					var i = animations.indexOf( animation );

					if ( i !== -1 ) {

						animations.splice( i, 1 );

					}

				},

				sort: function () {

					animations.sort( startSort );

				},

				update: function ( time ) {

					if ( prevtime > time ) {

						this.reset();

					}

					var animation;

					// add to active

					while ( animations[ next ] ) {

						animation = animations[ next ];

						if ( animation.enabled ) {

							if ( animation.start > time ) break;

							if ( animation.end > time ) {

								if ( animation.effect.program.start ) {

									animation.effect.program.start();

								}

								active.push( animation );

							}

						}

						next ++;

					}

					// remove from active

					var i = 0;

					while ( active[ i ] ) {

						animation = active[ i ];

						if ( animation.start > time || animation.end < time ) {

							if ( animation.effect.program.end ) {

								animation.effect.program.end();

							}

							active.splice( i, 1 );

							continue;

						}

						i ++;

					}

					/*
					// update curves

					for ( i = 0, l = curves.length; i < l; i ++ ) {

						curves[ i ].update( time, time - prevtime );

					}
					*/

					// render

					active.sort( layerSort );

					for ( i = 0, l = active.length; i < l; i ++ ) {

						animation = active[ i ];
						animation.effect.program.update( ( time - animation.start ) / ( animation.end - animation.start ), time - prevtime );

					}

					prevtime = time;

				},

				reset: function () {

					while ( active.length ) {

						var animation = active.pop();
						var program = animation.effect.program;

						if ( program.end ) program.end();

					}

					next = 0;

				}

			};

		}

	};

} )();
