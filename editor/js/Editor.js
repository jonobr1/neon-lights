/**
 * @author mrdoob / http://mrdoob.com/
 */

var Editor = function () {

	var Signal = signals.Signal;

	this.signals = {

		editorCleared: new Signal(),

		// includes

		includeAdded: new Signal(),
		includeSelected: new Signal(),
		includeChanged: new Signal(),
		includeMoved: new Signal(),
		includeRemoved: new Signal(),

		// effects

		effectRemoved: new Signal(),
		effectSelected: new Signal(),
		effectCompiled: new Signal(),

		// actions

		fullscreen: new Signal(),
		exportState: new Signal(),

		// animations

		animationAdded: new Signal(),
		animationModified: new Signal(),
		animationRemoved: new Signal(),
		animationSelected: new Signal(),

		// curves

		curveAdded: new Signal(),

		// events

		playingChanged: new Signal(),
		durationChanged: new Signal(),
		playbackRateChanged: new Signal(),
		timeChanged: new Signal(),
		timelineScaled: new Signal()

	};

	this.audio = null;
	this.config = new Config( 'framejs-editor' );

	this.isPlaying = false;
	this.currentTime = 0;

	this.includes = [];
	this.effects = [];
	this.timeline = new FRAME.Timeline();

	this.selected = null;

	// signals

	var scope = this;

	this.signals.animationModified.add( function () {

		scope.timeline.reset();
		scope.timeline.sort();
		scope.timeline.update( scope.currentTime );

	} );

	this.signals.effectCompiled.add( function () {

		scope.timeline.update( scope.currentTime );

	} );

	this.signals.timeChanged.add( function () {

		scope.timeline.update( scope.currentTime );

	} );

	// Animate

	var prevTime = 0;

	function animate() {

		if ( scope.audio !== null ) {

			if ( scope.isPlaying ) {

				scope.signals.timeChanged.dispatch( scope.currentTime );

			}

		} else {

			var currentTime = performance.now();

			if ( scope.isPlaying ) {

				scope.setTime( scope.currentTime + ( currentTime - prevTime ) / 1000 );

			}

			prevTime = currentTime;

		}

		requestAnimationFrame( animate );

	}

	animate();

};

Editor.prototype = {

	play: function () {

		if ( this.audio !== null ) {

			this.audio.play();

		}

		this.isPlaying = true;
		this.signals.playingChanged.dispatch( true );

	},

	stop: function () {

		if ( this.audio !== null ) {

			this.audio.pause();

		}

		this.isPlaying = false;
		this.signals.playingChanged.dispatch( false );

	},

	speedUp: function () {

		if ( this.audio !== null ) {

			this.audio.playbackRate += 0.1;
			this.signals.playbackRateChanged.dispatch( this.audio.playbackRate );

		}

	},

	speedDown: function () {

		if ( this.audio !== null ) {

			this.audio.playbackRate -= 0.1;
			this.signals.playbackRateChanged.dispatch( this.audio.playbackRate );

		}

	},

	setTime: function ( time ) {

		// location.hash = time;

		if ( this.audio !== null ) {

			this.audio.currentTime = Math.max( 0, time );

		}

		this.currentTime = Math.max( 0, time );
		this.signals.timeChanged.dispatch( this.currentTime );

	},

	//

	setAudio: function ( audio ) {

		this.audio = audio;

		var scope = this;

		audio.addEventListener( 'durationchange', function () {

			scope.signals.durationChanged.dispatch( audio.duration );

		}, false );

	},

	// includes

	addInclude: function ( include ) {

		var script = document.createElement( 'script' );
		script.textContent = include[ 1 ];
		document.head.appendChild( script );

		this.includes.push( include );
		this.signals.includeAdded.dispatch( include );

	},

	selectInclude: function ( include ) {

		this.signals.includeSelected.dispatch( include );

	},

	moveInclude: function ( include, index ) {

		var i = this.includes.indexOf( include );

		if ( index !== - 1 ) {

			this.includes.splice( i, 1 );
			this.includes.splice( index, 0, include );
			this.signals.includeMoved.dispatch( include );

		}

	},

	removeInclude: function ( include ) {

		var index = this.includes.indexOf( include );

		if ( index !== - 1 ) {

			this.includes.splice( index, 1 );
			this.signals.includeRemoved.dispatch( include );

		}

	},

	// effects

	addEffect: function ( effect ) {

		this.effects.push( effect );

	},

	selectEffect: function ( effect ) {

		this.signals.effectSelected.dispatch( effect );

	},

	removeEffect: function ( effect ) {

		var index = this.effects.indexOf( effect );

		if ( index >= 0 ) {

			this.effects.splice( index, 1 );
			this.signals.effectRemoved.dispatch( effect );

		}

	},

	// Remove any effects that are not bound to any animations.

	cleanEffects: function () {

		var scope = this;
		var effects = this.effects.slice(0);
		var animations = this.timeline.animations;

		effects.forEach( function ( effect, i ) {

			var bound = false;

			for ( var j = 0; j < animations.length; j++ ) {

				var animation = animations[ j ];

				if ( animation.effect === effect ) {

					bound = true;
					break;

				}

			}

			if ( !bound ) {

				scope.removeEffect( effect );

			}

		} );

	},

	// animations

	addAnimation: function ( animation ) {

		this.timeline.add( animation );
		this.signals.animationAdded.dispatch( animation );

	},

	removeAnimation: function ( animation ) {

		this.timeline.remove( animation );
		this.signals.animationRemoved.dispatch( animation );

	},

	addCurve: function ( curve ) {

		this.timeline.curves.push( curve );
		this.signals.curveAdded.dispatch( curve );

	},

	select: function ( animation ) {

		if ( this.selected === animation ) return;

		this.selected = animation;
		this.signals.animationSelected.dispatch( animation );

	},

	clear: function () {

		this.includes = [];
		this.effects = [];

		while ( this.timeline.animations.length > 0 ) {

			this.removeAnimation( this.timeline.animations[ 0 ] );

		}

		this.signals.editorCleared.dispatch();

	},

	fromJSON: function ( json ) {

		var includes = json.includes;

		for ( var i = 0, l = includes.length; i < l; i ++ ) {

			this.addInclude( includes[ i ] );

		}

		var effects = json.effects;

		for ( var i = 0, l = effects.length; i < l; i ++ ) {

			var data = effects[ i ];

			this.addEffect( new FRAME.Effect( data[ 0 ], data[ 1 ] ) );

		}

		var animations = json.animations;

		for ( var i = 0, l = animations.length; i < l; i ++ ) {

			var data = animations[ i ];

			var animation = new FRAME.Animation(
				data[ 0 ],
				data[ 1 ],
				data[ 2 ],
				data[ 3 ],
				this.effects[ data[ 4 ] ]
			);

			this.addAnimation( animation );

		}

		this.setTime( 0 );

	},

	toJSON: function () {

		var json = {
			"config": {},
			"includes": this.includes.slice(),
			"effects": [],
			// "curves": [],
			"animations": []
		};

		/*
		// curves

		var curves = editor.timeline.curves;

		for ( var i = 0, l = curves.length; i < l; i ++ ) {

			var curve = curves[ i ];

			if ( curve instanceof FRAME.Curves.Linear ) {

				json.curves.push( [ 'linear', curve.points ] );

			}

		}
		*/

		// effects

		var effects = editor.effects;

		for ( var i = 0, l = effects.length; i < l; i ++ ) {

			var effect = effects[ i ];

			json.effects.push( [
				effect.name,
				effect.source
			] );

		}

		// animations

		var animations = editor.timeline.animations;

		for ( var i = 0, l = animations.length; i < l; i ++ ) {

			var animation = animations[ i ];
			var effect = animation.effect;

			/*
			var parameters = {};

			for ( var key in module.parameters ) {

				parameters[ key ] = module.parameters[ key ].value;

			}
			*/

			json.animations.push( [
				animation.name,
				animation.start,
				animation.end,
				animation.layer,
				editor.effects.indexOf( animation.effect )
			] );

		}

		return json;

	}

};
