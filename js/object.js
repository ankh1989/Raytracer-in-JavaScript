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
    var rayst = r

    if (this.transform)
        rayst = new ray
        ({
            from:   this.transform.ipt(r.from),
            dir:    this.transform.idt(r.dir),
            power:  r.power
        })

    var hit = this.shape.trace(rayst)
    if (!hit) return
    if (!hit.owner) hit.owner = this

    if (this.transform)
    {
        hit.norm    = this.transform.fdt(hit.norm)
        hit.at      = this.transform.fpt(hit.at)
        hit.dist    = vec.dist(r.from, hit.at)
    }

    return hit
}