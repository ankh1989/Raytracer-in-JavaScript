function worker(args)
{
    this.func = args.func
    this.args = args.args
    this.oncompleted = args.oncompleted
    this.multithreading = true
}

worker.prototype.run = function()
{
    if (!this.multithreading)
        return this.oncompleted
        ({
            worker: this,
            result: this.func.apply(null, this.args)
        })

    var w = this
    var t = new Worker('js/worker.js')

    t.onmessage = function(event)
    {
        event.data.worker = w
        w.oncompleted(event.data)
    }

    t.postMessage
    ({
        func: this.func + '',
        args: this.args
    })
}

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
        result: r,
        duration: t1 - t0
    })

    close()
}