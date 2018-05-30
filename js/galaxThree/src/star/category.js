import { writeConsole } from '../utils.js';


function StarCategory( name, spectralTypes, radius, luminosity, proba ) {
    
    this.name = name;
    this.spectralTypes = spectralTypes;
    this.radius = radius;
    this.luminosity = luminosity;
    this.proba = proba;
    this.nbOfChunks = 1; //< Nb of chunks from the camera's position where we'll generate stars
    
}




StarCategory.prototype.updateNbOfChunks = function( chunksPerLuminosityUnit, maxValue ) {
    
    this.nbOfChunks = Math.max( 1, Math.min(
	maxValue, this.luminosity * chunksPerLuminosityUnit ) );
    
    writeConsole( "Chunk distance for " + this.name + " : " + this.nbOfChunks );
    
}



export { StarCategory };
