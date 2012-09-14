vec = {}

vec.all = function(x)
{
    return [x, x, x]
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

vec.mx3x3 = {}

vec.mx3x3.mulvm = function(v, mx)
{
    var mx0 = mx[0]
    var mx1 = mx[1]
    var mx2 = mx[2]

    return [
        v[0]*mx0[0] + v[1]*mx1[0] + v[2]*mx2[0],
        v[0]*mx0[1] + v[1]*mx1[1] + v[2]*mx2[1],
        v[0]*mx0[2] + v[1]*mx1[2] + v[2]*mx2[2],
    ]
}

vec.mx3x3.detm = function(mx)
{
    return vec.dot(mx[0], vec.cross(mx[1], mx[2]))
}

vec.mx3x3.zm = function()
{
    return [[0, 0, 0], [0, 0, 0], [0, 0, 0]]
}

vec.mx3x3.em = function()
{
    return [[1, 0, 0], [0, 1, 0], [0, 0, 1]]
}

vec.mx3x3.tm = function(mx)
{
    var r = vec.mx3x3.zm()

    for (var i = 0; i < 3; i++)
    for (var j = 0; j < 3; j++)
        r[i][j] = mx[j][i]

    return r
}

vec.mx3x3.invm = function(mx)
{
    var f = 1.0/vec.mx3x3.detm(mx)

    return vec.mx3x3.tm
    ([
        vec.mul(f, vec.cross(mx[1], mx[2])),
        vec.mul(f, vec.cross(mx[2], mx[0])),
        vec.mul(f, vec.cross(mx[0], mx[1]))
    ])
}

vec.mx3x3.mulmm = function(a, b)
{
    var c = vec.mx3x3.zm()

    for (var i = 0; i < 3; i++)
    for (var j = 0; j < 3; j++)
    for (var k = 0; k < 3; k++)
        c[i][j] += a[i][k]*b[k][j]

    return c
}

vec.mx3x3.negm = function(a)
{
    var b = vec.mx3x3.zm()

    for (var i = 0; i < 3; i++)
    for (var j = 0; j < 3; j++)
        b[i][j] = -a[i][j]

    return b
}

vec.mx3x3.addmm = function(a, b)
{
    var c = vec.mx3x3.zm()

    for (var i = 0; i < 3; i++)
    for (var j = 0; j < 3; j++)
        c[i][j] = a[i][j] + b[i][j]

    return c
}

vec.mx3x3.submm = function(a, b)
{
    return vec.mx3x3.addmm(a, vec.mx3x3.negm(b))
}

vec.mx3x3.maxm = function(a)
{
    var max = 0

    for (var i = 0; i < 3; i++)
    for (var j = 0; j < 3; j++)
    {
        var x = Math.abs(a[i][j])
        if (x > max) max = x
    }

    return max
}

vec.test = function()
{
    var a = [
        [1, 4, 7],
        [5, 7, 1],
        [0, 8, 7],
    ]

    var b = [
        [5, 1, 8],
        [0, 0, 2],
        [9, 2, 1],
    ]

    var c = [
        [5, 7, 6],
        [1, 2, 1],
        [3, 2, 7],
    ]

    var v = [4, 6, 7]

    var ab = vec.mx3x3.mulmm(a, b)
    var bc = vec.mx3x3.mulmm(b, c)
    var abc1 = vec.mx3x3.mulmm(ab, c)
    var abc2 = vec.mx3x3.mulmm(a, bc)

    console.log('ab*c - a*bc = ' +
        vec.mx3x3.maxm(vec.mx3x3.submm(abc1, abc2)))

    var ia = vec.mx3x3.invm(a)
    var iia = vec.mx3x3.invm(ia)

    console.log('a - iia = ' +
        vec.mx3x3.maxm(vec.mx3x3.submm(a, iia)))

    var aia = vec.mx3x3.mulmm(a, ia)
    var iaa = vec.mx3x3.mulmm(ia, a)

    console.log('aia - e = ' +
        vec.mx3x3.maxm(vec.mx3x3.submm(aia, vec.mx3x3.em())))
    console.log('iaa - e = ' +
        vec.mx3x3.maxm(vec.mx3x3.submm(iaa, vec.mx3x3.em())))

    var va = vec.mx3x3.mulvm(v, a)
    var vaia = vec.mx3x3.mulvm(va, ia)
    
    console.log('vaia - v = ' +
        vec.dist(vaia, v))
}