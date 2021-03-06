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
					       galaxy.arraySpectralCodeToColor,
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



    
    generateGlobalStars( this );
    
    setProbaPerChunk( this.imgStarData, this.galaxy.matrixChunks );

    
} // end StarGenerator




//////////////////////////////////////////////////////////////////////
StarGenerator.prototype.generateStars = function( camPosition ) {

    let start = performance.now();
    
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
	
	let theCategory = this.galaxy.arrayStarCategories[ catIndex ];

	if ( this.galaxy.arrayStarCategories[ catIndex ].nbOfChunks > 0 ) {
	
	    for ( let specType = 0 ; specType <  theCategory.spectralTypes.length ; ++specType ) {
		this.arrayGeometriesStar[catIndex][specType] = new THREE.Geometry();
	    }

	}

    }

    this.galaxy.starCount = 0;

    
    //Removes meshes.
    this.galaxy.removeMeshes();


    // Generate vertices.
    let matrixSize = this.galaxy.matrixChunks.length;

    for ( let catIndex = 0 ; catIndex < this.galaxy.arrayStarCategories.length ; ++catIndex ) {

	let nbOfChunks = this.galaxy.arrayStarCategories[ catIndex ].nbOfChunks;

	if ( nbOfChunks > 0 ) {
	    
	    for ( let x = Math.max( 0, this.camPositionMatrix.x - nbOfChunks ) ;
		  x <= Math.min( matrixSize-1, this.camPositionMatrix.x + nbOfChunks ) ; ++x ) {
		
    		for ( let y = Math.max( 0, this.camPositionMatrix.y - nbOfChunks ) ;
    		      y <= Math.min( matrixSize-1, this.camPositionMatrix.y + nbOfChunks ) ; ++y ) {

		    this.generateVerticesChunk( catIndex, x, y );
		    
		}
		
	    }
	    
	}
	
    }


    // Adds meshes to the scene.
    for ( let catIndex = 0 ; catIndex < this.arrayGeometriesStar.length ; ++catIndex ) {
	
	if ( this.galaxy.arrayStarCategories[ catIndex ].nbOfChunks > 0 ) {
	    
    	    for ( let specType = 0 ; specType < this.arrayGeometriesStar[ catIndex ].length ; ++specType ) {
		
    		if ( this.arrayGeometriesStar[ catIndex ][ specType ].vertices.length > 0 ) {
		    
    		    let mesh = new THREE.Points( this.arrayGeometriesStar[catIndex][specType],
    						 this.arrayMaterialsStar[catIndex][specType] );
    		    this.galaxy.scene.add( mesh );
		    this.galaxy.arrayStarCategories[ catIndex ].spectralTypes[ specType ].mesh = mesh;
    		}
		
	    }
	    
    	}
	
    }

    
    writeConsole( 'Nb of stars ' + this.galaxy.starCount );
    
    let end = performance.now();
    writeConsole( "Generation time : " + (end - start) + "ms" );



    
} // end generateStars method




//////////////////////////////////////////////////////////////////////
StarGenerator.prototype.generateVerticesChunk = function( categoryIndex, matrixX, matrixY ) {


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
function generateGlobalStars( generator ) {

    
    let arrayStarCategories = generator.galaxy.arrayStarCategories;
    let matrixSize = generator.galaxy.matrixChunks.length;

    
    // Generate Vertices
    for ( let catIndex = 0 ; catIndex < arrayStarCategories.length ; ++catIndex ) {

	if ( arrayStarCategories[ catIndex ].nbOfChunks === 0 ) {

	    for ( let x = 0 ; x <= matrixSize-1 ; ++x ) {
		
    		for ( let y = 0 ; y <= matrixSize-1 ; ++y ) {

		    generator.generateVerticesChunk( catIndex, x, y );
		    
		}
		
	    }
	    
	}
	
    }

    
    // Adds meshes to the scene.
    for ( let catIndex = 0 ; catIndex < generator.arrayGeometriesStar.length ; ++catIndex ) {
	
	if ( generator.galaxy.arrayStarCategories[ catIndex ].nbOfChunks == 0 ) {
	    
    	    for ( let specType = 0 ; specType < generator.arrayGeometriesStar[ catIndex ].length ; ++specType ) {
		
    		if ( generator.arrayGeometriesStar[ catIndex ][ specType ].vertices.length > 0 ) {
		    
    		    let mesh = new THREE.Points( generator.arrayGeometriesStar[catIndex][specType],
    						 generator.arrayMaterialsStar[catIndex][specType] );
    		    generator.galaxy.scene.add( mesh );
		    generator.galaxy.arrayStarCategories[ catIndex ].spectralTypes[ specType ].mesh = mesh;
    		}
		
	    }
	    
    	}
	
    }
    
    
} // end method



//////////////////////////////////////////////////////////////////////
function getMaxStarChunk( imgData, nbOfStars, matrixSize ) {

    let nbPixelForAChunk = ( imgData.data.length / 4 ) / ( matrixSize * matrixSize );
    return getNbOfStarsWhitePixel( imgData, nbOfStars ) * nbPixelForAChunk;
    
} // end method





//////////////////////////////////////////////////////////////////////
function getNbOfStarsWhitePixel( imgData, nbOfStars ) {

    let S = 0;
    for ( let i = 0 ; i < imgData.data.length ; i+=4 ) {
	S += imgData.data[i];
    }
    return ( nbOfStars / S );
    
} // end method




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

} // end method




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

} // end method





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

} // end method




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

} // end method

    



export { StarGenerator };
