shaders = {}

// Lambert

shaders.lambert = function(args)
{
    this.cd = args.cd || 1.0
}

shaders.lambert.prototype.intensity = function(rp)
{
    var nl = -vec.dot(rp.n(), rp.l())
    var d = nl < 0 ? 0 : this.cd*nl
    return d
}

// Phong

shaders.phong = function(args)
{
    this.ks = args.ks || 0.6
    this.cs = args.cs || 1.0
    this.kd = args.kd || 0.4
    this.cd = args.cd || 1.0

    this.e = args.e || 4
}

shaders.phong.prototype.intensity = function(rp)
{
    var vr = -vec.dot(rp.v(), rp.r())
    var nl = -vec.dot(rp.n(), rp.l())

    var s = vr < 0 ? 0 : this.ks*this.cs*Math.pow(vr, this.e)
    var d = nl < 0 ? 0 : this.kd*this.cd*nl

    return s + d
}

// Blinn

shaders.blinn = function(args)
{
    this.ks = args.ks || 0.6
    this.cs = args.cs || 1.0
    this.kd = args.kd || 0.4
    this.cd = args.cd || 1.0

    this.e = args.e || 16
}

shaders.blinn.prototype.intensity = function(rp)
{
    var nh = -vec.dot(rp.n(), rp.h())
    var nl = -vec.dot(rp.n(), rp.l())

    var s = nh < 0 ? 0 : this.ks*this.cs*Math.pow(nh, this.e)
    var d = nl < 0 ? 0 : this.kd*this.cd*nl

    return s + d
}

// Ward

shaders.ward = function(args)
{
    this.cd = args.cd || 0.3
    this.cs = args.cs || 0.7
    this.s  = args.s || 0.3
}

shaders.ward.prototype.intensity = function(rp)
{
    var nl = -vec.dot(rp.n(), rp.l())
    var nv = -vec.dot(rp.n(), rp.v())
    var nh = -vec.dot(rp.n(), rp.h())

    var d = this.cd
    var s = 0
    
    if (nl*nv > 0 && nh != 0)
    {
        var s2 = this.s*this.s
        var e = (nh*nh - 1)/(nh*s2)
        s = this.cs/(4*Math.PI*s2*Math.sqrt(nl*nv))*Math.exp(e)
    }

    return s + d
}