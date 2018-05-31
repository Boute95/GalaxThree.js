import { writeConsole } from '../utils.js';


//////////////////////////////////////////////////////////////////////
function Chunk() {

    this.proba;
    this.arrayMeshes = [];
    
}



//////////////////////////////////////////////////////////////////////
Chunk.prototype.removeStars = function( scene ) {

    for ( let mesh of this.arrayMeshes ) {
	scene.remove( mesh );
    }

    this.arrayMeshes = new Array();
    
}



//////////////////////////////////////////////////////////////////////
function setProbaPerChunk( imgData, matrixChunks ) {

    let maxColor = 0;

    // Gets the array's max value
    let i = 0;
    while ( i < imgData.data.length && maxColor <= 255 ) {
	if ( imgData.data[i] > maxColor ) {
	    maxColor = imgData.data[i];
	}
	i += 4;
    }
    
    let imgWidth = Math.sqrt( imgData.data.length / 4 );
    let nbOfPixelsByChunkWidth = imgWidth / matrixChunks.length;

    // Sets probability for each chunks
    for ( let i = 0 ; i < matrixChunks.length ; ++i ) {
	for ( let j = 0 ; j < matrixChunks[i].length ; ++j ) {
	    let imgCoord = matrixToImgCoord( j, i, nbOfPixelsByChunkWidth );
	    let imgIndex = ( imgCoord.y * imgWidth + imgCoord.x ) * 4;
	    matrixChunks[i][j].proba = imgData.data[ imgIndex ] / 255.0;
	}
    }

}




//////////////////////////////////////////////////////////////////////
function matrixToImgCoord( matrixX, matrixY, nbOfPixelsByChunkWidth ) {
    return {
	x: matrixX * nbOfPixelsByChunkWidth,
	y: matrixY * nbOfPixelsByChunkWidth,
    }
}




export { Chunk, setProbaPerChunk };
