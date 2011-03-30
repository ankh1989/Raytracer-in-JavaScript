function cylinder(a, b, r, color, material)
{
	a = a || vec.all(0)
	b = b || vec.e(vec.dim - 1)
	color = color || [1, 0, 0]
	material = material || mat.create()
	r = r || 1

	this.a = a
	this.b = b
	this.s = vec.norm(vec.sub(b, a))	
	this.r = r
	this.r2 = r * r	
	this.h = vec.len(vec.sub(b, a))
	this.color = color
	this.mat = material
}

cylinder.prototype.trace = function(ray)
{
	var p = ray.from
	var v = vec.norm(ray.dir)
	var a = this.a
	var s = vec.norm(this.s)	
	var r2 = this.r2
	
	var vs = vec.dot(v, s)
	var w = 1 - vs*vs
	
	if (w == 0) return
	
	var ap = vec.sub(p, a)
	var apv = vec.dot(ap, v)
	var aps = vec.dot(ap, s)	
	var c = apv - aps*vs
	var D = c*c - w*(vec.sqrlen(ap) - aps*aps - r2)
	
	if (D < 0) return	
	
	var sD = Math.sqrt(D)
	var t = (-c - sD)/w
	
	if (t < math.eps)
		t = (-c + sD)/w
	
	if (t < math.eps)
		return	
			
	var q = vec.add(p, vec.mul(t, v))	
	var d = vec.dot(vec.sub(q, a), s)
	
	if (d > this.h)
	{		
		var b = this.b
		var hit = plane.prototype.trace.apply({p:b, n:s}, [ray])
		
		if (!hit) return
		
		var sd = vec.sqrdist(hit.at, b)		
		
		if (sd > r2) return
		
		hit.norm = s
		return hit
	}	
	
	if (d < 0)
	{						
		var hit = plane.prototype.trace.apply({p:a, n:s}, [ray])
		
		if (!hit) return
		
		var sd = vec.sqrdist(hit.at, a)
		
		if (sd > r2) return
		
		hit.norm = vec.mul(-1, s)
		return hit
	}	
	
	var b = vec.add(a, vec.mul(d, s))
	var n = vec.mul(1/this.r, vec.sub(q, b))
	
	return {at:q, norm:n, dist:t}
}