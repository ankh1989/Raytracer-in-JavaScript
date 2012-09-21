function cubecyl(opts)
{
    opts = opts || {}
    
    opts.cyl = opts.cyl || {}
    opts.sphere = opts.sphere || {}

    var a = opts.a || vec.all(-1)
    var b = opts.b || vec.all(1)

    var cylr = opts.cyl.r || 0.06
    var spr = opts.sphere.r || 0.1
    
    var coords = function(i)
    {
        var p = []
        
        for (var ii = 0; ii < 3; ii++)
            p[ii] = (i & (1 << ii)) ? a[ii] : b[ii]
                
        return p
    }
    
    var objects = []
    
    var corners = 1 << 3
    
    for (var i = 0; i < corners; i++)
    {
        var pi = coords(i)
        var sph = new sphere({center:pi, radius:spr})
        objects.push(sph)
    
        for (var ii = 0; ii < 3; ii++)
            if ((i & (1 << ii)) == 0)
            {
                var j = i | (1 << ii)
                var pj = coords(j)
                var cyl = new cylinder({center1:pi, center2:pj, radius:cylr})
                objects.push(cyl)
            }
    }

    return new bounded
    ({
        shape: csg.or(objects),
        bound: new sphere
        ({
            center: vec.average(a, b),
            radius: vec.len(vec.sub(a, b))/2 + spr + math.eps
        })
    })
}