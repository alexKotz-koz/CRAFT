import { useFetchAllEvaluationsQuery, useFetchAllStudiesQuery, useFetchAllUsersQuery } from "../../store";
import { Spinner } from "reactstrap";
import { useState } from "react";

const ParticipantDashboard = () => {
    const { data: allUsers, isLoading: isLoadingAllUsers, error: errorAllUsers } = useFetchAllUsersQuery();
    const { data: allStudies, isLoading: isLoadingAllStudies, error: errorAllStudies } = useFetchAllStudiesQuery();
    const { data: allEvaluations, isLoading: isLoadingAllEvaluations, error: errorAllEvaluations } = useFetchAllEvaluationsQuery();

    const [openAccordion, setOpenAccordion] = useState({ '0': false, '1': false });

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
    const toggleAccordion = (id) => {
        setOpenAccordion(prev => ({
            ...prev,
            [id]: !prev[id]
        }));
    };

    console.log(allUsers)
    // console.log(allStudies)
    // console.log(allEvaluations)



    const userStats = {};
    if (allUsers && allEvaluations && allStudies) {
        allUsers.forEach(user => {
            let assignedLLMREs = [];
            if (user.role === "participant") {
                const llmreCount = allEvaluations.reduce((llmRECount, evaluation) => {
                    if (evaluation.participants?.some(
                        p => p.username === user.username || p.email === user.email
                    )) {
                        assignedLLMREs.push(evaluation?.index)
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
                    assignedLLMREs,
                    studyTaskCount
                }
            }
        });
    };
const sortedParticipants = allUsers
    .filter(user => user.role === "participant")
    .slice()
    .sort((a, b) => {
        // Handle missing cohorts
        if (!a.cohort) return 1;
        if (!b.cohort) return -1;

        // Try to parse cohort as number
        const numA = Number(a.cohort);
        const numB = Number(b.cohort);

        // If both are valid numbers, sort numerically
        if (!isNaN(numA) && !isNaN(numB)) {
            return numA - numB;
        }
        // Otherwise, sort as strings
        return a.cohort.localeCompare(b.cohort);
    });

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
            <div className="accordion mb-3" id="llmreAccordion">
                <div className="accordion-item mt-2">
                    <h2 className="accordion-header">
                        <button
                            className={`accordion-button ${!openAccordion['0'] && 'collapsed'}`}
                            type="button"
                            onClick={() => toggleAccordion('0')}
                        >
                            LLM Response Evaluation Index Map
                        </button>
                    </h2>
                    <div className={`accordion-collapse collapse ${openAccordion['0'] ? 'show' : ''}`}>
                        <div className="accordion-body">
                            <div className="row">
                                <table className="table table-striped d-none d-md-table">
                                    <thead>
                                        <tr>
                                            <th scope="col">Index ID</th>
                                            <th scope="col">Title</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {allEvaluations?.map(evaluation => (
                                            <tr key={evaluation._id}>
                                                <td>{evaluation.index}</td>
                                                <td>{evaluation.title}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="accordion-item mt-2">
                    <h2 className="accordion-header">
                        <button
                            className={`accordion-button ${!openAccordion['1'] && 'collapsed'}`}
                            type="button"
                            onClick={() => toggleAccordion('1')}
                        >
                            Participant Assignments
                        </button>
                    </h2>
                    <div className={`accordion-collapse collapse ${openAccordion['1'] ? 'show' : ''}`}>
                        <div className="accordion-body border border-dark-subtle rounded">
                            <div className="row">
                                <table className="table table-striped d-none d-md-table">
                                    <thead>
                                        <tr>
                                            <th scope="col">#</th>
                                            <th scope="col">Cohort</th>
                                            <th scope="col">Username</th>
                                            <th scope="col">Email</th>
                                            <th scope="col">Role</th>
                                            <th scope="col"># of Assigned LLM Response Evaluations</th>
                                            <th scope="col">Assigned LLM Response Evaluations</th>
                                            <th scope="col"># of Assigned Study Tasks</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {sortedParticipants.map((user, index) =>
                                            user.role === "participant" &&
                                            (
                                                <tr key={user._id}>
                                                    <td>{index}</td>
                                                    <td>{user.cohort}</td>
                                                    <td>{user.username}</td>
                                                    <td>{user.email}</td>
                                                    <td>{user.jobRole ?? 'N/A'}</td>
                                                    <td>{userStats[user._id]?.llmreCount ?? 0}</td>
                                                    <td>
                                                        {(userStats[user._id]?.assignedLLMREs
                                                            ?.slice()
                                                            .sort((a, b) => a - b)
                                                            .join(", ")) ?? ""}
                                                    </td>
                                                    <td>{userStats[user._id]?.studyTaskCount ?? 0}</td>
                                                </tr>
                                            ))}
                                    </tbody>
                                </table>
                            </div>

                        </div>

                    </div>

                </div>
            </div>
        </div>
    );
};

export default ParticipantDashboard;