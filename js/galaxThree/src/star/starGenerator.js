import { createMaterials } from './material.js';
import { setProbaPerChunk } from './chunk.js';
import { writeConsole, getImgDataArray } from '../utils.js';
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

    this.maxStarForAChunk = getMaxStarChunk( this.imgStarData, nbOfStars,
					     this.galaxy.matrixChunks.length );

    
    
    setProbaPerChunk( this.imgStarData, this.galaxy.matrixChunks );

    
} // end StarGenerator




//////////////////////////////////////////////////////////////////////
StarGenerator.prototype.generateStars = function( camPosition ) {


    let matrixSize = this.galaxy.matrixChunks.length;
    let posMatrix = worldPosToMatrixPos( camPosition, this.galaxy.matrixChunks,
					      this.galaxy.radiusInKm * 2 );

    
    for ( let i = 1 ; i < this.maxChunkDistance ; ++i ) {

	for ( let catIndex = 0 ; catIndex < this.galaxy.arrayStarCategories.length ;
	      ++catIndex ) {

	    if ( i <= this.galaxy.arrayStarCategories[ catIndex ].nbOfChunks ) {

		if ( posMatrix.x - i > 0 ) {
		    
		    this.generateChunk( catIndex, posMatrix.x - i, posMatrix.y );
		    
		    if ( posMatrix.y - i > 0 ) {
			this.generateChunk( catIndex, posMatrix.x - i, posMatrix.y - i );
		    }

		    if ( posMatrix.y + i < matrixSize ) {
			this.generateChunk( catIndex, posMatrix.x - i, posMatrix.y + i );
		    }
		    
		}

		if ( posMatrix.y + i < matrixSize ) {
		    this.generateChunk( catIndex, posMatrix.x, posMatrix.y + i );
		}

		if ( posMatrix.y - i > 0 ) {
		    this.generateChunk( catIndex, posMatrix.x, posMatrix.y - i );
		}
		
		if ( posMatrix.x + i < matrixSize ) {
		    
		    this.generateChunk( catIndex, posMatrix.x + i, posMatrix.y );

		    if ( posMatrix.y - i > 0 ) {
			this.generateChunk( catIndex, posMatrix.x + i, posMatrix.y - i );
		    }

		    if ( posMatrix.y + i < matrixSize ) {
			this.generateChunk( catIndex, posMatrix.x + i, posMatrix.y + i );
		    }
		    
		}
		
	    }
	    
	} // end for each category
	
    } // end for i in [ 1..maxChunkDistance ]

    writeConsole( "Number of mesh : " + this.galaxy.nbOfMesh );
    
    
} // end generateStars method







//////////////////////////////////////////////////////////////////////
StarGenerator.prototype.generateChunk = function( categoryIndex, matrixX, matrixY ) {

    let seed = matrixX + matrixY * this.galaxy.matrixChunks.length;
    let category = this.galaxy.arrayStarCategories[ categoryIndex ];
    let theChunk = this.galaxy.matrixChunks[ matrixY ][ matrixX ];
    
    let chunkProba = theChunk.proba;
    let nbOfStarsThisChunk = this.maxStarForAChunk * chunkProba * category.proba;

     writeConsole( "Generating " + nbOfStarsThisChunk + " stars in [ " + matrixY + " "
		  + matrixX + " ]" );

    let worldPos = matrixToWorldPos( { x: matrixX, y: matrixY },
				     this.galaxy.matrixChunks.length,
				     this.galaxy.chunkWorldSize );

    let worldXMin = worldPos.x;
    let worldXMax = worldPos.x * this.galaxy.chunkWorldSize;
    let worldZMin = worldPos.y;
    let worldZMax = worldPos.y * this.galaxy.chunkWorldSize;
    let height = this.galaxy.heightInKm;
    
    
    for ( let i = 0 ; i < nbOfStarsThisChunk ; ++i ) {
	
	let starVertex = new THREE.Vector3();
	starVertex.x = randomUniformSeeded( ++seed, worldXMin, worldXMax );
	starVertex.z = randomUniformSeeded( ++seed, worldZMin, worldZMax );
	starVertex.y = randomGaussSeeded( ++seed, 0, height / 3 );

	let whichSpectralType = Math.floor(
	    randomUniformSeeded( ++seed, 0, category.spectralTypes.length ) );
	this.arrayGeometriesStar[categoryIndex][whichSpectralType].vertices.push(
	    starVertex );
	this.galaxy.starCount += 1;
	
    } // end for

    
    // Adds stars to the scene.
    for ( let i = 0 ; i < this.arrayGeometriesStar[categoryIndex].length ; ++i ) {
	if ( this.arrayGeometriesStar[categoryIndex][i].vertices.length > 0 ) {
	    let mesh = new THREE.Points( this.arrayGeometriesStar[categoryIndex][i],
					 this.arrayMaterialsStar[categoryIndex][i] );
	    this.galaxy.scene.add( mesh );
	    this.galaxy.nbOfMesh += 1;
	}
    }
    
    
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




export { StarGenerator };
