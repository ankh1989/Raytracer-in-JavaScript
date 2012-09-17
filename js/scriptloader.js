function LoadScripts(load)
{
    var pathes =
    [
        'shapes/cylinder.js',
        'shapes/plane.js',
        'shapes/sphere.js',
        'shapes/isosurf.js',

        'objects/object.js',
        'objects/group.js',
        'objects/cubecyl.js',
        'objects/dodecahedron.js',
        'objects/sphereflake.js',

        'ray.js',
        'm3x3.js',
        'debug.js',
        'raytracer.js',
        'math.js',
        'scene.js',
        'scenes.js',
        'vector.js',
        'material.js',
        'texture.js',
        'camera.js',
        'factory.js',
        'screen.js'
    ]

    for (var i = 0; i < pathes.length; i++)
    {
        var path = pathes[i]
        load(path)
    }
}