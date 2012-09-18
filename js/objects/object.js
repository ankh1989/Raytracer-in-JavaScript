function object(args)
{
    this.shape      = args.shape
    this.material   = args.material
    this.transform  = args.transform
}

object.prototype.inside = function(p)
{
    return this.shape.inside(p)
}

object.prototype.trace = function(r)
{
    return this.shape.trace(r)
}