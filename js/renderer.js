function Renderer(args)
{
    this.nthreads       = args.nthreads
    this.width          = args.width
    this.height         = args.height
    this.cellsize       = args.cellsize
    this.aarays         = args.aarays
    this.GI             = args.GI
    this.scenename      = args.scenename
    this.numphotons     = args.numphotons

    this.onarearendering= args.onarearendering
    this.onarearendered = args.onarearendered
    this.oncompleted    = args.oncompleted

    this.state =
    {
        nThreads:   this.nthreads,
        threads:    [],
        nRemaining: undefined,
        cells:      []
    }

    this.photons = []
    this.totalrays = 0
    this.starttime = undefined
}

Renderer.prototype =
{
    Run: function()
    {
        this.starttime = time()

        if (!this.GI)
            this.Render()
        else
        {
            var r = this

            this.GetPhotonMap
            ({
                scenename:  this.scenename,
                numphotons: this.numphotons,
                numworkers: this.nthreads,
                onready:    function(photons){r.OnPhotonsCreated(photons)}
            })
        }
    },

    GetPhotonMap: function(args)
    {
        var scenename   = args.scenename
        var numphotons  = args.numphotons
        var onready     = args.onready
        var numworkers  = args.numworkers
        var nlevels     = args.levels || 4

        var nactiveworkers = numworkers
        var photonarrays = []

        for (var i = 0; i < numworkers; i++)
        {
            var w = new worker
            ({
                func: this.GeneratePhotons,
                args: [scenename, Math.ceil(numphotons/numworkers), nlevels],
                oncompleted: function(data)
                {
                    photonarrays.push(data.result)
                    nactiveworkers--

                    if (nactiveworkers < 0)
                        throw "a worker is unexpectedly active"

                    if (nactiveworkers == 0)
                    {
                        var photons = [].concat.apply([], photonarrays)
                        onready(photons)
                    }
                }
            })

            w.run()
        }
    },

    // this function runs on a separate thread
    GeneratePhotons: function(scenename, numphotons, nlevels)
    {
        var scene = scenes[scenename]()
        var rt = new raytracer({scene:scene})
        var em = new emitter({obj:rt.obj})

        var sumlight = 0
        for (var i in rt.scene.lights)
            sumlight += rt.scene.lights[i].power

        var photons = []
        var nphotons = 0

        while (nphotons < numphotons)
        {
            var rays = []

            for (var i in rt.scene.lights)
            {
                var light = rt.scene.lights[i]
                var count = Math.ceil(numphotons*light.power/sumlight)

                for (var n = 0; n < count; n++)
                    rays.push(new ray
                    ({
                        from:   light.at,
                        dir:    vec.randomdir(),
                        power:  light.power/count
                    }))
            }

            for (var i = 0; i < nlevels; i++)
                rays = em.emit(rays)

            for (var i = 1; i < em.levels.length; i++)
            {
                var level = em.levels[i]
                photons.push(level)
                nphotons += level.length
            }
        }

        photons = [].concat.apply([], photons)
        return photons
    },

    OnPhotonsCreated: function(photons)
    {
        this.PreparePhotonsForTransfer(photons)
        this.DrawPhotons(photons)
        //PrintPhotons(photons)
        //TestTrace(photons)
        console.log('photons: ', photons)
        this.photons = photons
        this.Render()
    },

    Render: function()
    {
        this.totalrays = 0
        this.CreateCells()
        this.CreateThreadStates()
        this.StartThreads()
    },

    CreateCells: function()
    {
        var nCols = Math.ceil(this.width/this.cellsize)
        var nRows = Math.ceil(this.height/this.cellsize)

        for (var i = 0; i < nRows*nCols; i++)
            this.state.cells[i] =
            {
                col:    i % nCols,
                row:    (i - i % nCols) / nCols,
                state:  'notrendered'
            }

        this.state.nRemaining = this.state.cells.length
    },

    CreateThreadStates: function()
    {
        for (var i = 0; i < this.state.nThreads; i++)
            this.state.threads[i] =
            {
                iCell:  i,
                id:     i
            }
    },

    StartThreads: function()
    {
        for (var i in this.state.threads)
        {
            var t = this.state.threads[i]
            if (this.FindNotRenderedCell(t))
                this.RenderCell(t)
        }
    },

    FindNotRenderedCell: function(thread)
    {
        for (var i = thread.iCell; i < this.state.cells.length; i++)
            if (this.state.cells[i].state == 'notrendered')
            {
                thread.iCell = i
                return true
            }

        return false
    },

    RenderCell: function(thread)
    {
        var cell = this.state.cells[thread.iCell]

        var xmin = cell.col * this.cellsize
        var ymin = cell.row * this.cellsize

        var xmax = xmin + this.cellsize - 1
        var ymax = ymin + this.cellsize - 1

        if (xmax >= this.width)  xmax = this.width - 1
        if (ymax >= this.height) ymax = this.height - 1

        if (xmin <= xmax && ymin <= ymax)
        {
            cell.state = 'rendering'
            var area = {xmin:xmin, xmax:xmax, ymin:ymin, ymax:ymax}
            this.onarearendering(area)
            this.LaunchRenderer(area, thread)
        }
        else
            cell.state = 'skipped'
    },

    LaunchRenderer: function(area, thread)
    {
        var r = this
        var w = new worker
        ({
            oncompleted:    function(args){r.OnRendererCompleted(args)},
            func:           this.RenderArea,
            args:
            [{
                scenename:  this.scenename,
                photons:    this.photons,
                area:       area,

                screen:
                {
                    width:     this.width,
                    height:    this.height,
                },

                settings:
                {
                    aarays:    this.aarays
                }
            }]
        })

        w.area       = area
        w.id         = thread.id
        w.thread     = thread

        w.run()
    },

    // This function runs on a separate thread.
    RenderArea: function(args)
    {
        var area = args.area
        var scene = scenes[args.scenename]()
        var rt = new raytracer({scene:scene})
        var scr = new screen
        ({
            width:      args.screen.width,
            height:     args.screen.height,
            aarays:     args.settings.aarays,
            raytracer:  rt
        })

        rt.photons = args.photons

        var rgba = scr.renderarea(
            [area.xmin, area.xmax],
            [area.ymin, area.ymax])

        return {
            rgba:       rgba,
            maxgrad:    math.findroot.maxgrad,
            totalrays:  rt.totalrays
        }
    },

    OnRendererCompleted: function(data)
    {
        this.OnMaxGradUpdated(data.result.maxgrad)
        this.OnTotalRaysUpdated(data.result.totalrays)
        this.onarearendered(data.worker.area, data.result.rgba)
        this.OnCellRendered(data.worker.thread)
    },

    OnMaxGradUpdated: function(maxgrad)
    {
        this.maxgrad = this.maxgrad || 0.0
        if (maxgrad > this.maxgrad)
            mthisap.maxgrad = maxgrad
    },

    OnTotalRaysUpdated: function(n)
    {
        this.totalrays = (this.totalrays || 0) + n
    },

    OnCellRendered: function(thread)
    {
        var cell = this.state.cells[thread.iCell]

        cell.state = 'rendered'
        this.state.nRemaining--

        if (this.state.nRemaining == 0)
            this.OnImageRendered()
        else if (this.FindNotRenderedCell(thread))
            this.RenderCell(thread)
    },

    OnImageRendered: function()
    {
        this.oncompleted
        ({
            duration: time() - this.starttime,
            totalrays: this.totalrays
        })
    },

    CreateScene: function()
    {
        return scenes[this.scenename]()
    },

    PreparePhotonsForTransfer: function(photons)
    {
        var round = function(f, x)
        {
            return Math.round(f*x)/x
        }

        var roundv = function(v, x)
        {
            v[0] = round(v[0], x)
            v[1] = round(v[1], x)
            v[2] = round(v[2], x)
        }

        for (var i = 0; i < photons.length; i++)
        {
            var pi = photons[i]
            pi.power = round(pi.power, 1e10)
            roundv(pi.from, 1e3)
            roundv(pi.dir, 1e3)
        }
    },

    TestTrace: function(photons)
    {
        var scene = this.CreateScene()
        var rt = new raytracer({scene:scene})
        rt.photons = photons
        var r = new ray({from:scene.camera.eye, to:[0, 0, 0], power:1})
        var c = rt.color(r)
        console.log('color:', c)
    },

    PrintPhotons: function(photons)
    {
        var strings = []

        for (var i = 0; i < photons.length; i++)
        {
            var p = photons[i].from
            strings.push('[' + p[0] + ',' + p[1] + ',' + p[2] + ']')
        }

        var str = strings.join(',')
        console.log('[', str, ']')
    },

    DrawPhotons: function(photons)
    {
        var scene = this.CreateScene()
        var cam = scene.camera
        var scr = new plane
        ({
            center: cam.lt,
            norm:   vec.cross(cam.right, cam.down)
        })

        var width = this.width
        var height = this.height
        var pixels = new Array(width*height*4)

        for (var i = 0; i < photons.length; i++)
        {
            var r = new ray
            ({
                from:   cam.eye,
                to:     photons[i].from
            })

            var h = scr.trace(r)
            if (!h) continue

            var p = vec.sub(h.at, cam.lt)
            var pr = vec.dot(p, cam.right)
            var pd = vec.dot(p, cam.down)
            var x = Math.floor(pr/vec.sqrlen(cam.right)*width)
            var y = Math.floor(pd/vec.sqrlen(cam.down)*height)

            if (x >= 0 && x < width && y >= 0 && y < height)
            {
                var b = (y*width + x)*4

                pixels[b + 0] = 255
                pixels[b + 1] = 0
                pixels[b + 2] = 0
                pixels[b + 3] = 255
            }
        }

        this.onarearendered({xmin:0, ymin:0, xmax:width-1, ymax:height-1}, pixels)
    }
}