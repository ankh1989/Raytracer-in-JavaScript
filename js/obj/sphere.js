function sphere(settings)
{
    this.c      = settings.center
    this.r      = settings.radius
    this.r2     = this.r*this.r
    this.ir     = 1/this.r
}

sphere.prototype.norm = function(at)
{
    var ir = this.ir
    var c = this.c
    
    return [
        ir * (at[0] - c[0]),
        ir * (at[1] - c[1]),
        ir * (at[2] - c[2])
    ]
}

sphere.prototype.trace = function(r)
{
    var a = r.from
    var ac = vec.sub(this.c, a)
    var s = r.dir
    var acs = vec.dot(ac, s)
    
    if (acs < 0) return
    
    var ac2 = vec.sqrlen(ac)
    var r2 = this.r2 || this.r * this.r
    var d2 = ac2 - r2
    var D = acs * acs - d2
    
    if (D < 0) return
        
    var sD = Math.sqrt(D)
    var t = acs - sD
    
    if (t < math.eps)
        t = acs + sD
        
    if (t < math.eps)
        return
            
    var p = [
        a[0] + t * s[0],
        a[1] + t * s[1],
        a[2] + t * s[2]
    ]
    
    return {at:p, dist:t}
}