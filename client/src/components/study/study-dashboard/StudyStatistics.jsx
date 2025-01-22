import { useParams } from "react-router-dom";
import { useFetchStudyQuery, useFetchSubCommentsQuery } from "../../../store";
import SimplePieChart from "./SimplePieChart";
import { ResponsiveContainer, Tooltip, Legend, LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts';


const StudyStatistics = () => {

    const { studyId } = useParams();
    const { data: study, error: errorStudy, isLoading: isLoadingStudy } = useFetchStudyQuery(studyId);
    //const { data: comments, error: errorComments, isLoading: isLoadingComments } = useFetchSubCommentsQuery()

    const studyDiscussionLink = `/discussion/${studyId}`

    console.log(study)

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
        response.responses.forEach(subResponse => {
            if (subResponse.comments.length > 0) {
                subResponse.comments.forEach(comment => {
                    console.log("comment ", comment)
                    const commentDate = new Date(comment.dateCreated);
                    const year = commentDate.getFullYear();
                    const month = commentDate.getMonth() + 1; // Months are zero-indexed
                    const day = commentDate.getDate();
                    const hour = commentDate.getHours();

                    // Create a new date object in the desired format
                    const formattedDate = `${year}-${month}-${day} ${hour}:00`;

                    // Add to commentData array
                    commentData.push({ date: formattedDate, count: 1 });
                });
            }
        });
    });

    // Aggregate comment counts by date
    const aggregatedCommentData = commentData.reduce((acc, curr) => {
        const existing = acc.find(item => item.date === curr.date);
        if (existing) {
            existing.count += 1;
        } else {
            acc.push(curr);
        }
        return acc;
    }, []);

    // Sort the aggregated data by date in ascending order
    aggregatedCommentData.sort((a, b) => new Date(a.date) - new Date(b.date));


    // Function to format the date labels
    const formatXAxis = (tickItem) => {
        const date = new Date(tickItem);
        return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()} ${date.getHours()}:00`;
    };

    return (
        <div className="container">
            <h3 className="text-center mb-4">Study Statistics</h3>
            <div className="row">
                <SimplePieChart data={respondedData} title="Responded" />
                <div className="col-8">
                    <h5 className="text-center">Comments</h5>
                    <ResponsiveContainer width="100%" height={400}>
                        <LineChart
                            data={aggregatedCommentData}
                            margin={{ top: 5, right: 30, left: 20, bottom: 100 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" tickFormatter={formatXAxis} angle={-45} textAnchor="end" />
                            <YAxis />
                            <Tooltip />
                            <Legend layout="vertical" align="right" verticalAlign="middle" />
                            <Line type="monotone" dataKey="count" stroke="#0088FE" activeDot={{ r: 8 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default StudyStatistics;