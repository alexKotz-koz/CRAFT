import { useFetchAllEvaluationsQuery, useFetchAllStudiesQuery, useFetchAllUsersQuery } from "../../store";
import { Spinner } from "reactstrap";

const ParticipantDashboard = () => {
    const { data: allUsers, isLoading: isLoadingAllUsers, error: errorAllUsers } = useFetchAllUsersQuery();
    const { data: allStudies, isLoading: isLoadingAllStudies, error: errorAllStudies } = useFetchAllStudiesQuery();
    const { data: allEvaluations, isLoading: isLoadingAllEvaluations, error: errorAllEvaluations } = useFetchAllEvaluationsQuery();

    if (isLoadingAllUsers || isLoadingAllStudies || isLoadingAllEvaluations) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
                <Spinner color="primary" />
            </div>
        );
    }

    if (errorAllUsers || errorAllStudies || errorAllEvaluations) {
        return <div>Error: {errorAllEvaluations?.data || errorAllStudies?.data || errorAllUsers?.data}</div>;
    }

    // console.log(allUsers)
    // console.log(allStudies)
    // console.log(allEvaluations)


    const userStats = {};
    if (allUsers && allEvaluations && allStudies) {
        allUsers.forEach(user => {
            if (user.role === "participant") {
                const llmreCount = allEvaluations.reduce((llmRECount, evaluation) => {
                    if (evaluation.participants?.some(
                        p => p.username === user.username || p.email === user.email
                    )) {
                        return llmRECount + 1;
                    }
                    return llmRECount;
                }, 0);
                const studyTaskCount = allStudies.reduce((totalTaskCount, study) => {
                    if (!study.tasks) return totalTaskCount;
                    return totalTaskCount + study.tasks.reduce((taskCount, task) => {
                        if (task.participants?.some(
                            p => p.username === user.username || p.email === user.email
                        )) {
                            return taskCount + 1;
                        }
                        return taskCount;
                    }, 0);
                }, 0);
                userStats[user._id] = {
                    llmreCount,
                    studyTaskCount
                }
            }
        });
    }

    return (
        <div className="container ">
            {/* Future: Add links to participant password reset, LLMRE assignment, and Study/Task assignment
             <div className="row">
                <div className="col-4">
                    <div className="card border border-dark rounded">
                        <div className="card-body d-flex flex-column">
                            <h5 className="card-title mb-2">
                                Reset Participant Password
                            </h5>
                        </div>
                    </div>
                </div>

            </div> */}
            <div className="row mt-2">
                <div className="border border-dark-subtle rounded">
                    <table className="table table-striped d-none d-md-table">
                        <thead>
                            <tr>
                                <th scope="col">ID</th>
                                <th scope="col">Username</th>
                                <th scope="col">Email</th>
                                <th scope="col"># of Assigned LLM Response Evaluations</th>
                                <th scope="col"># of Assigned Study Tasks</th>
                            </tr>
                        </thead>
                        <tbody>
                            {allUsers.map((user, index) =>
                                user.role === "participant" &&
                                (
                                    <tr key={user._id}>
                                        <td>{index}</td>
                                        <td>{user.username}</td>
                                        <td>{user.email}</td>
                                        <td>{userStats[user._id]?.llmreCount ?? 0}</td>
                                        <td>{userStats[user._id]?.studyTaskCount ?? 0}</td>
                                    </tr>
                                ))}
                        </tbody>
                    </table>
                </div>

            </div>
            {/* Desktop Table */}

        </div>
    );
};

export default ParticipantDashboard;