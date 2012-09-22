function material(args)
{
    if (args == 'glass')
        return new material
        ({
            transparency:   0.5,
            reflectance:     0.5,
            diffuse:        0.0,
            refrcoeff:      1.5
        })
    else if (args == 'mirror')
        return new material
        ({
            reflectance: 1.0
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

        this.reflectance    = args.reflectance || 0
        this.transparency  = args.transparency || 0
        this.diffuse       = args.diffuse || 1 - this.reflectance - this.transparency

        this.refrcoeff     = args.refrcoeff || 1
        this.color         = args.color
        this.shader        = args.shader || new shaders.phong({})
    }
}