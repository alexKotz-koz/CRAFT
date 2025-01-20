import { useParams } from "react-router-dom";
import { useFetchStudyQuery } from "../../../store";
import SimplePieChart from "./SimplePieChart";
import { PieChart, Pie, Cell, Tooltip, Legend, LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts';


const StudyStatistics = () => {

    const { studyId } = useParams();
    const { data: study, error: errorStudy, isLoading: isLoadingStudy } = useFetchStudyQuery(studyId);

    const studyDiscussionLink = `/discussion/${studyId}`

    if (isLoadingStudy) {
        return <div>Loading...</div>;
    }

    if (errorStudy) {
        console.log("Error: ", errorStudy)
        return <div>Error: {errorStudy.data}</div>;
    }

    /**
     * Participants: {email, username, responded: bool}
     * Prompts: {_id, prompt}
     * Responses: {dateCreated, participant: id, responses: obj, study: id, _id}
     * **** responses: {comments: obj, downvotes, upvotes, prompt: id, response, voters: array id's}
     * **** ***** comments: {content, createdAt, dateCreated, downvotes, kind, response: id, updatedAt, upvotes, user: {_id, username}, voters: array ids, _id}
     */
    const { dateCreated, dateModified, description, instructions, name, participants, prompts, responses } = study;


    // Responded
    const respondedCount = participants.filter(p => p.responded).length;
    const notRespondedCount = participants.length - respondedCount;

    const respondedData = [
        { name: 'Responded', value: respondedCount },
        { name: 'Not Responded', value: notRespondedCount }
    ];

    // Comments over Time
    const commentData = [];
    responses.forEach(response => {
        responses.forEach(subResponse => {
            
        })
    })



    return (
        <div className="container">
            <h3 className="text-center mb-4">Study Statistics</h3>
            <div className="row">
                <SimplePieChart data={respondedData} title="Responded" />
                <div className="col-8">

                </div>
            </div>
        </div>
    );
};

export default StudyStatistics;