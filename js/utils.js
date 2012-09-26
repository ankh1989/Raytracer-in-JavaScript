pi = Math.PI

function isarray(a)
{
    return typeof a == 'object' &&
        typeof a.length == 'number' &&
        isFinite(a.length) &&
        a.length == Math.floor(a.length)
}

function time()
{
    return (new Date()).getTime()
}

Array.prototype.fill = function(n, get)
{
    for (var i = 0; i < n; i++)
        this[i] = get(i)

    return this
}

Array.prototype.each = function(f)
{
    for (var i = 0; i < this.length; i++)
        f(this[i])

    return this
}