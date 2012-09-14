function raytracer(settings)
{
    this.scene = settings.scene
}

raytracer.ray = function(from, to, power)
{
    var dir = vec.norm(vec.sub(to, from))
    power = power || 1
    return {from:from, dir:dir, power:power}
}

raytracer.traceshape = function(ray, shape)
{
    var src = ray.from

    if (shape.transform)
    {
        if (!shape.transform.imx)
            shape.transform.imx = vec.mx3x3.invm(shape.transform.mx)

        var from = vec.mx3x3.mulvm(ray.from, shape.transform.imx)
        var to = vec.mx3x3.mulvm(vec.add(ray.from, ray.dir), shape.transform.imx)

        ray = raytracer.ray(from, to, ray.power)
    }

    var hit = shape.trace(ray)

    if (hit && shape.transform)
    {
        hit.at = vec.mx3x3.mulvm(hit.at, shape.transform.mx)
        hit.dist = vec.dist(src, hit.at)

        if (hit.norm)
            hit.norm = vec.norm(vec.mx3x3.mulvm(hit.norm, shape.transform.imx))
    }

    return hit
}

raytracer.getnorm = function(hit)
{
    if (hit.norm)
        return hit.norm

    var t = hit.owner.shape.transform

    if (!t)
        return hit.owner.shape.norm(hit.at)

    var i = function(v) { return vec.mx3x3.mulvm(v, t.imx) }

    return i(hit.owner.shape.norm(i(hit.at)))
}

raytracer.trace = function(ray, objects, min)
{
    var min = min || 0
    var p

    for (var i = 0; i < objects.length; i++)
    {
        var obj = objects[i]
        var ep = raytracer.traceshape(ray, obj.shape)
        
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

raytracer.prototype.color = function(r)
{
    var hit = raytracer.trace(r, this.scene.objects)
    if (!hit) return this.scene.bgcolor
    
    hit.norm = raytracer.getnorm(hit)

    var nc = [0, 0, 0]

    var m = hit.owner.material

    var surf = m.surface
    var refl = m.reflection
    var refr = m.transparency
        
    var surfcol = surf ? this.diffuse(r, hit) || nc : nc
    var reflcol = refl ? this.reflection(r, hit) || nc : nc
    var refrcol = refr ? this.refraction(r, hit) || nc : nc
    
    return [
        surf * surfcol[0] + refl * reflcol[0] + refr * refrcol[0],
        surf * surfcol[1] + refl * reflcol[1] + refr * refrcol[1],
        surf * surfcol[2] + refl * reflcol[2] + refr * refrcol[2]
    ]
}

raytracer.prototype.diffuse = function(r, hit)
{
    var m = hit.owner.material
    var sumlight = 0
    var lights = this.scene.lights
        
    for (var j = 0, len = lights.length; j < len; j++)
    {
        var light = lights[j]
        if (light.power == 0) continue

        var dir = vec.sub(hit.at, light.at)
        var dist = vec.len(dir)
        
        dir = vec.mul(1/dist, dir)
        
        var ray = {}
        
        ray.from = light.at
        ray.dir = dir
        
        var q = raytracer.trace(ray, this.scene.objects, dist - math.eps)
        
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
    
    var color = hit.owner.material.color

    if (color.getcolor)
        color = color.getcolor(hit.at)

    return [
        sumlight*color[0],
        sumlight*color[1],
        sumlight*color[2]
    ]
}

raytracer.prototype.reflection = function(r, hit)
{
    var k = hit.owner.material.reflection

    if (k * r.power < math.eps)
        return

    var q = {}

    q.dir = vec.reflect(r.dir, hit.norm)
    q.from = hit.at
    q.power = k * r.power

    return this.color(q)
}

raytracer.prototype.refraction = function(r, hit)
{
    var m = hit.owner.material
    var t = m.transparency
    
    if (t * r.power < math.eps)
        return
    
    var dir = vec.refract(r.dir, hit.norm, m.refrcoeff)
    if (!dir) return
        
    var q = {}

    q.dir = dir
    q.from = hit.at
    q.power = t * r.power
        
    return this.color(q)
}