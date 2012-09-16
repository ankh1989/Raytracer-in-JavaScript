function ray(args)
{
    this.power = args.power
    this.from = args.from

    if (args.dir)
        this.dir = args.dir
    else if (args.to)
        this.dir = vec.norm(vec.sub(args.to, args.from))
}