rt = {}

rt.objects = []
rt.lights = []
rt.bgcolor = [0, 0, 0]

rt.ray = function(from, to, power)
{
	var dir = vec.norm(vec.sub(to, from))
	power = power || 1	
	return {from:from, dir:dir, power:power}
}

rt.trace = function(ray, min, objects)
{
	objects = objects || rt.objects
	min = min || 0

	var p	

	for (var i = 0, len = objects.length; i < len; i++)
	{		
		var obj = objects[i]
		var ep = obj.trace(ray)
		
		if (!ep) continue
		
		var d = ep.dist		
		
		if (!p || d < p.dist && d > math.eps)
		{
			if (d < min) return		
			p = ep
			p.owner = p.owner || obj			
		}		
	}
	
	return p
}

rt.color = function(r)
{
	var hit = rt.trace(r)	
	if (!hit) return rt.bgcolor	
	
	hit.norm = hit.norm || hit.owner.norm(hit.at)
		
	var surfcol = rt.diffuse(r, hit) || [0, 0, 0]
	var reflcol = rt.reflection(r, hit) || [0, 0, 0]	
	var refrcol = rt.refraction(r, hit) || [0, 0, 0]	
	
	var m = hit.owner.mat
	
	var surf = m.surface
	var refl = m.reflection
	var refr = m.transparency
	
	return [
		surf * surfcol[0] + refl * reflcol[0] + refr * refrcol[0],
		surf * surfcol[1] + refl * reflcol[1] + refr * refrcol[1],
		surf * surfcol[2] + refl * reflcol[2] + refr * refrcol[2]
	]
}

rt.diffuse = function(r, hit)
{	
	var obj = hit.owner	
	var m = obj.mat
	var sumlight = 0	
	var rt_lights = rt.lights
		
	for (var j = 0, len = rt_lights.length; j < len; j++)
	{
		var light = rt_lights[j]		
		var dir = vec.sub(hit.at, light.at)		
		var dist = vec.len(dir)
		
		dir = vec.mul(1/dist, dir)
		
		var ray = {}
		
		ray.from = light.at
		ray.dir = dir		
		
		var q = rt.trace(ray, dist - math.eps)
		
		if (!q || vec.sqrdist(q.at, hit.at) > math.eps)
			continue		
		
		if (m.phong > 0)
		{
			var lr = vec.reflect(dir, hit.norm)
			var vcos = -vec.dot(lr, r.dir)
			
			if (vcos > 0)
			{			
				var phong = Math.pow(vcos, m.phongpower)
				sumlight += light.power * m.phong * phong
			}			
		}
		
		if (m.lambert > 0)
		{
			var cos = -vec.dot(dir, hit.norm)
			
			if (cos > 0)
				sumlight += light.power * m.lambert * cos
		}
	}	
	
	return vec.mul(sumlight, typeof obj.color == 'function' ? obj.color(hit.at) : obj.color)
}

rt.reflection = function(r, hit)
{	
	var k = hit.owner.mat.reflection

	if (k * r.power < math.eps)
		return
			
	var q = {}
			
	q.dir = vec.reflect(r.dir, hit.norm)		
	q.from = hit.at
	q.power = k * r.power		
					
	return rt.color(q)
}

rt.refraction = function(r, hit)
{
	var m = hit.owner.mat
	var t = m.transparency
	
	if (t * r.power < math.eps)
		return
	
	var dir = vec.refract(r.dir, hit.norm, m.refrcoeff)	
	if (!dir) return
		
	var q = {}

	q.dir = dir
	q.from = hit.at
	q.power = t * r.power	
		
	return rt.color(q)
}