function isosurf(settings)
{
    this.f          = eval('(' + settings.f + ')')
    this.bound      = settings.bound
    this.maxgrad    = settings.maxgrad
}

isosurf.prototype.inside = function(p)
{
    return this.f(p[0], p[1], p[2]) <= 0
}

isosurf.prototype.trace = function(r)
{
    var hit0 = this.bound.trace(r)
    if (!hit0) return
    
    var ray2 = new ray
    ({
        from:   vec.add(hit0.at, vec.mul(math.eps, r.dir)),
        dir:    r.dir
    })

    var hit1 = this.bound.trace(ray2)

    if (!hit1)
    {
        // the ray starts from inside the bounding shape
        hit1 = hit0
        hit0 = {at:r.from}
    }

    var dist = vec.len(vec.sub(hit1.at, hit0.at))

    var s = function(t)
    {
        return [
            hit0.at[0] + t*r.dir[0],
            hit0.at[1] + t*r.dir[1],
            hit0.at[2] + t*r.dir[2]
        ]
    }

    var f = this.f
    var g = function(t) { return f.apply(null, s(t)) }
    var t = math.findroot(g, 0, dist, this.maxgrad)

    if (t)
    {
        var p = s(t)
        var n = vec.norm(math.fulldiff(f, p))

        return {
            at:     p,
            norm:   n,
            dist:   vec.len(vec.sub(hit0.at, r.from)) + t
        }
    }
}