function ray(args)
{
    this.depth = args.depth || 0
    this.power = args.power
    this.from = args.from

    if (args.dir)
        this.dir = args.dir
    else if (args.to)
        this.dir = vec.norm(vec.sub(args.to, args.from))
}

ray.prototype.clone = function()
{
    return new ray
    ({
        from:   vec.clone(this.from),
        dir:    vec.clone(this.dir),
        power:  this.power
    })
}

ray.prototype.advance = function(t)
{
    var s = this.dir
    var p = this.from

    p[0] += t*s[0]
    p[1] += t*s[1]
    p[2] += t*s[2]

    return this
}