vec = {}

vec.clone = function(v)
{
    return [v[0], v[1], v[2]]
}

vec.all = function(x)
{
    return [x, x, x]
}

vec.random = function()
{
    return [Math.random()-0.5, Math.random()-0.5, Math.random()-0.5]
}

vec.randomdir = function()
{
    var v = vec.random()
    var d = vec.len(v)
    if (d != 0)
    {
        var f = 1/d

        v[0] *= f
        v[1] *= f
        v[2] *= f
    }
    return v
}

vec.leq = function(a, b)
{
    return a[0] <= b[0] && a[1] <= b[1] && a[2] <= b[2]
}

vec.e = function(i)
{
    var v = [0, 0, 0]
    v[i] = 1
    return v
}

vec.len = function(a)
{
    return Math.sqrt(a[0]*a[0] + a[1]*a[1] + a[2]*a[2])
}

vec.dist = function(a, b)
{
    return vec.len(vec.sub(a, b))
}

vec.norm = function(a)
{
    return vec.mul(1/vec.len(a), a)
}

vec.cross = function(a, b)
{
    return [
        a[1]*b[2] - a[2]*b[1],
        a[2]*b[0] - a[0]*b[2],
        a[0]*b[1] - a[1]*b[0]
    ]
}

vec.sum = function()
{
    var r = [0, 0, 0]
    
    for (var i = 0, len = arguments.length; i < len; i++)
    {
        var a = arguments[i]
        
        r[0] += a[0]
        r[1] += a[1]
        r[2] += a[2]		
    }
        
    return r
}

vec.average = function()
{
    return vec.mul(1/arguments.length, vec.sum.apply(this, arguments))
}

vec.dot = function(a, b)
{
    return a[0]*b[0] + a[1]*b[1] + a[2]*b[2]
}

vec.neg = function(a)
{
    return [-a[0], -a[1], -a[2]]
}

vec.add = function(a, b)
{
    return [a[0] + b[0], a[1] + b[1], a[2] + b[2]]
}

vec.sub = function(a, b)
{
    return [a[0] - b[0], a[1] - b[1], a[2] - b[2]]
}

vec.mul = function(f, a)
{
    return [f * a[0], f * a[1], f * a[2]]
}

vec.addmul = function(v, f, w)
{
    return [v[0] + f*w[0], v[1] + f*w[1], v[2] + f*w[2]]
}

vec.sqrlen = function(a)
{
    return a[0]*a[0] + a[1]*a[1] + a[2]*a[2]
}

vec.sqrdist = function(a, b)
{
    var x = a[0] - b[0]
    var y = a[1] - b[1]
    var z = a[2] - b[2]

    return x*x + y*y + z*z
}

vec.reflect = function(a, n)
{
    var f = 2*vec.dot(a, n)

    return [
        a[0] - f * n[0],
        a[1] - f * n[1],
        a[2] - f * n[2]
    ]
}

vec.refract = function(v, n, q)
{
    var nv = vec.dot(n, v)
    var bf, a

    if (nv > 0)
    {
        nv = -nv
        bf = 1
        a = q
    }
    else
    {
        a = 1/q
        bf = -1
    }

    var D = 1 - a*a*(1 - nv*nv)

    if (D < 0) return

    var b = bf*(nv*a + Math.sqrt(D))

    return [
        a * v[0] + b * n[0],
        a * v[1] + b * n[1],
        a * v[2] + b * n[2]
    ]
}

vec.sqrcdist = function(s, v)
{
    return vec.len(v) - Math.abs(vec.dot(v, s))
}