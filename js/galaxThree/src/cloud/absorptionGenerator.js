import { ly } from '../consts.js';
import { generateClouds } from './generator.js';



function generateAbsorptionClouds( galaxy, numberOfCloud, img, scene ) {

    let textures = [
	new THREE.TextureLoader().load( galaxy.dirPath + "/resources/black_nebula1.png" ),
	new THREE.TextureLoader().load( galaxy.dirPath + "/resources/black_nebula2.png" ),
	new THREE.TextureLoader().load( galaxy.dirPath + "/resources/black_nebula2.png" ),
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

    generateClouds( galaxy, materials, geometries, numberOfCloud, img, 0, scene );
    
}


export { generateAbsorptionClouds };
