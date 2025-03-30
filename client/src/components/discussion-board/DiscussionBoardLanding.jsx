import { useParams, useNavigate } from "react-router-dom";
import { Spinner } from "reactstrap";
import { useFetchStudyTasksQuery } from "../../store";
import StudyCard from "../tools/StudyCard";

const DiscussionBoardLanding = () => {
    const navigate = useNavigate();
    const { studyId } = useParams();
    const { data: tasks, isLoading: isLoadingStudyTasks, error: errorStudyTasks } = useFetchStudyTasksQuery(studyId);

    if (isLoadingStudyTasks) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
                <Spinner color="primary" />
            </div>
        );
    }

    if (errorStudyTasks) {
        return <div>Error: {errorStudyTasks?.data.error}</div>;
    }

    const renderTaskContent = (link) => {

        return (
            <div className="card-footer w-100">
                <button
                    className="btn btn-secondary text-decoration-none text-white w-100"
                    onClick={() => navigate(link)}
                >
                    Open Discussion
                </button>
            </div>
        );
    };

    return (
        <div className="container py-2 px-5 text-start">
            <h3 className="text-center mb-5">Task Discussions</h3>
            <div className="row">
                {tasks.map((task, index) => {
                    const discussionLink = `/discussion/${task._id}`;
                    return (
                        <StudyCard
                            key={index}
                            cardIndex={index}
                            cardName={task.name ?? task.study.name}
                            cardDescription={task.instructions}
                            content={renderTaskContent(discussionLink)}
                        />
                    )
                })}
            </div>

        </div>
    );

};

export default DiscussionBoardLanding;