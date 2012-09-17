var scenes = {}

scenes.camera1 = new camera
({
    from:   [3.8, 4.4, 4.5],
    to:     [0, 0, 0],
    w:      1,
    h:      1,
})

scenes.camera2 = new camera
({
    from:   [2.8, 3.4, 1.2],
    to:     [0, 0, 0],
    w:      1,
    h:      1,
})

scenes.create1 = function()
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
        
    var sm = function(c) { return mat.create({refl:0.6, t:0.0, color:c}) }
    var tc = {name:'checker', size:0.5}
    var pm = mat.create({refl:0.0, color:tc})

    var objects = 
    [
        {name:'object', shape:{name:'sphere', center:t[0], radius:1}, material:sm([1, 1, 0])},
        {name:'object', shape:{name:'sphere', center:t[1], radius:1}, material:sm([1, 0, 0])},
        {name:'object', shape:{name:'sphere', center:t[2], radius:1}, material:sm([0, 1, 0])},
        {name:'object', shape:{name:'sphere', center:t[3], radius:1}, material:sm([0, 1, 1])},

        {name:'object', shape:{name:'axisplane', center:[0, 0, -1], axis:2}, material:pm},
    ]

    return new scene
    ({
        lights:     lights,
        objects:    objects,
        camera:     scenes.camera1
    })
}

scenes.create2 = function()
{
    var lights =
    [
        {at:[7, 8, 9],          power:2},
        {at:[-0.9, 0.8, 0.9],   power:2},
    ]
    
    var sm = mat.create({refl:0.7, color:[0, 1, 0]})
    var cm = mat.create({refl:0.1, t:0.8, rc:1.2, color:[1, 0, 0]})
    var tc = {name:'checker', size:0.5}
    var pm = mat.create({refl:0.5, color:tc})    
    var sr = 0.2
    
    var objects = 
    [
        {name:'object', shape:{name:'cubecyl', sphere:{r:sr, mat:sm}, cyl:{r:0.08, mat:cm}}},
        {name:'object', shape:{name:'axisplane', center:[0, 0, -1-sr], axis:2}, material:pm},
    ]

    return new scene
    ({
        lights:     lights,
        objects:    objects,
        camera:     scenes.camera1
    })
}

scenes.create3 = function()
{
    var sm = mat.create({refl:0.4, color:[1, 0, 0]})
    var pc = {name:'checker', size:5}
    var pm = mat.create({refl:0.0, color:pc})

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

    var isobound = {name:'sphere', center:[0, 0, 0], radius:1.5}

    var cam = new camera
    ({
        from:   [2.8, 3.4, 1.2],
        to:     [0, 0, 0],
        w:      1,
        h:      1,
    })

    var mt =
    {
        mx: (new m3x3(1)).stretch(0, 1.5).stretch(1, 1.5).plain(),
        mp: [0, 0, 0]
    }

    var iso =
    {
        name:       'object',
        transform:  mt,
        material:   pm,
        shape:
        {
            name:   'isosurf',
            f:      f_rings + '',
            bound:  isobound,
            maxgrad:150
        }
    }

    return new scene
    ({
        lights:
        [
            {at:[0, 0, 0], power:2},
            {at:cam.eye, power:1}
        ],
        objects: [iso],
        camera: cam,
    })
}

scenes.create4 = function()
{
    var lights = [
        {at:[0, 0, 0], power:1},
        {at:[5, 6, 7], power:1},
    ]

    var cam = new camera({
        from:   [3, 4, 5],
        to:     [0, 0, 0],
        w:      1,
        h:      1
    })

    var sphm = mat.create({color:[1, 0, 0], refl:0.6})
    var cylm = mat.create({color:[0, 1, 0], refl:0.7})

    var dodecahedron =
    {
        name: 'object',
        shape:
        {
            name:       'dodecahedron',
            spheres:    {radius:0.2, material:sphm},
            cylinders:  {radius:0.1, material:cylm}
        }
    }

    var floor = {
        name:       'object',
        material:   mat.create({color:{name:'checker', size:1}, refl:0.5}),
        shape:      {name:'axisplane', axis:2, center:[0, 0, -2]}
    }

    return new scene({
        lights:     lights,
        objects:    [dodecahedron, floor],
        camera:     cam
    })
}

scenes.create5 = function()
{
    var sph = function(s, c)
    {
        return {name:'object', shape:{name:'sphere', center:s, radius:1}, material:mat.create({color:c})}
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
}

scenes.create6 = function()
{
    var m = (new m3x3(1)).rotate(1, -Math.PI/2).rotate(2, Math.PI/2)
    var eye = m.vmul([0, 0, 5])

    var cam = new camera({
        from:   [2, 3, 4],
        to:     [0, 0, 0],
        w:      1,
        h:      1
    })

    var lights = [
        {at:[-5, 9, 16], power:1},
        {at:cam.eye, power:1},
    ]

    var flake =
    {
        name:   'object',
        shape:
        {
            name:   'sphereflake',
            n:      4
        }
    }

    var floor =
    {
        name:       'object',
        material:   mat.create({color:{name:'checker', size:1}}),
        shape:      {name:'axisplane', axis:2, center:[0, 0, -2]}
    }

    return new scene
    ({
        lights:     lights,
        objects:    [flake, floor],
        camera:     cam
    })
}
