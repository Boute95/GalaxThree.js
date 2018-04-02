
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

function StarCategory(spectralType, radius, luminosity, proba) {
    this.spectralType = spectralType;
    this.radius = radius;
    this.luminosity = luminosity;
    this.proba = proba;
}

var arrayStarCategories = [
    new StarCategory("M",            0.3 * solRadius,     0.01,       0.8),
    new StarCategory("K",            0.8 * solRadius,     0.2,        0.08),
    new StarCategory("G",            1.0 * solRadius,     1.0,        0.035),
    new StarCategory("F",            1.3 * solRadius,     4.0,        0.02),
    new StarCategory("A",            1.7 * solRadius,     20.0,       0.007),
    new StarCategory("B",            5.0 * solRadius,     1000,       0.001),
    new StarCategory("O",            10.0 * solRadius,    100000.0,   0.0000001),
    // new StarCategory("",        30.0,    600.0,      0.004),
    // new StarCategory("WHITEDWARF",   0.01,    0.01,       0.05),
    // new StarCategory("SUPERGIANT",   300.0,   600000.0,   0.000001),
];




/////////////////////
// Universe object //
////////////////////////////////////////////////////////////////////////////////

/**
 * Constructor for Universe object. It is a big sphere.
 * @param radius Radius of the universe in light year.
 * @param starDensity Number of stars per cubic light year.
 * @param positionOfCenter Position of sphere's center in the world coordinates.
 */ 
function Universe(scene,
		  radiusInLy,
		  starDensity = 0.004,
		  positionOfCenter = new THREE.Vector3(0,0,0)) {

    this.radiusInKm = radiusInLy * ly;
    
    // Counts total number of stars.
    this.arrayStars = [];
    let volumeInLy = 4 * Math.PI * radiusInLy * radiusInLy * radiusInLy / 3;
    let numberOfStars = Math.round(starDensity * volumeInLy);
    writeConsole("Number of stars : " + numberOfStars);

    let starTexture = new THREE.TextureLoader().load( "resources/particle2.png" );
    
    // Generate stars and position them randomly
    for ( let category of arrayStarCategories ) {

	// Counts number of stars per category
    	let nbOfStarsCategory = Math.round( category.proba * numberOfStars );
	writeConsole( nbOfStarsCategory + " stars for the category " +
		     category["spectralType"] );

	// Create a geometry for each category with a particular material
	let starCategoryGeometry = new THREE.Geometry();
	
    	for (let i=0 ; i < nbOfStarsCategory ; ++i) {
    	    let star = new THREE.Vector3(
		Math.random() * 2 * this.radiusInKm - this.radiusInKm,
    		Math.random() * 2 * this.radiusInKm - this.radiusInKm,
    		Math.random() * 2 * this.radiusInKm - this.radiusInKm );
	    starCategoryGeometry.vertices.push( star );
	}

	let starCategoryMaterial = new THREE.PointsMaterial( {
	    color: 0xFFFFFF,
	    map: starTexture,
	    size: category.radius * solRadius * 10 } );
	let starsCategory = new THREE.Points(
	    starCategoryGeometry, starCategoryMaterial );
	scene.add( starsCategory );
	
    } // end for (category of arraystarcategories)
    
}




/////////////////////
// Other functions //
////////////////////////////////////////////////////////////////////////////////
function writeConsole(string) {
    console.log("[GALAX3] " + string);
}
