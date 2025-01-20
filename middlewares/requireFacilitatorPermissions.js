module.exports = (req, res, next) => {
    if(req.user.role !== 'facilitator') {
        return res.status(401).json({ error: 'You must be a facilitator to use this feature'});
    }

    next();
};