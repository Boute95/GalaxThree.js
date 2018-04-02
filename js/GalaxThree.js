
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
    
    // Adds the universe mesh to the scene.
    var geometry = new THREE.SphereBufferGeometry(this.radiusInKm,
						  widthSegmentsUniverseSphere,
						  heightSegmentsUniverseSphere);
    //var texture = new THREE.TextureLoader().load("resources/galaxy8k.jpg");
    var material = new THREE.MeshBasicMaterial({
//	map: texture,
	color: 0x111111,
	side: THREE.BackSide,
    });
    var mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    // Counts total number of stars.
    this.arrayStars = [];
    var volumeInLy = 4 * Math.PI * radiusInLy * radiusInLy * radiusInLy / 3;
    var numberOfStars = Math.round(starDensity * volumeInLy);
    writeConsole("Number of stars : " + numberOfStars);

    // Generate stars and position them randomly
    for (let category of arrayStarCategories) {
    	let nbOfStarsCategory = Math.round(category.proba * numberOfStars);
	writeConsole(nbOfStarsCategory + " stars for the category " +
		    category["spectralType"]);
    	for (let i=0 ; i < nbOfStarsCategory ; ++i) {
    	    var star = new Star(
		category.spectralType,
    		category.radius,
    		category.luminosity,
    		new THREE.Vector3(
		    Math.random() * 2 * this.radiusInKm - this.radiusInKm,
    		    Math.random() * 2 * this.radiusInKm - this.radiusInKm,
    		    Math.random() * 2 * this.radiusInKm - this.radiusInKm));
    	    this.arrayStars.push(star);
	    scene.add(star.mesh);
    	}
    } // end for (category of arraystarcategories)
   
}





/////////////////
// Star object //
////////////////////////////////////////////////////////////////////////////////
function Star (color, radius, luminosity, position) {

    // Characteristics
    this.color = color;
    this.radius = radius * solRadius;
    this.luminosity = luminosity;

    // Generate the mesh
    var geometry = new THREE.CircleBufferGeometry(this.radius, segmentsCircleStar);
    var material = new THREE.MeshBasicMaterial( { color: 0xFFFFFF } );
    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.position.set(position.x, position.y, position.z);
    this.mesh.lookAt(0,0,0);
    
}





/////////////////////
// Other functions //
////////////////////////////////////////////////////////////////////////////////
function writeConsole(string) {
    console.log("[GALAX3] " + string);
}
