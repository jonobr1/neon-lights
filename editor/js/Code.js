/**
 * @author mrdoob / http://mrdoob.com/
 */

var Code = function ( editor ) {

	var signals = editor.signals;

	var container = new UI.Panel();
	container.setId( 'effect' );
	container.setPosition( 'absolute' );
	container.setBackgroundColor( '#272822' );
	container.setDisplay( 'none' );

	var header = new UI.Panel();
	header.setPadding( '10px' );
	container.add( header );

	var title = new UI.Text().setColor( '#fff' );
	header.add( title );

	var buttonSVG = ( function () {
		var svg = document.createElementNS( 'http://www.w3.org/2000/svg', 'svg' );
		svg.setAttribute( 'width', 32 );
		svg.setAttribute( 'height', 32 );
		var path = document.createElementNS( 'http://www.w3.org/2000/svg', 'path' );
		path.setAttribute( 'd', 'M 12,12 L 22,22 M 22,12 12,22' );
		path.setAttribute( 'stroke', '#fff' );
		svg.appendChild( path );
		return svg;
	} )();

	var close = new UI.Element( buttonSVG );
	close.setPosition( 'absolute' );
	close.setTop( '3px' );
	close.setRight( '1px' );
	close.setCursor( 'pointer' );
	close.onClick( function () {

		container.setDisplay( 'none' );

	} );
	header.add( close );

	var delay;

	var currentEffect = null;
	var currentInclude = null;

	var codemirror = CodeMirror( container.dom, {
		value: '',
		lineNumbers: true,
		lineWrapping: true,
		matchBrackets: true,
		indentWithTabs: true,
		tabSize: 4,
		indentUnit: 4,
		mode: 'javascript'
	} );
	codemirror.setOption( 'theme', 'monokai' );
	codemirror.on( 'change', function () {

		if ( codemirror.state.focused === false ) return;

		clearTimeout( delay );
		delay = setTimeout( function () {

			if ( currentInclude !== null ) {

				currentInclude.source = codemirror.getValue();

				editor.signals.includeChanged.dispatch();

			} else if ( currentEffect !== null ) {

				var error;
				var currentSource = currentEffect.source;

				editor.timeline.reset();

				try {

					currentEffect.source = codemirror.getValue();
					currentEffect.compile();

					editor.signals.effectCompiled.dispatch();

				} catch ( e ) {

					error = e.name + ' : ' + e.message; // e.stack, e.columnNumber, e.lineNumber

				}

				editor.timeline.update( editor.currentTime );

				if ( error !== undefined ) {

					errorDiv.setDisplay( '' );
					errorText.setValue( '⌦ ' + error );

					currentEffect.source = currentSource;

				} else {

					errorDiv.setDisplay( 'none' );

				}

			}

		}, 1000 );

	} );

	var wrapper = codemirror.getWrapperElement();
	wrapper.addEventListener( 'keydown', function ( event ) {

		event.stopPropagation();

	} );

	//

	var errorDiv = new UI.Div();
	errorDiv.setPosition( 'absolute' );
	errorDiv.setDisplay( 'none' );
	errorDiv.setTop( '8px' );
	errorDiv.setWidth( '100%' );
	errorDiv.setTextAlign( 'center' );
	errorDiv.setZIndex( '3' );
	container.add( errorDiv );

	var errorText = new UI.Text();
	errorText.setBackgroundColor( '#f00' );
	errorText.setColor( '#fff' );
	errorText.setPadding( '4px' );
	errorDiv.add( errorText );

	//

	signals.editorCleared.add( function () {

		container.setDisplay( 'none' );

	} );

	signals.effectSelected.add( function ( effect ) {

		container.setDisplay( '' );

		title.setValue( effect.name );
		codemirror.setValue( effect.source );

		currentEffect = effect;
		currentInclude = null;

	} );

	signals.includeSelected.add( function ( include ) {

		container.setDisplay( '' );

		title.setValue( include.name );
		codemirror.setValue( include.source );

		currentEffect = null;
		currentInclude = include;

	} );

	editor.signals.animationSelected.add( function ( animation ) {

		if ( animation === null ) return;

		var effect = animation.effect;

		title.setValue( effect.name );
		codemirror.setValue( effect.source );

		currentEffect = effect;
		currentInclude = null;

	} );

	return container;

};
