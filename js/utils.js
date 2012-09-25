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