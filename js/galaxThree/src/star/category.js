import { writeConsole } from '../utils.js';


function StarCategory( name, spectralTypes, radius, luminosity, proba, nbOfChunks ) {
    
    this.name = name;
    this.spectralTypes = spectralTypes;
    this.radius = radius;
    this.luminosity = luminosity;
    this.proba = proba;
    // Nb of chunks from the camera's position where we'll generate stars.
    // Represents a ratio, the real number is calculated in function of the
    // matrix dimension.
    this.nbOfChunks = nbOfChunks; 
    
}




export { StarCategory };
