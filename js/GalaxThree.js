
/////////////////
// Global data //
////////////////////////////////////////////////////////////////////////////////

/* 
 * Let's suppose 1 unit = 1 kilometers.
 */

var ly = 9.46073047e12; //< 1 Light year in km.
var solRadius = 6.957e5;

function StarCategory(name, spectralTypes, radius, luminosity, proba) {
    this.name = name;
    this.spectralTypes = spectralTypes;
    this.radius = radius;
    this.luminosity = luminosity;
    this.proba = proba;
}

var spectralTypeToColor = {
    M : 0xFFCC6F,
    K : 0xFFD2A1,
    G : 0xFFF4EA,
    F : 0xF8F7FF,
    A : 0xCAD7FF,
    B : 0xAABFFF,
    O : 0x9BB0FF,
    D : 0x9BB2FF,
};






/////////////////////
// Galaxy object //
////////////////////////////////////////////////////////////////////////////////

/**
 * Constructor for Galaxy object. It is a big sphere.
 * @param radius Radius of the galaxy in light year.
 * @param starDensity Number of stars per cubic light year.
 * @param positionOfCenter Position of galaxy's center in the world coordinates.
 */ 
function Galaxy(scene,
		starImagePath,
		radiusInLy = 200,
		numberOfStars = 1e6,
		phi = 0.4,
		maxAngleBranchRadian = 2 * Math.PI) {
    
    this.radiusInKm = radiusInLy * ly;
    this.arrayStarCategories = [
	new StarCategory("MS_M",["M"],
			 0.3,     0.01,       0.8),
	new StarCategory("MS_K",["K"],
			 0.8,     0.2,        0.08),
	new StarCategory("MS_G",["G"],
			 1.0,     1.0,        0.035),
	new StarCategory("MS_F",["F"],
			 1.3,     4.0,        0.02),
	new StarCategory("MS_A",["A"],
			 1.7,     20.0,       0.007),
	new StarCategory("MS_B",["B"],
			 5.0,     1000,       0.001),
	new StarCategory("MS_O",["O"],
			 10.0,    100000.0,   0.0000001),
	new StarCategory("G",   ["G","K","M"],
			 30.0,    600.0,      0.004),
	new StarCategory("WD",  ["D"],
			 0.01,    0.01,       0.05),
	new StarCategory("SG",  ["O","B","A","F","G","K","M"],
			 300.0,   600000.0,   0.000001),
    ];

    writeConsole("Number of stars : " + numberOfStars);

    // Generates the two branches of the galaxy's spiral
    let starTexture = new THREE.TextureLoader().load( starImagePath );
    
    // For each category of stars ...
    for ( let category of this.arrayStarCategories ) {

	// Counts number of stars for the category.
    	let nbOfStarsCategory = Math.round( category.proba * numberOfStars );
	writeConsole( nbOfStarsCategory + " stars for the category " +
		      category["name"] );

	// Take the different spectral types of the category.
	let arraySpectralTypes;
	if ( category.spectralTypes.length > 1 &&
	     category.spectralTypes < nbOfStarsCategory ) {
	    let tmp_spectralTypes = category.spectralTypes.slice();
	    for ( let i = 0 ; i < nbOfStarsCategory ; ++i ) {
		let index = Math.random() * tmp_spectralTypes.length;
		arraySpectralTypes.push( tmp_spectralTypes );
		tmp_spectralTypes.splice( index, 1 );
	    }
	}
	else {
	    arraySpectralTypes = category.spectralTypes;
	}

	// Generate stars for each spectralType of the category
	for ( let spectralType of arraySpectralTypes ) {

	    let geometryStarType = new THREE.Geometry();
	    generateCluster( geometryStarType,
			     numberOfStars / 6,
			     this.radiusInKm / 2 );
	    generateSpiral( geometryStarType,
	    		    2 * numberOfStars / 3,
	    		    this.radiusInKm,
	    		    phi,
	    		    maxAngleBranchRadian );
	    
	    // Set the star's type material
	    let colorStarType = spectralTypeToColor[spectralType];
	    let materialStarType = new THREE.PointsMaterial( {
		color: colorStarType,
		map: starTexture,
		size: Math.pow( category.luminosity, 1/3.2 ) * 1e11,
		blending: THREE.AdditiveBlending,
		transparent: true, } );

	    // Put all the stars of the type into a Points object.
	    let starsType = new THREE.Points(
		geometryStarType, materialStarType );
	    scene.add( starsType );

	} // end for ( spectralType of arraySpectralTypes )
	
    } // end for ( category of arrayStarCategories )
    
}



////////////////////////////////////////////////////////////////////////////////
function generateCluster( geometry,
			  numberOfStars,
			  radiusInKm,
			  dispersion,
			  starTexture,
			  arrayStarCategories ) {

    // Place stars on the spiral branch
    for (let i = 0 ; i < numberOfStars ; ++i) {
	
	let starVertex = new THREE.Vector3();
	
	// Generate random position in spiral in polar coordinates.
	let theta = Math.random() * 2 * Math.PI;
	let phi = Math.random() * Math.PI;
	let r = randomGauss( 0, 1 ) * ( radiusInKm / 3 );
	
	// Converts into cartesian coordinates.
	starVertex.x = r * Math.cos( theta ) * Math.sin( phi );
	starVertex.z = r * Math.sin( theta ) * Math.sin( phi );
	starVertex.y = r * Math.cos( phi );
	
	// And finally pushes the vertex
	geometry.vertices.push( starVertex );
	
    }

    
}


////////////////////////////////////////////////////////////////////////////////
function generateSpiral( geometry,
			 numberOfStars,
			 radiusInKm,
			 phi,
			 maxAngleRadian ) {
    
    placeVerticesInSpiral( geometry,
			   numberOfStars / 2,
			   radiusInKm,
			   phi,
			   maxAngleRadian,
			   true );
    placeVerticesInSpiral( geometry,
			   numberOfStars / 2,
			   radiusInKm,
			   phi,
			   maxAngleRadian,
			   false );
    
    
}


////////////////////////////////////////////////////////////////////////////////
function placeVerticesInSpiral( geometry,
				numberOfStars,
				radius,
				phi,
				maxAngleRadian,
				negative ) {
    
    
    ///////////////////////////////////////////////////////////////////////////////
    // Logarithmic spiral : r = R / ( 1 - phi * tan( phi ) * log ( theta/phi ) ) //
    ///////////////////////////////////////////////////////////////////////////////
    /*
     * For more information about the formula, consult this article :
     * https://arxiv.org/pdf/0908.0892.pdf
     */
    
    let T = phi * Math.tan( phi ); //<  Pre-calculate phi * tan ( phi ) 
    let R = radius * ( 1 - T * Math.log( maxAngleRadian / phi ) );
    if ( negative ) {
	R = -R;
    }

    // Place stars on the spiral branch
    for (let i = 0 ; i < numberOfStars ; ++i) {
	
	let starVertex = new THREE.Vector3();
	
	// Generate random position in spiral in polar coordinates.
	let theta = Math.random() * maxAngleRadian;
	let r = R / ( 1 - T * Math.log( theta / phi ) );
	r += randomGauss( 0, 1 ) * 10 * ly;
	
	// Converts into cartesian coordinates.
	starVertex.x = r * Math.cos( theta );
	starVertex.z = r * Math.sin( theta );
	starVertex.y = 0;
	
	// And finally pushes the vertex
	geometry.vertices.push( starVertex );
	
    }
    
}





/////////////////////
// Other functions //
////////////////////////////////////////////////////////////////////////////////
/**
 * Generate a random number with normal distribution N(0,1) 
 */
function randomGauss( mu = 0, sigma = 1 ) {
    let u = Math.random();
    let v = Math.random();
    let Z = Math.sqrt( -2.0 * Math.log( u ) ) * Math.cos( 2 * Math.PI * v );
    return Z * sigma + mu;
}



function writeConsole(string) {
    console.log("[GALAX3] " + string);
}
