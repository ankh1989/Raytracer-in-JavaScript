function plane(settings)
{
    this.p = settings.center || vec.all(0)
    this.n = vec.norm(settings.norm || [0, 0, 1])
    this.pn = vec.dot(this.p, this.n)
}

plane.prototype.norm = function()
{
    return this.n
}

plane.prototype.trace = function(ray)
{	
    var s = ray.dir
    var n = this.n	
    var sn = vec.dot(s, n)	
    
    if (sn == 0) return
    
    var a = ray.from
    var pn = this.pn || vec.dot(this.p, n)
    var t = (pn - vec.dot(a, n)) / sn
    
    if (t < math.eps) return
        
    var q = [
        a[0] + t * s[0],
        a[1] + t * s[1],
        a[2] + t * s[2]
    ]
        
    return {at:q, dist:t}
}

function axisplane(settings)
{
    this.p = settings.center || vec.all(0)
    this.axis = settings.axis || 2
    this.n = vec.e(this.axis)
    this.paxis = this.p[this.axis]
}

axisplane.prototype.norm = function()
{
    return this.n
}

axisplane.prototype.trace = function(ray)
{
    var axis = this.axis
    var s = ray.dir
    var sn = s[axis]
    
    if (sn == 0) return
    
    var a = ray.from
    var t = (this.paxis - a[axis]) / sn
    
    if (t < math.eps) return
        
    var q = [
        a[0] + t * s[0],
        a[1] + t * s[1],
        a[2] + t * s[2]
    ]
        
    return {at:q, dist:t}
}