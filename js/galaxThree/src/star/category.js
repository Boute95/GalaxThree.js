import { writeConsole } from '../utils.js';


function StarCategory( name, spectralCodes, radius, luminosity, proba, nbOfChunks ) {
    
    this.name = name;
    
    this.spectralTypes = new Array();
    for ( let specCode of spectralCodes ) {
	this.spectralTypes.push( new SpectralType( specCode ) );
    }
    
    this.radius = radius;
    
    this.luminosity = luminosity;
    
    this.proba = proba;
    
    // Nb of chunks from the camera's position where we'll generate stars.
    this.nbOfChunks = nbOfChunks;
        
}



function SpectralType( spectralCode ) {

    this.spectralCode = spectralCode;
    this.mesh;
    
}



export { StarCategory };
