import { ly } from './consts.js';


function generateGalaxPlane( galaxy, scene ) {

    let geo = new THREE.PlaneBufferGeometry( galaxy.radiusInKm * 2, galaxy.radiusInKm * 2 );
    let tex = new THREE.TextureLoader().load( galaxy.dirPath + "resources/milkyway.png" );
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
	"float customOpacity = factorOpacityFunction * cameraDistance + cstOpacityFunction ;",
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
    galaxy.galaxyPlane = new THREE.Mesh( geo, mat );
    galaxy.galaxyPlane.rotation.x = - Math.PI / 2;
    scene.add( galaxy.galaxyPlane );

    
    // Set some attributes to the galaxyPlane useful for hiding it according to the
    // camera angle.
    galaxy.galaxyPlane.geometry.computeVertexNormals();
    galaxy.galaxyPlane.normalVect = new THREE.Vector3();
    galaxy.galaxyPlane.normalVect.x = galaxy.galaxyPlane.geometry.getAttribute( "normal" ).array[0];
    galaxy.galaxyPlane.normalVect.y = galaxy.galaxyPlane.geometry.getAttribute( "normal" ).array[1];
    galaxy.galaxyPlane.normalVect.z = galaxy.galaxyPlane.geometry.getAttribute( "normal" ).array[2];
    galaxy.galaxyPlane.maxOpacity = 0.4;
    galaxy.galaxyPlane.beginHideAngle = 0.01;
    galaxy.galaxyPlane.opacityFactorAccToCamAngle =
	galaxy.galaxyPlane.maxOpacity / galaxy.galaxyPlane.beginHideAngle;

    
} // end method



export { generateGalaxPlane };
