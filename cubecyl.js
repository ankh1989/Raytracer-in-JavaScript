function cubecyl(opts)
{
	opts = opts || {}
	
	opts.cyl = opts.cyl || {}
	opts.sphere = opts.sphere || {}

	var a = opts.a || vec.all(-1)
	var b = opts.b || vec.all(1)
	
	var cylr = opts.cyl.r || 0.06
	var cylc = opts.cyl.color || [1, 0, 0]
	var cylm = opts.cyl.mat || mat.create()
	
	var spr = opts.sphere.r || 0.1
	var spc = opts.sphere.color || [0, 1, 0]
	var spm = opts.sphere.mat || mat.create()
	
	var coords = function(i)
	{
		var p = []
		
		for (var ii = 0; ii < vec.dim; ii++)			
			p[ii] = (i & (1 << ii)) ? a[ii] : b[ii]			
				
		return p
	}
	
	this.objects = []
	
	var corners = 1 << vec.dim
	
	for (var i = 0; i < corners; i++)
	{
		var pi = coords(i)
		this.objects.push(new sphere(pi, spr, spc, spm))
	
		for (var ii = 0; ii < vec.dim; ii++)
			if ((i & (1 << ii)) == 0)
			{
				var j = i | (1 << ii)
				var pj = coords(j)
				this.objects.push(new cylinder(pi, pj, cylr, cylc, cylm))
			}
	}
	
	var bsp = {}
	
	bsp.c = vec.average(a, b)
	bsp.r = vec.len(vec.sub(a, b))/2 + spr + math.eps
	
	this.boundingsphere = bsp	
}

cubecyl.prototype.trace = function(ray)
{
	if (sphere.prototype.trace.apply(this.boundingsphere, [ray]))	
		return rt.trace(ray, 0, this.objects)
}