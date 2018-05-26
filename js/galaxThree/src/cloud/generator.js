import { getImgDataArray, getMaxArray } from '../utils.js';
import { ly } from '../consts.js';
import { randomGauss } from '../proba.js';



function generateClouds( galaxy, materials, geometries, numberOfCloud, img, RGBChannel, scene ) {

    // Takes the data from the image.
    let imgData = getImgDataArray( img );
    let maxCol = getMaxArray( imgData.data );

    // Adjust all color values between 255 and 0 if the max color is not 255.
    let coef = 255.0 / maxCol;
    for ( let i = 0 ; i < imgData.data.length ; i += 4 ) {
	imgData.data[ i + RGBChannel ] *= coef;
    }
    
    let pixelSizeInWorldCoord = galaxy.radiusInKm * 2 / img.width;
    let cloudPlaced = 0;
    
    // For each cloud to place.
    for ( let i = 0 ; i < numberOfCloud ; ++i ) {

	let cloudIsPlaced = false;
	
	while ( !cloudIsPlaced ) {
	    
	    let a = Math.random();
	    let randomPixelIndex =
		Math.floor( Math.random() * ( imgData.data.length / 4 ) ) * 4;

	    if ( a < imgData.data[ randomPixelIndex + RGBChannel ] / 255 ) {
		
		let pixelX = ( randomPixelIndex / 4 ) % img.width;
		let pixelY = Math.floor( ( randomPixelIndex / 4 ) / img.width );
		let worldX = pixelX * pixelSizeInWorldCoord - galaxy.radiusInKm;
		let worldZ = pixelY * pixelSizeInWorldCoord - galaxy.radiusInKm;

		let x = worldX;
		let z = worldZ;
		let y = randomGauss() * 0.2 * galaxy.heightInKm;
		let whichCloudTex = Math.floor( Math.random() * materials.length );
		geometries[ whichCloudTex ].vertices.push(
		    new THREE.Vector3( x, 0, z ) );
		++cloudPlaced;
		cloudIsPlaced = true;
		
	    }
	} // end while 
    } // end for

    for( let i = 0 ; i < geometries.length ; ++i ) {
	scene.add( new THREE.Points( geometries[i], materials[i] ) );
    }
    
    return cloudPlaced;
    
}


export { generateClouds };
