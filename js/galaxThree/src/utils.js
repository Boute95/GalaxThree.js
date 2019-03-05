function getImgDataArray( img, x, y, width, height ) {

    if ( x == undefined )      { x = 0; }
    if ( y == undefined )      { y = 0; }
    if ( width == undefined )  { width = img.width; }
    if ( height == undefined ) { height = img.height; }
    
    
    let data = new Object();
    //img.setAttribute( 'crossOrigin', 'anonymous' );
    let canvas = document.createElement( "canvas" );
    document.body.appendChild( canvas );
    canvas.width = img.width;
    canvas.height = img.height;
    let ctx = canvas.getContext( "2d" );
    ctx.drawImage(img, 0, 0);
    data = ctx.getImageData( x, y, width, height );

    canvas.parentNode.removeChild( canvas );
    
    return data;
    
}




function getMaxArray( array ) {

    let max;
    
    if ( array.length >= 1 ) {
	max = array[0];
    }
    
    for ( let i = 1 ; i < array.length ; ++i ) {
	if ( array[i] > max ) {
	    max = array[i];
	}
    }

    return max;
    
}





function writeConsole(string) {
    console.log("[GALAX3] " + string);
}




export { getImgDataArray, getMaxArray, writeConsole };
