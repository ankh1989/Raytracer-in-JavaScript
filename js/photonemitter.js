// This script is run as a worker thread.
//
// It emits a number of photos from light sources
// and sends to the main thread the list of mapped
// photons.

onmessage = function(event)
{
    importScripts('scriptloader.js')
    LoadScripts(importScripts)

    var args = event.data
    var numphotons = args.numphotons
    var scenename = args.scenename

    var scene = scenes[scenename]()
    var rt = new raytracer({scene:scene})

    for (var i in rt.scene.lights)
    {
        var light = rt.scene.lights[i]
        if (!light.power) continue

        for (var n = 0; n < numphotons; n++)
        {
            var v = vec.randomdir()
            var r = new ray
            ({
                from:   light.at,
                dir:    v,
                power:  light.power/numphotons
            })
            rt.emit(r)
        }
    }

    postMessage({photons:rt.photons})
}