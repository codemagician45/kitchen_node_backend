exports.routeMethod = fn => async (req, res, next) => {
    try {
        const result = fn(req, res);
        if (result.constructor === Promise) {
            await result;
        }
    } catch (e) {
        next(e);
    }
};
