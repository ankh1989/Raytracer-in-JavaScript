math = {}

math.eps = 1e-3

math.sqr = function(x)
{
	return x * x
}

math.inrange = function(x, min, max)
{
	return (x >= min) && (x <= max) || (x >= max) && (x <= min)
}