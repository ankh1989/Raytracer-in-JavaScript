function checker(options)
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

checker.prototype.getcolor = function(at)
{
    var sum = 0

    sum += Math.floor(this.s[0]*(0.123 + at[0]))
    sum += Math.floor(this.s[1]*(0.123 + at[1]))
    sum += Math.floor(this.s[2]*(0.123 + at[2]))

    return sum % 2 == 0 ? this.c : this.ic
}