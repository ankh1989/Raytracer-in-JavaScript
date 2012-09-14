math = {}

math.eps = 0.001

math.samesign = function(a, b)
{
    return a <= 0 && b <= 0 || a >= 0 && b >= 0
}

math.eq = function(a, b)
{
    var d = a - b
    return d < math.eps && -d < math.eps
}

math.sqr = function(x)
{
    return x*x
}

math.dirdiff = function(f, s, ds)
{
    var dt = math.eps
    var nds = vec.mul(dt/vec.len(ds), ds)
    var f1 = f(s[0], s[1], s[2])
    var f2 = f(s[0] + nds[0], s[1] + nds[1], s[2] + nds[2])
    return (f2 - f1)/dt
}

math.partdiff = function(f, s, arg)
{
    var ds = math.eps
    var s2 = [s[0], s[1], s[2]]
    s2[arg] += ds
    var fs2 = f.apply(null, s2)
    var fs = f.apply(null, s)
    return (fs2 - fs)/ds
}

math.fulldiff = function(f, s)
{
    return [
        math.partdiff(f, s, 0),
        math.partdiff(f, s, 1),
        math.partdiff(f, s, 2)
    ]
}

math.sbinsearch = function(f, s, min, max)
{
    var t0 = min
    var t1 = max

    while (t1 - t0 > math.eps)
    {
        var f0 = f(s(t0))
        var f1 = f(s(t1))

        var tm = (t0 + t1)/2
        var fm = f(s(tm))

        if (math.eq(fm, 0))
        {
            t0 = tm
            t1 = tm
        }
        else if (math.samesign(f0, fm))
        {
            f0 = fm
            t0 = tm
        }
        else
        {
            f1 = fm
            t1 = tm
        }
    }

    return t0
}

math.binsearch = function(f, min, max)
{
    var t0 = min
    var t1 = max

    while (t1 - t0 > math.eps)
    {
        var f0 = f(t0)
        var f1 = f(t1)

        var tm = (t0 + t1)/2
        var fm = f(tm)

        if (math.eq(fm, 0))
        {
            t0 = tm
            t1 = tm
        }
        else if (math.samesign(f0, fm))
        {
            f0 = fm
            t0 = tm
        }
        else
        {
            f1 = fm
            t1 = tm
        }
    }

    return (t0 + t1)/2
}

math.binsearch.test = function()
{
    var s = function(t) { return t }
    var f = function(s) { return s*s - 1 }

    var x = math.binsearch(f, s, 0.1, 1.7)
    
    return math.eq(x, 1)
}

math.findroot = function(g, t0, t1, maxgrad)
{
    var t = t0
    var prevg = g(t)

    while (t < t1)
    {
        /*
        var grad = Math.abs(g(t + math.eps) - g(t))/math.eps
        if (grad > math.findroot.maxgrad)
            math.findroot.maxgrad = grad
        */

        var dt = Math.abs(prevg)/maxgrad + math.eps
        var currg = g(t + dt)

        if (!math.samesign(prevg, currg))
            return math.binsearch(g, t, t + dt)

        prevg = currg
        t += dt
    }
}

math.findroot.maxgrad = 0.0

math.swap = function(a, i, j)
{
    var ai = a[i]
    var aj = a[j]

    a[i] = aj
    a[j] = ai
}