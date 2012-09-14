function cubecyl(opts)
{
    opts = opts || {}
    
    opts.cyl = opts.cyl || {}
    opts.sphere = opts.sphere || {}

    var a = opts.a || vec.all(-1)
    var b = opts.b || vec.all(1)
    
    var cylr = opts.cyl.r || 0.06
    var cylm = opts.cyl.mat || mat.create()
    
    var spr = opts.sphere.r || 0.1
    var spm = opts.sphere.mat || mat.create()
    
    var coords = function(i)
    {
        var p = []
        
        for (var ii = 0; ii < 3; ii++)
            p[ii] = (i & (1 << ii)) ? a[ii] : b[ii]
                
        return p
    }
    
    this.objects = []
    
    var corners = 1 << 3
    
    for (var i = 0; i < corners; i++)
    {
        var pi = coords(i)
        var sph = new sphere({center:pi, radius:spr})
        this.objects.push({shape:sph, material:spm})
    
        for (var ii = 0; ii < 3; ii++)
            if ((i & (1 << ii)) == 0)
            {
                var j = i | (1 << ii)
                var pj = coords(j)
                var cyl = new cylinder({center1:pi, center2:pj, radius:cylr})
                this.objects.push({shape:cyl, material:cylm})
            }
    }
    
    this.boundingsphere = {
        name:   'sphere',
        center: vec.average(a, b),
        radius: vec.len(vec.sub(a, b))/2 + spr + math.eps
    }
}

cubecyl.prototype.trace = function(ray)
{
    if (this.boundingsphere.trace(ray))
        return raytracer.trace(ray, this.objects, 0)
}