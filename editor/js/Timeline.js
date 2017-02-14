var Timeline = function ( editor ) {

	var signals = editor.signals;

	var container = new UI.Panel();
	container.setId( 'timeline' );

	var panel = new UI.Panel();
	panel.setPosition( 'absolute' );
	panel.setWidth( '300px' );
	panel.setHeight( '100%' );
	panel.dom.style.background = '#555';
	container.add( panel );

	// controls

	/*
	var buttons = new UI.Div();
	buttons.setPosition( 'absolute' );
	buttons.setTop( '5px' );
	buttons.setRight( '5px' );
	controls.add( buttons );

	var button = new UI.Button();
	button.setLabel( 'ANIMATIONS' );
	button.onClick( function () {

		elements.setDisplay( '' );
		curves.setDisplay( 'none' );

	 } );
	buttons.add( button );

	var button = new UI.Button();
	button.setLabel( 'CURVES' );
	button.setMarginLeft( '4px' );
	button.onClick( function () {

		scroller.style.background = '';

		elements.setDisplay( 'none' );
		curves.setDisplay( '' );

	} );
	buttons.add( button );
	*/

	// timeline

	var keysDown = {};
	document.addEventListener( 'keydown', function ( event ) { keysDown[ event.keyCode ] = true; } );
	document.addEventListener( 'keyup',   function ( event ) { keysDown[ event.keyCode ] = false; } );

	var scale = 32;
	var prevScale = scale;
	var duration = 60;

	var timeline = new UI.Panel();
	timeline.setPosition( 'absolute' );
	timeline.setTop( '0px' );
	timeline.setBottom( '0px' );
	timeline.setWidth( '100%' );
	timeline.setOverflow( 'hidden' );
	timeline.dom.addEventListener( 'mousewheel', function ( event ) {

		// check if [shift] is pressed

		if ( keysDown[ 16 ] === true ) {

			event.preventDefault();

			scale = Math.min( 120, Math.max( 2, scale + ( event.wheelDeltaY / 10 ) ) );

			signals.timelineScaled.dispatch( scale );

		}

	} );
	container.add( timeline );

	var canvas = document.createElement( 'canvas' );
	canvas.height = 32;
	canvas.style.position = 'absolute';
	canvas.addEventListener( 'mousedown', function ( event ) {

		event.preventDefault();

		var onMouseDownClientX = event.clientX;
		var onMouseDownOffsetX = event.offsetX;

		function onMouseMove( event ) {

			var mouseX = onMouseDownOffsetX + ( event.clientX - onMouseDownClientX ) + scroller.scrollLeft;

			editor.setTime( mouseX / scale );

		}

		function onMouseUp( event ) {

			onMouseMove( event );

			document.removeEventListener( 'mousemove', onMouseMove );
			document.removeEventListener( 'mouseup', onMouseUp );

		}

		document.addEventListener( 'mousemove', onMouseMove, false );
		document.addEventListener( 'mouseup', onMouseUp, false );

	}, false );
	timeline.dom.appendChild( canvas );

	function updateMarks() {

		canvas.width = duration * scale;

		var context = canvas.getContext( '2d' );

		context.strokeStyle = '#888';
		context.beginPath();

		var scale4 = scale / 4;

		for ( var i = 0.5, l = canvas.width; i <= l; i += scale ) {

			context.moveTo( i + ( scale4 * 0 ), 18 ); context.lineTo( i + ( scale4 * 0 ), 26 );
			context.moveTo( i + ( scale4 * 1 ), 22 ); context.lineTo( i + ( scale4 * 1 ), 26 );
			context.moveTo( i + ( scale4 * 2 ), 22 ); context.lineTo( i + ( scale4 * 2 ), 26 );
			context.moveTo( i + ( scale4 * 3 ), 22 ); context.lineTo( i + ( scale4 * 3 ), 26 );


		}

		context.stroke();

		context.font = '10px Arial';
		context.fillStyle = '#888'
		context.textAlign = 'center';

		for ( var i = scale, l = canvas.width; i <= l; i += scale ) {

			var j = i / scale;

			var minute = Math.floor( j / 60 );
			var second = Math.floor( j % 60 );

			var text = ( minute > 0 ? minute + ':' : '' ) + ( '0' + second ).slice( - 2 );

			context.fillText( text, i, 13 );

		}

	}

	var scroller = document.createElement( 'div' );
	scroller.style.position = 'absolute';
	scroller.style.top = '32px';
	scroller.style.bottom = '0px';
	scroller.style.width = '100%';
	scroller.style.overflow = 'auto';
	scroller.addEventListener( 'scroll', function ( event ) {

		canvas.style.left = ( - scroller.scrollLeft ) + 'px';
		updateTimeMark();

	}, false );
	timeline.dom.appendChild( scroller );

	var elements = new Timeline.Animations( editor );
	scroller.appendChild( elements.dom );

	/*
	var curves = new Timeline.Curves( editor );
	curves.setDisplay( 'none' );
	scroller.appendChild( curves.dom );
	*/

	function updateContainers() {

		var width = duration * scale;

		elements.setWidth( width + 'px' );
		// curves.setWidth( width + 'px' );

	}

	updateContainers();

	//

	var timeMark = document.createElement( 'div' );
	timeMark.style.position = 'absolute';
	timeMark.style.top = '0px';
	timeMark.style.left = '-8px';
	timeMark.style.width = '16px';
	timeMark.style.height = '100%';
	timeMark.style.background = 'url(' + ( function () {

		var canvas = document.createElement( 'canvas' );
		canvas.width = 16;
		canvas.height = 1;

		var context = canvas.getContext( '2d' );
		context.fillStyle = '#f00';
		context.fillRect( 8, 0, 1, 1 );

		return canvas.toDataURL();

	}() ) + ')';
	timeMark.style.pointerEvents = 'none';
	timeline.dom.appendChild( timeMark );

	function updateTimeMark( time ) {

		timeMark.style.left = ( time * scale ) - scroller.scrollLeft - 8 + 'px';

	}

	updateMarks();

	// signals

	signals.durationChanged.add( function ( value ) {

		duration = value;

		updateMarks();
		updateContainers();

	} );

	signals.timeChanged.add( function ( value ) {

		updateTimeMark( value );

	} );

	signals.timelineScaled.add( function ( value ) {

		scale = value;

		scroller.scrollLeft = ( scroller.scrollLeft * value ) / prevScale;

		updateMarks();
		updateTimeMark();
		updateContainers();

		prevScale = value;

	} );

	return container;

};
