
/////////////////
// Global data //
////////////////////////////////////////////////////////////////////////////////

/* 
 * Let's suppose 1 unit = 1 kilometers.
 */

let ly = 9.46073047e12; //< 1 Light year in km.
let solRadius = 6.957e5;

function StarCategory(name, spectralTypes, radius, luminosity, proba) {
    this.name = name;
    this.spectralTypes = spectralTypes;
    this.radius = radius;
    this.luminosity = luminosity;
    this.proba = proba;
}





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
		imgStarMap,
		imgCloudMap,
		radiusInLy = 200,
		heightInLy = 5,
		numberOfStars = 1e6 ) {

    let self = this;
    
    this.starCount = 0;
    
    this.radiusInKm = radiusInLy * ly;
    
    this.heightInKm = heightInLy * ly;
    
    this.arrayStarCategories = [
	// new StarCategory("MS_M",["M"],
	// 		 0.3,     0.01,       0.8),
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
    
    this.spectralTypeToColor = {
	M : 0xFFCC6F,
	K : 0xFFD2A1,
	G : 0xFFF4EA,
	F : 0xF8F7FF,
	A : 0xCAD7FF,
	B : 0xAABFFF,
	O : 0x9BB0FF,
	D : 0x9BB2FF,
    };


    let starTexture = new THREE.TextureLoader().load( starImagePath );

    // Array of geometry and material for each spectral type of each category.
    let geoAndMaterialsOfCategories = [ ];

    // Creates geometries and materials according to categories and their
    // spectral types.
    createGeoAndMaterials( geoAndMaterialsOfCategories );

    generateStarsAccordingToMap( numberOfStars, imgStarMap );
    writeConsole( "Number of stars : " + this.starCount );

    // Adds stars to the scene.
    for ( let category of geoAndMaterialsOfCategories ) {
	for ( let geoAndMat of category ) {
	    if ( geoAndMat["geometry"].vertices.length > 0 ) {
		let mesh = new THREE.Points( geoAndMat["geometry"], geoAndMat["material"] );
		scene.add( mesh );
	    }
	}
    }

    let nbClouds = generateClouds( 100, imgCloudMap, scene );
    writeConsole( "Number of clouds : " + nbClouds );

    



    //////////////////////////////////////////////////////////////////////
    function createGeoAndMaterials( arrayGeoAndMaterials ) {

	for ( let i = 0 ; i < self.arrayStarCategories.length ; ++i ) {

	    let category = self.arrayStarCategories[i];
	    arrayGeoAndMaterials.push( new Array() );

	    for ( let spectralType of category.spectralTypes ) {

		arrayGeoAndMaterials[i].push( {
		    
		    geometry : new THREE.Geometry(),
		    
		    material : new THREE.PointsMaterial( {
			color: self.spectralTypeToColor[ spectralType ],
			map: starTexture,
			size: Math.pow( category.luminosity, 0.8 ) * 1e11,
			blending: THREE.AdditiveBlending,
			transparent: true,
		    } ) } );
	    	
	    } // end for each spectral type of the category.
	    
	} // end for each category.

    } // end function



        
    //////////////////////////////////////////////////////////////////////
    function generateStarsAccordingToMap( numberOfStars, img ) {
					  
	let imgData = getImgDataArray( img );
	let nbOfStarsForAWhitePixel = getNbOfStarsWhitePixel( imgData, numberOfStars );
	let pixelSizeInWorldCoord = self.radiusInKm / img.width;

	// For each pixel of the map.
	for ( let i = 0 ; i < imgData.data.length ; i += 4 ) {

	    let nbOfStarsForThisPixel =
		nbOfStarsForAWhitePixel * ( imgData.data[i] / 255 );
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

		while ( !starPlaced && categoryIndex < self.arrayStarCategories.length ) {

		    let category = self.arrayStarCategories[ categoryIndex ];
		    sumProba += category.proba;
		    
		    if ( a < sumProba ) {

			let starVertex = new THREE.Vector3();
			starVertex.x = randomUniform( worldXMin, worldXMax );
			starVertex.z = randomUniform( worldZMin, worldZMax );
			starVertex.y = randomGauss( 0, self.heightInKm / 3);

			let whichSpectralType = Math.floor(
			    randomUniform( 0, category.spectralTypes.length ) );
			geoAndMaterialsOfCategories
			[ categoryIndex ]
			[ whichSpectralType ]
			[ "geometry" ].vertices.push( starVertex );

			self.starCount += 1;
			starPlaced = true;
		    }

		    ++categoryIndex;
		    
		} // end for each category.

	    } // end for each star of this pixel.
	    
	} // end for each pixel of the map.

	
    } // end function
    


    
    //////////////////////////////////////////////////////////////////////
    function getNbOfStarsWhitePixel( imgData, nbOfStars ) {

	let S = 0;
	for ( let i = 0 ; i < imgData.data.length ; i+=4 ) {
	    S += imgData.data[i];
	}
	return ( nbOfStars / S ) * 255;
	
    } // end function



    
    //////////////////////////////////////////////////////////////////////
    function generateClouds( numberOfCloud, img, scene ) {

	// Takes the data from the image.
	let imgData = getImgDataArray( img );
	let maxCol = getMaxArray( imgData.data );

	// Adjust all color values between 255 and 0 if the max color is not 255.
	let coef = 255.0 / maxCol;
	for ( let i = 0 ; i < imgData.data.length ; i += 4 ) {
	    imgData.data[i] *= coef;
	}
	
	let pixelSizeInWorldCoord = self.radiusInKm / img.width;
	let cloudPlaced = 0;

	let textures = [
	    new THREE.TextureLoader().load( "../resources/smoke1.png" ),
	    new THREE.TextureLoader().load( "../resources/smoke2.png" ),
	];
	
	let materials = [
	    new THREE.SpriteMaterial( { color: 0x050301,
					map: textures[0],
//					size: 5e3 * ly,
					transparent: true,
					//blending: THREE.CustomBlending,
					// blendEquation: THREE.AddEquation,
					// blendSrc: THREE.ZeroFactor,
					// blendDst: THREE.OneMinusSrcAlphaFactor,
					//alphaTest: 0.5,
				      } ),
	    // new THREE.PointsMaterial( { color: 0x0f0f0f,
	    // 				map: textures[1],
	    // 				size: 4e3 * ly,
	    // 				transparent: true,
	    // 			      } ),
	];
	
	let geometries = [
	    new THREE.Geometry(),
	    new THREE.Geometry(),
	];

	
	// For each cloud to place.
	for ( let i = 0 ; i < numberOfCloud ; ++i ) {

	    let cloudIsPlaced = false;
	    
	    while ( !cloudIsPlaced ) {
		
		let a = Math.random();
		let randomPixelIndex = Math.floor( Math.random() * ( imgData.data.length / 4 ) ) * 4 ;

		if ( a < imgData.data[randomPixelIndex] / 255 ) {
		    
		    let pixelX = ( randomPixelIndex / 4 ) % img.width;
		    let pixelY = Math.floor( ( randomPixelIndex / 4 ) / img.width );
		    let worldX = pixelX * pixelSizeInWorldCoord;
		    let worldZ = pixelY * pixelSizeInWorldCoord;

		    let x = worldX;
		    let z = worldZ;
		    let whichCloudTex = Math.floor( Math.random() * materials.length );
		    let sprite =  new THREE.Sprite( materials[whichCloudTex] );
		    sprite.position.set ( x, 0, z );
		    sprite.scale.set( 10000 * ly, 10000 * ly, 1 );
		    scene.add( sprite );
		    ++cloudPlaced;
		    cloudIsPlaced = true;
		    
		}
	    } // end while 
	} // end for

	// for( let i = 0 ; i < geometries.length ; ++i ) {
	//     scene.add( new THREE.Points( geometries[i], materials[i] ) );
	// }
	
	return cloudPlaced;
	
    } // end function

    
    

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
	
    } // end function




    
} // end constructor





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
    document.body.appendChild( canvas );
    canvas.width = img.width;
    canvas.height = img.height;
    let ctx = canvas.getContext( "2d" );
    ctx.drawImage(img, 0, 0);
    data = ctx.getImageData( 0, 0, img.width, img.height );

    canvas.parentNode.removeChild( canvas );
    
    return data;
    
}



function getMaxArray( array ) {

    let max;
    
    if ( array.length >= 1 ) {
	max = array[0];
    }
    
    for ( let i = 1 ; i < array.length ; ++i ) {
	if ( array[i] > max ) {
	    max = array[i];
	}
    }

    return max;
    
}



function writeConsole(string) {
    console.log("[GALAX3] " + string);
}
