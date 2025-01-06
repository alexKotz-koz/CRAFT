const mongoose = require('mongoose');
const Study = mongoose.model('study');

const requireLogin = require('../middlewares/requireLogin');


module.exports  = (app) => {
    app.post('/api/study/new', requireLogin, async(req, res) => {

        const {name, instructions, participants, prompts} = req.body;

        const study = new Study({
            name,
            instructions,
            participants,
            prompts,
            _user: req.user.id,
            dateCreated: Date.now(),
            dateModified: Date.now(),
        });

        try {
            await study.save();
            res.send(study);
        } catch (err) {
            res.status(422).send(err);
        }
    });
};
