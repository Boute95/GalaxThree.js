/**
 * This file is under GNU Public Licence V3.
 *
 * @author Alexis Breton
 *
 */


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





////////////////////
// Galaxy object //
////////////////////////////////////////////////////////////////////////////////

/**
 * Constructor for Galaxy object.
 */ 
function Galaxy( scene,
		 starImagePath,
		 imgStarMap,
		 imgCloudMap,
		 numberOfStars = 1e6,
		 radiusInLy = 1e5,
		 heightInLy = 3e3,
		 maxHeightInLy = 10e3 ) {
    
    //////////////////////////////////////////////////////////////////////
    // Attributes
    
    let self = this;
    
    this.starCount = 0;
    
    this.radiusInKm = radiusInLy * ly;
    
    this.heightInKm = heightInLy * ly;

    this.maxHeightInKm = maxHeightInLy * ly;

    this.starTexture;

    // Array of geometry and material for each spectral type of each star category.
    this.geoAndMatStarCategories = [ ];

    // Texture of the galaxy displayed when getting farther from it.
    this.galaxyPlane;

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

    // end attributes
    //////////////////////////////////////////////////////////////////////

    
    //////////////////////////////////////////////////////////////////////
    // Public methods
    
    this.update = function( camera )  {

	// Update the cam position in the plane's uniform.
	let camPos = camera.position.clone();
	self.galaxyPlane.worldToLocal( camPos );
	self.galaxyPlane.material.uniforms[ 'myCamPosition' ].value = camPos.clone();

	// Calculate the angle of the camera from the plane.
	camPos.normalize();
	camPos.projectOnVector( self.galaxyPlane.normalVect );

	// Reduces the plane opacity in function of the angle of the camera.
	let lengthProjection = camPos.lengthSq();
	if ( lengthProjection < self.galaxyPlane.beginHideAngle ) {
	    self.galaxyPlane.material.uniforms[ 'maxOpacity' ].value =
		self.galaxyPlane.opacityFactorAccToCamAngle * lengthProjection;
	}
	else {
	    self.galaxyPlane.material.uniforms[ 'maxOpacity' ].value =
		self.galaxyPlane.maxOpacity;
	}
	
    }; // end method
    

    // end public methods
    //////////////////////////////////////////////////////////////////////



    
    init();

    

    
    //////////////////////////////////////////////////////////////////////
    // Private methods
    
    function init() {
	
	self.starTexture = new THREE.TextureLoader().load( starImagePath );
	
	// Creates geometries and materials according to categories and their
	// spectral types.
	createStarGeoAndMaterials( self.geoAndMatStarCategories );

	generateStarsAccordingToMap( numberOfStars, imgStarMap );
	writeConsole( "Number of stars : " + self.starCount );
	
	// Adds stars to the scene.
	for ( let category of self.geoAndMatStarCategories ) {
	    for ( let geoAndMat of category ) {
		if ( geoAndMat["geometry"].vertices.length > 0 ) {
		    let mesh = new THREE.Points( geoAndMat["geometry"], geoAndMat["material"] );
		    scene.add( mesh );
		}
	    }
	}
	
	let nbClouds = generateClouds( 1e4, imgCloudMap, scene );
	
	setGalaxPlane( scene );
	
    } // end method


    

    //////////////////////////////////////////////////
    function createStarGeoAndMaterials( arrayGeoAndMaterials ) {

	for ( let i = 0 ; i < self.arrayStarCategories.length ; ++i ) {

	    let category = self.arrayStarCategories[i];
	    arrayGeoAndMaterials.push( new Array() );

	    for ( let spectralType of category.spectralTypes ) {

		arrayGeoAndMaterials[i].push( {
		    
		    geometry: new THREE.Geometry(),

		    material: getStarMaterial( category.luminosity,
		    			       self.spectralTypeToColor[ spectralType ] ),
		    
		    // material : new THREE.PointsMaterial( {
		    // 	color: self.spectralTypeToColor[ spectralType ],
		    // 	map: self.starTexture,
		    // 	size: 1e14,//Math.pow( category.luminosity, 0.8 ) * 1e13,
		    // 	blending: THREE.AdditiveBlending,
		    // 	transparent: true,
		    // 	alphaTest: 0.5,
		    // } ),

		} );
	    	
	    } // end for each spectral type of the category.
	    
	} // end for each category.

    } // end method



    //////////////////////////////////////////////////        
    function generateStarsAccordingToMap( numberOfStars, img ) {
	
	let imgData = getImgDataArray( img );
	let nbOfStarsForAWhitePixel = getNbOfStarsWhitePixel( imgData, numberOfStars );
	let pixelSizeInWorldCoord = self.radiusInKm * 2 / img.width;
	
	// For each pixel of the map.
	for ( let i = 0 ; i < imgData.data.length ; i += 4 ) {

	    let nbOfStarsForThisPixel =
		nbOfStarsForAWhitePixel * ( imgData.data[i] / 255.0 );
	    let pixelX = ( i / 4 ) % img.width;
	    let pixelY = Math.floor( ( i / 4 ) / img.width );
	    let worldXMin = pixelX * pixelSizeInWorldCoord - pixelSizeInWorldCoord / 2
		- self.radiusInKm;
	    let worldXMax = pixelX * pixelSizeInWorldCoord + pixelSizeInWorldCoord / 2
		- self.radiusInKm;
	    let worldZMin = pixelY * pixelSizeInWorldCoord - pixelSizeInWorldCoord / 2
		- self.radiusInKm;
	    let worldZMax = pixelY * pixelSizeInWorldCoord + pixelSizeInWorldCoord / 2
		- self.radiusInKm;
	    let height = self.heightInKm + imgData.data[i + 1] / 255
		* ( self.maxHeightInKm - self.heightInKm );

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
			starVertex.y = randomGauss( 0, height / 3);

			let whichSpectralType = Math.floor(
			    randomUniform( 0, category.spectralTypes.length ) );
			self.geoAndMatStarCategories
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

	
    } // end method
    


    //////////////////////////////////////////////////    
    function getNbOfStarsWhitePixel( imgData, nbOfStars ) {

	let S = 0;
	for ( let i = 0 ; i < imgData.data.length ; i+=4 ) {
	    S += imgData.data[i] + imgData.data[i + 1] + imgData.data[i + 2];
	}
	return ( nbOfStars / S ) * 255;
	
    } // end method



    //////////////////////////////////////////////////
    function generateClouds( numberOfCloud, img, scene ) {

	// Takes the data from the image.
	let imgData = getImgDataArray( img );
	let maxCol = getMaxArray( imgData.data );

	// Adjust all color values between 255 and 0 if the max color is not 255.
	let coef = 255.0 / maxCol;
	for ( let i = 0 ; i < imgData.data.length ; i += 4 ) {
	    imgData.data[i] *= coef;
	}
	
	let pixelSizeInWorldCoord = self.radiusInKm * 2 / img.width;
	let cloudPlaced = 0;

	let textures = [
	    new THREE.TextureLoader().load( "../resources/black_nebula1.png" ),
	    new THREE.TextureLoader().load( "../resources/black_nebula2.png" ),
	    new THREE.TextureLoader().load( "../resources/black_nebula2.png" ),
	];
	
	let materials = [
	    new THREE.PointsMaterial( { color: 0x120904,
				  map: textures[0],
				  size: 7e3 * ly,
				  transparent: true,
				  depthWrite: false,
				  opacity: 0.3,
				} ),
	    new THREE.PointsMaterial( { color: 0x060503,
	    				map: textures[1],
	    				size: 7e3 * ly,
	    				transparent: true,
					depthWrite: false,
					opacity: 0.3,
				      } ),
	    new THREE.PointsMaterial( { color: 0x060503,
	    				map: textures[2],
	    				size: 8e3 * ly,
	    				transparent: true,
					depthWrite: false,
					opacity: 0.4,
				      } ),
	];
	
	let geometries = [
	    new THREE.Geometry(),
	    new THREE.Geometry(),
	    new THREE.Geometry(),
	];

	
	// For each cloud to place.
	for ( let i = 0 ; i < numberOfCloud ; ++i ) {

	    let cloudIsPlaced = false;
	    
	    while ( !cloudIsPlaced ) {
		
		let a = Math.random();
		let randomPixelIndex =
		    Math.floor( Math.random() * ( imgData.data.length / 4 ) ) * 4 ;

		if ( a < imgData.data[randomPixelIndex] / 255 ) {
		    
		    let pixelX = ( randomPixelIndex / 4 ) % img.width;
		    let pixelY = Math.floor( ( randomPixelIndex / 4 ) / img.width );
		    let worldX = pixelX * pixelSizeInWorldCoord - self.radiusInKm;
		    let worldZ = pixelY * pixelSizeInWorldCoord - self.radiusInKm;

		    let x = worldX;
		    let z = worldZ;
		    let y = randomGauss() * 0.2 * self.heightInKm;
		    let whichCloudTex = Math.floor( Math.random() * materials.length );
		    geometries[whichCloudTex].vertices.push(
			new THREE.Vector3( x, 0, z ) );
		    ++cloudPlaced;
		    cloudIsPlaced = true;
		    
		}
	    } // end while 
	} // end for

	for( let i = 0 ; i < geometries.length ; ++i ) {
	    scene.add( new THREE.Points( geometries[i], materials[i] ) );
	}
	
	return cloudPlaced;
	
    } // end method

    

    //////////////////////////////////////////////////
    function setGalaxPlane( scene ) {

	let geo = new THREE.PlaneBufferGeometry( self.radiusInKm * 2, self.radiusInKm * 2 );
	let tex = new THREE.TextureLoader().load( "../resources/milkyway.png" );
	let basicShader = THREE.ShaderLib[ 'basic' ];

	let maxOpacityDistance = 4e5 * ly;
	let minOpacityDistance = 1e4 * ly;
	let cstOpacityFunction = minOpacityDistance / ( minOpacityDistance - maxOpacityDistance );
	let factorOpacityFunction =  - cstOpacityFunction / minOpacityDistance;

	
	// Set built-in uniforms and adds some custom one
	let uniforms = THREE.UniformsUtils.merge( [
	    THREE.UniformsUtils.clone( basicShader.uniforms ),
	    { cstOpacityFunction: { value: cstOpacityFunction } },
	    { factorOpacityFunction: { value: factorOpacityFunction } },
	    { maxOpacity: { value: 1 } },
	    { myCamPosition: { value: new THREE.Vector3( 0, 0, 0 ) } },
	] );
	uniforms[ 'map' ].value = tex;

	
	// Adds some code in vertex shader to reduce opacity when the camera gets closer
	// to the mesh.
	let vertexShader = basicShader.vertexShader;
	let fragShader = basicShader.fragmentShader;
	let customLinesBegVertex = [
	    "varying vec3 vPosition;",
	].join( '\n' );
	let customLinesVertex = [
	    "vPosition = position;"
	].join( '\n' );
	let customLinesBegFrag = [
	    "uniform float cstOpacityFunction;",
	    "uniform float factorOpacityFunction;",
	    "uniform float maxOpacity;",
	    "uniform vec3 myCamPosition;",
	    "varying vec3 vPosition;",
	].join( '\n' );
	let customLinesFrag = [
	    "float cameraDistance = distance( myCamPosition, vPosition );",
	    "float customOpacity = factorOpacityFunction * cameraDistance + cstOpacityFunction;",
	    "customOpacity = min( customOpacity, maxOpacity );",
	    "gl_FragColor = vec4( outgoingLight, customOpacity );"
	].join( '\n' );
	
	let linesVertexShader = vertexShader.split( '\n' );
	linesVertexShader.splice( 0, 0, customLinesBegVertex );
	linesVertexShader.splice( 31, 0, customLinesVertex );
	vertexShader = linesVertexShader.join( '\n' );
	
	let linesFragShader = fragShader.split( '\n' );
	linesFragShader.splice( 0, 0, customLinesBegFrag );
	linesFragShader.splice( 43, 0, customLinesFrag );
	fragShader = linesFragShader.join( '\n' );

	// Creates new material with the new shader.
	let mat = new THREE.ShaderMaterial( {
	    uniforms: uniforms,
	    vertexShader: vertexShader,
	    fragmentShader: fragShader,
	    side: THREE.DoubleSide,
	    transparent: true,
	    blending: THREE.AdditiveBlending,
	} );
	mat.map = tex;

	
	// Constructs the mesh.
	self.galaxyPlane = new THREE.Mesh( geo, mat );
	self.galaxyPlane.rotation.x = - Math.PI / 2;
	scene.add( self.galaxyPlane );

	
	// Set some attributes to the galaxyPlane useful for hiding it according to the
	// camera angle.
	self.galaxyPlane.geometry.computeVertexNormals();
	self.galaxyPlane.normalVect = new THREE.Vector3();
	self.galaxyPlane.normalVect.x = self.galaxyPlane.geometry.getAttribute( "normal" ).array[0];
	self.galaxyPlane.normalVect.y = self.galaxyPlane.geometry.getAttribute( "normal" ).array[1];
	self.galaxyPlane.normalVect.z = self.galaxyPlane.geometry.getAttribute( "normal" ).array[2];
	self.galaxyPlane.maxOpacity = 0.4;
	self.galaxyPlane.beginHideAngle = 0.01;
	self.galaxyPlane.opacityFactorAccToCamAngle =
	    self.galaxyPlane.maxOpacity / self.galaxyPlane.beginHideAngle;

	
    } // end method


    
    //////////////////////////////////////////////////
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



    //////////////////////////////////////////////////
    function getStarMaterial( luminosity, color ) {
	
	let defaultShader = THREE.ShaderLib[ 'points' ];

	// Sets uniforms.
	let uniforms = THREE.UniformsUtils.merge( [
	    THREE.UniformsUtils.clone( defaultShader.uniforms ),
	    { luminosity: { value: luminosity } },
	] );
	uniforms[ 'map' ].value = self.starTexture;

	let vertexShader = defaultShader.vertexShader;
	let fragShader = defaultShader.fragmentShader;

	let customLinesBegVertex = [
	    "uniform float luminosity;",
	].join( '\n' );

	writeConsole( vertexShader );

	let mat = new THREE.ShaderMaterial( {
	    uniforms: uniforms,
	    vertexShader: vertexShader,
	    fragmentShader: fragShader,
	    transparent: true,
//	    color: color,
//	    size: 1e14,
	} );
	mat.map = self.starTexture;

	return mat;

    } // end method

    
} // end constructor





////////////////////////////////////////////////////////////////////////////////
// Utility functions

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
