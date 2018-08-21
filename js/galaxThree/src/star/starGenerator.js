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

    this.camPositionMatrix = { x: 0, y: 0 };


    

    setProbaPerChunk( this.imgStarData, this.galaxy.matrixChunks );

    
} // end StarGenerator




//////////////////////////////////////////////////////////////////////
StarGenerator.prototype.generateStars = function( camPosition ) {

    
    let camPosMatrix = worldPosToMatrixPos( camPosition, this.galaxy.matrixChunks,
					    this.galaxy.radiusInKm * 2 );

    
    // Return if camera didn't enter a new chunk.
    if ( camPosMatrix.x == this.camPositionMatrix.x &&
	 camPosMatrix.y == this.camPositionMatrix.y ) {
	return;
    }
    this.camPositionMatrix.x = camPosMatrix.x;
    this.camPositionMatrix.y = camPosMatrix.y;


    // Removes vertices.
    for ( let catIndex = 0 ; catIndex < this.galaxy.arrayStarCategories.length ;
	  ++catIndex ) {
	this.removeVertices( catIndex );
    }
    this.starCount = 0;


    // Generate vertices.
    let matrixSize = this.galaxy.matrixChunks.length;

    for ( let x = this.camPositionMatrix.x - this.maxChunkDistance ;
    	  x < this.camPositionMatrix.x + this.maxChunkDistance ; ++x ) {

    	for ( let y = this.camPositionMatrix.y - this.maxChunkDistance ;
    	      y < this.camPositionMatrix.y + this.maxChunkDistance ; ++y ) {
	
    	    for ( let catIndex = 0 ; catIndex < this.galaxy.arrayStarCategories.length ;
    		  ++catIndex ) {

    		let nbOfChunks = this.galaxy.arrayStarCategories[ catIndex ].nbOfChunks;

    		if ( Math.abs( x - this.camPositionMatrix.x ) <= nbOfChunks &&
    		     Math.abs( y - this.camPositionMatrix.y ) <= nbOfChunks &&
    		     x >= 0 && y >= 0 && x < matrixSize && y < matrixSize ) {

    		    this.generateChunk( catIndex, x, y );
		    
    		}

    	    }
	    
    	}
	
    }


    //Remove meshes.
    this.galaxy.removeMeshes();

    
    // Adds meshes to the scene.
    for ( let i = 0 ; i < this.arrayGeometriesStar.length ; ++i ) {
    	for ( let j = 0 ; j < this.arrayGeometriesStar[i].length ; ++j ) {
    	    if ( this.arrayGeometriesStar[i][j].vertices.length > 0 ) {
    		let mesh = new THREE.Points( this.arrayGeometriesStar[i][j],
    					     this.arrayMaterialsStar[i][j] );
    		this.galaxy.scene.add( mesh );
		this.galaxy.starMeshes.push( mesh );
    	    }
    	}
    }

    
    writeConsole( "Number of mesh : " + this.galaxy.starMeshes.length );
    writeConsole( 'Nb of vertices ' + this.arrayGeometriesStar[0][0].vertices.length );
    
    
} // end generateStars method





//////////////////////////////////////////////////////////////////////
StarGenerator.prototype.removeVertices = function( categoryIndex ) {

    let theCategory = this.galaxy.arrayStarCategories[ categoryIndex ];
    
    for ( let specType = 0 ; specType <  theCategory.spectralTypes.length ; ++specType ) {
	this.arrayGeometriesStar[categoryIndex][specType].vertices.length = 0;
    }
    
} // end removeVertices method




//////////////////////////////////////////////////////////////////////
StarGenerator.prototype.generateChunk = function( categoryIndex, matrixX, matrixY ) {

    
    let randomizator = new alea( matrixX + matrixY * this.galaxy.matrixChunks.length );
    let category = this.galaxy.arrayStarCategories[ categoryIndex ];
    let imgPos = matrixToImgPos( { x: matrixX, y: matrixY },
				 this.galaxy.matrixChunks.length, this.imgMap.width );
    let theCategory = this.galaxy.arrayStarCategories[ categoryIndex ];


    for ( let y = imgPos.y ; y < imgPos.y + this.chunkWidthInPixel ; ++y ) {

	for ( let x = imgPos.x ; x < imgPos.x + this.chunkWidthInPixel ; ++x ) {

	    let pixel = this.imgMatrix[y][x];
   
	    for ( let i = 0 ; i < pixel.nbOfStars ; ++i ) {
		
		let a = randomizator();

		if ( a < theCategory.proba ) {
		    
		    let starVertex = new THREE.Vector3();
		    
		    starVertex.x = randomizator.double() * ( pixel.worldXMax - pixel.worldXMin ) +
			pixel.worldXMin;
		    starVertex.z = randomizator.double() * ( pixel.worldZMax - pixel.worldZMin ) +
			pixel.worldZMin;
		    starVertex.y = randomGauss( 0, pixel.height / 3, randomizator(), randomizator() );

		    let whichSpectralType = Math.floor( randomizator() * category.spectralTypes.length );
		    this.arrayGeometriesStar[categoryIndex][whichSpectralType].vertices.push(
			starVertex );
		    this.galaxy.starCount += 1;
		
		}

	    }
		
	} 
	
    }

    
    for ( let x = 0 ; x < category.spectralTypes.length ; ++x ) {
	this.arrayGeometriesStar[categoryIndex][x].verticesNeedUpdate = true;
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
    let zCamOriginAdjusted = camPosClone.z + sizeGalaxyInKm / 2;
    let sizeOfAChunkInKm = sizeGalaxyInKm / matrix.length;
    let xMatrix = Math.floor( xCamOriginAdjusted / sizeOfAChunkInKm );
    let yMatrix = Math.floor( zCamOriginAdjusted / sizeOfAChunkInKm );
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
	    
	    matrix[i][j].worldZMin = i * starGenerator.pixelSizeInWorldCoord -
		starGenerator.pixelSizeInWorldCoord / 2	- starGenerator.galaxy.radiusInKm;
	    
	    matrix[i][j].worldZMax = i * starGenerator.pixelSizeInWorldCoord +
		starGenerator.pixelSizeInWorldCoord / 2	- starGenerator.galaxy.radiusInKm;
	    
	    matrix[i][j].height = starGenerator.galaxy.heightInKm + imgData.data[indexData + 1]
		/ 255.0	* ( starGenerator.galaxy.maxHeightInKm - starGenerator.galaxy.heightInKm );

	}
	
    }

    return matrix;

}

    



export { StarGenerator };
