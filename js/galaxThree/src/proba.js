let theSeed = 1

function random() {
    let x = Math.sin( theSeed++ ) * 10000;
    return x - Math.floor( x );
}




function randomUniform( min = 0, max = 1 ) {
    return Math.random() * ( max - min ) + min;
}




function randomUniformSeeded( min = 0, max = 1 ) {
    return random() * ( max - min ) + min;
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
 * Generate a random number with normal distribution N(mu, sigma) 
 */
function randomGaussSeeded( mu = 0, sigma = 1 ) {
    let u = random();
    let v = random();
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




export { randomUniform, randomUniformSeeded, randomGauss, randomGaussSeeded, randomLessInEnd };
