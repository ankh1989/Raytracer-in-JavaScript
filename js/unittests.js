function UnitTest(name, func)
{
    this.name = name
    this.func = func
}

UnitTest.prototype =
{
    Run: function()
    {
        this.func()
    },

    Log: function(a)
    {
        console.log('unittests.' + this.name + '> ', a)
    },

    IsTrue: function(f, s)
    {
        if (!f) throw {test:s, value:f, reason:'not true'}
    },

    IsFalse: function(f, s)
    {
        if (f) throw {test:s, value:f, reason:'not false'}
    },

    IsZero: function(x, s)
    {
        if (Math.abs(x) > 1e-3) throw {test:s, value:f, reason:'not zero'}
    }
}

var UnitTests =
{
    tests: {},

    Add: function(name, func)
    {
        if (this.tests[name])
            throw "the unittest already exists"

        this.tests[name] = new UnitTest(name, func)
    },

    RunAll: function()
    {
        var failed = false

        for (var name in this.tests)
        try
        {
            this.tests[name].Run()
            this.tests[name].Log('succeeded')
        }
        catch(e)
        {
            this.tests[name].Log(e)
            failed = true
        }

        if (failed) throw "unit tests failed"
    }
}

UnitTests.Add('m3x3', function()
{
    var eps = 0.01

    var a = new m3x3('random')
    var b = new m3x3('random')
    var c = new m3x3('random')

    this.IsZero(a.clone().mul(b.clone().mul(c)).sub(a.clone().mul(b).mul(c)).norm(), "abc")
    this.IsZero(a.clone().transpose().transpose().sub(a).norm(), "double transpose")
    this.IsZero(a.clone().invert().invert().sub(a).norm(), "double invert")
    this.IsZero(a.clone().invert().mul(a).sub(new m3x3(1)).norm(), "iaa")
    this.IsZero(a.clone().mul(a.clone().invert()).sub(new m3x3(1)).norm(), "aia")
    this.IsZero(b.clone().mul(a).mul(a.clone().invert()).sub(b).norm(), "baia")
})

UnitTests.Add('math.sort', function()
{
    $t = this.IsTrue.bind(this)

    var getrandomarray = function(n)
    {
        var a = new Array(n)
        for (var i = 0; i < a.length; i++)
            a[i] = Math.floor(Math.random()*10)
        return a
    }

    var testsort = function(n)
    {
        var a = getrandomarray(n)

        var s1 = math.sum(a)
        var m1 = math.mul(a)

        math.sortarray(a)

        var s2 = math.sum(a)
        var m2 = math.mul(a)

        $t(math.eq(s1, s2), 'sort' + n)
        $t(math.eq(m1, m2), 'sort' + n)

        for (var i = 0; i < a.length - 1; i++)
            $t(a[i] <= a[i + 1], 'sort ' + a)
    }

    testsort(1)
    testsort(2)
    testsort(3)
    testsort(5)
    testsort(10)
    testsort(15)
    testsort(20)
})

UnitTests.Add('kdtree', function()
{
    $z = this.IsZero.bind(this)
    $t = this.IsTrue.bind(this)
    $f = this.IsFalse.bind(this)

    var each = function(t, f)
    {
        if (t.split)
        {
            for (i = 0; i < t.split.length; i++)
                f(t.split[i])

            each(t.left, f)
            each(t.right, f)
        }
        else if (t.objects)
        {
            for (var i = 0; i < t.objects.length; i++)
                f(t.objects[i])
        }
    }

    var box = function(t)
    {
        var min, max

        each(t, function(obj)
        {
            var p = obj.p

            if (!min) min = vec.clone(p)
            if (!max) max = vec.clone(p)

            for (var i = 0; i < 3; i++)
            {
                if (min[i] > p[i]) min[i] = p[i]
                if (max[i] < p[i]) max[i] = p[i]
            }
        })

        return {min:min, max:max}
    }

    var randombox = function()
    {
        var min = vec.random()
        var max = vec.random()

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

    var checksplit = function(t)
    {
        if (!t.split) return

        var L = box(t.left)
        var R = box(t.right)
        var x = t.axis

        for (var i = 0; i < t.split.length; i++)
        {
            var p = t.split[i].p

            $f(L.max && L.max[x] >= p[x])
            $f(R.min && R.min[x] <= p[x])
        }

        checksplit(t.left)
        checksplit(t.right)
    }

    var checkset = function(t, n)
    {
        var set = {}
        var num = 0

        each(t, function(obj)
        {
            var i = obj.i
            $f(set[i])
            set[i] = true
            num++
        })

        $t(num == n)
    }

    var checkselect = function(t, b)
    {
        var min = b.min
        var max = b.max

        var list1 = t.select(min, max)
        var list2 = []

        each(t, function(obj)
        {
            if (vec.leq(min, obj.p) && vec.leq(obj.p, max))
                list2.push(obj)
        })

        $t(list1.length == list2.length)

        var set = {}

        for (var i = 0; i < list1.length; i++)
        {
            var ob = list1[i]
            $f(set[ob.i])
            set[ob.i] = true
        }

        for (var i = 0; i < list2.length; i++)
        {
            var ob = list2[i]
            $t(set[ob.i])
            set[ob.i] = false
        }
    }

    var checktree = function(src)
    {
        var objects

        if (isarray(src))
            objects = [].fill(src.length, function(i){ return {i:i, p:src[i]} })
        else if (src && src.gen && src.num)
            objects = [].fill(src.num, function(i){ return {i:i, p:src.gen(i)} })
        else
            throw "unknown src"

        var t = new kdtree(objects, function(ob){return ob.p})

        checkset(t, objects.length)
        checksplit(t)

        for (var i = 0; i < 100; i++)
            checkselect(t, randombox())
    }

    var rnd = function(min, max)
    {
        return Math.round(Math.random()*(max - min) + min)
    }

    checktree({num:100, gen:vec.random})
    checktree([ [0.111,0.476,-1],[-0.419,1,-0.408],[0.583,0.35,1],[0.39,1,0.686],[-0.27,0.066,-0.41],[0.024,1,-0.212],[-1,-0.207,0.753],[-0.36,-1,0.154],[0.213,-0.622,-0.777],[0.369,-0.463,-0.683],[1.512,1,-0.836],[4.376,-1,-0.011],[2.799,1,0.266],[2.582,-1,-0.153],[1.137,1,-0.619],[-0.232,-1,0.951],[0.022,1,0.356],[0.498,0.338,1],[2.048,0.09,-1],[2.485,1,-0.832],[4.227,-1,0.463],[4.57,-0.997,1],[-1,-0.936,-0.678],[-0.97,-1,-0.708],[-1,-0.8,-0.479],[-0.875,1,-0.304],[-0.072,0.127,-0.742],[-0.21,0.389,-1],[0.139,0.193,-0.818],[0.136,0.328,-0.658],[0.122,0.376,-0.629],[0.146,0.324,-0.645],[0.367,0.961,-1],[0.406,0.865,-0.916],[0.285,1,-0.63],[0.321,0.848,-0.788],[0.378,0.877,-0.651],[0.449,1,-0.54],[2.31,-0.57,1],[1.72,-1,-0.023],[1.84,0.323,1],[3.018,0.965,-1],[4.259,0.28,1],[5.039,1,0.096],[5.017,-0.514,1],[-1,0.756,-0.618],[-0.737,-1,0.083],[0.481,-0.344,1],[0.198,-1,0.91],[0.166,-0.918,1],[2.205,-0.916,-1],[1.235,-1,-0.996],[1.227,-0.999,-1],[0.965,0.691,1],[0.122,-1,0.071],[0.696,-0.716,-1],[0.686,-1,-0.561],[1.272,0.119,1],[0.176,1,-0.094],[1.248,0.532,-1],[1.81,1,0.555],[2.445,0.017,1],[3.125,-0.951,-1],[3.073,-1,-0.964],[3.04,-0.968,-1],[1.174,1,-0.658],[1.182,0.844,-1],[1.092,1,-0.869],[3.487,0.578,1],[6.305,0.568,-1],[4.797,-1,0.08],[6.594,0.318,1],[5.8,1,0.702],[9.362,-1,0.059],[8.359,1,-0.039],[7.611,-0.785,1],[7.264,-1,0.775],[5.994,0.711,-1],[7.32,-1,0.513],[6.068,0.601,1],[2.854,-1,-0.333],[2.5,-0.064,-1],[3.405,-1,-0.066],[4.712,1,-0.38],[6.247,0.693,1],[9.823,-1,0.026],[10.296,1,-0.293],[10.333,0.134,-1],[10.265,-1,-0.361],[0.332,-0.461,1],[0.477,0.184,-0.452],[0.716,0.24,-0.578],[1.241,0.363,-1],[0.596,1,-0.423],[0.382,0.876,-0.467],[0.55,0.959,-1],[0.007,0.679,1],[0.548,1,0.899],[3.366,-1,-0.127],[1.4,1,-0.745],[1.001,0.967,-1],[0.965,1,-0.938],[5.082,0.262,1],[7.413,0.815,-1],[8.154,1,-0.705],[8.464,0.721,-1],[-0.233,0.323,1],[-0.85,-1,0.796],[-1,-0.919,0.613],[-0.47,-0.562,1],[-0.036,-1,0.114],[-0.195,-0.748,0.09],[-0.4,-0.685,0.055],[-0.139,-0.189,0.3],[0.377,0.038,1],[2.7,-1,0.495],[-1,0.71,0.631],[-0.203,1,0.184],[-0.659,0.19,1],[-0.522,-0.045,0.3],[0.4,-0.336,1],[1.106,-1,0.992],[1.132,-0.952,1],[0.144,-0.2,0.3],[0.566,1,0.334],[-0.3,0.448,-1],[-0.15,0.103,-0.937],[-0.328,0.092,-1],[-0.319,0.051,-0.947],[-1,-0.085,-0.676],[-0.755,-0.355,-1],[-1,-0.599,-0.81],[-0.489,-0.465,-1],[0.507,1,0.704],[2.695,-0.779,-1],[3.431,1,0.997],[1.245,-1,0.455],[2.554,1,0.907],[2.607,0.972,1],[-0.129,-1,0.305],[-0.223,-0.757,0.227],[-0.382,0.031,-0.565],[-0.015,0.301,-1],[-1,0.199,-0.321],[-0.487,-0.001,-0.512],[-0.882,0.096,-1],[-1,0.023,-0.959],[2.629,0.398,-1],[3.125,-1,0.476],[2.635,-0.895,1],[-0.791,1,0.628],[-1,0.76,0.677],[-0.475,0.798,1],[-0.528,1,0.729],[0.863,-0.558,-1],[0.413,-1,-0.805],[0.146,-0.643,-0.719],[-0.471,-0.453,-0.996],[-0.331,0.047,-0.938],[-0.408,0.158,-1],[-0.252,0.072,-0.989],[-1,0.997,-0.065],[-0.823,0.709,1],[-1,0.732,0.917],[-0.845,0.612,1],[-1,0.596,0.837],[0.2,-0.096,0.3],[0.92,-0.873,1],[0.916,-1,0.981],[1.327,0.007,-1],[2.694,-1,0.18],[2.057,1,-0.109],[2.455,0.397,-1],[6.018,1,-0.012],[-0.065,0.129,-0.265],[-0.58,0.775,-1],[-0.517,1,-0.99],[-0.533,0.974,-1],[-0.562,1,-0.962],[-0.443,0.928,-1],[-0.433,1,-0.875],[-0.306,0.877,-1],[0.072,0.172,-0.763],[-0.2,0.313,-1],[0.019,1,-0.208],[1.047,-1,-0.069],[0.279,-0.172,-0.522],[0.663,-0.454,-1],[0.353,-1,0.644],[0.206,-0.521,1],[0.274,-0.272,0.3],[0.609,-1,0.584],[1.04,-0.323,1],[1.365,-1,0.36],[2.369,-0.085,1],[1.718,-1,0.028],[2.495,-0.327,-1],[3.749,1,-0.057],[3.973,-0.185,-1],[4.664,1,-0.638],[4.377,0.99,-1],[2.54,-0.496,-1],[2.713,-1,0.826],[2.566,-0.676,1],[3.913,1,-0.367],[1.843,-1,0.411],[2.613,0.586,1],[3.421,1,0.938],[5.505,-1,-0.253],[4.813,1,-0.497],[2.161,-0.596,-1],[0.676,1,0.272],[2.504,0.955,1],[2.784,-0.843,-1],[2.014,-0.073,1],[0.272,-0.149,-0.136],[3.111,-0.139,-1],[5.065,0.156,1],[7.214,-0.98,-1],[7.267,-1,-0.988],[7.347,-0.919,-1],[7.351,-1,-0.926],[7.571,-0.849,-1],[7.875,-1,-0.667],[8.355,-0.355,-1],[7.831,1,-0.089],[6.07,0.33,-1],[5.606,1,-0.935],[4.511,-0.115,1],[4.239,-1,0.606],[2.293,0.431,-1],[2.243,1,-0.636],[3.718,-0.263,1] ])
    checktree({num:100, gen:function(){ return [rnd(0, 99), rnd(0, 99), rnd(0, 0)] }})
})

UnitTests.Add('kdtree.knn', function()
{
    $t = this.IsTrue.bind(this)

    var numobj = 1000
    var numtst = 100
    var k = 25

    var objects = [].fill(numobj, function(i)
    {
        return {i:i, p:vec.random()}
    })

    var t = new kdtree(objects, function(obj)
    {
        return obj.p
    })

    var search = function(p, k)
    {
        var list = objects.slice(0)

        list.each(function(obj)
        {
            obj.d = math.infdist(p, obj.p)
        })

        list.sort(function(a, b)
        {
            return a.d - b.d
        })

        return list.slice(0, k)
    }

    for (var i = 0; i < numtst; i++)
    {
        var p = vec.random()
        var nb = search(p, k)
        var nbt = t.search(p, k, math.infdist)

        $t(nb.length == Math.min(k, numobj), 'nb.length')
        $t(nbt.length == nb.length, 'nbt.length')

        for (var j = 0; j < nb.length; j++)
            $t(nb[j].i == nbt[j].i, 'nb[i]')
    }
})