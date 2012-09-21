// This script is run as a worker thread.
//
// It renders a specific area on the screen
// and passes the rendered area to the main thread
// when done.

// The main thread sends only one message to the renderer
// thread. That message contains all information about
// the 3D scene, the camera and the area on the flat screen
// that need be rendered.
onmessage = function(event)
{
    LoadDependencies()
    ReadRenderSettings(event.data)
    render()
}

// Loads scripts that are needed by the renderer.
function LoadDependencies()
{
    importScripts('scriptloader.js')
    LoadScripts(importScripts)
}

function ReadRenderSettings(data)
{
    self.area = data.area

    var scene = scenes[data.scenename]()

    self.screen = new screen
    ({
        width:      data.screen.width,
        height:     data.screen.height,
        aarays:     data.settings.aarays,
        raytracer:  new raytracer({scene:scene})
    })
}

// Renders the area and passes results to the main thread.
function render()
{
    var rgba = self.screen.renderarea(
        [self.area.xmin, self.area.xmax],
        [self.area.ymin, self.area.ymax])

    postMessage({maxgrad:math.findroot.maxgrad})
    postMessage({rgba:rgba})
}
