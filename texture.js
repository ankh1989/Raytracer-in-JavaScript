texture = {}

texture.checker = function(options)
{
	options = options || {}
	
	var s = options.s
	
	if (isFinite(s))
		s = vec.all(s)
	else if (!s)
		s = vec.all(1)		
	
	var c = options.color || [1, 1, 1]	
	var ic = [1 - c[0], 1 - c[1], 1 - c[2]]
	
	return function(at)
	{				
		var sum = 0
		
		for (var i = 0; i < vec.dim; i++)
			sum += Math.floor(s[i]*(0.123 + at[i]))
			
		return sum % 2 == 0 ? c : ic
	}
}