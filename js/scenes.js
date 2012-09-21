scenes =
{
    '4 spheres': function()
    {
        var lights =
        [
            {at:[2, 2, 1],     power:1},
            {at:[-2, 10, 7],   power:1},
            {at:[-10, -3, 4],  power:1},
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
        var pm = new material({color:tc})

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
                    refl:   0.6,
                    color:  color
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
        var lights =
        [
            {power:1, at:[5, 5, 5]},
            {power:1, at:[-5, 5, 5]},
            {power:1, at:[5, -5, 5]},
            {power:1, at:[-5, -5, 5]},
            {power:1, at:[0, 0, 0]},
        ]
    
        var sm = new material({refl:0.7, color:[0, 1, 0]})
        var cm = new material({refl:0.8, color:[1, 0, 0]})
        var tc = new textures.checker({size:0.5})
        var pm = new material({refl:0.5, color:tc})
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
        var sm = new material({refl:0.4, color:[1, 0, 0]})
        var pc = new textures.checker({size:5})
        var pm = new material({refl:0.5, rc:1.5, t:0.0, color:[1, 0, 0]})

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
            transform:  new transform(mt),
            material:   pm,
            shape: new isosurf
            ({
                f:      f_rings + '',
                bound:  isobound,
                maxgrad:150
            })
        })

        var floor = new object
        ({
            material:   new material({color:new textures.checker({size:1}), refl:0.5}),
            shape:      new axisplane({axis:2, center:[0, 0, -2]})
        })

        return new scene
        ({
            lights:
            [
                {at:[0, 0, 0], power:1},
                {at:[1, 2, 20], power:1},
            ],
            objects: [iso, floor],
            camera: cam,
        })
    },

    'Dodecahedron': function()
    {
        var lights = [
            {power:1, at:[5, 5, 5]},
            {power:1, at:[-5, 5, 5]},
            {power:1, at:[5, -5, 5]},
            {power:1, at:[-5, -5, 5]},
            {power:1, at:[0, 0, 0]},
        ]

        var cam = new camera({
            from:   [3, 4, 5],
            to:     [0, 0, 0],
            w:      1,
            h:      1
        })

        var sphm = new material({color:[1, 0, 0], refl:0.6})
        var cylm = new material({color:[0, 1, 0], refl:0.7})

        var dc = new object
        ({
            material: new material
            ({
                color: [1, 0, 0],
                refl: 0.5
            }),
            shape: new dodecahedron
            ({
                spheres:    {radius:0.2, material:sphm},
                cylinders:  {radius:0.1, material:cylm}
            })
        })

        var floor = new object
        ({
            material:   new material({color:new textures.checker({size:1}), refl:0.5}),
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
            {at:cam.eye, power:1}
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
            {at:[-5, 9, 16], power:1},
            {at:cam.eye, power:1},
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
            /*
            {power:0.5, at:[5, 5, 5]},
            {power:0.5, at:[-5, 5, 5]},
            {power:0.5, at:[5, -5, 5]},
            {power:0.5, at:[-5, -5, 5]},
            */
            {power:0.5, at:[0, 0, 0]},
            {power:0.5, at:[3, 4, 2]}
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
            shape:      composite,
            material:   new material([1, 0, 0]),
            transform:  new transform(mx)
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
                {power:0.8, at:[10, 100, 60]},
                {power:0.2, at:cam.eye},
            ]
        })
    },

    'Test': function()
    {
        var sph = new object
        ({
            shape:      new sphere({center:[0, 0, 1], radius:1}),
            material:   new material([1, 0, 0])
        })

        var cb = new object
        ({
            shape:      new cube({}),
            material:   new material([1, 0, 0]),
            transform:  new transform([-3, -1, 1])
        })

        var floor = new object
        ({
            material:   new material({color:new textures.lines({size:1})}),
            shape:      new axisplane({axis:2, center:[0, 0, 0]})
        })

        var cam = new camera
        ({
            from:   [3, 4, 3],
            to:     [0, 0, 2],
            w:      1,
            h:      1
        })

        return new scene
        ({
            objects: [sph, cb, floor],
            camera: cam,
            bgcolor: [0.5, 0.5, 1.0],
            lights:
            [
                {power:1, at:[-3, 10, 6]},
                //{power:1, at:[4, -10, 7]},
            ]
        })
    }
} // scenes