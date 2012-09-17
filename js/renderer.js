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
    loadDependencies()
    ReadRenderSettings(event.data)
    render()
}

// Loads scripts that are needed by the renderer.
function loadDependencies()
{
    importScripts(
        'obj/object.js',
        'obj/group.js',
        'obj/cubecyl.js',
        'obj/cylinder.js',
        'obj/plane.js',
        'obj/sphere.js',
        'obj/isosurf.js',
        'obj/dodecahedron.js',
        'obj/sphereflake.js',
        'ray.js',
        'm3x3.js',
        'debug.js',
        'raytracer.js',
        'math.js',
        'scene.js',
        'vector.js',
        'material.js',
        'texture.js',
        'camera.js',
        'factory.js',
        'screen.js')
}

function ReadRenderSettings(data)
{
    data.scene.objects = factory.deserialize(data.scene.objects)

    self.area = data.area

    self.screen = new screen
    ({
        width:      data.screen.width,
        height:     data.screen.height,
        aarays:     data.settings.aarays,
        raytracer:  new raytracer({scene:data.scene})
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
