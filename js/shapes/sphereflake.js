function sphereflake(args)
{
    var c       = args.center || [0, 0, 0]
    var r       = args.radius || 1
    var m       = args.axes || new m3x3(1)
    var rm      = args.rm || 1/3
    var n       = args.n

    var sc2dc = function(a, b)
    {
        return [
            Math.sin(b)*Math.cos(a),
            Math.sin(b)*Math.sin(a),
            Math.cos(b)
        ]
    }

    var pi = Math.PI

    var scoords = [
        [0,             pi/2],
        [pi/3,          pi/2],
        [2*pi/3,        pi/2],
        [pi,            pi/2],
        [4*pi/3,        pi/2],
        [5*pi/3,        pi/2],
        [pi,            pi/2],

        [pi/6,          pi/4],
        [pi/6 + 2*pi/3, pi/4],
        [pi/6 - 2*pi/3, pi/4],
    ]

    var objects = []

    objects.push(new sphere({center:c, radius:r}))

    if (n > 0)
        for (var i = 0; i < scoords.length; i++)
        {
            var ri = r*rm
            var ai = scoords[i][0]
            var bi = scoords[i][1]
            var vi = m.vmul(sc2dc(ai, bi))
            var ci = vec.add(c, vec.mul(r + ri, vi))
            var mi = (new m3x3(1)).rotate(1, -bi).rotate(2, -ai).mul(m)

            objects.push(new sphereflake
            ({
                center: ci,
                radius: ri,
                axes:   mi,
                rm:     rm,
                n:      n - 1
            }))
        }

    return new bounded
    ({
        // As long as spheres do not intersect each other,
        // "group" can be used instead of "csg.union".
        shape: new group(objects),
        bound: new sphere
        ({
            center: c,
            radius: (1 + rm)/(1 - rm)
        })
    })
}