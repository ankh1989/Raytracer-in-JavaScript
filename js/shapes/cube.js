// A cube within -1..+1 bounds:
//
// -1 < x < +1
// -1 < y < +1
// -1 < z < +1

function cube(args)
{
}

cube.prototype.inside = function(p)
{
    return  (Math.abs(p[0]) <= 1) &&
            (Math.abs(p[1]) <= 1) &&
            (Math.abs(p[2]) <= 1)
}

cube.prototype.trace = function(r)
{
    var h = {}
    
    this.traceaxis(r, 0, h)
    this.traceaxis(r, 1, h)
    this.traceaxis(r, 2, h)

    if (h.norm) return h
}

cube.prototype.traceaxis = function(r, i, h)
{
    var j = (i + 1) % 3
    var k = (i + 2) % 3

    var p = r.from
    var s = r.dir

    if (s[i] == 0) return

    var tp = (+1 - p[i])/s[i]
    var tn = (-1 - p[i])/s[i]

    var t = tp
    if (t < 0 || tn < t) t = tn
    if (t < 0) return

    if (h.norm && t >= h.dist)
        return

    var q = [
        p[0] + t*s[0],
        p[1] + t*s[1],
        p[2] + t*s[2]
    ]

    if ((Math.abs(q[j]) <= 1) && (Math.abs(q[k]) <= 1))
    {
        h.dist = t
        h.norm = vec.e(i)
        h.at = q
    }
}