const asyncHandler1 = (func) => async (req, res, next, error) => {
    try {
        await func(req, res, next, error);
    } catch (error) {
        res.status(400).json({ success: false, message: error.message })
    }


}

const asyncHandler = (func) => {
    return (req, res, next) => {
        Promise.resolve((func(req, res, next))).catch((error) => { next(error) })
    }
}



export { asyncHandler }