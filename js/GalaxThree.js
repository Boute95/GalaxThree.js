
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

    this.counterStars = 0;
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

    // Loads the star's texture
    let starTexture = new THREE.TextureLoader().load( starImagePath );

    // Array of arrays of geometry and materials.
    let geoAndMaterialsOfCategories = [ ];

    // Creates geometries and materials according to categories and their
    // spectral types.
    for ( let i = 0 ; i < this.arrayStarCategories.length ; ++i ) {

	let category = this.arrayStarCategories[i];
	geoAndMaterialsOfCategories.push( new Array() );

	for ( let spectralType of category.spectralTypes ) {

	    geoAndMaterialsOfCategories[i].push( {
		
		geometry : new THREE.Geometry(),
		
		material : new THREE.PointsMaterial( {
		    color: spectralTypeToColor[ spectralType ],
		    map: starTexture,
		    size: Math.pow( category.luminosity, 1/3.2 ) * 1e11,
		    blending: THREE.AdditiveBlending,
		    transparent: true, } ) } );
	    	
	} // end for each spectral type of the category.
	
    } // end for each category.

    // Parses the shape map.
    let imgData = getImgDataArray( img );
    let nbOfStarsForAWhitePixel = getNbOfStarsWhitePixel( imgData, numberOfStars );
    writeConsole ( nbOfStarsForAWhitePixel );
    let pixelSizeInWorldCoord = this.radiusInKm / img.width;

    // For each pixel of the map.
    for ( let i = 0 ; i < imgData.data.length ; i += 4 ) {

	let nbOfStarsForThisPixel = nbOfStarsForAWhitePixel * ( imgData.data[i] / 255 );
	let pixelX = ( i / 4 ) % img.width;
	let pixelY = Math.floor( ( i / 4 ) / img.width );
	let worldXMin = pixelX * pixelSizeInWorldCoord - pixelSizeInWorldCoord / 2;
	let worldXMax = pixelX * pixelSizeInWorldCoord + pixelSizeInWorldCoord / 2;
	let worldZMin = pixelY * pixelSizeInWorldCoord - pixelSizeInWorldCoord / 2;
	let worldZMax = pixelY * pixelSizeInWorldCoord + pixelSizeInWorldCoord / 2;

	for ( let starNb = 0 ; starNb < nbOfStarsForThisPixel ; ++starNb ) {
	    
	    let a = Math.random(); //< Determines which star category to select
	    let sumProba = 0;
	    let categoryIndex = 0;
	    let starPlaced = false;

	    while ( !starPlaced && categoryIndex < this.arrayStarCategories.length ) {

		let category = this.arrayStarCategories[ categoryIndex ];
		sumProba += category.proba;
		    
		if ( a < sumProba ) {

		    let starVertex = new THREE.Vector3();
		    starVertex.x = randomUniform( worldXMin, worldXMax );
		    starVertex.z = randomUniform( worldZMin, worldZMax );

		    let whichSpecType =
			Math.floor( randomUniform( 0, category.spectralTypes.length ) );
		    geoAndMaterialsOfCategories
		    [ categoryIndex ]
		    [ whichSpecType ]
		    [ "geometry" ].vertices.push( starVertex );

		    this.counterStars += 1;
		    starPlaced = true;
		}

		++categoryIndex;
		
	    } // end for each category.

	} // end for each star of this pixel.
	
    } // end for each pixel of the map.

    writeConsole( "Number of stars : " + this.counterStars );

    for ( let category of geoAndMaterialsOfCategories ) {
	for ( let geoAndMat of category ) {
	    if ( geoAndMat["geometry"].vertices.length > 0 ) {
		let mesh = new THREE.Points( geoAndMat["geometry"], geoAndMat["material"] );
		scene.add( mesh );
	    }
	}
    }



    


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
				  categoryProba,
				  heightInKm,
				  imgData,
				  pixelSizeInWorldCoord,
				  starCountPerPixel ) {

	let counterStars = 0;

	// For each pixel of the shape image
	for ( let i = 0 ; i < imgData.data.length ; i+=4 ) {

	    let probaFromColor = imgData.data[i] / 255;
	    let probaPixel = probaFromColor * categoryProba;
	    let pixelX = ( i / 4 ) % img.width;
	    let pixelY = Math.floor( ( i / 4 ) / img.width );
	    let worldXMin = pixelX * pixelSizeInWorldCoord - pixelSizeInWorldCoord / 2;
	    let worldXMax = pixelX * pixelSizeInWorldCoord + pixelSizeInWorldCoord / 2;
	    let worldZMin = pixelY * pixelSizeInWorldCoord - pixelSizeInWorldCoord / 2;
	    let worldZMax = pixelY * pixelSizeInWorldCoord + pixelSizeInWorldCoord / 2;
	    
	    for ( let j = 0 ; j < starCountPerPixel ; ++j ) {
		let p = Math.random();
		if ( p < probaPixel ) {
		    let starVertex = new THREE.Vector3();
		    starVertex.x = randomUniform( worldXMin, worldXMax );
		    starVertex.z = randomUniform( worldZMin, worldZMax );
		    starVertex.y = randomGauss( 0, heightInKm / 3 );
		    geometry.vertices.push( starVertex );
		    ++counterStars;
		}
	    }
	    
	} // end for each pixel

	return counterStars
	
    }



    //////////////////////////////////////////////////////////////////////
    function getNbOfStarsWhitePixel( imgData, nbOfStars ) {

	let S = 0;
	for ( let i = 0 ; i < imgData.data.length ; i+=4 ) {
	    S += imgData.data[i];
	}
	return ( nbOfStars / S ) * 255;
	
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
