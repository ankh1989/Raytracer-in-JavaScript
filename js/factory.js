// The purpose of this factory is to workaround
// the problem of losing object methods when
// transferring these objects from the main thread
// to a worker thread. When the main thread sends
// an object to a worker thread, the object is serialized
// to a JSON string and then deserialized by the
// worker thread. This method of transferring implies, that
// no object methods will be transferred.
//
// The workaround is to kee inside each object a field
// called "settings" that contain all the information needed
// to create a copy of the object. When the factory creates
// an object, it attaches to the object the "settings" field
// and when the object is deserialized on a worker thread,
// the latter extracts the "settings" field and creates
// a copy of the object.

var factory = {}

factory.create = function()
{
    var $ = arguments
    var name = $[0]
    var obj

    if (name == 'sphere')
        obj = new sphere($[1], $[2], $[3], $[4])
    else if (name == 'cubecyl')
        obj = new cubecyl($[1])
    else if (name == 'cylinder')
        obj = new cylinder($[1], $[2], $[3], $[4], $[5])
    else if (name == 'plane')
        obj = new plane($[1], $[2], $[3], $[4])
    else if (name == 'axisplane')
        obj = new axisplane($[1], $[2], $[3], $[4])
    else if (name == 'sphere')
        obj = new sphere($[1], $[2], $[3], $[4])
    else if (name == 'texture.checker')
        obj = new texture.checker($[1])
    else
        throw name + ' is an unknown object name: ' + $.length

    obj.settings = []

    for (var i = 0; i < $.length; i++)
        obj.settings[i] = $[i]

    return obj
}