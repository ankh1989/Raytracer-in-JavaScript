function raytracer(settings)
{
    this.scene = settings.scene

    if (this.scene.objects.length == 1)
        this.obj = this.scene.objects[0]
    else
        this.obj = new group(this.scene.objects)

    this.totalrays = 0
    this.photons = []
    this.photonmap = null // kd-tree from photos
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

    var components =
    [
        [m.diffuse,      this.diffuse],
        [m.reflectance,  this.reflect],
        [m.transparency, this.refract],
    ]

    var color = [0, 0, 0]

    for (var i = 0; i < components.length; i++)
    {
        var k = components[i][0]
        var f = components[i][1]
        if (!k) continue
        var li = f.apply(this, [r, hit])
        if (!li) continue
        color[0] += k*li[0]
        color[1] += k*li[1]
        color[2] += k*li[2]
    }

    return color
}

// Returns the intensity of diffuse lighting.
raytracer.prototype.diffuse = function(r, hit)
{
    var m = hit.owner.material
    if (!m.color) return

    var lid = this.direct(r, hit)
    var lii = this.indirect(r, hit)

    var li = vec.add(lid, lii)

    var color = m.color

    if (color.getcolor)
        color = color.getcolor(hit.at)

    return [
        li[0]*color[0],
        li[1]*color[1],
        li[2]*color[2]
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
raytracer.prototype.indirect = function(r, h)
{
    if (!this.photonmap)
    {
        if (!this.photons || !this.photons.length)
            return [0, 0, 0]

        this.photonmap = new kdtree(
            this.photons,
            function(r) { return r.from })
    }

    var p = h.at
    var e = 0.1

    var photons = this.photonmap.select
    (
        [p[0] - e, p[1] - e, p[2] - e],
        [p[0] + e, p[1] + e, p[2] + e]
    )

    var m = h.owner.material
    var li = 0

    for (var i = 0; i < photons.length; i++)
    {
        var pi = photons[i]
        var rp = new rpoint
        ({
            p: h.at,
            v: r.dir,
            n: h.norm,
            l: pi.dir
        })

        var rpli = m.shader.intensity(rp)
        li += rpli*pi.power
    }

    var s = Math.PI*e*e
    li /= s
    return [li, li, li]
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
    r.depth = r.depth || 0
    if (r.power < 1e-8) return

    var h = this.trace(r)
    if (!h) return

    if (r.depth > 0)
    {
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

        // An update in the list of photos invalidates
        // the kd-tree based on that list.
        this.photons.push(photon)
        this.photonmap = null
    }

    var m = h.owner.material

    // caustics produced by reflected photos
    var reflect = function()
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
            rr.depth = r.depth + 1
            this.emit(rr)
        }
    }

    // caustics produced by refracted photos
    var refract = function()
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
            rr.depth = r.depth + 1
            this.emit(rr)
        }
    }

    // diffuse interreflection
    var diffuse = function()
    {
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
        lr.depth = r.depth + 1
        this.emit(lr)
    }

    //
    // Choose one of possible ways for the ray to proceed:
    // reflection, refraction or diffusion. Each way has its
    // own probability set by the surface material.
    //

    var possiblerays =
    [
        [m.diffuse,         diffuse],
        [m.reflectance,     reflect],
        [m.transparency,    refract],
    ]

    var curp = Math.random()
    for (var i = 0; i < possiblerays.length; i++)
    {
        curp -= possiblerays[i][0]
        if (curp <= 0)
            possiblerays[i][1].apply(this)
    }
}