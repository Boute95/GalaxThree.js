import { ly } from '../consts.js';
import { generateClouds } from './generator.js';



function generateEmissionClouds( galaxy, numberOfCloud, img, scene ) {

    let textures = [
	new THREE.TextureLoader().load( galaxy.dirPath + "/resources/emission_cloud.png" ),
    ];
    
    let materials = [
	new THREE.PointsMaterial( { color: 0xFFFFFF,
	    			    map: textures[0],
	    			    size: 5e3 * ly,
	    			    transparent: true,
				    depthWrite: false,
				    blending: THREE.AdditiveBlending,
				    opacity: 0.01,
				  } ),
    ];
    
    let geometries = [
	new THREE.Geometry(),
    ];

    generateClouds( galaxy, materials, geometries, numberOfCloud, img, 2, scene );
    
}


export { generateEmissionClouds };
