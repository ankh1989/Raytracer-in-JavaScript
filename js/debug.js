debug = {}

dbg = debug

debug.monitorcalls = function(f)
{
    f.ncalls = 0

    var df = function()
    {
        f.ncalls++
        return f.apply(this, arguments)
    }
    
    df.ncalls = function()
    {
        return f.ncalls
    }
    
    return df
}

debug.monitornamespace = function(ns)
{
    for (var f in ns)
        ns[f] = debug.monitorcalls(ns[f])
}

debug.monitorcallsinfo = function(ns)
{
    var fs = []
    
    for (var f in ns)
    {
        var a = {}
        
        a.f = f
        a.n = ns[f].ncalls()
        
        fs.push(a)
    }
    
    for (var i = 0; i < fs.length; i++)
    for (var j = i + 1; j < fs.length; j++)
        if (fs[i].n < fs[j].n)
        {
            var fsi = fs[i]
            fs[i] = fs[j]
            fs[j] = fsi
        }
        
    var s = []
        
    for (var i = 0; i < fs.length; i++)
        s.push(fs[i].f + ' - ' + fs[i].n)
        
    return s.join('\n')
}

debug.isarray = function(obj)
{
    return false

    return typeof obj == 'object' && typeof obj.prototype == 'object' &&
        obj.prototype.join &&
        obj.prototype.push && 
        obj.prototype.pop &&
        obj.prototype.sort
}

debug.tostr = function(obj, depth)
{
    if (typeof obj == 'object' && (depth === undefined || depth > 0))
    {
        var str = ''

        for (var key in obj)
            str = str + debug.tostr(key, depth - 1) + ':' + debug.tostr(obj[key], depth - 1) + ';'

        return '{' + str.substr(0, str.length - 1) + '}'
    }
    else if (typeof obj == 'function')
        return typeof obj
    else if (typeof obj == 'number')
        return Math.floor(obj*1000)/1000 + ''
    else
        return obj + ''
}

debug.postMessage = function(obj, depth)
{
    postMessage(debug.tostr(obj, depth))
}