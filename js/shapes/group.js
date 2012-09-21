function group(objects)
{
    this.objects = objects
}

group.prototype.inside = function(p)
{
    for (var i = 0; i < this.objects.length; i++)
        if (this.objects.inside(p))
            return true

    return false
}

group.prototype.trace = function(r)
{
    var h

    for (var i = 0; i < this.objects.length; i++)
    {
        var w = this.objects[i].trace(r)
        if (w && (!h || w.dist < h.dist))
            h = w
    }

    return h
}