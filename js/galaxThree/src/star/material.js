import { ly } from '../consts.js';



//////////////////////////////////////////////////////////////////////
function createMaterials( arrayStarCategories, arraySpectralTypeToColor,
			  starTexture, maxStarLuminosity ) {

    let arrayMaterialsStar = new Array();
    
    for ( let i = 0 ; i < arrayStarCategories.length ; ++i ) {

	let category = arrayStarCategories[i];
	arrayMaterialsStar.push( new Array() );

	for ( let spectralType of category.spectralTypes ) {

	    arrayMaterialsStar[i].push(	getMaterial( starTexture,
						     category.luminosity,
						     maxStarLuminosity ,
		    				     arraySpectralTypeToColor[spectralType]
						   ) );
	    
	} // end for each spectral type of the category.
	
    } // end for each category.

    return arrayMaterialsStar;

} // end method




//////////////////////////////////////////////////////////////////////
function getMaterial( texture, luminosity, maxStarLuminosity, color ) {
    
    let pointShader = THREE.ShaderLib[ 'points' ];
    let basicShader = THREE.ShaderLib[ 'basic' ];

    let maxOpacityDistance = 5e3 * Math.sqrt( luminosity ) *  ly;
    let minOpacityDistance = 1e5 * Math.sqrt( luminosity ) * ly;
    let cstOpacityFunction = minOpacityDistance / ( minOpacityDistance - maxOpacityDistance );
    let factorOpacityFunction =  - cstOpacityFunction / minOpacityDistance;

    // Sets uniforms.
    let uniforms = THREE.UniformsUtils.merge( [
	THREE.UniformsUtils.clone( pointShader.uniforms ),
	THREE.UniformsUtils.clone( basicShader.uniforms ),
	{ cstOpacityFunction: { value: cstOpacityFunction } },
	{ factorOpacityFunction: { value: factorOpacityFunction } },
	{ myCamPosition: { value: new THREE.Vector3( 0, 0, 0 ) } },
    ] );
    uniforms[ 'map' ].value = texture;

    let vertexShader = pointShader.vertexShader;
    let fragShader = pointShader.fragmentShader;
    let customLinesBegVertex = [
	"varying vec3 vPosition;",
    ].join( '\n' );
    let customLinesVertex = [
	"vPosition = position;"
    ].join( '\n' );
    let customLinesBegFrag = [
	"uniform float cstOpacityFunction;",
	"uniform float factorOpacityFunction;",
	"uniform vec3 myCamPosition;",
	"varying vec3 vPosition;",
    ].join( '\n' );
    let customLinesFrag = [
	"float cameraDistance = distance( myCamPosition, vPosition );",
	"float correctedOpacity = factorOpacityFunction * cameraDistance + cstOpacityFunction;",
	"diffuseColor = vec4( vec3( diffuseColor ), correctedOpacity );",
    ].join( '\n' );

    let linesVertexShader = vertexShader.split( '\n' );
    linesVertexShader.splice( 0, 0, customLinesBegVertex );
    linesVertexShader.splice( 23, 0, customLinesVertex );
    vertexShader = linesVertexShader.join( '\n' );
    
    let linesFragShader = fragShader.split( '\n' );
    linesFragShader.splice( 0, 0, customLinesBegFrag );
    linesFragShader.splice( 15, 0, customLinesFrag );
    fragShader = linesFragShader.join( '\n' );

    let mat = new THREE.ShaderMaterial( {
	uniforms: uniforms,
	vertexShader: vertexShader,
	fragmentShader: fragShader,
	transparent: true,
	blending: THREE.AdditiveBlending,
    } );
    
    mat.map = texture;
    mat.uniforms[ 'size' ].value = 4 + ( luminosity * 2 / maxStarLuminosity );
    mat.uniforms[ 'diffuse' ].value = new THREE.Color( color );
    mat.alphaTest = 0.6;

    return mat;

} // end method


export { createMaterials };
