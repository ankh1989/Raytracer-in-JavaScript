// The purpose of this factory is to workaround
// the problem of losing object methods when
// transferring these objects from the main thread
// to a worker thread. When the main thread sends
// an object to a worker thread, the object is serialized
// to a JSON string and then deserialized by the
// worker thread. This method of transferring implies, that
// no object methods will be transferred.

var factory = {}

factory.globals = function(){return this}()

factory.constructors = []

factory.create = function(settings)
{
    var ctor = factory.constructors[settings.name]
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

factory.register = function(name, ctor)
{
    if (factory.constructors[name])
        throw "the ctor is already registered"
    factory.constructors[name] = ctor
}

factory.register('axisplane',           axisplane)
factory.register('plane',               plane)
factory.register('sphere',              sphere)
factory.register('cube',                cube)
factory.register('cylinder',            cylinder)
factory.register('isosurf',             isosurf)

factory.register('material',            material)
factory.register('checker',             textures.checker)
factory.register('lines',               textures.lines)

factory.register('object',              object)
factory.register('cubecyl',             cubecyl)
factory.register('dodecahedron',        dodecahedron)
factory.register('sphereflake',         sphereflake)

factory.register('csg.union',           csg.union)
factory.register('csg.intersection',    csg.intersection)
factory.register('csg.complement',      csg.complement)
factory.register('csg.relcomplement',   csg.relcomplement)
