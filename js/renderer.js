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
        'debug.js',
        'raytracer.js',
        'math.js',
        'scene.js',
        'vector.js',
        'cubecyl.js',
        'cylinder.js',
        'plane.js',
        'sphere.js',
        'material.js',
        'texture.js',
        'camera.js',
        'factory.js',
        'screen.js')
}

function ReadRenderSettings(data)
{
    recreateObjects(data.scene.objects)

    self.area = data.area

    self.screen = new screen
    ({
        width:      data.screen.width,
        height:     data.screen.height,
        aarays:     data.settings.aarays,
        raytracer:  new raytracer({scene:data.scene})
    })
}

// During transferring of objects from the main thread to
// the renderer thread, only simple fields are copied and
// thus objects lose functions stored in their "prototype"
// field.
function recreateObjects(objects)
{
    for (var i in objects)
        if (i != 'settings' && objects[i].settings)
        {
            objects[i] = factory.create.apply(null, objects[i].settings)
            if (typeof objects[i] == 'object')
                recreateObjects(objects[i])
        }
}

// Renders the area and passes results to the main thread.
function render()
{
    var rgba = self.screen.renderarea(
        [self.area.xmin, self.area.xmax],
        [self.area.ymin, self.area.ymax])

    postMessage({rgba:rgba})
}
