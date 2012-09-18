function raytracer(settings)
{
    this.scene = settings.scene
    this.union = new csg_union({objects:this.scene.objects})
}

raytracer.traceobj = function(r, obj)
{
    if (!obj.transform)
        return obj.trace(r)

    var st = obj.transform

    st.imx = st.imx || vec.mx3x3.invm(st.mx)

    var rayst = new ray
    ({
        from:   vec.add(vec.mx3x3.mulvm(r.from, st.imx), st.mp),
        dir:    vec.norm(vec.mx3x3.mulvm(r.dir, st.imx)),
        power:  r.power
    })

    var hit = obj.trace(rayst)

    if (!hit) return

    hit.norm    = vec.norm(vec.mx3x3.mulvm(hit.norm, st.mx))
    hit.at      = vec.mx3x3.mulvm(vec.sub(hit.at, st.mp), st.mx)
    hit.dist    = vec.dist(r.from, hit.at)

    return hit
}

raytracer.prototype.trace = function(r)
{
    return raytracer.traceobj(r, this.union)
}

raytracer.prototype.color = function(r)
{
    var hit = this.trace(r)
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
        var q = this.trace(lightray)
        
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