// Constructive Solid Geometry

csg = {}

csg.tracer = function(args)
{
    this.bound      = args.bound
    this.objects    = args.objects
    this.iis        = args.inside
}

csg.tracer.prototype.inside = function(p)
{
    return this.iis(this.entered(p))
}

csg.tracer.prototype.trace = function(r)
{
    if (this.bound && !this.bound.inside(r.from) && !raytracer.traceobj(r, this.bound))
        return

    var firstis = null

    for (var i = 0; i < this.objects.length; i++)
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

        var t = is.hit.dist - dist + math.eps
        ray.advance(t)
        dist += t

        var nextis = this.getis(ray, dist, i)
        firstis = this.pushis(firstis, nextis)
    }
}

csg.tracer.prototype.getis = function(r, dist, objid)
{
    var obj = this.objects[objid]
    var hit = raytracer.traceobj(r, obj)
    if (!hit) return

    hit.owner = hit.owner || obj
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

    for (var i = 0; i < this.objects.length; i++)
        entered[i] = this.objects[i].inside(p)

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

csg.setop = function(op)
{
    return function()
    {
        var objects = []

        for (var i = 0; i < arguments.length; i++)
            objects[i] = arguments[i]

        return {name:op, objects:objects}
    }
}

csg_union = csg.ctor(function(es)
{
    for (var i = 0; i < es.length; i++)
        if (es[i]) return true

    return false
})

csg_intersection = csg.ctor(function(es)
{
    for (var i = 0; i < es.length; i++)
        if (!es[i]) return false

    return true
})

csg_complement = csg.ctor(function(es)
{
    return !es[0]
})

csg_relcomplement = csg.ctor(function(es)
{
    return es[0] && !es[1]
})

csg.or  = csg.setop('csg_union')
csg.and = csg.setop('csg_intersection')
csg.not = csg.setop('csg_complement')
csg.sub = csg.setop('csg_relcomplement')