/**
 * @author Alexis Breton
 **/

function GalaxyControls( object, domElement ) {


    self = this;
    
    this.object = object;
    this.target = new THREE.Vector3( 0, 0, 0 );
        
    this.domElement = ( domElement !== undefined ) ? domElement : document;
    
    this.movementSpeed = 1;
    this.lookSpeed = 0.005;

    this.moveForward = false;
    this.moveBackward = false;
    this.moveLeft = false;
    this.moveRight = false;
    this.lookMove = false;

    this.mouseX = 0;
    this.mouseY = 0;
    
    this.lat = 0;
    this.lon = 0;
    this.phi = 0;
    this.theta = 0;

    this.viewHalfX = 0;
    this.viewHalfY = 0;


    this.handleResize = function () {

	if ( this.domElement === document ) {

	    this.viewHalfX = window.innerWidth / 2;
	    this.viewHalfY = window.innerHeight / 2;

	} else {

	    this.viewHalfX = this.domElement.offsetWidth / 2;
	    this.viewHalfY = this.domElement.offsetHeight / 2;

	}

    }; // end method

    
    this.onKeyDown = function( event ) {

	switch( event.keyCode ) {

	case 38: /*up*/
	case 87: /*W*/ this.moveForward = true; break;

	case 37: /*left*/
	case 65: /*A*/ this.moveLeft = true; break;

	case 40: /*down*/
	case 83: /*S*/ this.moveBackward = true; break;

	case 39: /*right*/
	case 68: /*D*/ this.moveRight = true; break;

	case 82: /*R*/ this.moveUp = true; break;
	case 70: /*F*/ this.moveDown = true; break;

	}

    }; // end method
    

    this.onKeyUp = function( event ) {

	switch( event.keyCode ) {

	case 38: /*up*/
	case 87: /*W*/ this.moveForward = false; break;

	case 37: /*left*/
	case 65: /*A*/ this.moveLeft = false; break;

	case 40: /*down*/
	case 83: /*S*/ this.moveBackward = false; break;

	case 39: /*right*/
	case 68: /*D*/ this.moveRight = false; break;

	case 82: /*R*/ this.moveUp = false; break;
	case 70: /*F*/ this.moveDown = false; break;
	    
	}
	
    }; // end method
    

    this.onMouseMove = function ( event ) {

	if ( this.domElement === document ) {

	    this.mouseX = event.pageX - this.viewHalfX;
	    this.mouseY = event.pageY - this.viewHalfY;

	} else {

	    this.mouseX = event.pageX - this.domElement.offsetLeft - this.viewHalfX;
	    this.mouseY = event.pageY - this.domElement.offsetTop - this.viewHalfY;

	}

    }; // end method


    this.onMouseDown = function( event ) {

	this.lookMove = true;
	
    }; // end method

    
    this.onMouseUp = function( event ) {

	this.lookMove = false;
	
    }; // end method


    window.addEventListener( 'keydown',
			     function( event ) { self.onKeyDown( event ) },
			     false );
    
    window.addEventListener( 'keyup',
			     function( event ) { self.onKeyUp( event ) },
			     false );
    
    this.domElement.addEventListener( 'mousemove',
			     function( event ) { self.onMouseMove( event ) },
			     false );

    this.domElement.addEventListener( 'mousedown',
			     function( event ) { self.onMouseDown( event ) },
			     false );

    this.domElement.addEventListener( 'mouseup',
			     function( event ) { self.onMouseUp( event ) },
			     false );

    


    
    this.update = function( delta ) {
	

	let actualLookSpeed = delta * this.lookSpeed;
	let verticalLookRatio = 1;

	this.lon += this.mouseX * actualLookSpeed;
	this.lat -= this.mouseY * actualLookSpeed * verticalLookRatio;
	this.lat = Math.max( - 85, Math.min( 85, this.lat ) );
	this.phi = THREE.Math.degToRad( 90 - this.lat );
	this.theta = THREE.Math.degToRad( this.lon );

	let targetPosition = this.target;
	let position = this.object.position;

	targetPosition.x = position.x + 1e12 * Math.sin( this.phi ) * Math.cos( this.theta );
	targetPosition.y = position.y + 1e12 * Math.cos( this.phi );
	targetPosition.z = position.z + 1e12 * Math.sin( this.phi ) * Math.sin( this.theta );

	this.object.lookAt( targetPosition );
	console.log( targetPosition.x + ' ' + targetPosition.y + ' ' + targetPosition.z );
		

	if ( this.moveForward && !this.moveBackward) { this.object.translateZ( -this.movementSpeed );}
	if ( this.moveBackward && !this.moveForward ) { this.object.translateZ( this.movementSpeed ); }
	if ( this.moveLeft && !this.moveRight ) { this.object.translateX( -this.movementSpeed ); }
	if ( this.moveRight && !this.moveLeft ) { this.object.translateX( this.movementSpeed ); }
	if ( this.moveUp && !this.moveDown ) { this.object.translateY( this.movementSpeed ); }
	if ( this.moveDown && !this.moveUp ) { this.object.translateY( -this.movementSpeed ); }
	
	
    } // end method


    this.handleResize();

    
} // end GalaxyControls
