function dodecahedron(settings)
{
    var sphr = settings.spheres.radius
    var cylr = settings.cylinders.radius

    var vertices = dodecahedron.getvertices()

    var dcenter = vec.average.apply(null, vertices)
    var dradius = vec.dist(dcenter, vertices[0])

    var spheres = []

    for (var i = 0; i < vertices.length; i++)
        spheres.push(new sphere({center:vertices[i], radius:sphr}))

    var cylinders = []
    var neighbors = dodecahedron.getneighbors(vertices)

    for (var i = 0; i < neighbors.length; i++)
    for (var j = 0; j < neighbors[i].length; j++)
    {
        var ci = vertices[i]
        var cj = vertices[neighbors[i][j]]

        cylinders.push(new cylinder({center1:ci, center2:cj, radius:cylr}))
    }

    return new bounded
    ({
        shape: csg.or([].concat(spheres, cylinders)),
        bound: new sphere
        ({
            center: dcenter,
            radius: dradius + sphr
        })
    })
}

dodecahedron.getvertices = function()
{
    var f = (1 + Math.sqrt(5))/2

    return [
        [+1, +1, +1],
        [+1, +1, -1],
        [+1, -1, +1],
        [+1, -1, -1],
        [-1, +1, +1],
        [-1, +1, -1],
        [-1, -1, +1],
        [-1, -1, -1],

        [0, +1/f, +f],
        [0, +1/f, -f],
        [0, -1/f, +f],
        [0, -1/f, -f],

        [+1/f, +f, 0],
        [+1/f, -f, 0],
        [-1/f, +f, 0],
        [-1/f, -f, 0],

        [+f, 0, +1/f],
        [+f, 0, -1/f],
        [-f, 0, +1/f],
        [-f, 0, -1/f]
    ]
}

dodecahedron.findneighbors = function(vi, all)
{
    if (all.length < 2)
        return []

    var d = []
    var idx = []

    for (var i = 0; i < all.length; i++)
    {
        d[i] = vec.dist(all[vi], all[i])
        idx[i] = i
    }

    for (var i = 0; i < d.length; i++)
    for (var j = i + 1; j < d.length; j++)
        if (d[i] > d[j])
        {
            math.swap(d, i, j)
            math.swap(idx, i, j)
        }

    var nb = []

    for (var i = 0; i < d.length; i++)
        if (math.eq(d[i], d[1]))
            nb.push(idx[i])

    return nb
}

dodecahedron.getneighbors = function(vertices)
{
    var neighbors = []

    for (var i = 0; i < vertices.length; i++)
        neighbors[i] = dodecahedron.findneighbors(i, vertices)

    return neighbors
}