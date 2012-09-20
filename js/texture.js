textures = {}

textures.checker = function(options)
{
    options = options || {}
    
    var s = options.size
    
    if (isFinite(s))
        s = vec.all(s)
    else if (!s)
        s = vec.all(1)
    
    var c = options.color || [1, 1, 1]
    var ic = [1 - c[0], 1 - c[1], 1 - c[2]]

    this.s = s
    this.c = c
    this.ic = ic
}

textures.checker.prototype.getcolor = function(at)
{
    var sum = 0

    sum += Math.floor(this.s[0]*(0.123 + at[0]))
    sum += Math.floor(this.s[1]*(0.123 + at[1]))
    sum += Math.floor(this.s[2]*(0.123 + at[2]))

    return sum % 2 == 0 ? this.c : this.ic
}

textures.lines = function(options)
{
    options = options || {}
    
    var s = options.size
    
    if (isFinite(s))
        s = vec.all(s)
    else if (!s)
        s = vec.all(1)
    
    var c = options.color || [0, 0, 0]
    var ic = [1 - c[0], 1 - c[1], 1 - c[2]]

    this.s = s
    this.c = c
    this.ic = ic
}

textures.lines.prototype.getcolor = function(p)
{
    var dist = function(si, pi)
    {
        var spi = pi/si
        var fi = spi - Math.floor(spi)
        if (fi > 0.5) fi = 1.0 - fi
        return fi*si
    }

    var min = function(a, b)
    {
        return a < b ? a : b
    }

    var s = this.s
    var d = min(dist(s[0], p[0]), dist(s[1], p[1]), dist(s[2], p[2]))

    return d < 0.03 ? this.c : this.ic
}
