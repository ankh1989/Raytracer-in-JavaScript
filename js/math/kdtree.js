// Builds a kd-tree from an unsorted list of objects.
// T(n) = O(k*n*log(n))
function kdtree(objects, getp)
{
    var dims = getp(objects[0]).length

    // constructs a balanced tree assuming, that
    // getp(sorted[axis][i])[axis] is sorted
    // by i for each axis
    var tree = function(sorted, splitaxis)
    {
        var n = sorted[0].length

        if (n < 6)
        {
            this.objects = sorted[0]
            this.getp = getp
            return
        }

        var imedian = Math.floor(n/2)
        var lcount = imedian
        var rcount = n - imedian - 1
        var median = getp(sorted[splitaxis][imedian])[splitaxis]
        var lsorted = new Array(dims)
        var rsorted = new Array(dims)
        var splitted = []

        for (var axis = 0; axis < dims; axis++)
        {
            lsorted[axis] = new Array(lcount)
            rsorted[axis] = new Array(rcount)

            var il = 0
            var ir = 0

            for (var i = 0; i < n; i++)
            {
                var obj = sorted[axis][i]
                var coord = getp(obj)[splitaxis]

                if (coord < median)
                    lsorted[axis][il++] = obj
                else if (coord > median)
                    rsorted[axis][ir++] = obj
                else if (axis == splitaxis)
                    splitted.push(obj)
            }
        }

        var nextsplitaxis = (splitaxis + 1) % dims

        this.left   = new tree(lsorted, nextsplitaxis)
        this.right  = new tree(rsorted, nextsplitaxis)
        this.axis   = splitaxis
        this.value  = median
        this.split  = splitted
        this.getp   = getp
    }

    // getp(sorted[axis][i])[axis] is sorted by i for each axis
    var sorted = new Array(dims)

    for (var axis = 0; axis < dims; axis++)
    {
        var copy = objects.slice(0, objects.length)
        var swap = function(i, j) { math.swap(copy, i, j) }
        var get = function(i) { return getp(copy[i])[axis] }
        math.sort(0, copy.length - 1, get, swap)
        sorted[axis] = copy
    }

    tree.prototype = kdtree.prototype
    return new tree(sorted, 0)
}

// Returns all objects within the {min, max} box.
kdtree.prototype.select = function(min, max)
{
    var getp = this.getp
    var results = []

    var push = function(obj)
    {
        var p = getp(obj)
        if (vec.leq(min, p) && vec.leq(p, max))
            results.push(obj)
    }

    var walk = function(t)
    {
        if (t.split)
        {
            for (var i = 0; i < t.split.length; i++)
                push(t.split[i])

            var x = t.axis
            var v = t.value

            if (min[x] < v) walk(t.left)
            if (max[x] > v) walk(t.right)
        }

        if (t.objects)
            for (var i = 0; i < t.objects.length; i++)
                push(t.objects[i])
    }

    walk(this)

    return results
}