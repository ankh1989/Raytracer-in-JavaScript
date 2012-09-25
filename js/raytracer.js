function raytracer(settings)
{
    this.scene = settings.scene

    if (this.scene.objects.length == 1)
        this.obj = this.scene.objects[0]
    else
        this.obj = new group(this.scene.objects)

    this.totalrays = 0
    this.photons = []
    this.photonmap = null // kd-tree from photons

    this.ip4 = 1/(4*Math.PI)
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
        if (!lh || vec.sqrdist(lh.at, hit.at) > 1e-3)
            continue

        var rp = new rpoint
        ({
            p:  hit.at,
            v:  r.dir,
            l:  lr.dir,
            n:  hit.norm
        })

        var fadeout = this.ip4/vec.sqrdist(hit.at, light.at)
        intensity += light.power*fadeout*shader.intensity(rp)
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
    var e = 0.05

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

    var s = 4*e*e
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