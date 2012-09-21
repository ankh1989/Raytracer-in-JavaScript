function plane(settings)
{
    this.p = settings.center || vec.all(0)
    this.n = vec.norm(settings.norm || [0, 0, 1])
    this.pn = vec.dot(this.p, this.n)
}

plane.prototype.inside = function(p)
{
    var c = this.p
    var n = this.n

    return n[0]*(p[0] - c[0]) + n[1]*(p[1] - c[1]) + n[2]*(p[2] - c[2]) <= 0
}

plane.prototype.trace = function(r)
{
    var s = r.dir
    var n = this.n
    var sn = vec.dot(s, n)
    
    if (sn == 0) return
    
    var a = r.from
    var pn = this.pn || vec.dot(this.p, n)
    var t = (pn - vec.dot(a, n)) / sn
    
    if (t < math.eps) return
        
    var q = [
        a[0] + t * s[0],
        a[1] + t * s[1],
        a[2] + t * s[2]
    ]
        
    return {at:q, dist:t, norm:n}
}

function axisplane(settings)
{
    this.p = settings.center || vec.all(0)
    this.axis = settings.axis || 2
    this.n = vec.e(this.axis)
    this.paxis = this.p[this.axis]
}

axisplane.prototype.inside = function(p)
{
    var i = this.axis

    return p[i] - this.p[i] <= 0
}

axisplane.prototype.trace = function(r)
{
    var axis = this.axis
    var s = r.dir
    var sn = s[axis]
    
    if (sn == 0) return
    
    var a = r.from
    var t = (this.paxis - a[axis]) / sn
    
    if (t < math.eps) return
        
    var q = [
        a[0] + t * s[0],
        a[1] + t * s[1],
        a[2] + t * s[2]
    ]
        
    return {at:q, dist:t, norm:this.n}
}