// An rpoint contains vectors for the reflection point.
// It gets p, v, n and l vectors and can give h and r vectors.

function rpoint(args)
{
    this.p_ = args.p
    this.v_ = args.v
    this.l_ = args.l
    this.n_ = args.n
}

rpoint.prototype.p = function()
{
    return this.p_
}

rpoint.prototype.v = function()
{
    return this.v_
}

rpoint.prototype.l = function()
{
    return this.l_
}

rpoint.prototype.n = function()
{
    return this.n_
}

rpoint.prototype.h = function()
{
    if (!this.h_)
    {
        var v = this.v_
        var l = this.l_
        var h = vec.add(v, l)
        var hd = 1/vec.norm(h)

        h[0] *= hd
        h[1] *= hd
        h[2] *= hd

        this.h_ = h
    }

    return this.h_
}

rpoint.prototype.r = function()
{
    if (!this.r_)
        this.r_ = vec.reflect(this.l_, this.n_)

    return this.r_
}