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

function $$(field)
{
    return parseInt($(field).value)
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

function CloneImage()
{
    $('img').width = $('canvas').width
    $('img').height = $('canvas').height
    $('img').src = $('canvas').toDataURL()
    $('img').style.visibility = 'visible'
}

function ResizeCanvas()
{
    var s = GetUIChoosenSettings()
    var n = s.nImgSize

    if ($('canvas').width != n)
        $('canvas').width = n

    if ($('canvas').height != n)
        $('canvas').height = n
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

function Enable()
{
    $('render').disabled = false
}

function Disable()
{
    $('render').disabled = true
}

function OnAllScriptsLoaded()
{
    ListScenes()
    ResizeCanvas()

    if (!unittests.run())
        $('uterror').style.visibility = 'visible'
}

function Render()
{
    Disable()
    ResizeCanvas()

    var s = GetUIChoosenSettings()

    var r = new Renderer
    ({
        nthreads:           s.nWorkers,
        width:              s.nImgSize,
        height:             s.nImgSize,
        cellsize:           s.nCellSize,
        aarays:             s.nAARays,
        GI:                 s.fGI,
        scenename:          s.tSceneName,
        numphotons:         1e5,
        onarearendering:    HighlightArea,
        onarearendered:     CopyImageData,
        oncompleted:        OnImageRendered
    })

    r.Run()
}

function HighlightArea(area)
{
    /*
    var context = $('canvas').getContext('2d')
    context.fillStyle = 'rgba(0,0,0,0.5)'
    context.fillRect(area.xmin, area.ymin, area.xmax - area.xmin + 1, area.ymax - area.ymin + 1)
    */
}

function CopyImageData(area, rgba)
{
    var areawidth   = area.xmax - area.xmin + 1
    var areaheight  = area.ymax - area.ymin + 1

    var context = $('canvas').getContext('2d')
    var image = context.getImageData(area.xmin, area.ymin, areawidth, areaheight)
    var imgdata = image.data

    for (var i = 0; i < 4 * areawidth * areaheight; i++)
        imgdata[i] = rgba[i]

    context.putImageData(image, area.xmin, area.ymin)
}

function OnImageRendered(args)
{
    Enable()

    console.log(GetUIChoosenSettings().tSceneName,
    {
        RPS:        Math.floor(1000 * args.totalrays / args.duration),
        Rays:       args.totalrays,
        Duration:   args.duration
    })
}