function object(args)
{
    this.shape      = args.shape
    this.material   = args.material
    this.transform  = args.transform
    this.bound      = args.bound
}

object.prototype.inside = function(p)
{
    return this.shape.inside(p)
}

object.prototype.trace = function(r)
{
    if (this.bound && !this.bound.inside(r.from) && !this.bound.trace(r))
        return

    var st = this.transform
    var rayst = r

    if (st)
    {
        st.imx = st.imx || vec.mx3x3.invm(st.mx)
        st.mp = st.mp || [0, 0, 0]

        rayst = new ray
        ({
            from:   vec.mx3x3.mulvm(vec.sub(r.from, st.mp), st.imx),
            dir:    vec.norm(vec.mx3x3.mulvm(r.dir, st.imx)),
            power:  r.power
        })
    }

    var hit = this.shape.trace(rayst)
    if (!hit) return

    if (st)
    {
        hit.norm    = vec.norm(vec.mx3x3.mulvm(hit.norm, st.mx))
        hit.at      = vec.add(vec.mx3x3.mulvm(hit.at, st.mx), st.mp)
        hit.dist    = vec.dist(r.from, hit.at)
    }

    hit.owner = hit.owner || this

    return hit
}