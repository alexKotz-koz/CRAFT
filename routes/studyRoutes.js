const mongoose = require('mongoose');
const Study = mongoose.model('study');
const StudyResponse = mongoose.model('StudyResponse');

const requireLogin = require('../middlewares/requireLogin');


module.exports = (app) => {
    app.post('/api/study/new', requireLogin, async (req, res) => {

        const { name, instructions, description, participants, prompts } = req.body;

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

    app.post('/api/study/response', requireLogin, async (req, res) => {
        
        const { studyId, responses, participant, dateCreated} = req.body;

        const studyResponse = new StudyResponse({
            study: studyId,
            responses,
            participant,
            dateCreated
        });

        try {
            await studyResponse.save();

            // Update the Study document to add the response
            await Study.findByIdAndUpdate(studyId, { $push: { responses: studyResponse._id } });

            // Update the StudyParticipant.responded value to true
            await Study.findOneAndUpdate(
                { _id: studyId, 'participants.email': req.user.email },
                { $set: { 'participants.$.responded': true } }
            );

            res.send(studyResponse);
        } catch (err) {
            res.status(422).send(err);
        }
    });

    app.get('/api/study/my_studies', requireLogin, async (req, res) => {
        let studies;
        switch (req.user.role) {
            case 'facilitator':
            case 'admin': 
                studies = await Study.find({ _user: req.user.id });
                break;
            case 'participant':
                studies = await Study.find({ 'participants.email': req.user.email });
                break;
            default:
                return res.status(400).send("Invalid user role");
        }

        res.send(studies)

    });
    app.get('/api/study/:studyId', requireLogin, async (req, res) => {
        const {studyId} = req.params;
        try{
            const study = await Study.findById(studyId);
            if (!study) {
                return res.status(404).send("Study not found");
            }
            res.send(study);
        } catch (err) {
            res.status(422).send(err);
        }
    })
};
