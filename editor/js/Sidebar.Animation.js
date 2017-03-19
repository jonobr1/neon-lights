/**
 * @author mrdoob / http://mrdoob.com/
 */

Sidebar.Animation = function ( editor ) {

	var signals = editor.signals;

	var container = new UI.Panel();
	container.setId( 'animation' );

	//

	var selected = null;
	var values;

	function createParameterRow( key, parameter ) {

		if ( parameter === null ) return;

		var parameterRow = new UI.Row();
		parameterRow.add( new UI.Text( parameter.name ).setWidth( '90px' ) );

		if ( parameter instanceof FRAME.Parameters.Boolean ) {

			var parameterValue = new UI.Checkbox()
				.setValue( parameter.value )
				.onChange( function () {

					parameter.value = this.getValue();
					signals.animationModified.dispatch( animation );

				} );

			parameterRow.add( parameterValue );

			values[ key ] = parameterValue;

		} else if ( parameter instanceof FRAME.Parameters.Integer ) {

			var parameterValue = new UI.Integer()
				.setRange( parameter.min, parameter.max )
				.setValue( parameter.value )
				.setWidth( '150px' )
				.onChange( function () {

					parameter.value = this.getValue();
					signals.animationModified.dispatch( animation );

				} );

			parameterRow.add( parameterValue );

			values[ key ] = parameterValue;

		} else if ( parameter instanceof FRAME.Parameters.Float ) {

			var parameterValue = new UI.Number()
				.setRange( parameter.min, parameter.max )
				.setValue( parameter.value )
				.setWidth( '150px' )
				.onChange( function () {

					parameter.value = this.getValue();
					signals.animationModified.dispatch( animation );

				} );

			parameterRow.add( parameterValue );

			values[ key ] = parameterValue;

		} else if ( parameter instanceof FRAME.Parameters.Vector2 ) {

			var vectorX = new UI.Number()
				.setValue( parameter.value[ 0 ] )
				.setWidth( '50px' )
				.onChange( function () {

					parameter.value[ 0 ] = this.getValue();
					signals.animationModified.dispatch( animation );

				} );

			var vectorY = new UI.Number()
				.setValue( parameter.value[ 1 ] )
				.setWidth( '50px' )
				.onChange( function () {

					parameter.value[ 1 ] = this.getValue();
					signals.animationModified.dispatch( animation );

				} );

			parameterRow.add( vectorX );
			parameterRow.add( vectorY );

		} else if ( parameter instanceof FRAME.Parameters.Vector3 ) {

			var vectorX = new UI.Number()
				.setValue( parameter.value[ 0 ] )
				.setWidth( '50px' )
				.onChange( function () {

					parameter.value[ 0 ] = this.getValue();
					signals.animationModified.dispatch( animation );

				} );

			var vectorY = new UI.Number()
				.setValue( parameter.value[ 1 ] )
				.setWidth( '50px' )
				.onChange( function () {

					parameter.value[ 1 ] = this.getValue();
					signals.animationModified.dispatch( animation );

				} );

			var vectorZ = new UI.Number()
				.setValue( parameter.value[ 2 ] )
				.setWidth( '50px' )
				.onChange( function () {

					parameter.value[ 2 ] = this.getValue();
					signals.animationModified.dispatch( animation );

				} );

			parameterRow.add( vectorX );
			parameterRow.add( vectorY );
			parameterRow.add( vectorZ );

		} else if ( parameter instanceof FRAME.Parameters.String ) {

			var parameterValue = new UI.Input()
				.setValue( parameter.value )
				.setWidth( '150px' )
				.onKeyUp( function () {

					parameter.value = this.getValue();
					signals.animationModified.dispatch( animation );

				} );

			parameterRow.add( parameterValue );

		} else if ( parameter instanceof FRAME.Parameters.Color ) {

			var parameterValue = new UI.Color()
				.setHexValue( parameter.value )
				.setWidth( '150px' )
				.onChange( function () {

					parameter.value = this.getHexValue();
					signals.animationModified.dispatch( animation );

				} );

			parameterRow.add( parameterValue );

		}

		return parameterRow;

	}

	function build() {

		container.clear();

		if ( selected === null ) return;

		values = {};

		var animation = selected;

		// Name

		var row = new UI.Row();
		row.add( new UI.Text( 'Name' ).setWidth( '90px' ) );
		container.add( row );

		var animationName = new UI.Input( animation.name )
		animationName.onChange( function () {

			animation.name = this.getValue();
			signals.animationRenamed.dispatch( animation );

		} );
		row.add( animationName );

		// Position

		var row = new UI.Row();
		row.add( new UI.Text( 'Position' ).setWidth( '90px' ) );
		container.add( row );

		var animationStart = new UI.Number( animation.start ).setWidth( '80px' );
		animationStart.onChange( function () {

			animation.start = this.getValue();
			signals.animationModified.dispatch( animation );

		} );
		row.add( animationStart );

		var animationEnd = new UI.Number( animation.end ).setWidth( '80px' );
		animationEnd.onChange( function () {

			animation.end = this.getValue();
			signals.animationModified.dispatch( animation );

		} );
		row.add( animationEnd );

		// Enabled

		var row = new UI.Row();
		row.add( new UI.Text( 'Enabled' ).setWidth( '90px' ) );
		container.add( row );

		var animationName = new UI.Checkbox( animation.enabled )
		animationName.onChange( function () {

			animation.enabled = this.getValue();
			signals.animationModified.dispatch( animation );

		} );
		row.add( animationName );

		//

		container.add( new UI.HorizontalRule() );

		//

		var parameters = animation.effect.program.parameters;

		for ( var key in parameters ) {

			container.add( createParameterRow( key, parameters[ key ] ) );

		}

		//

		container.add( new UI.Break(), new UI.Break() );
		container.add( new UI.Text( 'Effect' ).setTextTransform( 'uppercase' ) );
		container.add( new UI.Break(), new UI.Break() );

		var effects = editor.effects;
		var options = {};

		for ( var i = 0; i < effects.length; i ++ ) {

			options[ i ] = effects[ i ].name;

		}

		var effectsSelect = new UI.Select().setMarginLeft( '90px' );
		effectsSelect.setOptions( options ).setValue( effects.indexOf( animation.effect ) );
		effectsSelect.onChange( function () {

			editor.timeline.reset();
			animation.effect = editor.effects[ this.getValue() ];

			signals.animationModified.dispatch( animation );

			build();

		} );
		container.add( effectsSelect );

		container.add( new UI.Break(), new UI.Break() );

		var row = new UI.Row();
		row.add( new UI.Text( 'Name' ).setWidth( '90px' ) );
		container.add( row );

		var effectName = new UI.Input( animation.effect.name );
		effectName.onChange( function () {

			animation.effect.name = this.getValue();
			signals.effectRenamed.dispatch( animation.effect );

		} );
		row.add( effectName );

		var edit = new UI.Button( 'EDIT' ).setMarginLeft( '4px' );
		edit.onClick( function () {

			editor.selectEffect( animation.effect );

		} );
		row.add( edit );

	}

	//

	signals.editorCleared.add( function () {

		selected = null;
		build();

	} );

	signals.animationSelected.add( function ( animation ) {

		selected = animation;
		build();

	} );

	signals.effectCompiled.add( build );

	/*
	signals.timeChanged.add( function () {

		if ( selected !== null ) {

			var animation = selected;

			for ( var key in values ) {

				values[ key ].setValue( animation.module.parameters[ key ].value );

			}

		}

	} );
	*/

	return container;

};
