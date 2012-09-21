function LoadScripts(load)
{
    var pathes =
    [
        'utils.js',

        'math/math.js',
        'math/vector.js',
        'math/m3x3.js',
        'math/transform.js',

        'shapes/bounded.js',
        'shapes/cylinder.js',
        'shapes/plane.js',
        'shapes/cube.js',
        'shapes/sphere.js',
        'shapes/isosurf.js',
        'shapes/sphereflake.js',

        'objects/group.js',
        'objects/csg.js',
        'objects/object.js',
        'objects/cubecyl.js',
        'objects/dodecahedron.js',
        
        'ray.js',
        'debug.js',
        'raytracer.js',
        'scene.js',
        'scenes.js',
        'material.js',
        'texture.js',
        'camera.js',
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