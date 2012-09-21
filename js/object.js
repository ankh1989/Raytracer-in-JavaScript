function object(args)
{
    this.shape      = args.shape
    this.material   = args.material
}

object.prototype.inside = function(p)
{
    return this.shape.inside(p)
}

object.prototype.trace = function(r)
{
    var hit = this.shape.trace(r)
    if (!hit) return
    if (!hit.owner) hit.owner = this
    return hit
}