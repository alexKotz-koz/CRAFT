import { useParams } from "react-router-dom";

import { useFetchStudyTasksQuery } from "../../store";
import ButtonLink from "../tools/ButtonLink";

const DiscussionBoardLanding = ({ user }) => {

    const { studyId } = useParams();
    const { data: tasks, isLoading: isLoadingStudyTasks, error: errorStudyTasks } = useFetchStudyTasksQuery(studyId);


    if (isLoadingStudyTasks) {
        return <div>Loading...</div>;
    }

    if (errorStudyTasks) {
        return <div>Error: {errorStudyTasks?.data.error}</div>;
    }


    return (
        <div className="container text-start">
            <h3 className="text-center mb-5">Task Discussions</h3>
            <div className="row">
                {tasks.map((task, index) => {
                    const discussionLink = `/discussion/${task._id}`;
                    return (
                        <div key={index} className="col-12 col-md-6 col-lg-4 col-xl-3 mb-4">
                            <div className="card h-100">
                                <div className="card-body d-flex flex-column">
                                    <h5 className="card-header mb-3">
                                        {task.name ? task.name : task.study.name }
                                    </h5>
                                    <p className="card-text description">
                                        {task.instructions}
                                    </p>
                                    <div className="card-footer">
                                        <ButtonLink to={discussionLink} additionalClasses="btn-secondary w-100" text='Open Discussion' />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>

        </div>
    );

};

export default DiscussionBoardLanding;