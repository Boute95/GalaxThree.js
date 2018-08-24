/**
 * @author Alexis Breton
 **/

function Wasd( camera ) {

    
    this.domElement = ( domElement !== undefined ) ? domElement : document;

    this.domElement.addEventListener( 'keydown', onKeyDown );
    this.domElement.addEventListener( 'keyup', onKeyUp );
    

    this.movementSpeed = 1;


    this.onKeyDown = function( event ) {

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
    
    this.update = function( delta ) {

	
	
    }

    
}
