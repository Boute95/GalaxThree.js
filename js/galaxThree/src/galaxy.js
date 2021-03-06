import { writeConsole, getImgDataArray } from './utils.js';
import { ly } from './consts.js';
import { StarCategory } from './star/category.js';
import { StarGenerator } from './star/starGenerator.js';
import { generateAbsorptionClouds } from './cloud/absorptionGenerator.js';
import { generateEmissionClouds } from './cloud/emissionGenerator.js';
import { generateGalaxPlane } from './plane.js';
import { Chunk } from './star/chunk.js';



function Galaxy( scene,
		 galaxDirPath,
		 imgStarMap,
		 imgCloudMap,
		 numberOfStars = 1e6,
		 radiusInLy = 1e5,
		 heightInLy = 3e3,
		 maxHeightInLy = 1e4 ) {


    
    //////////////////////////////////////////////////////////////////////
    // Attributes
    
    let self = this;

    this.scene = scene;

    this.dirPath = galaxDirPath;
    
    this.starCount = 0;

    this.radiusInKm = radiusInLy * ly;
    
    this.heightInKm = heightInLy * ly;

    this.maxHeightInKm = maxHeightInLy * ly;

    this.starGenerator;

    this.matrixChunks;

    this.chunkWorldSize;

    // Displays the galaxy's texture when camera gets farther from it.
    this.galaxyPlane;

    this.arrayStarCategories = [
	new StarCategory("MS_M",["M"],
	 		 0.3,     0.01,       0.8,     1),
	new StarCategory("MS_K",["K"],
			 0.8,     0.2,        0.08,     1),
	new StarCategory("MS_G",["G"],
			 1.0,     1.0,        0.035,    2),
	new StarCategory("MS_F",["F"],
			 1.3,     4.0,        0.02,     2),
	new StarCategory("MS_A",["A"],
			 1.7,     20.0,       0.007,    0),
	new StarCategory("MS_B",["B"],
			 5.0,     1000,       0.001,    0),
	new StarCategory("MS_O",["O"],
			 10.0,    100000.0,   0.0000001,0),
	new StarCategory("G",   ["G","K","M"],
			 30.0,    600.0,      0.004,    0),
	new StarCategory("WD",  ["D"],
			 0.01,    0.01,       0.05,     1),
	new StarCategory("SG",  ["O","B","A","F","G","K","M"],
			 300.0,   600000.0,   0.000001, 0),
    ];

    this.arraySpectralCodeToColor = {
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


	let camPos = camera.position.clone();
	
	self.starGenerator.generateStars( camPos );

	// Update the cam position in the plane's uniform.
	self.galaxyPlane.worldToLocal( camPos );
	self.galaxyPlane.material.uniforms[ 'myCamPosition' ].value = camPos.clone();

	// Updates the cam position for each stars' materials
	for ( let category of this.arrayStarCategories ) {
	    for ( let spectralType of category.spectralTypes ) {
		if ( spectralType.mesh !== undefined ) {
		    let camPos = camera.position.clone();
		    spectralType.mesh.worldToLocal( camPos );
		    spectralType.mesh.material.uniforms[ 'myCamPosition' ].value = camPos;
		}
	    }
	}

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




    this.removeMeshes = function() {

	for ( let cat of this.arrayStarCategories ) {
	    if ( cat.nbOfChunks > 0 ) {
		for ( let specType of cat.spectralTypes ) {
		    this.scene.remove( specType.mesh );
		}
	    }
	}
	
    }; // end method



    this.numberOfStars = function() {

	let S = 0 ;

	for ( let category of this.arrayStarCategories ) {
	    for ( let spectralType of category.spectralTypes ) {
		if ( spectralType.mesh !== undefined ) {
		    S += spectralType.mesh.geometry.vertices.length;
		}
	    }
	}

	return S;
	
    }; // end method

    // end public methods
    //////////////////////////////////////////////////////////////////////


    //////////////////////////////////////////////////////////////////////
    // Private methods
    
    function init() {

	// Matrix init
	let dimMatrix = 64; //< Should be a power of 2 of img size.
	self.matrixChunks = new Array( dimMatrix );
	for ( let i = 0 ; i < self.matrixChunks.length ; ++i ) {
	    self.matrixChunks[i] = new Array( dimMatrix );
	    for ( let j = 0 ; j < self.matrixChunks[i].length ; ++j ) {
		self.matrixChunks[i][j] = new Chunk();
	    }
	}
	
	self.chunkWorldSize = ( self.radiusInKm * 2 ) / dimMatrix;
	
	let starTexture = new THREE.TextureLoader().load( self.dirPath +
							  'resources/particle4.png' );

	self.starGenerator = new StarGenerator( self, imgStarMap, starTexture,
					       numberOfStars );

	self.starGenerator.generateStars( new THREE.Vector3( 0, 0, 0 ) );

	
	generateAbsorptionClouds( self, 2e3, imgCloudMap, scene );
	//generateEmissionClouds( self, 5e4, imgCloudMap, scene );
	
	
	generateGalaxPlane( self, scene );

	// Debug ...
	window.addEventListener( 'keydown', function( event ) {
	    if ( event.keyCode === 82 /*R*/ ) {
		writeConsole( 'cette touche peut servir ...' );
	    }
	    if ( event.keyCode === 67 /*C*/ ) {
		writeConsole( 'Number of stars : ' + self.numberOfStars() );
	    }
	}, false );

	
    } // end method


    // end private methods
    //////////////////////////////////////////////////////////////////////

    

    init();


    
} // end constructor







export { Galaxy };
