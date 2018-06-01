import { ly } from '../consts.js';
import { createMaterials } from './material.js';
import { setProbaPerChunk } from './chunk.js';
import { writeConsole, getImgDataArray } from '../utils.js';
import { randomUniform, randomGauss } from '../proba.js';


//////////////////////////////////////////////////////////////////////
function StarGenerator( galaxy, imgStarMap, starTexture, nbOfStars ) {

    
    this.galaxy = galaxy;

    this.imgMap = imgStarMap;

    this.imgStarData = getImgDataArray( imgStarMap );

    this.nbOfStarsForAWhitePixel = getNbOfStarsWhitePixel( this.imgStarData, nbOfStars );

    this.pixelSizeInWorldCoord = galaxy.radiusInKm * 2 / imgStarMap.width;

    this.chunkWidthInPixel = imgStarMap.width / this.galaxy.matrixChunks.length;
    
    this.maxStarForAChunk = getMaxStarChunk( this.imgStarData, nbOfStars,
					     this.galaxy.matrixChunks.length );

    this.imgMatrix = createImgMatrix( this );
    
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

    // 2211ms without matrix
    
    let arng = new alea( matrixX + matrixY * this.galaxy.matrixChunks.length );
    let category = this.galaxy.arrayStarCategories[ categoryIndex ];
    let imgPos = matrixToImgPos( { x: matrixX, y: matrixY },
				 this.galaxy.matrixChunks.length, this.imgMap.width );
    let theCategory = this.galaxy.arrayStarCategories[ categoryIndex ];


    for ( let y = imgPos.y ; y < imgPos.y + this.chunkWidthInPixel ; ++y ) {

	for ( let x = imgPos.x ; x < imgPos.x + this.chunkWidthInPixel ; ++x ) {

	    let pixel = this.imgMatrix[y][x];

	    for ( let i = 0 ; i < pixel.nbOfStars ; ++i ) {
		
		let a = arng();    //< Determines which star category to select
		
		if ( a < theCategory.proba ) {
		    
		    let starVertex = new THREE.Vector3();
		    
		    starVertex.x = arng.double() * ( pixel.worldXMax - pixel.worldXMin ) +
			pixel.worldXMin;
		    starVertex.z = arng.double() * ( pixel.worldZMax - pixel.worldZMin ) +
			pixel.worldZMin;
		    starVertex.y = randomGauss( 0, pixel.height / 3 );

		    let whichSpectralType = Math.floor( arng() * category.spectralTypes.length );
		    this.arrayGeometriesStar[categoryIndex][whichSpectralType].vertices.push(
			starVertex );
		    this.galaxy.starCount += 1;
		
		}

	    }
		
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
	x: Math.floor( matrixPos.x * coef ),
	y: Math.floor( matrixPos.y * coef ),
    }

}




function createImgMatrix( starGenerator ) {

    let imgData = starGenerator.imgStarData;
    
    let matrix = [];
    for ( let i = 0 ; i < starGenerator.imgMap.width ; ++i ) {
	
	matrix.push( new Array() );
	
	for( let j = 0 ; j < starGenerator.imgMap.height ; ++j ) {
	    
	    matrix[i].push( {} );

	    let indexData = ( j + i * starGenerator.imgMap.width ) * 4;

	    matrix[i][j].nbOfStars =
		starGenerator.nbOfStarsForAWhitePixel * ( imgData.data[indexData] / 255.0 );
	    
	    matrix[i][j].worldXMin = j * starGenerator.pixelSizeInWorldCoord -
		starGenerator.pixelSizeInWorldCoord / 2	- starGenerator.galaxy.radiusInKm;
	    
	    matrix[i][j].worldXMax = j * starGenerator.pixelSizeInWorldCoord +
		starGenerator.pixelSizeInWorldCoord / 2	- starGenerator.galaxy.radiusInKm;
	    
	    matrix[i][j].worldZMin = j * starGenerator.pixelSizeInWorldCoord -
		starGenerator.pixelSizeInWorldCoord / 2	- starGenerator.galaxy.radiusInKm;
	    
	    matrix[i][j].worldZMax = j * starGenerator.pixelSizeInWorldCoord +
		starGenerator.pixelSizeInWorldCoord / 2	- starGenerator.galaxy.radiusInKm;
	    
	    matrix[i][j].height = starGenerator.galaxy.heightInKm + imgData.data[indexData + 1]
		/ 255.0	* ( starGenerator.galaxy.maxHeightInKm - starGenerator.galaxy.heightInKm );

	}
	
    }

    return matrix;

}

    



export { StarGenerator };
