import { useParams } from "react-router-dom";
import { useFetchStudyCommentsQuery, useFetchStudyQuery, useFetchSubCommentsQuery } from "../../../store";
import SimplePieChart from "./SimplePieChart";
import TimeLinePlot from "./TimeLinePlot";

const StudyDashboard = () => {

    const { studyId } = useParams();
    const { data: study, error: errorStudy, isLoading: isLoadingStudy } = useFetchStudyQuery(studyId);
    const { data: comments, error: errorComments, isLoading: isLoadingComments } = useFetchStudyCommentsQuery(studyId);

    const studyDiscussionLink = `/discussion/${studyId}`

    console.log("study", study)
    console.log("comments", comments)

    if (isLoadingStudy) {
        return <div>Loading...</div>;
    }

    if (errorStudy) {
        console.log("Error: ", errorStudy)
        return <div>Error: {errorStudy.data}</div>;
    }


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


    return (
        <div className="container-fluid">
            <h3 className="text-center mb-4">Study Statistics</h3>
            
            <div className="row">
                <SimplePieChart data={respondedData} title="Responded" />
                <TimeLinePlot data={aggregatedCommentData} title="Comments" lineDataKey="count" />

            </div>
        </div>
    );
};

export default StudyDashboard;