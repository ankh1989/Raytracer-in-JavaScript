vec = {}

vec.dim = 3

vec.rand = function(min, max)
{
    min = isFinite(min) ? min : -1
    max = isFinite(max) ? max : 1
    
    var v = new Array(vec.dim)
    
    for (var i = 0; i < vec.dim; i++)
        v[i] = Math.random(min, max)
        
    return v
}

vec.$ = function()
{
    var p = []

    for (var i = 0; i < vec.dim; i++)
        p[i] = arguments[i] || 0
        
    return p
}

vec.all = function(x)
{
    var v = new Array(vec.dim)
    
    for (var i = 0; i < vec.dim; i++)
        v[i] = x
        
    return v
}

vec.e = function(i)
{
    var v = new Array(vec.dim)
    
    for (var j = 0; j < vec.dim; j++)
        v[j] = 0
        
    v[i] = 1
    return v
}

vec.len = function(a)
{
    return Math.sqrt(vec.sqrlen(a))
}

vec.norm = function(a)
{
    return vec.mul(1/vec.len(a), a)
}

vec.gauss = function(m)
{
    var n = m.length
    
    for (var i = 0; i < n; i++)	
    for (var j = i + 1; j < n; j++)
    {
        if (m[i][i] == 0) continue
    
        var f = m[j][i]/m[i][i]
        
        for (var k = i; k < n; k++)
            m[j][k] -= f*m[i][k]
    }
}

vec.det = function(m)
{
    vec.gauss(m)
    
    var det = 1
    
    for (var i = 0; i < m.length; i++)
        det *= m[i][i]
        
    return det
}

vec.vec = function(vectors)
{	
    var p = []

    var remcol = function(m, col)
    {
        var r = []
        
        for (var i = 0; i < m.length; i++)		
            r[i] = m[i].slice(0, col).concat(m[i].slice(col + 1))			
        
        return r
    }
    
    for (var i = 0; i < vec.dim; i++)	
        p[i] = (i % 2 == 0 ? +1 : -1)*vec.det(remcol(vectors, i))
    
    return p
}

vec.sum = function()
{
    var r = vec.all(0)
    
    for (var i = 0, len = arguments.length; i < len; i++)
    {
        var a = arguments[i]
        
        for (var j = 0; j < vec.dim; j++)
            r[j] += a[j]		
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

vec.clone = function(v)
{
    return [v[0], v[1], v[2]]
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