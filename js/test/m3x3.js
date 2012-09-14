(function()
{
    var eps = 0.01

    var test = function(z, s) { if (Math.abs(z) > eps) throw "m3x3 " + s + " test failed: " + z }

    var a = new m3x3('random')
    var b = new m3x3('random')
    var c = new m3x3('random')

    test(a.clone().mul(b.clone().mul(c)).sub(a.clone().mul(b).mul(c)).norm(), "abc")
    test(a.clone().transpose().transpose().sub(a).norm(), "doble transpose")
    test(a.clone().invert().invert().sub(a).norm(), "double invert")
    test(a.clone().invert().mul(a).sub(new m3x3(1)).norm(), "iaa")
    test(a.clone().mul(a.clone().invert()).sub(new m3x3(1)).norm(), "aia")
    test(b.clone().mul(a).mul(a.clone().invert()).sub(b).norm(), "baia")
})()