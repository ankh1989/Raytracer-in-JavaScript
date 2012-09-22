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

function OnAllScriptsLoaded()
{
    map = {}

    map.canvas = null
    map.context = null

    map.width = null
    map.height = null

    map.aarays = 1

    map.cellSize = 150

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

    function $(id)
    {
        return document.getElementById(id)
    }

    function disable(f)
    {
        $('render').disabled = f
        $('aarays').disabled = f
        $('imgsize').disabled = f
    }

    map.time = function()
    {
        return (new Date()).getTime()
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

        map.HighlightCell(cell.row, cell.col, map.activeColor)

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

        console.log(map.width + 'x' + map.height + ' rendered for ' + duration + 'ms')
        console.log('Rays traced: ' + map.totalrays)

        if (map.maxgrad)
            console.log('maxgrad=' + map.maxgrad)
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

    function GetSelectedSceneName()
    {
        return $('scene').options[$('scene').selectedIndex].text
    }

    function CreateSelectedScene()
    {
        var name = GetSelectedSceneName()
        return scenes[name]()
    }

    $('render').onclick = function()
    {
        disable(true)

        var $$ = function(field, def)
        {
            var x = parseInt($(field).value)
            x = isFinite(x) && x > 0 ? x : def
            $(field).value = x
            return x
        }

        map.scene = CreateSelectedScene()

        map.aarays = $$('aarays')
        map.state.nThreads = $$('nthreads')
        map.cellSize = $$('cellsize')
        map.setsize($$('imgsize'), $$('imgsize'))
        map.clear()
    
        map.Render()
    }

    $('image').onclick = function()
    {
        makeimg()
    }

    $('canvas').onclick = function(event)
    {
        var rt = new raytracer({scene:CreateSelectedScene()})
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

        var r = rt.scene.camera.ray(x/s.width, y/s.height)
        r.power = 1
        rt.emit(r)
        console.log('photos created: ' + rt.photonmap.length)
    }

    initialize()
}