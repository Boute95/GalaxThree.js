function randomUniform( min = 0, max = 1 ) {
    return Math.random() * ( max - min ) + min;
}




/**
 * Generate a random number with normal distribution N(mu, sigma) 
 */
function randomGauss( mu, sigma, p1, p2 ) {
    if ( mu === undefined )      mu = 0;
    if ( sigma === undefined )   sigma = 1;
    if ( p1 === undefined )      p1 = Math.random();
    if ( p2 === undefined )      p2 = Math.random();
    
    let Z = Math.sqrt( -2.0 * Math.log( p1 ) ) * Math.cos( 2 * Math.PI * p2 );
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




export { randomUniform, randomGauss, randomLessInEnd };
