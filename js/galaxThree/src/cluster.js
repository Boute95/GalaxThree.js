import './lib/three.min.js';


//////////////////////////////////////////////////////////////////////
function generateCluster( geometry,
			  numberOfStars,
			  radiusInKm,
			  flatteningCoef = 0.25 ) {

    for (let i = 0 ; i < numberOfStars ; ++i) {
	
	let starVertex = new THREE.Vector3();

	starVertex.x = randomGauss( 0, 1 ) * ( radiusInKm / 3 );
	starVertex.y = randomGauss( 0, 1 - flatteningCoef ) * ( radiusInKm / 3 );
	starVertex.z = randomGauss( 0, 1 ) * ( radiusInKm / 3 );
	
	geometry.vertices.push( starVertex );
	
    }
    
} // end method


export generateCluster;
