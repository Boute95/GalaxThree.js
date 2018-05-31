import { ly } from '../consts.js';
import { createMaterials } from './material.js';
import { setProbaPerChunk } from './chunk.js';
import { writeConsole, getImgDataArray } from '../utils.js';
import { randomUniformSeeded, randomGaussSeeded } from '../proba.js';


//////////////////////////////////////////////////////////////////////
function StarGenerator( galaxy, imgStarMap, starTexture, nbOfStars ) {

    
    this.galaxy = galaxy;

    this.imgMap = imgStarMap;
    
    this.imgStarData = getImgDataArray( imgStarMap );
    
    this.starTexture = starTexture;

    this.maxStarLuminosity = Math.max.apply( Math, galaxy.arrayStarCategories.map(
	function( o ) { return o.luminosity; } ) );

    this.maxChunkDistance = Math.max.apply( Math, galaxy.arrayStarCategories.map(
	function( o ) { return o.nbOfChunks; } ) );

    // Material for each spectral type of each star category.
    this.arrayMaterialsStar = createMaterials( galaxy.arrayStarCategories,
					       galaxy.arraySpectralTypeToColor,
					       starTexture,
					       this.maxStarLuminosity );

    this.arrayGeometriesStar = new Array();
    for ( let i = 0 ; i < this.arrayMaterialsStar.length ; ++i ) {
	this.arrayGeometriesStar.push( new Array() );
	for ( let j = 0 ; j < this.arrayMaterialsStar[i].length ; ++j ) {
	    this.arrayGeometriesStar[i].push( new THREE.Geometry() );
	}
    }

    this.nbOfStarsForAWhitePixel = getNbOfStarsWhitePixel( this.imgStarData, nbOfStars );

    this.pixelSizeInWorldCoord = galaxy.radiusInKm * 2 / imgStarMap.width;

    this.nbPixelForAChunkWidth = imgStarMap.width / this.galaxy.matrixChunks.length;
		  
    this.maxStarForAChunk = getMaxStarChunk( this.imgStarData, nbOfStars,
					     this.galaxy.matrixChunks.length );

    
    
    setProbaPerChunk( this.imgStarData, this.galaxy.matrixChunks );

    
} // end StarGenerator




//////////////////////////////////////////////////////////////////////
StarGenerator.prototype.generateStars = function( camPosition ) {


    let matrixSize = this.galaxy.matrixChunks.length;
    let posMatrix = worldPosToMatrixPos( camPosition, this.galaxy.matrixChunks,
					 this.galaxy.radiusInKm * 2 );

    for ( let x = posMatrix.x - this.maxChunkDistance ;
	  x < posMatrix.x + this.maxChunkDistance ; ++x ) {

	for ( let y = posMatrix.y - this.maxChunkDistance ;
	      y < posMatrix.y + this.maxChunkDistance ; ++y ) {
	
	    for ( let catIndex = 0 ; catIndex < this.galaxy.arrayStarCategories.length ;
		  ++catIndex ) {

		let nbOfChunks = this.galaxy.arrayStarCategories[ catIndex ].nbOfChunks;

		if ( Math.abs( x - posMatrix.x ) <= nbOfChunks &&
		     Math.abs( y - posMatrix.y ) <= nbOfChunks &&
		     x >= 0 && y >= 0 && x < matrixSize && y < matrixSize ) {
		    
		    this.generateChunk( catIndex, x, y );
		    
		}

	    }
	    
	}
	
    }

    // Adds stars to the scene.
    for ( let i = 0 ; i < this.arrayGeometriesStar.length ; ++i ) {
	for ( let j = 0 ; j < this.arrayGeometriesStar[i].length ; ++j ) {
	    if ( this.arrayGeometriesStar[i][j].vertices.length > 0 ) {
		let mesh = new THREE.Points( this.arrayGeometriesStar[i][j],
					     this.arrayMaterialsStar[i][j] );
		this.galaxy.scene.add( mesh );
		this.galaxy.nbOfMesh += 1;
	    }
	}
    }
    
    writeConsole( "Number of mesh : " + this.galaxy.nbOfMesh );
    
    
} // end generateStars method







//////////////////////////////////////////////////////////////////////
StarGenerator.prototype.generateChunk = function( categoryIndex, matrixX, matrixY ) {

    
    let seed = matrixX + matrixY * this.galaxy.matrixChunks.length;
    let category = this.galaxy.arrayStarCategories[ categoryIndex ];
    let imgPos = matrixToImgPos( { x: matrixX, y: matrixY },
				 this.galaxy.matrixChunks.length, this.imgMap.width );
    let imgData = getImgDataArray( this.imgMap, imgPos.x, imgPos.y,
				   this.nbPixelForAChunkWidth, this.nbPixelForAChunkWidth );
    let theCategory = this.galaxy.arrayStarCategories[ categoryIndex ];


    // For each pixel of the chunk.
    for ( let i = 0 ; i < imgData.data.length ; i += 4 ) {

	let nbOfStarsForThisPixel =
	    this.nbOfStarsForAWhitePixel * ( imgData.data[i] / 255.0 );
	let pixelX = imgPos.x + ( i / 4 ) % this.nbPixelForAChunkWidth;
	let pixelY = imgPos.y + Math.floor( ( i / 4 ) / this.nbPixelForAChunkWidth );
	let worldXMin = pixelX * this.pixelSizeInWorldCoord - this.pixelSizeInWorldCoord / 2
	    - this.galaxy.radiusInKm;
	let worldXMax = pixelX * this.pixelSizeInWorldCoord + this.pixelSizeInWorldCoord / 2
	    - this.galaxy.radiusInKm;
	let worldZMin = pixelY * this.pixelSizeInWorldCoord - this.pixelSizeInWorldCoord / 2
	    - this.galaxy.radiusInKm;
	let worldZMax = pixelY * this.pixelSizeInWorldCoord + this.pixelSizeInWorldCoord / 2
	    - this.galaxy.radiusInKm;
	let height = this.galaxy.heightInKm + imgData.data[i + 1] / 255.0
	    * ( this.galaxy.maxHeightInKm - this.galaxy.heightInKm );

	for ( let starNb = 0 ; starNb < nbOfStarsForThisPixel ; ++starNb ) {
	    
	    let a = randomUniformSeeded( seed++, 0, 1 );    //< Determines which star category to select

	    if ( a < theCategory.proba ) {

		let starVertex = new THREE.Vector3();
		starVertex.x = randomUniformSeeded( ++seed, worldXMin, worldXMax );
		starVertex.z = randomUniformSeeded( ++seed, worldZMin, worldZMax );
		starVertex.y = randomGaussSeeded( ++seed, 0, height / 3 );

		let whichSpectralType = Math.floor(
		    randomUniformSeeded( seed, 0, category.spectralTypes.length ) );
		this.arrayGeometriesStar[categoryIndex][whichSpectralType].vertices.push(
		    starVertex );
		this.galaxy.starCount += 1;
		
	    }
		
	} // end for each star of this pixel.
	
    } // end for each pixel of the chunk.
    
	
} // end method




//////////////////////////////////////////////////////////////////////
function getMaxStarChunk( imgData, nbOfStars, matrixSize ) {

    let nbPixelForAChunk = ( imgData.data.length / 4 ) / ( matrixSize * matrixSize );
    return getNbOfStarsWhitePixel( imgData, nbOfStars ) * nbPixelForAChunk;
    
}





//////////////////////////////////////////////////////////////////////
function getNbOfStarsWhitePixel( imgData, nbOfStars ) {

    let S = 0;
    for ( let i = 0 ; i < imgData.data.length ; i+=4 ) {
	S += imgData.data[i];
    }
    return ( nbOfStars / S );
    
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
    xMatrix = Math.min( matrix.length, Math.max( 0, xMatrix ) );
    yMatrix = Math.min( matrix.length, Math.max( 0, yMatrix ) );

    return {
	x: xMatrix,
	y: yMatrix,
    }

}




//////////////////////////////////////////////////////////////////////
/**
 * Matrix must be square !
 * World origin must be in the galaxy's center !
 */
function matrixToWorldPos( matrixPos, matrixSize, chunkWorldSize ) {

    let xMatrixOriginAdjusted = matrixPos.x - matrixSize / 2;
    let yMatrixOriginAdjusted = matrixPos.y - matrixSize / 2;

    return {
	x: xMatrixOriginAdjusted * chunkWorldSize,
	y: yMatrixOriginAdjusted * chunkWorldSize,
    }

}





//////////////////////////////////////////////////////////////////////
/**
 * Matrix must be square !
 */
function matrixToImgPos( matrixPos, matrixSize, imgWidth ) {

    let coef = imgWidth / matrixSize;
    
    return {
	x: matrixPos.x * coef,
	y: matrixPos.y * coef,
    }

}


    



export { StarGenerator };
