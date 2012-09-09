mat = {}

mat.create = function(opts)
{
    opts = opts || {}
    
    var m = {}
    
    var $ = function(x, y)
    {
        return typeof x == 'undefined' ? y : x
    }
    
    m.lambert = $(opts.lam, 0.4)
    m.phong = $(opts.ph, 0.6)
    m.phongpower = $(opts.phpow, 7)
    m.reflection = $(opts.refl, 0)	
    m.refrcoeff = $(opts.rc, 1)
    m.transparency = $(opts.t, 0)
    m.surface = 1 - m.reflection - m.transparency
    
    return m
}