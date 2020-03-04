const stream = require('stream')

module.exports = function nanikaify(transform, condition)
{
    return function(filename, opts) {
        opts = Object.assign({_flags: {}}, opts)

        if (typeof condition === 'string' && !filename.endsWith(condition))
            return new stream.PassThrough()
        if (typeof condition === 'function' && !condition(filename, opts))
            return new stream.PassThrough()

        const buffers = []

        return new stream.Transform({
            transform(chunk, _, done)
            {
                buffers.push(chunk)
                done()
            },

            flush(done)
            {
                new Promise(resolve => {
                    const src = Buffer.concat(buffers).toString()
                    resolve(transform.call(this, filename, opts, src, done))
                })
                .then(ret => {
                    if (ret)
                        done(null, ret.code || ret)
                })
                .catch(done)
            },
        })
    }
}
