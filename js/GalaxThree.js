
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
		img,
		radiusInLy = 200,
		heightInLy = 5,
		numberOfStars = 1e6 ) {
    
    this.radiusInKm = radiusInLy * ly;
    this.heightInKm = heightInLy * ly;
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

    // Parses the shape map.
    let imgData = getImgDataArray( img );
    let starCountPerColorUnit = getStarCountPerColorUnit( imgData, numberOfStars );
    let pixelSizeInWorldCoord = this.radiusInKm / img.width;

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

	// Generate stars for each spectralType of the category.
	for ( let spectralType of arraySpectralTypes ) {

	    // Places the stars.
	    let geometryStarType = new THREE.Geometry();
	    placeStarsWithShape( geometryStarType,
	    			 numberOfStars,
				 imgData,
				 starCountPerColorUnit,
				 pixelSizeInWorldCoord );
	    	    
	    // Set the star's type material.
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

	
    }


    //////////////////////////////////////////////////////////////////////
    function placeStarsWithShape( geometry,
				  numberOfStars,
				  imgData,
				  starCountPerColorUnit,
				  pixelSizeInWorldCoord ) {

	// For each pixel of the shape image
	for ( let i = 0 ; i < imgData.data.length ; i+=4 ) {

	    let pixelStarCount = starCountPerColorUnit * imgData.data[i];
	    let pixelX = ( i / 4 ) % img.width;
	    let pixelY = Math.floor( ( i / 4 ) / img.width );
	    let worldXMin = pixelX * pixelSizeInWorldCoord - pixelSizeInWorldCoord / 2;
	    let worldXMax = pixelX * pixelSizeInWorldCoord + pixelSizeInWorldCoord / 2;
	    let worldZMin = pixelY * pixelSizeInWorldCoord - pixelSizeInWorldCoord / 2;
	    let worldZMax = pixelY * pixelSizeInWorldCoord + pixelSizeInWorldCoord / 2;
	    
	    for ( let j = 0 ; j < pixelStarCount ; ++j ) {
		let starVertex = new THREE.Vector3();
		starVertex.x = randomUniform( worldXMin, worldXMax );
		starVertex.z = randomUniform( worldZMin, worldZMax );
		geometry.vertices.push( starVertex );
	    }
	    
	} // end for each pixel
	
    }



    //////////////////////////////////////////////////////////////////////
    function getStarCountPerColorUnit( imgData, nbOfStars ) {
	
	let S = 0; //< Sum color values.

	for ( let i = 0 ; i < imgData.data.length ; i+=4 ) {
	    S += imgData.data[i];
	}
	
	return numberOfStars / S;
	
    }

	
} // end function Galaxy() { }





/////////////////////
// Other functions //
////////////////////////////////////////////////////////////////////////////////

function randomUniform( min = 0, max = 1 ) {
    return Math.random() * ( max - min ) + min;
}


/**
 * Generate a random number with normal distribution N(mu, sigma) 
 */
function randomGauss( mu = 0, sigma = 1 ) {
    let u = Math.random();
    let v = Math.random();
    let Z = Math.sqrt( -2.0 * Math.log( u ) ) * Math.cos( 2 * Math.PI * v );
    return Z * sigma + mu;
}



/**
 * Generate a random number with a uniform distribution in [ 0, beginDecrease ] 
 * and with decreasing density in [ beginDecrease, 1 ].
 * @param beginDecrease Number between 0 and 1. The probability of appearance
 * of a number from beginDecrease to 1 will decrease.
 */
function randomLessInEnd( beginDecrease ) {
    
    let u = Math.random();
    let v = Math.random();
    let k = 1;

    if ( u > beginDecrease ) {
	k = Math.cos( ( u - beginDecrease ) * ( Math.PI / ( 1 - beginDecrease ) ) )
	    / 2 + 0.5;

	if ( v > k ) {
	    u = randomLessInEnd( beginDecrease );
	}

    }
    
    return u;
}



function getImgDataArray( img ) {

    let data = new Object();
    //img.setAttribute( 'crossOrigin', 'anonymous' );
    let canvas = document.createElement( "canvas" );
    canvas.width = img.width;
    canvas.height = img.height;
    let ctx = canvas.getContext( "2d" );
    ctx.drawImage(img, 0, 0);
    data = ctx.getImageData( 0, 0, img.width, img.height );
    return data;
    
}



function writeConsole(string) {
    console.log("[GALAX3] " + string);
}
