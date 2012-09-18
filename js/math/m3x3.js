function m3x3(w)
{
    if (typeof w == 'number')
    {
        this[0] = [w, 0, 0]
        this[1] = [0, w, 0]
        this[2] = [0, 0, w]
    }
    
    if (typeof w == 'object')
    {
        if (typeof w.rotate == 'number' && typeof w.axis == 'number')
        {
            var s = Math.sin(w.rotate)
            var c = Math.cos(w.rotate)

            var i = (w.axis + 2) % 3
            var j = (w.axis + 1) % 3

            m3x3.apply(this, [1])

            this[i][i] = +c
            this[i][j] = +s
            this[j][i] = -s
            this[j][j] = +c
        }
    }

    if (w == 'random')
    {
        var r = function() { return Math.random() }

        this[0] = [r(), r(), r()]
        this[1] = [r(), r(), r()]
        this[2] = [r(), r(), r()]
    }

    if (typeof w == 'function')
    {
        this[0] = [w(0, 0), w(0, 1), w(0, 2)]
        this[1] = [w(1, 0), w(1, 1), w(1, 2)]
        this[2] = [w(2, 0), w(2, 1), w(2, 2)]
    }

    if (!this[0])
        throw "undefined m3x3 type"
}

m3x3.prototype.plain = function()
{
    var p = [[], [], []]

    for (var i = 0; i < 3; i++)
    for (var j = 0; j < 3; j++)
        p[i][j] = this[i][j]

    return p
}

m3x3.prototype.apply = function(f)
{
    for (var i = 0; i < 3; i++)
    for (var j = 0; j < 3; j++)
        f.apply(this, [i, j])

    return this
}

m3x3.prototype.clone = function()
{
    var m = this
    return new m3x3(function(i, j){return m[i][j]})
}

m3x3.prototype.det = function()
{
    return vec.dot(this[0], vec.cross(this[1], this[2]))
}

m3x3.prototype.norm = function()
{
    var sum = 0
    this.apply(function(i, j){sum += Math.abs(this[i][j])})
    return sum
}

m3x3.prototype.assign = function(m)
{
    return this.apply(function(i, j){this[i][j] = m[i][j]})
}

m3x3.prototype.mulv = function(v)
{
    return this.apply(function(i, j){this[i][j] *= v})
}

m3x3.prototype.vmul = function(v)
{
    var mx0 = this[0]
    var mx1 = this[1]
    var mx2 = this[2]

    return [
        v[0]*mx0[0] + v[1]*mx1[0] + v[2]*mx2[0],
        v[0]*mx0[1] + v[1]*mx1[1] + v[2]*mx2[1],
        v[0]*mx0[2] + v[1]*mx1[2] + v[2]*mx2[2],
    ]
}

m3x3.prototype.mul = function(m)
{
    this[0] = m.vmul(this[0])
    this[1] = m.vmul(this[1])
    this[2] = m.vmul(this[2])

    return this
}

m3x3.prototype.rotate = function(axis, angle)
{
    return this.mul(new m3x3({axis:axis, rotate:angle}))
}

m3x3.prototype.stretch = function(axis, ratio)
{
    var v = this[axis]

    v[0] *= ratio
    v[1] *= ratio
    v[2] *= ratio

    return this
}

m3x3.prototype.transpose = function()
{
    for (var i = 0; i < 3; i++)
    for (var j = i + 1; j < 3; j++)
    {
        var ij = this[i][j]
        var ji = this[j][i]

        this[i][j] = ji
        this[j][i] = ij
    }

    return this
}

m3x3.prototype.invert = function()
{
    var det = this.det()

    var s0 = this[0]
    var s1 = this[1]
    var s2 = this[2]

    this[0] = vec.cross(s1, s2)
    this[1] = vec.cross(s2, s0)
    this[2] = vec.cross(s0, s1)

    return this.mulv(1/det).transpose()
}

m3x3.prototype.add = function(m)
{
    return this.apply(function(i, j){this[i][j] += m[i][j]})
}

m3x3.prototype.sub = function(m)
{
    return this.apply(function(i, j){this[i][j] -= m[i][j]})
}
