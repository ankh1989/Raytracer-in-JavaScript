function group(settings)
{
    this.bound      = settings.bound
    this.objects    = settings.objects
}

group.prototype.trace = function(ray)
{
    if (!this.bound || this.bound.trace(ray))
        return raytracer.trace(ray, this.objects, 0)
}