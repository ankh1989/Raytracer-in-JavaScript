function raytracer(settings)
{
    this.scene = settings.scene
    this.obj = csg.or.apply(null, this.scene.objects)
}

raytracer.prototype.color = function(r)
{
    var hit = this.obj.trace(r)
    if (!hit) return this.scene.bgcolor

    var m = hit.owner.material

    var surf = m.surface
    var refl = m.reflection
    var refr = m.transparency

    var surfcol = this.diffuse(r, hit) || [0, 0, 0]
    var reflcol = this.reflection(r, hit) || [0, 0, 0]
    var refrcol = this.refraction(r, hit) || [0, 0, 0]
    
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
        
    for (var j = 0; j < lights.length; j++)
    {
        var light = lights[j]
        var dir = vec.sub(hit.at, light.at)
        var dist = vec.len(dir)
        
        dir[0] /= dist
        dir[1] /= dist
        dir[2] /= dist

        var lightray = new ray({from:light.at, dir:dir})
        var q = this.obj.trace(lightray)
        
        if (!q || vec.sqrdist(q.at, hit.at) > math.eps)
            continue

        var rp = new rpoint({p:hit.at, v:r.dir, l:dir, n:hit.norm})
        sumlight += light.power*m.shader.intensity(rp)
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
    var p = hit.owner.material.reflection*r.power
    if (p < math.eps) return

    var rd = vec.reflect(r.dir, hit.norm)
    var np = vec.addmul(hit.at, math.eps, rd)

    var reflray = new ray
    ({
        from:   np,
        dir:    rd,
        power:  p
    })

    return this.color(reflray)
}

raytracer.prototype.refraction = function(r, hit)
{
    var p = hit.owner.material.transparency*r.power
    if (p < math.eps) return

    var rr = vec.refract(r.dir, hit.norm, hit.owner.material.refrcoeff)

    if (!rr) return

    var np = vec.addmul(hit.at, math.eps, rr)

    var refrray = new ray
    ({
        from:   np,
        dir:    rr,
        power:  p
    })

    return this.color(refrray)
}