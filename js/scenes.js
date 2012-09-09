var scenes = {}

scenes.camera1 = new camera
({
    from: vec.$(3.8, 4.4, 3.5),
    to: vec.all(0),
    w: 1,
    h: 1,
})

scenes.create1 = function()
{
    var lights =
    [
        {at:vec.$(2, 2, 1),     power:1},
        {at:vec.$(-2, 10, 7),   power:1},
        {at:vec.$(-10, -3, 4),  power:1},
    ]
    
    var s2 = Math.sqrt(2)
    var s3 = Math.sqrt(3)
    
    var t =
    [
        vec.$(0, 0, 0),
        vec.$(2, 0, 0),
        vec.$(1, s3, 0),
        vec.$(1, 1/s3, 2 * s2/s3),
    ]
    
    var c = vec.$(0.5, 0.5 / s3, 0.25 * s2 / s3)
    
    for (var i = 0, len = t.length; i < len; i++)
        t[i] = vec.sub(t[i], c)
        
    var sm = mat.create({refl:0.6})
    var sm2 = mat.create({refl:0.3, t:0.5, rc:1.2})
    var pm = mat.create({refl:0.5})
    var tc = factory.create('texture.checker', {s:0.5})
    var wc = [1, 1, 1]
    
    var objects = 
    [
        factory.create('sphere', t[0], 1, [1, 1, 0], sm),
        factory.create('sphere', t[1], 1, [1, 0, 0], sm),
        factory.create('sphere', t[2], 1, [0, 1, 0], sm),
        factory.create('sphere', t[3], 1, [0, 1, 1], sm),
        
        factory.create('axisplane', [0, 0, -1], 2, tc, pm),
    ]

    return new scene
    ({
        lights:lights,
        objects:objects,
        camera:scenes.camera1
    })
}

scenes.create2 = function()
{
    var lights =
    [
        {at:vec.$(7, 8, 9, 10),             power:2},
        {at:vec.$(-0.9, 0.8, 0.9, -0.5),    power:2},
    ]
    
    var sm = mat.create({refl:0.7})
    var cm = mat.create({refl:0.1, t:0.8, rc:1.2})
    var pm = mat.create({refl:0.5})
    var tc = factory.create('texture.checker', {s:0.5})
    var wc = [1, 1, 1]
    var sr = 0.2
    
    var objects = 
    [
        new factory.create('cubecyl', {sphere:{r:sr, mat:sm}, cyl:{r:0.08, mat:cm}}),
        new factory.create('axisplane', vec.$(0, 0, -1 - sr), 2, tc, pm),
    ]

    return new scene
    ({
        lights:lights,
        objects:objects,
        camera:scenes.camera1
    })
}