var Properties = function ( editor ) {

	var container = new UI.Panel();
	container.setId( 'properties' );

	// signals

	var signals = editor.signals;

	var selected = null;
	var values;

	function build() {

		container.clear();

		if ( selected === null ) return;

		values = {};

		var animation = selected;

		var animationPanel = new UI.Panel();
		container.add( animationPanel );

		animationPanel.add( new UI.Text( animation.name ).setId( 'name' ) );

		var edit = new UI.Button( 'EDIT' );
		edit.setPosition( 'absolute' );
		edit.setRight( '8px' );
		edit.onClick( function () {

			editor.selectEffect( animation.effect );

		} );
		animationPanel.add( edit );

		animationPanel.add( new UI.HorizontalRule() );

		function createParameterRow( key ) {

			var parameter = parameters[ key ];

			if ( parameter === null ) return;

			var parameterRow = new UI.Panel();
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

		var parameters = animation.effect.program.parameters;

		for ( var key in parameters ) {

			animationPanel.add( createParameterRow( key ) );

		}

	}

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
