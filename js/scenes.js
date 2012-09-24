scenes =
{
    '4 spheres': function()
    {
        var lights =
        [
            {at:[20, 20, 10],     power:20000},
            {at:[-20, 100, 70],   power:20000},
            {at:[-100, -30, 40],  power:20000},
        ]
    
        var s2 = Math.sqrt(2)
        var s3 = Math.sqrt(3)
    
        var t =
        [
            [0, 0, 0],
            [2, 0, 0],
            [1, s3, 0],
            [1, 1/s3, 2 * s2/s3],
        ]
    
        var c = [0.5, 0.5 / s3, 0.25 * s2 / s3]
    
        for (var i = 0, len = t.length; i < len; i++)
            t[i] = vec.sub(t[i], c)
        
        var tc = new textures.checker({size:0.5})
        var pm = new material({color:tc, reflectance:0.5})

        var newsphere = function(c, color)
        {
            return new object
            ({
                shape: new sphere
                ({
                    center: c,
                    radius: 1
                }),
                material: new material
                ({
                    reflectance: 0.6,
                    color:      color
                })
            })
        }

        var newfloor = function(z)
        {
            return new object
            ({
                shape: new axisplane
                ({
                    center: [0, 0, z],
                    axis:   2
                }),
                material: pm
            })
        }

        var objects =
        [
            newsphere(t[0], [1, 1, 0]),
            newsphere(t[1], [1, 0, 0]),
            newsphere(t[2], [0, 1, 0]),
            newsphere(t[3], [0, 1, 1]),

            newfloor(-1),
        ]

        var cam = new camera
        ({
            from:   [3.8, 4.4, 4.5],
            to:     [0, 0, 0],
            w:      1,
            h:      1,
        })

        return new scene
        ({
            lights:     lights,
            objects:    objects,
            camera:     cam
        })
    },

    'Cube': function()
    {
        var light = function(x, y, z, p)
        {
            var p = p || 300000
            var k = 100
            return {power:p, at:[k*x, k*y, k*z]}
        }

        var lights =
        [
            light(1, 1, 1),
            light(-1, 1, 1),
            light(1, -1, 1),
            light(-1, -1, 1),
            light(0, 0, 0, 50),
        ]
    
        var sm = new material({reflectance:0.7, color:[0, 1, 0]})
        var cm = new material({reflectance:0.8, color:[1, 0, 0]})
        var tc = new textures.checker({size:0.5})
        var pm = new material({reflectance:0.5, color:tc})
        var sr = 0.5

        var cc = new cubecyl({sphere:{r:sr, mat:sm}, cyl:{r:0.3, mat:cm}})
    
        var objects = 
        [
            new object({shape:cc, material:new material('glass')}),
            new object({shape:new axisplane({center:[0, 0, -1-sr], axis:2}), material:pm}),
        ]

        var cam = new camera
        ({
            from:   [3.8, 4.4, 4.5],
            to:     [0, 0, 0],
            w:      1,
            h:      1,
        })

        return new scene
        ({
            lights:     lights,
            objects:    objects,
            camera:     cam
        })
    },

    'Isosurface': function()
    {
        var sm = new material({reflectance:0.4, color:[1, 0, 0]})
        var pc = new textures.checker({size:5})
        var pm = new material({reflectance:0.5, color:[1, 0, 0]})

        var f_ring = function(x, y, z)
        {
            var a = x*x + y*y - 1
            return a*a + z*z - 0.1
        }

        var f_torus = function(x, y, z)
        {
            var R = 1
            var r = 0.2
            var x2y2 = x*x + y*y
            return math.sqr(x2y2 + z*z + R*R - r*r) - 4*R*R*x2y2
        }

        var f_sphere = function(x, y, z)
        {
            return x*x + y*y + z*z - 1
        }

        var f_sinfield = function(x, y, z)
        {
            return z - Math.sin(x*5 + y*y*6)/5
        }

        var f_spheroid = function(x, y, z)
        {
            return x*(x + Math.sin(x*8)/3) + y*(y - Math.cos(y*9)/4 + Math.sin(z*10)/5) + z*(z + Math.sin(z*18)/3) - 1
        }

        var f_rings = function(x, y, z)
        {
            var f_torus = function(x, y, z)
            {
                var R = 1
                var r = 0.1
                var x2y2 = x*x + y*y
                return math.sqr(x2y2 + z*z + R*R - r*r) - 4*R*R*x2y2
            }

            var tz = f_torus(x, y, z)
            var ty = f_torus(z, x, y)
            var tx = f_torus(y, z, x)

            var r = 0.1

            var sqr = function(x) { return x }

            return tx*ty*tz - r
        }

        var isobound = new sphere({center:[0, 0, 0], radius:1.5})

        var cam = new camera
        ({
            from:   [2.8, 4.4, 2.2],
            to:     [0, 0, 0],
            w:      1,
            h:      1,
        })

        var mt = (new m3x3(1)).stretch(0, 1.5).stretch(1, 1.5)

        var iso = new object
        ({
            material:   pm,
            shape: new transformed
            ({
                transform:  new transform(mt),
                shape: new isosurf
                ({
                    f:      f_rings + '',
                    bound:  isobound,
                    maxgrad:150
                })
            })
        })

        var floor = new object
        ({
            material:   new material({color:new textures.checker({size:1}), reflectance:0.5}),
            shape:      new axisplane({axis:2, center:[0, 0, -2]})
        })

        return new scene
        ({
            lights:
            [
                {at:[0, 0, 0], power:20},
                {at:[100, 200, 2000], power:100000000},
            ],
            objects: [iso, floor],
            camera: cam,
        })
    },

    'Dodecahedron': function()
    {
        var lights = [
            {power:1e5, at:[-50, -50, 50]},
            {power:20, at:[0, 0, 0]},
        ]

        var cam = new camera({
            from:   [3, 4, 5],
            to:     [0, 0, 0],
            w:      1,
            h:      1
        })

        var sphm = new material({color:[1, 0, 0], reflectance:0.6})
        var cylm = new material({color:[0, 1, 0], reflectance:0.7})

        var dc = new object
        ({
            material: new material
            ({
                color: [1, 0, 0],
                reflectance: 0.5
            }),
            shape: new dodecahedron
            ({
                spheres:    {radius:0.2, material:sphm},
                cylinders:  {radius:0.1, material:cylm}
            })
        })

        var floor = new object
        ({
            material:   new material({color:new textures.checker({size:1}), reflectance:0.5}),
            shape:      new axisplane({axis:2, center:[0, 0, -2]})
        })

        return new scene({
            lights:     lights,
            objects:    [dc, floor],
            camera:     cam
        })
    },

    'Axis Test': function()
    {
        var sph = function(s, c)
        {
            return new object({shape:new sphere({center:s, radius:1}), material:new material(c)})
        }

        var objects =
        [
            sph([0, 0, 0], [1, 1, 1]),
            sph([4, 0, 0], [1, 0, 0]),
            sph([0, 4, 0], [0, 1, 0]),
            sph([0, 0, 4], [0, 0, 1])
        ]

        var cam = new camera
        ({
            from:   [9, 9, 9],
            to:     [0, 0, 0],
            w:      1,
            h:      1
        })

        var lights = 
        [
            {at:cam.eye, power:2e3}
        ]

        return new scene
        ({
            lights:     lights,
            objects:    objects,
            camera:     cam,
            bgcolor:    [0.8, 0.8, 1.0]
        })
    },

    'Sphereflake': function()
    {
        var m = (new m3x3(1)).rotate(1, -Math.PI/2).rotate(2, Math.PI/2)
        var eye = m.vmul([0, 0, 5])

        var cam = new camera({
            from:   [4, 5, 6],
            to:     [0, 0, 0],
            w:      1,
            h:      1
        })

        var lights = [
            {at:[-50, 90, 160], power:3e5},
        ]

        var flake = new object
        ({
            shape: new sphereflake({n:4}),
            material: new material([1, 1, 1])
        })

        var floor = new object
        ({
            material:   new material({color:new textures.checker({size:1})}),
            shape:      new axisplane({axis:2, center:[0, 0, -2]})
        })

        return new scene
        ({
            lights:     lights,
            objects:    [flake, floor],
            camera:     cam
        })
    },

    'CSG': function()
    {
        var cam = new camera
        ({
            from:   [2, 3, 4],
            to:     [0, 0, 0],
            w:      1,
            h:      1
        })

        var lights =
        [
            {power:10, at:[0, 0, 0]},
            {power:5e4, at:[30, 40, 50]}
        ]

        var r = 3

        var c1 = [1, 0, 0]
        var c2 = [-1, 0, 0]

        var ps = function(x, y, z)
        {
            var $ = function() { return 0.0*(Math.random() - 0.5) }
            var c = [x + $(), y + $(), z + $()]
            var n = [x + $(), y + $(), z + $()]
            return new plane({norm:n, center:c})
        }

        var cyl = function(x, y, z)
        {
            var a = [x, y, z]
            var b = [-x, -y, -z]
            var r = 0.7

            return new cylinder({center1:a, center2:b, radius:r})
        }

        var sph = function(x, y, z)
        {
            var c = [x, y, z]
            var r = 0.5

            return new sphere({center:c, radius:r})
        }

        var planes =
        [
            ps(+1, 0, 0),
            ps(-1, 0, 0),
            ps(0, +1, 0),
            ps(0, -1, 0),
            ps(0, 0, +1),
            ps(0, 0, -1),
        ]

        var cylinders =
        [
            cyl(2, 0, 0),
            cyl(0, 2, 0),
            cyl(0, 0, 2),
        ]

        var spheres = 
        [
            sph(+1, +1, +1),
            sph(+1, +1, -1),
            sph(+1, -1, +1),
            sph(+1, -1, -1),
            sph(-1, +1, +1),
            sph(-1, +1, -1),
            sph(-1, -1, +1),
            sph(-1, -1, -1),
        ]

        var composite = csg.and
        (
            new cube(),
            csg.not(csg.or(spheres)),
            csg.not(csg.or(cylinders))
        )

        var floor = new object
        ({
            material:   new material({color:new textures.checker({size:1})}),
            shape:      new axisplane({axis:2, center:[0, 0, -2]})
        })

        var mx = (new m3x3(1)).rotate(1, -1).rotate(2, -0.1).rotate(1, 3)

        var obj = new object
        ({
            shape: new transformed
            ({
                shape:      composite,
                transform:  new transform(mx)
            }),
            material: new material([1, 0, 0])
        })

        return new scene
        ({
            lights:     lights,
            objects:    [obj, floor],
            camera:     cam
        })
    },

    'Pyramid': function()
    {
        var pcoord = function(i, j, k)
        {
            var s2 = Math.sqrt(2)
            var s3 = Math.sqrt(3)

            var t0 = [2, 0, 0]
            var t1 = [1, s3, 0]
            var t2 = [1, 1/s3, 2 * s2/s3]

            return [
                i*t0[0] + j*t1[0] + k*t2[0],
                i*t0[1] + j*t1[1] + k*t2[1],
                i*t0[2] + j*t1[2] + k*t2[2],
            ]
        }

        var getcenters = function(n)
        {
            var c = []

            for (var i = 0; i < n; i++)
            for (var j = 0; j < n - i; j++)
            for (var k = 0; k < n - i - j; k++)
                c.push(pcoord(i, j, k))

            return c
        }

        var newsphere = function(c)
        {
            return new object
            ({
                shape:      new sphere({center:c, radius:1}),
                material:   new material([1, 0, 0])
            })
        }

        var centers = getcenters(5)
        var spheres = []

        for (var i in centers)
            spheres.push(newsphere(centers[i]))

        var center = vec.average.apply(null, centers)
        var cameye = vec.add(center, [10, 15, 12])

        var floor = new object
        ({
            material:   new material({color:new textures.lines({size:1})}),
            shape:      new plane({norm:[0, 0, 1], center:[0, 0, -1]})
        })

        var cam = new camera
        ({
            from:   cameye,
            to:     center,
            w:      1,
            h:      1
        })

        return new scene
        ({
            objects: [floor].concat(spheres),
            camera: cam,
            bgcolor: [0.5, 0.5, 1.0],
            lights:
            [
                {power:1e5, at:[10, 100, 60]},
                {power:1e2, at:cam.eye},
            ]
        })
    },

    'Cornell Box': function()
    {
        var wall = function(p, n, c)
        {
            return new object
            ({
                shape: new plane({p:p, n:n}),
                material: new material(c)
            })
        }

        var box = function(x, y, w, h, r)
        {
            return new object
            ({
                material: new material([1, 1, 1]),
                shape: new transformed
                ({
                    shape: new cube(),
                    transform: new transform
                    ({
                        m: (new m3x3(1)).stretch(0, w/2).stretch(1, w/2).stretch(2, h/2).rotate(2, r),
                        p: [x, y, h/2 - 1]
                    })
                })
            })
        }

        var walls = new group
        ([
            wall([0, 0, -1], [0, 0, 1], [1, 1, 1]), // floor
            wall([0, 0, 1], [0, 0, -1], [1, 1, 1]), // ceiling
            wall([0, -1, 0], [0, 1, 0], [1, 0, 0]), // left red wall
            wall([0, 1, 0], [0, -1, 0], [0, 1, 0]), // right green wall
            wall([-1, 0, 0], [1, 0, 0], [1, 1, 1])  // white back wall
        ])

        var objects = new group
        ([
            box(-0.1, -0.3, 0.8, 1.3, -0.3),
            box(0.5, 0.5, 0.6, 0.6, 0.4)
        ])

        var cam = new camera
        ({
            from:   [3.5, 0, 0],
            to:     [0, 0, 0],
            w:      2,
            h:      2,
            len:    2.5
        })

        return new scene
        ({
            camera:     cam,
            lights:     [{power:5, at:[0, 0, 0.99]}],
            objects:    [walls, objects]
        })
    },

    'Test': function()
    {
        var sph = new object
        ({
            shape:      new sphere({center:[0, 0, 1], radius:1}),
            material:   new material('glass')
        })

        var cb = new object
        ({
            shape:      new cube({}),
            material:   new material([1, 0, 0])
        })

        var cyl = function(r, h1, h2)
        {
            return new cylinder({center1:[0, 0, h1], center2:[0, 0, h2], radius:r})
        }

        var window = new transformed
        ({
            shape: new cube(),
            transform: new transform
            ({
                m: new m3x3(0.3),
                p: [-1, 0, 0.5]
            })
        })

        var obj = new object
        ({
            material: new material([1, 1, 1]),
            shape: csg.or
            (
                //cyl(1.1, 0.9, 1.1),
                csg.and
                (
                    cyl(1, 0, 1),
                    csg.not(cyl(0.9, -0.1, 1.1)),
                    csg.not(window)
                )
            )
        })

        var floor = new object
        ({
            material:   new material([0.5, 0.5, 0.5]),
            shape:      new axisplane({axis:2, center:[0, 0, 0]})
        })

        var cam = new camera
        ({
            from:   [4, 3, 2],
            to:     [0.8, -0.8, 0],
            w:      1,
            h:      1
        })

        return new scene
        ({
            objects: [sph, floor],
            camera: cam,
            //bgcolor: [0.5, 0.5, 1.0],
            lights:
            [
                {power:3e3, at:[-5, 5, 5]}
            ]
        })
    }
} // scenes