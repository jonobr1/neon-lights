/**
 * @author WITHIN - Modified to work with r93+
 * @author dmarcos / https://github.com/dmarcos
 * @author mrdoob / http://mrdoob.com
 *
 * WebVR Spec: http://mozvr.github.io/webvr-spec/webvr.html
 *
 * Firefox: http://mozvr.com/downloads/
 * Chromium: https://webvr.info/get-chrome
 */

THREE.VREffect = function ( renderer, onError ) {

	var scope = this;

	var device = null;
	var frameData = null;

	var standingMatrix = new THREE.Matrix4();
	var standingMatrixInverse = new THREE.Matrix4();

	if ( typeof window !== 'undefined' && 'VRFrameData' in window ) {

		frameData = new window.VRFrameData();
		window.addEventListener( 'vrdisplaypresentchange', onVRDisplayPresentChange, false );

	}

	//

	var matrixWorldInverse = new THREE.Matrix4();
	var tempQuaternion = new THREE.Quaternion();
	var tempPosition = new THREE.Vector3();

	var cameraL = new THREE.PerspectiveCamera();
	cameraL.bounds = new THREE.Vector4( 0.0, 0.0, 0.5, 1.0 );
	cameraL.layers.enable( 1 );

	var cameraR = new THREE.PerspectiveCamera();
	cameraR.bounds = new THREE.Vector4( 0.5, 0.0, 0.5, 1.0 );
	cameraR.layers.enable( 2 );

	var cameraVR = new THREE.ArrayCamera( [ cameraL, cameraR ] );
	cameraVR.layers.enable( 1 );
	cameraVR.layers.enable( 2 );
	cameraVR.matrixAutoUpdate = false;

	function getCamera( camera ) {

		if ( device === null ) return camera;

		device.depthNear = camera.near;
		device.depthFar = camera.far;

		device.getFrameData( frameData );

		//

		var stageParameters = device.stageParameters;

		if ( stageParameters ) {

			standingMatrix.fromArray( stageParameters.sittingToStandingTransform );

		} else {

			standingMatrix.makeTranslation( 0, scope.userHeight, 0 );

		}


		var pose = frameData.pose;

		camera.matrix.copy( standingMatrix );
		camera.matrix.decompose( camera.position, camera.quaternion, camera.scale );

		if ( pose.orientation !== null ) {

			tempQuaternion.fromArray( pose.orientation );
			camera.quaternion.multiply( tempQuaternion );

		}

		if ( pose.position !== null ) {

			tempQuaternion.setFromRotationMatrix( standingMatrix );
			tempPosition.fromArray( pose.position );
			tempPosition.applyQuaternion( tempQuaternion );
			camera.position.add( tempPosition );

		}

		camera.updateMatrixWorld();

		if ( device.isPresenting === false ) return camera;

		//

		cameraL.near = camera.near;
		cameraR.near = camera.near;

		cameraL.far = camera.far;
		cameraR.far = camera.far;

		cameraVR.matrixWorld.copy( camera.matrixWorld );
		cameraVR.matrixWorldInverse.copy( camera.matrixWorldInverse );

		cameraL.matrixWorldInverse.fromArray( frameData.leftViewMatrix );
		cameraR.matrixWorldInverse.fromArray( frameData.rightViewMatrix );

		// TODO (mrdoob) Double check this code

		standingMatrixInverse.getInverse( standingMatrix );

		cameraL.matrixWorldInverse.multiply( standingMatrixInverse );
		cameraR.matrixWorldInverse.multiply( standingMatrixInverse );

		var parent = camera.parent;

		if ( parent !== null ) {

			matrixWorldInverse.getInverse( parent.matrixWorld );

			cameraL.matrixWorldInverse.multiply( matrixWorldInverse );
			cameraR.matrixWorldInverse.multiply( matrixWorldInverse );

		}

		// envMap and Mirror needs camera.matrixWorld

		cameraL.matrixWorld.getInverse( cameraL.matrixWorldInverse );
		cameraR.matrixWorld.getInverse( cameraR.matrixWorldInverse );

		cameraL.projectionMatrix.fromArray( frameData.leftProjectionMatrix );
		cameraR.projectionMatrix.fromArray( frameData.rightProjectionMatrix );

		// HACK (mrdoob)
		// https://github.com/w3c/webvr/issues/203

		cameraVR.projectionMatrix.copy( cameraL.projectionMatrix );

		//

		var layers = device.getLayers();

		if ( layers.length ) {

			var layer = layers[ 0 ];

			if ( layer.leftBounds !== null && layer.leftBounds.length === 4 ) {

				cameraL.bounds.fromArray( layer.leftBounds );

			}

			if ( layer.rightBounds !== null && layer.rightBounds.length === 4 ) {

				cameraR.bounds.fromArray( layer.rightBounds );

			}

		}

		return cameraVR;

	}

	//

	function onVRDisplayPresentChange() {

		if ( device !== null && device !== undefined ) {

			scope.isPresenting = device.isPresenting;

		} else {

			scope.isPresenting = false;

		}

		if ( scope.isPresenting ) {

			var eyeParameters = device.getEyeParameters( 'left' );
			var renderWidth = eyeParameters.renderWidth;
			var renderHeight = eyeParameters.renderHeight;

			renderer.setDrawingBufferSize( renderWidth * 2, renderHeight, 1 );

			renderer.domElement.style.width = rendererSize.width + 'px';
			renderer.domElement.style.height = rendererSize.height + 'px';

		} else {

			renderer.setSize( rendererSize.width, rendererSize.height, true );

		}

	}

	//

	this.isPresenting = false;
	this.userHeight = 1.6;

	var rendererSize = renderer.getSize();

	this.getVRDisplay = function () {

		return device;

	};

	this.setVRDisplay = function ( value ) {

		device = value;

	};

	this.getStandingMatrix = function () {

		return standingMatrix;

	};

	this.setSize = function ( width, height ) {

		rendererSize.width = width;
		rendererSize.height = height;

		onVRDisplayPresentChange();

	};

	this.setFullScreen = function ( boolean ) {

		return new Promise( function ( resolve, reject ) {

			if ( device === null ) {

				reject( new Error( 'No VR hardware found.' ) );
				return;

			}

			if ( scope.isPresenting === boolean ) {

				resolve();
				return;

			}

			if ( boolean ) {

				resolve( device.requestPresent( [ { source: renderer.domElement } ] ) );

			} else {

				resolve( device.exitPresent() );

			}

		} );

	};

	this.requestPresent = function () {

		return this.setFullScreen( true );

	};

	this.exitPresent = function () {

		return this.setFullScreen( false );

	};

	this.requestAnimationFrame = function ( f ) {

		if ( scope.isPresenting ) {

			return device.requestAnimationFrame( f );

		} else {

			return window.requestAnimationFrame( f );

		}

	};

	this.cancelAnimationFrame = function ( h ) {

		if ( scope.isPresenting ) {

			device.cancelAnimationFrame( h );

		} else {

			window.cancelAnimationFrame( h );

		}

	};

	this.render = function ( scene, camera ) {

		var cameraVR;

		if ( scope.isPresenting ) {

			cameraVR = getCamera( camera );

			renderer.render( scene, cameraVR );
			scope.submitFrame( scene, camera );

		} else {

			renderer.render( scene, camera );

		}

	};

	this.submitFrame = function ( scene, camera ) {

		if ( scope.isPresenting ) {

			device.submitFrame();

			// https://github.com/toji/webvr.info/blob/master/samples/07-advanced-mirroring.html#L320
			if ( device.capabilities.hasExternalDisplay ) {
				renderer.context.viewport( 0, 0, renderer.domElement.width, renderer.domElement.height );
				renderer.render( scene, camera );
			}

		}

	};

}
