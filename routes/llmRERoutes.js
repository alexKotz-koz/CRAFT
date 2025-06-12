const mongoose = require('mongoose');
const { LLMResponseEvaluation, FullLLMResponseEvaluation, SectionsLLMResponseEvaluation } = require('../models/LLMResponseEvaluation');
const { LLMResponseEvaluationResponse } = require('../models/LLMResponseEvaluationResponse');

const requireLogin = require('../middlewares/requireLogin');
const requireFacilitatorPermissions = require('../middlewares/requireFacilitatorPermissions');

module.exports = (app) => {
    app.post('/api/llm-response-evaluation/create', requireFacilitatorPermissions, requireLogin, async (req, res) => {

        ////REMOVE: For reuse (participants)
        const { title, instructions, llmOutput, rubricItems, participants } = req.body;

        //REMOVE: For reuse (participants)
        try {
            let evaluation;
            if (Array.isArray(llmOutput)) {
                evaluation = new SectionsLLMResponseEvaluation({
                    user: req.user._id,
                    title,
                    instructions,
                    llmOutput,
                    rubricItems,
                    participants
                });
            } else if (typeof llmOutput === "string") {
                evaluation = new FullLLMResponseEvaluation({
                    user: req.user._id,
                    title,
                    instructions,
                    llmOutput,
                    rubricItems,
                    participants
                });
            } else {
                return res.status(400).send("Invalid llmOutput type");
            }

            await evaluation.save();
            res.status(201).json(evaluation);
        } catch (error) {
            console.error("Error creating evaluation: ", error);
            res.status(500).send("Internal Server Error");
        }
    });

    app.get('/api/llm-response-evaluation/all', async (req, res) => {
        try {
            const allLLMREs = await LLMResponseEvaluation.find();
            res.send(allLLMREs);
        } catch (err) {
            return res.status(500).send("Internal Server Error");
        }
    });

    app.get('/api/llm-response-evaluation/:evaluationId', requireLogin, async (req, res) => {
        const { evaluationId } = req.params;
        try {
            const llmre = await LLMResponseEvaluation.findById(evaluationId);
            res.send(llmre);

        } catch (err) {
            console.error("Error fetching LLM Response Evaluation:", err);
            res.status(422).send(err);
        }
    });

    app.post('/api/llm-response-evaluation/:evaluationId/response', requireLogin, async (req, res) => {
        const { evaluationId } = req.params;
        const userId = req.user._id;
        const { responses } = req.body;

        try {
            // Upsert: update if exists, otherwise create new
            const responseDoc = await LLMResponseEvaluationResponse.findOneAndUpdate(
                { evaluationId, userId },
                { $set: { responses, createdAt: new Date() } },
                { new: true, upsert: true }
            );
            res.status(200).json(responseDoc);
        } catch (err) {
            console.error("Error saving LLM Response Evaluation Response:", err);
            res.status(500).send("Internal Server Error");
        }
    });

    app.get('/api/llm-response-evaluation/:evaluationId/response/me', requireLogin, async (req, res) => {
        const { evaluationId } = req.params;
        const userId = req.user._id;
        try {
            const response = await LLMResponseEvaluationResponse.findOne({ evaluationId, userId });
            if (!response) return res.status(200).send(null);
            res.json(response);
        } catch (err) {
            console.error("Error fetching user response:", err);
            res.status(500).send("Internal Server Error");
        }
    });

};