function group(args)
{
    this.bound      = args.bound
    this.objects    = args.objects
    this.transform  = args.transform
}

group.prototype.trace = function(r)
{
    if (!this.bound || this.bound.trace(r))
        return raytracer.trace(r, this.objects, 0)
}