
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
		numberOfBranches = 2,
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

    generateSpiralBranch( scene,
			  numberOfStars / numberOfBranches,
			  this.radiusInKm,
			  phi,
			  maxAngleBranchRadian,
			  false,
			  starTexture,
			  this.arrayStarCategories );
    generateSpiralBranch( scene,
			  numberOfStars / numberOfBranches,
			  this.radiusInKm,
			  phi,
			  maxAngleBranchRadian,
			  true,
			  starTexture,
			  this.arrayStarCategories );
    
	
}


////////////////////////////////////////////////////////////////////////////////
function generateSpiralBranch( scene,
			       numberOfStars,
			       radiusInKm,
			       phi,
			       maxAngleRadian,
			       negative,
			       starTexture,
			       arrayStarCategories ) {

    // For each category of stars ...
    for ( let category of arrayStarCategories ) {

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

	    let geomStarType = new THREE.Geometry();

	    placeVerticesInSpiral( geomStarType,
				   numberOfStars,
				   radiusInKm,
				   phi,
				   maxAngleRadian,
				   negative );
				   
	    // Set the star's type material
	    let colorStarType = spectralTypeToColor[spectralType];
	    let materialStarType = new THREE.PointsMaterial( {
		color: colorStarType,
		map: starTexture,
		size: Math.pow( category.luminosity, 1/3 ) * 1e12,
		blending: THREE.AdditiveBlending,
		transparent: true, } );

	    // Put all the stars of the type into a Points object.
	    let starsType = new THREE.Points(
		geomStarType, materialStarType );
	    scene.add( starsType );

	} // end for ( spectralType of arraySpectralTypes )
	
    } // end for ( category of arrayStarCategories )
    
}


////////////////////////////////////////////////////////////////////////////////
function placeVerticesInSpiral( geometry,
				numberOfStars,
				radius,
				phi,
				maxAngleRadian,
				negative ) {
    
    
    /////////////////////////////////////////////////////////////////////////////////
    // Logarithmic spiral : r = R / ( 1 - phi * tan( phi ) * log ( theta / phi ) ) //
    /////////////////////////////////////////////////////////////////////////////////
    /*
     * For more information about the formula, consult this article :
     * https://arxiv.org/pdf/0908.0892.pdf
     */
    
    let T = phi * Math.tan( phi ); //<  Pre-calculate phi * tan ( phi ) 
    let R = radius * ( 1 - T * Math.log( maxAngleRadian / phi ) );
    writeConsole( R );
    if ( negative ) {
	R = -R;
    }

    // Place stars on the spiral branch
    for (let i = 0 ; i < numberOfStars ; ++i) {
	
	let starVertex = new THREE.Vector3();
	
	// Generate random position in spiral in polar coordinates.
	let theta = Math.random() * maxAngleRadian;
	let r = R / ( 1 - T * Math.log( theta / phi ) );
	
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
function writeConsole(string) {
    console.log("[GALAX3] " + string);
}
