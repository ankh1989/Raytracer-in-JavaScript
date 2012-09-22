function raytracer(settings)
{
    this.scene = settings.scene

    if (this.scene.objects.length == 1)
        this.obj = this.scene.objects[0]
    else
        this.obj = new group(this.scene.objects)

    this.totalrays = 0
    this.photonmap = []
    this.dirays = 100
}

raytracer.prototype.trace = function(r)
{
    return this.obj.trace(r)
}

// Returns the intensity of light along a specified ray.
raytracer.prototype.color = function(r)
{
    this.totalrays++
    if (r.power < 1e-4) return [0, 0, 0]

    var hit = this.trace(r)
    if (!hit) return this.scene.bgcolor

    if (vec.dot(r.dir, hit.norm) > 0)
        hit.norm = vec.neg(hit.norm)

    var m = hit.owner.material

    var surf = m.diffuse
    var refl = m.reflectance
    var refr = m.transparency

    var surfcol = this.diffuse(r, hit) || [0, 0, 0]
    var reflcol = this.reflect(r, hit) || [0, 0, 0]
    var refrcol = this.refract(r, hit) || [0, 0, 0]
    
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
        var lr = new ray
        ({
            from:   light.at,
            to:     hit.at
        })

        var lh = this.trace(lr)
        if (!lh || vec.dist(lh.at, hit.at) > 1e-3)
            continue

        var rp = new rpoint
        ({
            p:  hit.at,
            v:  r.dir,
            l:  lr.dir,
            n:  hit.norm
        })

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
    return [0, 0, 0]
}

// Returns the intensity of the reflected light ray.
raytracer.prototype.reflect = function(r, hit)
{
    var m = hit.owner.material
    var v = vec.reflect(r.dir, hit.norm)
    if (!v) return

    var rr = new ray
    ({
        from:   hit.at,
        dir:    v,
        power:  r.power*m.reflectance
    })

    rr.advance(math.eps)
    return this.color(rr)
}

// Returns the intensity of the refracted light ray(s).
raytracer.prototype.refract = function(r, hit)
{
    var m = hit.owner.material
    var v = vec.refract(r.dir, hit.norm, m.refrcoeff)
    if (!v) return

    var rr = new ray
    ({
        from:   hit.at,
        dir:    v,
        power:  r.power*m.transparency
    })

    rr.advance(math.eps)
    return this.color(rr)
}

// Emits a light ray and puts produced photos
// into the phon map.
raytracer.prototype.emit = function(r)
{
    if (r.power < math.eps) return
    var h = this.trace(r)
    if (!h) return

    // The photon's origin is jittered to avoid
    // having two photos with the same
    // x, y or z coordinate. This will help to
    // build the kd-tree.
    var photon = new ray
    ({
        from:   vec.addmul(h.at, 1e-6, vec.random()),
        dir:    r.dir,
        power:  r.power
    })

    this.photonmap.push(photon)
    var m = h.owner.material

    // caustics produced by reflected photos
    if (m.reflectance > 0)
    {
        var v = vec.reflect(r.dir, h.norm)
        if (v)
        {
            var rr = new ray
            ({
                from:   vec.clone(h.at),
                dir:    v,
                power:  r.power*m.reflectance
            })

            rr.advance(math.eps)
            this.emit(rr)
        }
    }

    // caustics produced by refracted photos
    if (m.transparency > 0)
    {
        var v = vec.refract(r.dir, h.norm, m.refrcoeff)
        if (v)
        {
            var rr = new ray
            ({
                from:   vec.clone(h.at),
                dir:    v,
                power:  r.power*m.transparency
            })

            rr.advance(math.eps)
            this.emit(rr)
        }
    }

    // diffuse interreflection
    if (m.diffuse > 0)
    {
        var power = r.power*m.diffuse/this.dirays
        if (power > math.eps)
        for (var i = 0; i < this.dirays; i++)
        {
            var x = new m3x3({xaxis:h.norm})
            var v = vec.random()
            v[0] = Math.abs(v[0])
            v = x.vmul(v)
            if (vec.dot(v, h.norm) < 0) throw "invalid v"

            var rp = new rpoint
            ({
                p: h.at,
                v: r.dir,
                n: h.norm,
                m: x,
                l: vec.neg(v)
            })

            var li = m.shader.intensity(rp)
            var lr = new ray
            ({
                from:   vec.clone(h.at),
                dir:    v,
                power:  power*li
            })

            lr.advance(math.eps)
            this.emit(lr)
        }
    }
}