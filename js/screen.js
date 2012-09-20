function screen(settings)
{
    this.width      = settings.width
    this.height     = settings.height
    this.aarays     = settings.aarays
    this.rt         = settings.raytracer
}

screen.prototype.raycolor = function(x, y, raypower)
{
    var cam = this.rt.scene.camera

    var x2 = vec.mul(x / this.width, cam.right)
    var y2 = vec.mul(y / this.height, cam.down)
    
    var scr = vec.add(cam.lt, vec.add(x2, y2))
    var r = new ray({from:cam.eye, to:scr, power:raypower})

    return this.rt.color(r)
}

screen.prototype.renderarea = function(xrange, yrange)
{
    var areawidth = xrange[1] - xrange[0] + 1
    var areaheight = yrange[1] - yrange[0] + 1

    var width = this.width
    var height = this.height

    var f = 1/this.aarays
    var base = 0
    var rgba = new Array(4 * areawidth * areaheight)

    for (var y = yrange[0]; y <= yrange[1]; y++)
    for (var x = xrange[0]; x <= xrange[1]; x++)
    {
        var color = [0, 0, 0]

        for (var k = 0; k < this.aarays; k++)
        {
            var xpos = x + Math.random(0, 1)
            var ypos = y + Math.random(0, 1)
            
            var c = this.raycolor(xpos, ypos, f)

            color[0] += c[0]
            color[1] += c[1]
            color[2] += c[2]
        }

        rgba[base + 0] = Math.floor(color[0] * f * 255)
        rgba[base + 1] = Math.floor(color[1] * f * 255)
        rgba[base + 2] = Math.floor(color[2] * f * 255)
        rgba[base + 3] = 255

        base += 4
    }

    return rgba
}