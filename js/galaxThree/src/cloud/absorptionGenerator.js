import { getImgDataArray, getMaxArray } from '../utils.js';
import { ly } from '../consts.js';
import { randomGauss } from '../proba.js';



function generateAbsorptionClouds( galaxy, numberOfCloud, img, scene ) {

    // Takes the data from the image.
    let imgData = getImgDataArray( img );
    let maxCol = getMaxArray( imgData.data );

    // Adjust all color values between 255 and 0 if the max color is not 255.
    let coef = 255.0 / maxCol;
    for ( let i = 0 ; i < imgData.data.length ; i += 4 ) {
	imgData.data[i] *= coef;
    }
    
    let pixelSizeInWorldCoord = galaxy.radiusInKm * 2 / img.width;
    let cloudPlaced = 0;

    let textures = [
	new THREE.TextureLoader().load( "../resources/black_nebula1.png" ),
	new THREE.TextureLoader().load( "../resources/black_nebula2.png" ),
	new THREE.TextureLoader().load( "../resources/black_nebula2.png" ),
    ];
    
    let materials = [
	new THREE.PointsMaterial( { color: 0x120904,
				    map: textures[0],
				    size: 7e3 * ly,
				    transparent: true,
				    depthWrite: false,
				    opacity: 0.1,
				  } ),
	new THREE.PointsMaterial( { color: 0x060503,
	    			    map: textures[1],
	    			    size: 7e3 * ly,
	    			    transparent: true,
				    depthWrite: false,
				    opacity: 0.1,
				  } ),
	new THREE.PointsMaterial( { color: 0x060503,
	    			    map: textures[2],
	    			    size: 8e3 * ly,
	    			    transparent: true,
				    depthWrite: false,
				    opacity: 0.06,
				  } ),
    ];
    
    let geometries = [
	new THREE.Geometry(),
	new THREE.Geometry(),
	new THREE.Geometry(),
    ];

    
    // For each cloud to place.
    for ( let i = 0 ; i < numberOfCloud ; ++i ) {

	let cloudIsPlaced = false;
	
	while ( !cloudIsPlaced ) {
	    
	    let a = Math.random();
	    let randomPixelIndex =
		Math.floor( Math.random() * ( imgData.data.length / 4 ) ) * 4 ;

	    if ( a < imgData.data[ randomPixelIndex ] / 255 ) {
		
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
    
} // end method


export { generateAbsorptionClouds };
