function perftest(name, t)
{
    this.name = name
    this.t = t
}

perftest.prototype.log = function(obj)
{
    console.log(this.name + '> ', obj)
}

perftest.prototype.time = function()
{
    return (new Date()).getTime()
}

perftest.prototype.run = function()
{
    var t0 = this.time()

    try
    {
        this.t()
    }
    catch(e)
    {
        this.log(e)
    }

    var t1 = this.time()
    this.log('completed for ' + (t1 - t0) + 'ms')
}

var perftests =
{
    tests: {},

    add: function(name, t)
    {
        if (this.tests[name])
            throw "The test already exists"

        this.tests[name] = new perftest(name, t)
    },

    runall: function()
    {
        for (var name in this.tests)
            this.tests[name].run()
    }
}

perftests.add('kd-tree build', function()
{
    var num = 1e6

    var objects = new Array(num)
    for (var i = 0; i < objects.length; i++)
        objects[i] = {p:vec.random(), i:i}

    var t = new kdtree(objects, function(obj){return obj.p})

    var randombox = function()
    {
        var min = vec.random()
        var max = vec.addmul(min, 0.1, vec.random())

        for (var i = 0; i < 3; i++)
        {
            var a = min[i]
            var b = max[i]
            if (a > b)
            {
                min[i] = b
                max[i] = a
            }
        }

        return {min:min, max:max}
    }

    var t0 = this.time()
    var nselect = 1000
    var nsum = 0

    for (var i = 0; i < nselect; i++)
    {
        var b = randombox()
        var s = t.select(b.min, b.max)
        nsum += s.length
    }

    this.log('average selection contains ' + Math.round(nsum/nselect) + ' items')

    var t1 = this.time()
    var speed = (t1 - t0)/1e3/nselect
    this.log('kdtree.select takes ' + Math.round(speed*1e6) + ' seconds per million calls')
})