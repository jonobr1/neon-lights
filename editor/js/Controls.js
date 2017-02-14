var Controls = function ( editor ) {

	var signals = editor.signals;

	var container = new UI.Panel();
	container.setId( 'controls' );

	var playButton = new UI.Button();
	playButton.setLabel( '▶︎' );
	playButton.setMarginTop( '6px' );
	playButton.setMarginLeft( '6px' );
	playButton.setPaddingRight( '4px' );
	playButton.onClick( function () {

		editor.isPlaying ? editor.stop() : editor.play();

	} );
	container.add( playButton );

	signals.playingChanged.add( function ( isPlaying ) {

		playButton.setLabel( isPlaying ? '❚❚' : '▶︎' )

	} );

	var timeText = new UI.Text();
	timeText.setColor( '#bbb' );
	timeText.setMarginLeft( '5px' );
	timeText.setValue( '0:00.00' );
	container.add( timeText );

	function updateTimeText( value ) {

		var minutes = Math.floor( value / 60 );
		var seconds = value % 60;
		var padding = seconds < 10 ? '0' : '';

		timeText.setValue( minutes + ':' + padding + seconds.toFixed( 2 ) );

	}

	var playbackRateText = new UI.Text();
	playbackRateText.setColor( '#999' );
	playbackRateText.setMarginLeft( '5px' );
	playbackRateText.setValue( '1.0x' );
	container.add( playbackRateText );

	function updatePlaybackRateText( value ) {

		playbackRateText.setValue( value.toFixed( 1 ) + 'x' );

	}

	//

	signals.timeChanged.add( function ( value ) {

		updateTimeText( value );

	} );

	signals.playbackRateChanged.add( function ( value ) {

		updatePlaybackRateText( value );

	} );

	return container;

};
