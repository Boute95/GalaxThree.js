import { createStarGeoAndMaterials } from './geoAndMaterial.js';
import { getImgDataArray } from '../utils.js';
import { randomUniformSeeded, randomGaussSeeded } from '../proba.js';



//////////////////////////////////////////////////////////////////////
function generateStars( galaxy, numberOfStars, img, scene ) {

    createStarGeoAndMaterials( galaxy );

    
    let imgData = getImgDataArray( img );
    let nbOfStarsForAWhitePixel = getNbOfStarsWhitePixel( imgData, numberOfStars );
    let pixelSizeInWorldCoord = galaxy.radiusInKm * 2 / img.width;

    
    // For each pixel of the map.
    for ( let i = 0 ; i < imgData.data.length ; i += 4 ) {

	let nbOfStarsForThisPixel =
	    nbOfStarsForAWhitePixel * ( imgData.data[i] / 255.0 );
	let pixelX = ( i / 4 ) % img.width;
	let pixelY = Math.floor( ( i / 4 ) / img.width );
	let worldXMin = pixelX * pixelSizeInWorldCoord - pixelSizeInWorldCoord / 2
	    - galaxy.radiusInKm;
	let worldXMax = pixelX * pixelSizeInWorldCoord + pixelSizeInWorldCoord / 2
	    - galaxy.radiusInKm;
	let worldZMin = pixelY * pixelSizeInWorldCoord - pixelSizeInWorldCoord / 2
	    - galaxy.radiusInKm;
	let worldZMax = pixelY * pixelSizeInWorldCoord + pixelSizeInWorldCoord / 2
	    - galaxy.radiusInKm;
	let height = galaxy.heightInKm + imgData.data[i + 1] / 255
	    * ( galaxy.maxHeightInKm - galaxy.heightInKm );

	for ( let starNb = 0 ; starNb < nbOfStarsForThisPixel ; ++starNb ) {
	    
	    let a = randomUniformSeeded();    //< Determines which star category to select
	    let sumProba = 0;
	    let categoryIndex = 0;
	    let starPlaced = false;

	    while ( !starPlaced && categoryIndex < galaxy.arrayStarCategories.length ) {

		let category = galaxy.arrayStarCategories[ categoryIndex ];
		sumProba += category.proba;
		
		if ( a < sumProba ) {

		    let starVertex = new THREE.Vector3();
		    starVertex.x = randomUniformSeeded( worldXMin, worldXMax );
		    starVertex.z = randomUniformSeeded( worldZMin, worldZMax );
		    starVertex.y = randomGaussSeeded( 0, height / 3 );

		    let whichSpectralType = Math.floor(
			randomUniformSeeded( 0, category.spectralTypes.length ) );
		    galaxy.arrayGeoAndMatStar[ categoryIndex ][ whichSpectralType ][ "geometry" ].
			vertices.push( starVertex );
		    galaxy.starCount += 1;
		    starPlaced = true;
		    
		}

		++categoryIndex;
		
	    } // end for each category.

	} // end for each star of this pixel.
	
    } // end for each pixel of the map.

    
    // Adds stars to the scene.
    for ( let category of galaxy.arrayGeoAndMatStar ) {
	for ( let geoAndMat of category ) {
	    if ( geoAndMat["geometry"].vertices.length > 0 ) {
		let mesh = new THREE.Points( geoAndMat["geometry"], geoAndMat["material"] );
		galaxy.starMeshes.push( mesh );
		scene.add( mesh );
	    }
	}
    }

    
}




//////////////////////////////////////////////////////////////////////
function getNbOfStarsWhitePixel( imgData, nbOfStars ) {

    let S = 0;
    for ( let i = 0 ; i < imgData.data.length ; i+=4 ) {
	S += imgData.data[i] + imgData.data[i + 1] + imgData.data[i + 2];
    }
    return ( nbOfStars / S ) * 255;
    
}



export { generateStars };
