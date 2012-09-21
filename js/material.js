function material(args)
{
    if (args == 'glass')
        return new material
        ({
            rc:     1.5,
            t:      0.4,
            refl:   0.5,
            color:  [0, 1, 0]
        })
    else if (args == 'mirror')
        return new material
        ({
            refl:   1.0
        })
    else if (isarray(args) && args.length == 3)
        return new material
        ({
            color: [args[0], args[1], args[2]]
        })
    else
    {
        var $ = function(val, defaultval)
        {
            return typeof args[val] == 'undefined' ? defaultval : args[val]
        }
    
        this.lambert       = $('lam', 0.3)
        this.phong         = $('ph', 0.6)
        this.ambient       = $('ambient', 0.1)
        this.phongpower    = $('phpow', 7)
        this.reflection    = $('refl', 0)
        this.refrcoeff     = $('rc', 1)
        this.transparency  = $('t', 0)
        this.surface       = 1 - this.reflection - this.transparency
        this.color         = args.color
        this.shader        = args.shader || new shaders.phong({})
    }
}