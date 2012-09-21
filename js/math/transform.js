// Affine transform

function transform(args)
{
    if (typeof args.m == 'object')
    {
        this.m = args.m
        this.p = args.p
    }
    else if (typeof args[0] == 'object' && typeof args[0][0] == 'number')
    {
        this.m = args
        this.p = null
    }
    else if (typeof args[0] == 'number')
    {
        this.m = null
        this.p = [args[0], args[1], args[2]]
    }

    if (this.m)
        this.i = this.m.clone().invert()
}

// forward direction transform
transform.prototype.fdt = function(v)
{
    var n = vec.clone(v)

    if (this.m)
    {
        n = this.m.vmul(v)
        var s = 1/vec.len(n)

        n[0] *= s
        n[1] *= s
        n[2] *= s
    }

    return n
}

// inverse direction transform
transform.prototype.idt = function(v)
{
    var n = vec.clone(v)

    if (this.i)
    {
        n = this.i.vmul(v)
        var s = 1/vec.len(n)

        n[0] *= s
        n[1] *= s
        n[2] *= s
    }

    return n
}

// forward position transform
transform.prototype.fpt = function(p)
{
    var q = this.m ? this.m.vmul(p) : vec.clone(p)

    if (this.p)
    {
        q[0] += this.p[0]
        q[1] += this.p[1]
        q[2] += this.p[2]
    }

    return q
}

// inverse position transform
transform.prototype.ipt = function(p)
{
    var q = vec.clone(p)

    if (this.p)
    {
        q[0] -= this.p[0]
        q[1] -= this.p[1]
        q[2] -= this.p[2]
    }

    return this.i ? this.i.vmul(q) : q
}