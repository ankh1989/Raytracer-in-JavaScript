var nScriptsPending = 0

LoadScripts(function(path)
{
    nScriptsPending++
    var script = document.createElement('script')
    script.type = 'text/javascript'
    script.src = 'js/' + path
    script.onload = OnScriptLoaded
    document.getElementsByTagName("head")[0].appendChild(script)
})

function OnScriptLoaded()
{
    if (--nScriptsPending == 0)
        OnAllScriptsLoaded()
}

function $(id)
{
    return document.getElementById(id)
}

function $$(field, def)
{
    var x = parseInt($(field).value)
    x = isFinite(x) && x > 0 ? x : def
    $(field).value = x
    return x
}

function timems()
{
    return (new Date()).getTime()
}

function GetSelectedSceneName()
{
    return $('scene').options[$('scene').selectedIndex].text
}

function CreateSelectedScene()
{
    var name = GetSelectedSceneName()
    return scenes[name]()
}

function OnAllScriptsLoaded()
{
    if (!unittests.run())
        $('uterror').style.visibility = 'visible'

    map = {}

    map.canvas = null
    map.context = null

    map.width = null
    map.height = null

    map.aarays = 1

    map.cellSize = $$('cellsize')

    map.grid = []

    map.scene = null

    map.grayColor1 = [0.9, 0.9, 0.9]
    map.grayColor2 = [0.8, 0.8, 0.8]
    map.activeColor = [0.9, 0.8, 0.6]

    map.state = {
        nThreads:   8,
        threads:    [],

        nRemaining: undefined,
        cells:      []
    }

    function disable(f)
    {
        $('render').disabled = f
        $('aarays').disabled = f
        $('imgsize').disabled = f
    }

    map.time = function()
    {
        return timems()
    }

    map.setsize = function(size)
    {
        map.canvas.width = size
        map.canvas.height = size
        map.width = size
        map.height = size
        map.grid = map.getgrid()
        map.context = map.canvas.getContext('2d')
    }

    map.getgrid = function()
    {
        var xn = Math.ceil(map.width / map.cellSize)
        var yn = Math.ceil(map.height / map.cellSize)
    
        return [xn, yn]
    }

    map.Render = function()
    {
        map.starttime = map.time()
        map.totalrays = 0
        map.CreateCells()
        map.CreateThreadStates()
        map.StartThreads()
    }

    map.CreateCells = function()
    {
        var nCols = map.grid[0]
        var nRows = map.grid[1]

        for (var i = 0; i < nRows * nCols; i++)
            map.state.cells[i] = {
                col:    i % nCols,
                row:    (i - i % nCols) / nCols,
                state:  'notrendered'
            }

        map.state.nRemaining = map.state.cells.length
    }

    map.CreateThreadStates = function()
    {
        for (var i = 0; i < map.state.nThreads; i++)
            map.state.threads[i] = {
                iCell:  i,
                id:     i
            }
    }

    map.StartThreads = function()
    {
        for (var i in map.state.threads)
        {
            var t = map.state.threads[i]
            if (map.FindNotRenderedCell(t))
                map.RenderCell(t)
        }
    }

    map.FindNotRenderedCell = function(thread)
    {
        for (var i = thread.iCell; i < map.state.cells.length; i++)
            if (map.state.cells[i].state == 'notrendered')
            {
                thread.iCell = i
                return true
            }

        return false
    }

    map.RenderCell = function(thread)
    {
        var cell = map.state.cells[thread.iCell]

        var xmin = cell.col * map.cellSize
        var ymin = cell.row * map.cellSize

        var xmax = xmin + map.cellSize - 1
        var ymax = ymin + map.cellSize - 1

        if (xmax >= map.width)  xmax = map.width - 1
        if (ymax >= map.height) ymax = map.height - 1

        if (xmin <= xmax && ymin <= ymax)
        {
            cell.state = 'rendering'

            map.LaunchRenderer(
                {xmin:xmin, xmax:xmax, ymin:ymin, ymax:ymax},
                thread)
        }
        else
            cell.state = 'skipped'
    }

    map.LaunchRenderer = function(area, thread)
    {
        var renderer = new Worker('js/renderer.js')

        renderer.area       = area
        renderer.id         = thread.id
        renderer.thread     = thread
        renderer.onmessage  = map.OnRendererMessage

        renderer.postMessage
        ({
            scenename: GetSelectedSceneName(),

            screen: {
                width:     map.width,
                height:    map.height,
            },

            settings: {
                aarays:    map.aarays
            },

            photons: map.photons,

            // Ideally, this should be sent as a separate message
            // to the renderer task, because this would allow to
            // reuse the same task again and avoid costly initialization
            // (loading external scripts, etc.).
            area: area
        })
    }

    map.OnRendererMessage = function(event)
    {
        var log = function(text)
        {
            if (console && console.log)
                console.log(event.target.id + '> ' + text)
        }

        if (typeof event.data == 'string')
            log(event.data)
        if (typeof event.data == 'object')
        {
            if (event.data.rgba)
                map.OnRendererFinished(event)
            if (event.data.maxgrad)
                map.OnMaxGradUpdated(event)
            if (event.data.totalrays)
                map.OnTotalRaysUpdated(event.data.totalrays)
        }
        else
            log("unknown event from " + event.target.id)
    }

    map.OnRendererFinished = function(event)
    {
        var task = event.target

        task.terminate()

        map.CopyImageData(task.area, event.data.rgba)
        map.OnCellRendered(task.thread)
    }

    map.OnMaxGradUpdated = function(event)
    {
        map.maxgrad = map.maxgrad || 0.0
        if (event.data.maxgrad > map.maxgrad)
            map.maxgrad = event.data.maxgrad
    }

    map.OnTotalRaysUpdated = function(n)
    {
        map.totalrays = (map.totalrays || 0) + n
    }

    map.OnCellRendered = function(thread)
    {
        var cell = map.state.cells[thread.iCell]

        cell.state = 'rendered'
        map.state.nRemaining--

        if (map.state.nRemaining == 0)
            map.OnImageRendered()
        else if (map.FindNotRenderedCell(thread))
            map.RenderCell(thread)
    }

    map.OnImageRendered = function()
    {
        map.context.fillStyle = '#c80'
        map.context.font = 'bold 20px calibri'
        map.context.textBaseline = 'top'
        map.context.shadowOffsetX = 0;
        map.context.shadowOffsetY = 0;
        map.context.shadowBlur = 4;
        map.context.shadowColor = 'rgba(0, 255, 0, 0.7)'

        var duration = map.time() - map.starttime
        var nrays = map.totalrays
        var rps = Math.floor(1000 * nrays / duration)

        map.context.fillText(rps + ' RPS', 10, 5)
        disable(false)

        console.log(map.settings.sSceneName + ' rendered for ' + duration + 'ms')
        console.log('Rays traced: ' + map.totalrays)

        if (map.maxgrad)
            console.log('maxgrad=' + map.maxgrad)

        //if (map.photons) DrawPhotons(map.photons)
    }

    map.CopyImageData = function(area, rgba)
    {
        var areawidth   = area.xmax - area.xmin + 1
        var areaheight  = area.ymax - area.ymin + 1

        var image = map.context.getImageData(area.xmin, area.ymin, areawidth, areaheight)
        var imgdata = image.data

        for (var i = 0; i < 4 * areawidth * areaheight; i++)
            imgdata[i] = rgba[i]

        map.context.putImageData(image, area.xmin, area.ymin)
    }

    map.clear = function()
    {
        var grid = map.grid

        for (var xi = 0; xi < grid[0]; xi++)
        for (var yi = 0; yi < grid[1]; yi++)
            map.HighlightCell(yi, xi, (xi + yi) % 2 == 0 ? map.grayColor1 : map.grayColor2)
    }

    map.HighlightCell = function(row, col, c)
    {
        var $$ = function(i) { return Math.floor(c[i] * 255) }

        map.context.fillStyle = 'rgb(' + $$(0) + ',' + $$(1) + ',' + $$(2) + ')'
        map.context.fillRect(col * map.cellSize, row * map.cellSize, map.cellSize, map.cellSize)
    }

    function makeimg()
    {
        $('img').width = $('canvas').width
        $('img').height = $('canvas').height
        $('img').src = $('canvas').toDataURL()
        $('img').style.visibility = 'visible'
    }

    function initialize()
    {
        ListScenes()
        map.canvas = $('canvas')
        map.setsize($('imgsize').value)
        map.clear()
    }

    function ListScenes()
    {
        for (var name in scenes)
        {
            var item = document.createElement('option')
            item.text = name
            $('scene').appendChild(item)
        }
    }

    $('render').onclick = function()
    {
        disable(true)

        map.settings = GetUIChoosenSettings()
        map.scene = CreateSelectedScene()

        map.aarays = $$('aarays')
        map.state.nThreads = $$('nthreads')
        map.cellSize = $$('cellsize')
        map.setsize($$('imgsize'), $$('imgsize'))
        map.clear()
        map.photons = []

        if (!map.settings.fGI)
            map.Render()
        else
            GetPhotonMap
            ({
                scenename:  GetSelectedSceneName(),
                numphotons: 2000000,
                numworkers: GetNumWorkers(),
                onready:    function(photons)
                {
                    PreparePhotonsForTransfer(photons)
                    DrawPhotons(photons)
                    //PrintPhotons(photons)
                    //TestTrace(photons)
                    console.log('photons: ', photons)
                    map.photons = photons
                    map.Render()
                }
            })
    }

    $('image').onclick = function()
    {
        makeimg()
    }

    $('canvas').onclick = function(event)
    {
        var rt = new raytracer({scene:CreateSelectedScene()})
        if (map.photons) rt.photons = map.photons

        var s = new screen
        ({
            width:      $('canvas').width,
            height:     $('canvas').height,
            aarays:     1,
            raytracer:  rt
        })

        var x = event.x
        var y = event.y
        var c = s.raycolor(x, y, 1)
        console.log('(' + x + ',' + y + ')=[' + c + ']')

        var r = new ray({from:s.rt.scene.camera.eye, to:[0, 0, 0], power:1})
        s.rt.emit(r)
    }

    initialize()
}

function GetUIChoosenSettings()
{
    return {
        nWorkers:   $$('nthreads'),
        fGI:        $('GI').checked,
        nAARays:    $$('aarays'),
        nImgSize:   $$('imgsize'),
        nCellSize:  $$('cellsize'),
        tSceneName: $('scene').options[$('scene').selectedIndex].text
    }
}

function GetNumWorkers()
{
    return $$('nthreads')
}

function GetPhotonMap(args)
{
    var scenename   = args.scenename
    var numphotons  = args.numphotons
    var onready     = args.onready
    var numworkers  = args.numworkers

    var nactiveworkers = numworkers
    var photonarrays = []

    var GeneratePhotons = function(scenename, numphotons)
    {
        var scene = scenes[scenename]()
        var rt = new raytracer({scene:scene})

        for (var i in rt.scene.lights)
        {
            var light = rt.scene.lights[i]
            if (!light.power) continue

            for (var n = 0; n < numphotons; n++)
            {
                var r = new ray
                ({
                    from:   light.at,
                    dir:    vec.randomdir(),
                    power:  light.power/numphotons
                })

                rt.emit(r)
            }
        }

        return rt.photons
    }

    var OnWorkerReady = function(event)
    {
        event.target.terminate()

        photonarrays.push(event.data.result)
        nactiveworkers--

        if (nactiveworkers < 0)
            throw "a worker is unexpectedly active"

        if (nactiveworkers == 0)
        {
            var photons = [].concat.apply([], photonarrays)
            onready(photons)
        }
    }

    for (var i = 0; i < numworkers; i++)
    {
        var t = new Worker('js/worker.js')

        t.onmessage = OnWorkerReady

        t.postMessage
        ({
            func: GeneratePhotons + '',
            args: [scenename, Math.ceil(numphotons/numworkers)]
        })
    }
}

function DrawPhotons(photons)
{
    var scene = CreateSelectedScene()
    var cam = scene.camera
    var scr = new plane
    ({
        center: cam.lt,
        norm:   vec.cross(cam.right, cam.down)
    })

    var width = $('canvas').width
    var height = $('canvas').height

    var ctx = $('canvas').getContext('2d')
    var img = ctx.getImageData(0, 0, width, height)
    var pixels = img.data

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
            pixels[b + 1] = 255
            pixels[b + 2] = 255
            pixels[b + 3] = 255
        }
    }

    ctx.putImageData(img, 0, 0)
}

function PreparePhotonsForTransfer(photons)
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
}

function TestTrace(photons)
{
    var scene = scenes[GetSelectedSceneName()]()
    var rt = new raytracer({scene:scene})
    rt.photons = photons
    var r = new ray({from:scene.camera.eye, to:[0, 0, 0], power:1})
    var c = rt.color(r)
    console.log('color:', c)
}

function PrintPhotons(photons)
{
    var strings = []

    for (var i = 0; i < photons.length; i++)
    {
        var p = photons[i].from
        strings.push('[' + p[0] + ',' + p[1] + ',' + p[2] + ']')
    }

    var str = strings.join(',')
    console.log('[', str, ']')
}