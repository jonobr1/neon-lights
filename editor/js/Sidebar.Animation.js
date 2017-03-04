/**
 * @author mrdoob / http://mrdoob.com/
 */

Sidebar.Animation = function ( editor ) {

	var container = new UI.Panel();
	container.setId( 'animation' );

	// signals

	var signals = editor.signals;

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

		var title = new UI.Text( animation.name ).setId( 'name' );
		container.add( title );

		var rename = new UI.Button( 'RENAME' );
		rename.setPosition( 'absolute' );
		rename.setRight( '8px' );
		rename.onClick( function () {

			var name = prompt( '', animation.name );

			if ( name !== null ) {

				animation.name = name;
				title.setValue( name );

				signals.animationRenamed.dispatch( animation );

			}

		} );
		container.add( rename );

		container.add( new UI.HorizontalRule() );

		var parameters = animation.effect.program.parameters;

		for ( var key in parameters ) {

			container.add( createParameterRow( key, parameters[ key ] ) );

		}

		//

		var effect = animation.effect;

		container.add( new UI.HorizontalRule() );

		var effectName = new UI.Text( effect.name ).setId( 'name' );
		container.add( effectName );

		var edit = new UI.Button( 'EDIT' );
		edit.setPosition( 'absolute' );
		edit.setRight( '70px' );
		edit.onClick( function () {

			editor.selectEffect( effect );

		} );
		container.add( edit );

		var rename = new UI.Button( 'RENAME' );
		rename.setPosition( 'absolute' );
		rename.setRight( '8px' );
		rename.onClick( function () {

			var name = prompt( '', effect.name );

			if ( name !== null ) {

				effect.name = name;
				effectName.setValue( name );

				signals.effectRenamed.dispatch( effect );

			}

		} );
		container.add( rename );

	}

	//

	editor.signals.animationSelected.add( function ( animation ) {

		selected = animation;

		build();

	} );
	editor.signals.effectCompiled.add( build );

	/*
	editor.signals.timeChanged.add( function () {

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
