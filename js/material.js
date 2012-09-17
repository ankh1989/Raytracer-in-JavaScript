function material(args)
{
    var $ = function(val, defaultval)
    {
        return typeof args[val] == 'undefined' ? defaultval : args[val]
    }
    
    this.lambert       = $('lam', 0.4)
    this.phong         = $('ph', 0.6)
    this.phongpower    = $('phpow', 7)
    this.reflection    = $('refl', 0)
    this.refrcoeff     = $('rc', 1)
    this.transparency  = $('t', 0)
    this.surface       = 1 - this.reflection - this.transparency
    this.color         = $('color', [0, 1, 0])
}