// Constructive Solid Geometry

csg = {}

csg.tracer = function(args)
{
    this.shapes     = args.shapes
    this.iis        = args.inside
}

csg.tracer.prototype.inside = function(p)
{
    return this.iis(this.entered(p))
}

csg.tracer.prototype.trace = function(r)
{
    var firstis = null

    for (var i = 0; i < this.shapes.length; i++)
    {
        var is = this.getis(r, 0, i)
        firstis = this.pushis(firstis, is)
    }

    var entered = this.entered(r.from)
    var iis = this.iis(entered)
    var ray = r.clone()
    var dist = 0

    for (var is = firstis; is; is = is.next)
    {
        var i = is.objid

        entered[i] = !entered[i]

        if (this.iis(entered) != iis)
            return is.hit

        var t = is.hit.dist - dist + 1e-5
        ray.advance(t)
        dist += t

        var nextis = this.getis(ray, dist, i)
        firstis = this.pushis(firstis, nextis)
    }
}

csg.tracer.prototype.getis = function(r, dist, objid)
{
    var s = this.shapes[objid]
    var hit = raytracer.traceobj(r, s)
    if (!hit) return

    hit.dist += dist

    return {hit:hit, objid:objid}
}

csg.tracer.prototype.pushis = function(fis, is)
{
    if (!fis) return is
    if (!is) return fis

    var q, p = fis
    while (p && is.hit.dist >= p.hit.dist)
    {
        q = p
        p = p.next
    }

    if (!q)
    {
        is.next = fis
        return is
    }

    q.next = is
    is.next = p
    return fis
}

csg.tracer.prototype.entered = function(p)
{
    var entered = []

    for (var i = 0; i < this.shapes.length; i++)
        entered[i] = this.shapes[i].inside(p)

    return entered
}

csg.ctor = function(iis)
{
    var ctor = function(args)
    {
        args.inside = iis
        this.transform = args.transform
        this.tracer = new csg.tracer(args)
    }

    ctor.prototype.inside = function(p) { return this.tracer.inside(p) }
    ctor.prototype.trace = function(r) { return this.tracer.trace(r) }

    return ctor
}

csg.op = function(op)
{
    return function()
    {
        var shapes = []

        for (var i = 0; i < arguments.length; i++)
            shapes[i] = arguments[i]

        return new op({shapes:shapes})
    }
}

csg.union = csg.ctor(function(es)
{
    for (var i = 0; i < es.length; i++)
        if (es[i]) return true

    return false
})

csg.intersection = csg.ctor(function(es)
{
    for (var i = 0; i < es.length; i++)
        if (!es[i]) return false

    return true
})

csg.complement = csg.ctor(function(es)
{
    return !es[0]
})

csg.relcomplement = csg.ctor(function(es)
{
    return es[0] && !es[1]
})

csg.or  = csg.op(csg.union)
csg.and = csg.op(csg.intersection)
csg.not = csg.op(csg.complement)
csg.sub = csg.op(csg.relcomplement)