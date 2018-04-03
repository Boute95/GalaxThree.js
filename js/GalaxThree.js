
/////////////////
// Global data //
////////////////////////////////////////////////////////////////////////////////

/* 
 * Let's suppose 1 unit = 1 kilometers.
 */

var ly = 9.46073047e12; //< Light year
var solRadius = 6.957e5;
var segmentsCircleStar = 8;
var heightSegmentsUniverseSphere = 32;
var widthSegmentsUniverseSphere = 24;

function StarCategory(name, spectralTypes, radius, luminosity, proba) {
    this.name = name;
    this.spectralTypes = spectralTypes;
    this.radius = radius;
    this.luminosity = luminosity;
    this.proba = proba;
}

var arrayStarCategories = [
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
// Universe object //
////////////////////////////////////////////////////////////////////////////////

/**
 * Constructor for Universe object. It is a big sphere.
 * @param radius Radius of the universe in light year.
 * @param starDensity Number of stars per cubic light year.
 * @param positionOfCenter Position of universe's center in the world coordinates.
 */ 
function Universe(scene,
		  starImagePath,
		  radiusInLy,
		  starDensity = 0.004,
		  positionOfCenter = new THREE.Vector3(0,0,0)) {

    this.radiusInKm = radiusInLy * ly;
    
    // Counts total number of stars.
    this.arrayStars = [];
    let volumeInLy = 4 * Math.PI * radiusInLy * radiusInLy * radiusInLy / 3;
    let numberOfStars = Math.round(starDensity * volumeInLy);
    writeConsole("Number of stars : " + numberOfStars);

    // Generates stars
    let starTexture = new THREE.TextureLoader().load( starImagePath );
    addStars( scene, numberOfStars, this.radiusInKm, starTexture );
    
    
    
}




////////////////////////////////////////////////////////////////////////////////
function addStars( scene, numberOfStars, radiusInKm, starTexture ) {

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
	    
	    // Generate stars in the universe's sphere.
	    for (let i = 0 ; i < nbOfStarsCategory ; ++i) {
		let star = randomPosInSphere( radiusInKm );
		geomStarType.vertices.push( star );
	    }
	    
	    // Set the star's type material
	    let colorStarType = spectralTypeToColor[spectralType];
	    let materialStarType = new THREE.PointsMaterial( {
		color: colorStarType,
		map: starTexture,
		size: Math.pow( category.luminosity, 1/3 ) * 1e12,
		transparent: true, } );

	    // Put all the stars of the type into a Points object.
	    let starsType = new THREE.Points(
		geomStarType, materialStarType );
	    scene.add( starsType );

	} // end for ( spectralType of arraySpectralTypes )
	
    } // end for ( category of arrayStarCategories )
    
}





////////////////////////////////////////////////////////////////////////////////
function randomPosInSphere( radius ) {
    let vect = new THREE.Vector3();
    // Random numbers in spherical coordinates.
    let phi = Math.random() * 2 * Math.PI;
    let costheta = 2 * Math.random() - 1;
    let u = Math.random();
    let theta = Math.acos( costheta );
    let r = radius * Math.cbrt( u );
    // Converts in cartesian coordinates.
    vect.x = r * Math.sin( theta ) * Math.cos( phi );
    vect.y = r * Math.sin( theta ) * Math.sin( phi );
    vect.z = r * Math.cos( theta );
    // And we can finally return the position
    return vect;
}


/////////////////////
// Other functions //
////////////////////////////////////////////////////////////////////////////////
function writeConsole(string) {
    console.log("[GALAX3] " + string);
}
