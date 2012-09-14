function isosurf(settings)
{
    this.f          = eval('(' + settings.f + ')')
    this.bound      = settings.bound
    this.maxgrad    = settings.maxgrad
}

isosurf.prototype.norm = function(at)
{
    return vec.norm(math.fulldiff(this.f, at))
}

isosurf.prototype.trace = function(ray)
{
    var hit0 = this.bound.trace(ray)
    if (!hit0) return
    
    var ray2 = {from:vec.add(hit0.at, vec.mul(math.eps, ray.dir)), dir:ray.dir}
    var hit1 = this.bound.trace(ray2)
    if (!hit1)
    {
        // the ray starts from inside the bounding shape
        hit1 = hit0
        hit0 = {at:ray.from}
    }

    var dist = vec.len(vec.sub(hit1.at, hit0.at))

    var s = function(t)
    {
        return [
            hit0.at[0] + t*ray.dir[0],
            hit0.at[1] + t*ray.dir[1],
            hit0.at[2] + t*ray.dir[2]
        ]
    }

    var f = this.f
    var g = function(t) { return f.apply(null, s(t)) }
    var t = math.findroot(g, 0, dist, this.maxgrad)

    if (t)
        return {
            at: s(t),
            dist: vec.len(vec.sub(hit0.at, ray.from)) + t
        }
}