import { createStarGeoAndMaterials } from './geoAndMaterial.js';
import { setProbaPerChunk } from './chunkProba.js';
import { getImgDataArray } from '../utils.js';
import { randomUniformSeeded, randomGaussSeeded } from '../proba.js';


//////////////////////////////////////////////////////////////////////
function StarGenerator( galaxy, imgStarMap, starTexture, nbOfStars ) {

    
    this.galaxy = galaxy;
    
    this.imgStarData = getImgDataArray( imgStarMap );
    
    this.starTexture = starTexture;
    
    this.maxStarLuminosity = Math.max.apply( Math, galaxy.arrayStarCategories.map(
	function( o ) { return o.luminosity; } ) );

    this.maxChunkDistance = Math.max.apply( Math, galaxy.arrayStarCategories.map(
	function( o ) { return o.nbOfChunks; } ) );

    // Material for each spectral type of each star category.
    this.arrayMaterialsStar = createMaterials( galaxy.arrayStarCategories,
					       galaxy.arraySpectralTypeToColor
					       starTexture,
					       this.maxStarLuminosity, );

    this.nbOfStarsForAWhitePixel =
	getNbOfStarsWhitePixel( this.imgStarData, nbOfStars );

    
    
    setProbaPerChunk( starGen.imgData, starGen.galaxy.matrixChunks );

    
} // end StarGenerator




//////////////////////////////////////////////////////////////////////
StarGenerator.prototype.generateStars = function( camPosition ) {

    
    let camPosInMatrix = worldPosToMatrixPos( camPosition, this.galaxy.matrixChunks,
					      this.galaxy.radiusInKm * 2 );

    
    for ( let i = 1 ; i < this.maxChunkDistance ; ++i ) {

	for ( let category of this.galaxy.arrayStarCategories ) {

	    if ( i <= category.nbOfChunks ) {

		generateChunk( camPosInMatrix.x - i, camPosInMatrix.y );
		generateChunk( camPosInMatrix.x - i, camPosInMatrix.y - i );
		generateChunk( camPosInMatrix.x - i, camPosInMatrix.y + i );
		generateChunk( camPosInMatrix.x,     camPosInMatrix.y + i );
		generateChunk( camPosInMatrix.x,     camPosInMatrix.y - i );
		generateChunk( camPosInMatrix.x + i, camPosInMatrix.y );
		generateChunk( camPosInMatrix.x + i, camPosInMatrix.y - i );
		generateChunk( camPosInMatrix.x + i, camPosInMatrix.y + i );
		
		
	    }
	    
	} // end for each category
	
    } // end for i in [ 1..maxChunkDistance ]
    
    
} // end generateStars method





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
