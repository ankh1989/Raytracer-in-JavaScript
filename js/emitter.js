function emitter(args)
{
    this.obj = args.obj
    this.levels = []
}

// emits a set of rays, saves photons produced by the rays
// and returns a set of rays produced by reflection, refraction, etc.
emitter.prototype.emit = function(rays)
{
    var photons = []
    var newrays = []

    for (var i = 0; i < rays.length; i++)
    {
        var r = rays[i]
        var h = this.obj.trace(r)
        if (!h) continue

        if (h.owner.material.diffuse > 0)
            photons.push(new ray
            ({
                from:   h.at,
                dir:    r.dir,
                power:  r.power
            }))

        var p = this.emitphoton(r, h)
        if (p) newrays.push(p)
    }

    this.levels.push(photons)
    return newrays
}

// emits a new photon from the reflection point
emitter.prototype.emitphoton = function(r, h)
{
    var m = h.owner.material

    // Choose one of possible ways for the ray to proceed:
    // reflection, refraction or diffusion. Each way has its
    // own probability set by the surface material.
    var possiblerays =
    [
        [m.diffuse,         this.diffuse],
        [m.reflectance,     this.reflect],
        [m.transparency,    this.refract],
    ]

    var p = Math.random()

    for (var i = 0; i < possiblerays.length; i++)
    {
        p -= possiblerays[i][0]
        if (p <= 0)
            return possiblerays[i][1].apply(this, [r, h])
    }
}

// caustics produced by reflected photos
emitter.prototype.reflect = function(r, h)
{
    var m = h.owner.material
    var v = vec.reflect(r.dir, h.norm)
    if (!v) return

    var rr = new ray
    ({
        from:   vec.clone(h.at),
        dir:    v,
        power:  r.power*m.reflectance
    })

    rr.advance(math.eps)
    return rr
}

// caustics produced by refracted photos
emitter.prototype.refract = function(r, h)
{
    var m = h.owner.material
    var v = vec.refract(r.dir, h.norm, m.refrcoeff)
    if (!v) return

    var rr = new ray
    ({
        from:   vec.clone(h.at),
        dir:    v,
        power:  r.power*m.transparency
    })

    rr.advance(math.eps)
    return rr
}

// diffuse interreflection
emitter.prototype.diffuse = function(r, h)
{
    var m = h.owner.material
    var v

    while (!v || vec.dot(v, h.norm) < 0)
        v = vec.randomdir()

    var rp = new rpoint
    ({
        p: h.at,
        v: r.dir,
        n: h.norm,
        l: vec.neg(v)
    })

    var li = m.shader.intensity(rp)
    var lr = new ray
    ({
        from:   vec.clone(h.at),
        dir:    v,
        power:  li*r.power*m.diffuse
    })

    lr.advance(math.eps)
    return lr
}