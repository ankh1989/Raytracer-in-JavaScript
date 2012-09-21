function raytracer(settings)
{
    this.scene = settings.scene

    if (this.scene.objects.length == 1)
        this.obj = this.scene.objects[0]
    else
        this.obj = new group(this.scene.objects)

    this.totalrays = 0
}

// Returns the intensity of light along a specified ray.
raytracer.prototype.color = function(r)
{
    this.totalrays++

    if (r.depth > 5) return [0, 0, 0]

    var hit = this.obj.trace(r)
    if (!hit) return this.scene.bgcolor

    if (vec.dot(r.dir, hit.norm) > 0)
        hit.norm = vec.neg(hit.norm)

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

// Returns the intensity of diffuse lighting.
raytracer.prototype.diffuse = function(r, hit)
{
    var m = hit.owner.material
    if (!m.color) return

    var intensity = vec.add
    (
        this.direct(r, hit),
        this.indirect(r, hit)
    )

    var color = m.color

    if (color.getcolor)
        color = color.getcolor(hit.at)

    return [
        intensity[0]*color[0],
        intensity[1]*color[1],
        intensity[2]*color[2]
    ]
}

// Returns the intensity of direct lighting.
raytracer.prototype.direct = function(r, hit)
{
    var shader = hit.owner.material.shader
    var intensity = 0

    for (var i = 0; i < this.scene.lights.length; i++)
    {
        var light = this.scene.lights[i]
        var dir = vec.sub(hit.at, light.at)
        var dist = vec.len(dir)
        var id = 1/dist

        dir[0] *= id
        dir[1] *= id
        dir[2] *= id

        var q = this.obj.trace(new ray({from:light.at, dir:dir}))
        if (!q || vec.sqrdist(q.at, hit.at) > math.eps)
            continue

        var rp = new rpoint({p:hit.at, v:r.dir, l:dir, n:hit.norm})
        intensity += light.power*shader.intensity(rp)
    }

    return [
        intensity,
        intensity,
        intensity
    ]
}

// Returns the intensity of indirect lighting.
raytracer.prototype.indirect = function(r, hit)
{
    var shader = hit.owner.material.shader
    var nrays = 0
    var color = [0, 0, 0]

    for (var i = 0; i < nrays; i++)
    {
        //
        // choose a random point on the hemisphere
        //

        var phi = Math.random()*Math.PI*2
        var h = Math.random()
        var d = Math.sqrt(1 - h*h)
        var hemirp = [d*Math.cos(phi), d*Math.sin(phi), h]

        //
        // compute the light intensity factor for the direction
        //

        var rp = new rpoint
        ({
            p: hit.at,
            v: r.dir,
            n: hit.norm,
            l: vec.neg(hemirp)
        })
        var li = shader.intensity(rp)/nrays
        if (li == 0) continue

        //
        // Compute light intensity for the choosen direction
        //

        var lr = new ray
        ({
            depth:  r.depth + 1,
            from:   vec.addmul(hit.at, math.eps, hemirp),
            dir:    hemirp,
            power:  r.power*li
        })
        var lc = this.color(lr)
        if (!lc || (lc[0] == 0 && lc[1] == 0 && lc[2] == 0)) continue

        //
        // Collect the computed intensity
        //

        color[0] += li*lc[0]
        color[1] += li*lc[1]
        color[2] += li*lc[2]
    }

    return color
}

// Returns the intensity of the reflected light ray.
raytracer.prototype.reflection = function(r, hit)
{
    var p = hit.owner.material.reflection*r.power
    var rd = vec.reflect(r.dir, hit.norm)
    var np = vec.addmul(hit.at, math.eps, rd)

    var reflray = new ray
    ({
        depth:  r.depth + 1,
        from:   np,
        dir:    rd,
        power:  p
    })

    return this.color(reflray)
}

// Returns the intensity of the refracted light ray(s).
raytracer.prototype.refraction = function(r, hit)
{
    var p = hit.owner.material.transparency*r.power
    var rr = vec.refract(r.dir, hit.norm, hit.owner.material.refrcoeff)

    if (!rr) return

    var np = vec.addmul(hit.at, math.eps, rr)

    var refrray = new ray
    ({
        depth:  r.depth + 1,
        from:   np,
        dir:    rr,
        power:  p
    })

    return this.color(refrray)
}