module.exports = (req, res, next) => {
    if(req.user.role !== 'facilitator' && req.user.role !== 'admin') {
        return res.status(401).json({ error: 'You must be a facilitator or administrator to use this feature'});
    }

    next();
};