function LoadScripts(load)
{
    var pathes =
    [
        'math/math.js',
        'math/vector.js',
        'math/m3x3.js',

        'shapes/cylinder.js',
        'shapes/plane.js',
        'shapes/cube.js',
        'shapes/sphere.js',
        'shapes/isosurf.js',

        'objects/group.js',
        'objects/csg.js',
        'objects/object.js',
        'objects/cubecyl.js',
        'objects/dodecahedron.js',
        'objects/sphereflake.js',
        
        'ray.js',
        'debug.js',
        'raytracer.js',
        'scene.js',
        'scenes.js',
        'material.js',
        'texture.js',
        'camera.js',
        'factory.js',
        'screen.js',
        'shaders.js',
        'rpoint.js',
    ]

    for (var i = 0; i < pathes.length; i++)
    {
        var path = pathes[i]
        load(path)
    }
}