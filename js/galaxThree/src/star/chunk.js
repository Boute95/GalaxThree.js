function Chunk() {

    this.proba;
    this.arrayMeshes = [];
    
}




Chunk.prototype.removeStars = function( scene ) {

    for ( let mesh of this.arrayMeshes ) {
	scene.remove( mesh );
    }

    this.arrayMeshes = new Array();
    
}




function setProbaPerChunk( imgData, matrixChunks ) {

    let maxColor = 0;

    // Gets the array's max value
    let i = 0;
    while ( i < imgData.data.length && maxColor <= 255 ) {
	if ( imgData.data[i] > maxColor ) {
	    maxColor = imgData[i];
	}
	i += 4;
    }

    
    let pixelPerChunk =  ( imgData.data.length / 4 ) /
	( matrixChunks.length * matrixChunks.length );

    
    // Sets probability for each chunks
    for ( let i = 0 ; i < matrixChunks.length ; ++i ) {
	for ( let j = 0 ; j < matrixChunks[i].length ; ++j ) {
	    let indiceImg = ( j + matrixChunks.length * i ) * 4 * pixelPerChunk;
	    matrixChunks[i][j].proba = imgData.data[ indiceImg ] / 255.0;
	}
    }

}


export { Chunk, setProbaPerChunk };
