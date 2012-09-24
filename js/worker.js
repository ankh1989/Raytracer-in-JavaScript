// This script is run as a worker thread.
//
// 1. It receives a message with the string representation of a function.
// 2. It compiles this function and executes it.
// 3. The value returned by the function is sent back to the main thread.

onmessage = function(event)
{
    var t0 = (new Date()).getTime()

    importScripts('scriptloader.js')
    LoadScripts(importScripts)

    var f = eval('(' + event.data.func + ')')
    var r = f.apply(null, event.data.args)

    var t1 = (new Date()).getTime()

    postMessage
    ({
        result:     r,
        start:      t0,
        finish:     t1,
        duration:   t1 - t0
    })
}