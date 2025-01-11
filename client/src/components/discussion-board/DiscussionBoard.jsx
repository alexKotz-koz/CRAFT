import { useFetchInitialResponsesQuery } from "../../store";
import { useParams } from "react-router-dom";

const DiscussionBoard = () => {
    const { studyId } = useParams();
    const { data: responses, error, isLoading } = useFetchInitialResponsesQuery(studyId);
    console.log("discussion responses: ", responses);
    return (
        <div className="container">

        </div>
    );
};

export default DiscussionBoard;