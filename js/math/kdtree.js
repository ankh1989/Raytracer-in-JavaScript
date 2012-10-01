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
            var L = new Array(lcount)
            var R = new Array(rcount)

            var il = 0
            var ir = 0

            for (var i = 0; i < n; i++)
            {
                var obj = sorted[axis][i]
                var coord = getp(obj)[splitaxis]

                if (coord < median)
                    L[il++] = obj
                else if (coord > median)
                    R[ir++] = obj
                else if (axis == splitaxis)
                    splitted.push(obj)
            }

            lsorted[axis] = L.slice(0, il)
            rsorted[axis] = R.slice(0, ir)
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

// Traverses all items in the tree and calls
// the specified callback with every item.
kdtree.prototype.each = function(f)
{
    if (this.split) this.split.each(f)
    if (this.objects) this.objects.each(f)
    if (this.left) this.left.each(f)
    if (this.right) this.right.each(f)
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

// k-NN algorithm: it searches k nearest neighbors to point p
// and uses getdist to measure distance between two points
kdtree.prototype.search = function(p, k, getdist)
{
    var getp = this.getp

    // neighbors[i].obj
    // neighbors[i].dist
    var neighbors = []

    var getmaxdist = function()
    {
        var n = neighbors.length
        if (n > 0) return neighbors[n - 1].dist
    }

    var insert = function(dist, obj)
    {
        var i = neighbors.length;
        while (i > 0 && dist < neighbors[i - 1].dist)
            i--

        if (i == k) return

        for (var j = neighbors.length; j > i; j--)
            if (j < k) neighbors[j] = neighbors[j - 1]

        neighbors[i] = {obj:obj, dist:dist}
    }

    var searchplain = function(objects)
    {
        objects.each(function(obj)
        {
            insert(getdist(p, getp(obj)), obj)
        })
    }

    var search = function(t)
    {
        if (t.objects)
        {
            searchplain(t.objects)
            return
        }

        var x = p[t.axis]
        var dist = Math.abs(t.value - x)

        if (x < t.value)
        {
            search(t.left)
            if (neighbors.length < k || getmaxdist() > dist)
            {
                search(t.right)
                searchplain(t.split)
            }
        }
        else
        {
            search(t.right)
            if (neighbors.length < k || getmaxdist() > dist)
            {
                search(t.left)
                searchplain(t.split)
            }
        }
    }

    search(this)

    return neighbors.map(function(nb)
    {
        return nb.obj
    })
}