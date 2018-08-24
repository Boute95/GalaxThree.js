/**
 * @author Alexis Breton
 **/

function Wasd( object, domElement ) {


    self = this;
    

    this.object = object;
    
    
    this.domElement = ( domElement !== undefined ) ? domElement : document;

    
    this.movementSpeed = 1;


    this.moveForward = false;
    this.moveBackward = false;
    this.moveLeft = false;
    this.moveRight = false;

    
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

    } // end method
    

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
	
    } // end method


    this.domElement.addEventListener( 'keydown',
				      function( event ) { self.onKeyDown( event ) },
				      false );
    this.domElement.addEventListener( 'keyup',
				      function( event ) { self.onKeyUp( event ) },
				      false );

    
    this.update = function( delta ) {

	if ( this.moveForward && !this.moveBackward) { this.object.translateZ( -this.movementSpeed );}
	if ( this.moveBackward && !this.moveForward ) { this.object.translateZ( this.movementSpeed ); }
	if ( this.moveLeft && !this.moveRight ) { this.object.translateX( this.movementSpeed ); }
	if ( this.moveRight && !this.moveLeft ) { this.object.translateX( -this.movementSpeed ); }
	if ( this.moveUp && !this.moveDown ) { this.object.translateY( this.movementSpeed ); }
	if ( this.moveDown && !this.moveUp ) { this.object.translateY( -this.movementSpeed ); }
	
    } // end method

    
}
