function MoveCamera( object, domElement ) {
    

    self = this;
    this.object = object;
    this.domElement = ( domElement !== undefined ) ? domElement : document;
    this.movementSpeed = 1.0;
    this.moveForward = false;
    this.moveBackward = false;
    this.moveLeft = false;
    this.moveRight = false;
    

    this.onKeyDown = function ( event ) {

	switch ( event.keyCode ) {

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

    };

    
    this.onKeyUp = function ( event ) {

	switch ( event.keyCode ) {

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

    };


    this.update = function() {

	let actualMoveSpeed = this.movementSpeed;

	if ( this.moveForward ) this.object.translateZ( - actualMoveSpeed );
	if ( this.moveBackward ) this.object.translateZ( actualMoveSpeed );

	if ( this.moveLeft ) this.object.translateX( - actualMoveSpeed );
	if ( this.moveRight ) this.object.translateX( actualMoveSpeed );

	if ( this.moveUp ) this.object.translateY( actualMoveSpeed );
	if ( this.moveDown ) this.object.translateY( - actualMoveSpeed );
	
    };

    
    window.addEventListener( 'keydown', function( event ) { self.onKeyDown( event ); }, false );
    window.addEventListener( 'keyup', function( event ) { self.onKeyUp( event ); }, false );
    
}
