function camera(opts)
{
    var w = opts.w || 2
    var h = opts.h || 2
    var len = opts.len || 1
    var z = opts.z
    
    if (!z)
    {
        z = []
        
        for (i = 0; i < vec.dim - 2; i++)
            z[i] = vec.e(i + 2)
    }
    
    z = z.slice(0, vec.dim - 2)
    
    for (var i = 0, len = z.length; i < len; i++)
        z[i] = vec.norm(z[i])
    
    var s = vec.norm(vec.sub(opts.to, opts.from))
    var r = vec.vec([s].concat(z))
    var b = vec.vec([s, r].concat(z.slice(1)))
            
    var lt = vec.sum(opts.from, vec.mul(len, s), vec.mul(-w/2, r), vec.mul(-h/2, b))
    var right = vec.mul(w, r)
    var down = vec.mul(h, b)
    var eye = opts.from	
    
    this.eye    = eye
    this.lt     = lt
    this.right  = right
    this.down   = down
}