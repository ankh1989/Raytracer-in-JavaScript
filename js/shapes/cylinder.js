function cylinder(settings)
{
    this.a = settings.center1 || [0, 0, 0]
    this.b = settings.center2 || [0, 0, 1]
    this.r = settings.radius || 1
    this.s = vec.norm(vec.sub(this.b, this.a))
    this.r2 = this.r * this.r
    this.h = vec.len(vec.sub(this.b, this.a))
}

cylinder.prototype.inside = function(p)
{
    var a = this.a
    var s = this.s
    var h = s[0]*(p[0] - a[0]) + s[1]*(p[1] - a[1]) + s[2]*(p[2] - a[2])
    
    if (h < 0 || h > this.h)
        return false

    var q = [
        a[0] + h*s[0] - p[0],
        a[1] + h*s[1] - p[1],
        a[2] + h*s[2] - p[2],
    ]

    return q[0]*q[0] + q[1]*q[1] + q[2]*q[2] - this.r2 <= 0
}

cylinder.prototype.trace = function(r)
{
    var p = r.from
    var v = vec.norm(r.dir)
    var a = this.a
    var s = vec.norm(this.s)
    var r2 = this.r2
    
    var vs = vec.dot(v, s)
    var w = 1 - vs*vs
    
    if (w == 0) return
    
    var ap = vec.sub(p, a)
    var apv = vec.dot(ap, v)
    var aps = vec.dot(ap, s)
    var c = apv - aps*vs
    var D = c*c - w*(vec.sqrlen(ap) - aps*aps - r2)
    
    if (D < 0) return	
    
    var sD = Math.sqrt(D)
    var t = (-c - sD)/w
    
    if (t < math.eps)
        t = (-c + sD)/w
    
    if (t < math.eps)
        return	
            
    var q = vec.add(p, vec.mul(t, v))
    var d = vec.dot(vec.sub(q, a), s)
    
    if (d > this.h)
    {
        var b = this.b
        var hit = plane.prototype.trace.apply({p:b, n:s}, [r])
        
        if (!hit) return
        
        var sd = vec.sqrdist(hit.at, b)
        
        if (sd > r2) return
        
        hit.norm = s
        return hit
    }
    
    if (d < 0)
    {
        var hit = plane.prototype.trace.apply({p:a, n:s}, [r])
        
        if (!hit) return
        
        var sd = vec.sqrdist(hit.at, a)
        
        if (sd > r2) return
        
        hit.norm = vec.mul(-1, s)
        return hit
    }
    
    var b = vec.add(a, vec.mul(d, s))
    var n = vec.mul(1/this.r, vec.sub(q, b))
    
    return {at:q, norm:n, dist:t}
}