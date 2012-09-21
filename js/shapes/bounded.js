function bounded(args)
{
    this.shape = args.shape
    this.bound = args.bound
}

bounded.prototype.inside = function(p)
{
    return this.bound.inside(p) && this.shape.inside(p)
}

bounded.prototype.trace = function(r)
{
    if (this.bound.inside(r.from) || this.bound.trace(r))
        return this.shape.trace(r)
}