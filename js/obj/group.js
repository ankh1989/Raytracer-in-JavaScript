function group(settings)
{
    this.bound      = settings.bound
    this.objects    = settings.objects
}

group.prototype.trace = function(r)
{
    if (!this.bound || this.bound.trace(r))
        return raytracer.trace(r, this.objects, 0)
}