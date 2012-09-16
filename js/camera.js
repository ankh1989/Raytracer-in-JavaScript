function camera(opts)
{
    var w       = opts.w || 2
    var h       = opts.h || 2
    var len     = opts.len || 1
    var z       = vec.norm(opts.z || [0, 0, 1])
    var s       = vec.norm(vec.sub(opts.to, opts.from))
    var r       = vec.cross(s, z)
    var b       = vec.cross(s, r)
                
    this.lt     = vec.sum(opts.from, vec.mul(len, s), vec.mul(-w/2, r), vec.mul(-h/2, b))
    this.right  = vec.mul(w, r)
    this.down   = vec.mul(h, b)
    this.eye    = opts.from
}