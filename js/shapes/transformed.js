function transformed(args)
{
    this.shape      = args.shape
    this.transform  = args.transform
}

transformed.prototype.inside = function(p)
{
    var q = this.transform.ipt(p)
    return this.shape.inside(q)
}

transformed.prototype.trace = function(r)
{
    var tr = new ray
    ({
        from:   this.transform.ipt(r.from),
        dir:    this.transform.idt(r.dir)
    })

    var h = this.shape.trace(tr)
    if (!h) return

    h.norm  = this.transform.fdt(h.norm)
    h.at    = this.transform.fpt(h.at)
    h.dist  = vec.dist(r.from, h.at)

    return h
}