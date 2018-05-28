import { createStarGeoAndMaterials } from './geoAndMaterial.js';
import { setProbaPerChunk } from './chunkProba.js';
import { getImgDataArray } from '../utils.js';
import { randomUniformSeeded, randomGaussSeeded } from '../proba.js';


//////////////////////////////////////////////////////////////////////
function StarGenerator( galaxy, imgStarMap, nbOfStars ) {

    this.galaxy = galaxy;
    this.imgStarData = getImgDataArray( imgStarMap );
    this.nbOfStarsForAWhitePixel =
	getNbOfStarsWhitePixel( this.imgStarData, nbOfStars );

    createStarGeoAndMaterials( galaxy );
    
}




//////////////////////////////////////////////////////////////////////
StarGenerator.prototype.init = function() {

    setProbaPerChunk( this.imgData, this.galaxy.matrixChunks );
    
}




//////////////////////////////////////////////////////////////////////
StarGenerator.prototype.generateStars = function( camPosition ) {

    let camPosInMatrix = worldPosToMatrixPos( camPosition, this.galaxy.matrixChunks,
					      this.galaxy.radiusInKm * 2 );
    
}




//////////////////////////////////////////////////////////////////////
function getNbOfStarsWhitePixel( imgData, nbOfStars ) {

    let S = 0;
    for ( let i = 0 ; i < imgData.data.length ; i+=4 ) {
	S += imgData.data[i] + imgData.data[i + 1] + imgData.data[i + 2];
    }
    return ( nbOfStars / S ) * 255;
    
}




//////////////////////////////////////////////////////////////////////
/**
 * Matrix must be square !
 * World origin must be in the galaxy's center !
 */
function worldPosToMatrixPos( camPosition, matrix, sizeGalaxyInKm ) {

    let camPosClone = camPosition.clone();
    let xCamOriginAdjusted = camPosClone.x + sizeGalaxyInKm / 2;
    let yCamOriginAdjusted = camPosClone.y + sizeGalaxyInKm / 2;
    let sizeOfAChunkInKm = sizeGalaxyInKm / matrix.length;
    let xMatrix = Math.floor( xCamOriginAdjusted / sizeOfAChunkInKm );
    let yMatrix = Math.floor( yCamOriginAdjusted / sizeOfAChunkInKm );

    return {
	x: xMatrix;
	y: xMatrix;
    }

}




export { StarGenerator };
