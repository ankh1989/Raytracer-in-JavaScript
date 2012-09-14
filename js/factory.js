// The purpose of this factory is to workaround
// the problem of losing object methods when
// transferring these objects from the main thread
// to a worker thread. When the main thread sends
// an object to a worker thread, the object is serialized
// to a JSON string and then deserialized by the
// worker thread. This method of transferring implies, that
// no object methods will be transferred.

var factory = {}

factory.global = function(){return this}()

factory.create = function(settings)
{
    var ctor = factory.global[settings.name]
    if (!ctor) throw settings.name + " is not a ctor"
    return new ctor(settings)
}

factory.deserialize = function(obj)
{
    if (typeof obj != 'object')
        return obj

    if (obj.name)
        obj = factory.create(obj)

    for (var i in obj)
        obj[i] = factory.deserialize(obj[i])


    return obj    
}