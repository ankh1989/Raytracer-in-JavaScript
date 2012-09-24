var unittests =
[
    //
    // m3x3
    //

    function()
    {
        var eps = 0.01

        var chk = function(z, s) { if (Math.abs(z) > eps) throw "m3x3 " + s + " test failed: " + z }

        var a = new m3x3('random')
        var b = new m3x3('random')
        var c = new m3x3('random')

        chk(a.clone().mul(b.clone().mul(c)).sub(a.clone().mul(b).mul(c)).norm(), "abc")
        chk(a.clone().transpose().transpose().sub(a).norm(), "double transpose")
        chk(a.clone().invert().invert().sub(a).norm(), "double invert")
        chk(a.clone().invert().mul(a).sub(new m3x3(1)).norm(), "iaa")
        chk(a.clone().mul(a.clone().invert()).sub(new m3x3(1)).norm(), "aia")
        chk(b.clone().mul(a).mul(a.clone().invert()).sub(b).norm(), "baia")
    },

    //
    // math
    //

    function()
    {
        var chk = function(f, s) { if (!f) throw s + " test failed" }

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

            chk(math.eq(s1, s2), 'sort' + n)
            chk(math.eq(m1, m2), 'sort' + n)

            for (var i = 0; i < a.length - 1; i++)
                chk(a[i] <= a[i + 1], 'sort ' + a)
        }

        testsort(1)
        testsort(2)
        testsort(3)
        testsort(5)
        testsort(10)
        testsort(15)
        testsort(20)
    },

    //
    // kd-tree
    //

    function()
    {
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

                if (L.max && L.max[x] >= p[x]) throw "split"
                if (R.min && R.min[x] <= p[x]) throw "split"
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
                if (set[i]) throw "set"
                set[i] = true
                num++
            })

            if (num != n) throw "set"
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

            if (list1.length != list2.length)
                throw "select"

            var set = {}

            for (var i in list1)
            {
                var ob = list1[i]
                if (set[ob.i]) throw "select"
                set[ob.i] = true
            }

            for (var i in list2)
            {
                var ob = list2[i]
                if (!set[ob.i]) throw "select"
                set[ob.i] = false
            }
        }

        var num = 100
        var objects = new Array(num)
        for (var i = 0; i < objects.length; i++)
            objects[i] =
            {
                p: vec.random(),
                i: i
            }

        var t = new kdtree(objects, function(obj){return obj.p})

        checkset(t, num)
        checksplit(t)

        for (var i = 0; i < 100; i++)
            checkselect(t, randombox())
    },
]

unittests.run = function()
{
    for (var i = 0; i < unittests.length; i++)
        unittests[i]()
}