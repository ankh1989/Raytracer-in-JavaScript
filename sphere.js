function sphere(center, radius, color, material)
{
	this.c = center	
	this.r2 = radius * radius
	this.ir = 1/radius
	this.r = radius
	this.mat = material || mat.create()
	this.color = color || [1, 0, 0]
}

sphere.prototype.norm = function(at)
{	
	var ir = this.ir
	var c = this.c
	var n = new Array(c.length)
	
	for (var i = 0; i < c.length; i++)
		n[i] = ir * (at[i] - c[i])
		
	return n	
}

sphere.prototype.trace = function(ray)
{	
	var a = ray.from	
	var ac = vec.sub(this.c, a)
	var s = ray.dir
	var acs = vec.dot(ac, s)	
	
	if (acs < 0) return
	
	var ac2 = vec.sqrlen(ac)
	var r2 = this.r2 || this.r * this.r
	var d2 = ac2 - r2
	var D = acs * acs - d2
	
	if (D < 0) return
		
	var sD = Math.sqrt(D)	
	var t = acs - sD
	
	if (t < math.eps)
		t = acs + sD
		
	if (t < math.eps)
		return
			
	var p = new Array(a.length)
	
	for (var i = 0; i < a.length; i++)
		p[i] = a[i] + t * s[i]	
	
	return {at:p, dist:t}
}