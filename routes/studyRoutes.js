const mongoose = require('mongoose');
const Study = mongoose.model('study');

const requireLogin = require('../middlewares/requireLogin');


module.exports  = (app) => {
    app.post('/api/study/new', requireLogin, async(req, res) => {

        const {name, instructions, description, participants, prompts} = req.body;

        const existingStudy = await Study.findOne({
            name
        });
        if (existingStudy) {
            return res.status(409).send("Study with that name already exists, please select a different study name.")
        }

        const study = new Study({
            name,
            instructions,
            description,
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

    app.get('/api/study/my_studies', requireLogin, async(req, res) => {
        const studies = await Study.find({ _user: req.user.id });

        res.send(studies)

    });
};
