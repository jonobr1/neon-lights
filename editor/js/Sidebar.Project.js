/**
 * @author mrdoob / http://mrdoob.com/
 */

Sidebar.Project = function ( editor ) {

	var signals = editor.signals;

	var container = new UI.Panel();
	container.setId( 'project' );

	container.add( new UI.Text( 'Includes' ).setTextTransform( 'uppercase' ) );
	container.add( new UI.Break() );
	container.add( new UI.Break() );

	//

	var includesContainer = new UI.Row();
	container.add( includesContainer );

	var newInclude = new UI.Button( 'New' );
	newInclude.onClick( function () {

		var include = [ 'Name', '' ];
		editor.addInclude( include );

		update();

	} );
	container.add( newInclude );

	//

	function buildInclude( id ) {

		var include = editor.includes[ id ];

		var span = new UI.Span();

		var name = new UI.Input( include[ 0 ] ).setWidth( '130px' ).setFontSize( '12px' );
		name.onChange( function () {

			include[ 0 ] = this.getValue();

		} );
		span.add( name );

		var edit = new UI.Button( 'Edit' );
		edit.setMarginLeft( '4px' );
		edit.onClick( function () {

			editor.selectInclude( include );

		} );
		span.add( edit );

		var move = new UI.Button( 'Move' );
		move.setMarginLeft( '4px' );
		move.onClick( function () {

			var title = name.getValue();
			var i = editor.includes.indexOf( include );
			var index = prompt( 'Move ' + title + ' to ' + Math.max( i, 0 ) + '?' );

			if ( index !== i ) {

				editor.moveInclude( include, index );

			}

		} );
		span.add( move );

		var remove = new UI.Button( 'Remove' );
		remove.setMarginLeft( '4px' );
		remove.onClick( function () {

			if ( confirm( 'Are you sure?' ) ) {

				editor.removeInclude( include );

			}

		} );
		span.add( remove );

		return span;

	}

	//

	function update() {

		includesContainer.clear();

		var includes = editor.includes;

		for ( var i = 0; i < includes.length; i ++ ) {

			includesContainer.add( buildInclude( i ) );

		}

	}

	// signals

	signals.editorCleared.add( update );
	signals.includeAdded.add( update );
	signals.includeMoved.add( update );
	signals.includeRemoved.add( update );

	return container;

};
