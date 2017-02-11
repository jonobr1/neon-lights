var Viewport = function ( editor ) {

	var container = new UI.Panel();
	container.setId( 'viewport' );

	FRAME.dom = container.dom;

	/*
	editor.signals.fullscreen.add( function () {

		var element = container.dom;

		if ( element.requestFullscreen ) element.requestFullscreen();
		if ( element.msRequestFullscreen ) element.msRequestFullscreen();
		if ( element.mozRequestFullScreen ) element.mozRequestFullScreen();
		if ( element.webkitRequestFullscreen ) element.webkitRequestFullscreen();

	} );
	*/

	editor.signals.editorCleared.add( function () {

		while ( container.dom.children.length ) {

			container.dom.removeChild( container.dom.lastChild );

		}

	} );


	return container;

};
