import { BrowserRouter, Routes, Route } from "react-router-dom";

import Header from './Header';
import SignUp from './auth/SignUp';
import Login from './auth/Login';
import Home from './Home';
import Landing from './Landing';
import StudyNewWizard from './study/study-new/StudyNewWizard';
import Study from './study/Study';
import PasswordReset from "./auth/PasswordReset";
import StudyResponseWizard from "./study/study-response/StudyResponseWizard";
import StudyResponse from "./study/study-response/StudyResponse";
import DiscussionBoard from "./discussion-board/DiscussionBoard";
import DiscussionBoardLanding from "./discussion-board/DiscussionBoardLanding";
import StudyDashboard from "./study/study-dashboard/StudyDashboard";
import ParticipantInitialConfig from "./auth/ParticipantInitialConfig";
import LLMRELanding from "./llmRE/Landing";
import LLMRECreate from './llmRE/CreateNewEvaluation';
import LLMResponseEvaluation from "./llmRE/LLMResponseEvaluation";
import READONLY_LLMResponseEvaluation from "./llmRE/READONLY_LLMResponseEvaluation";
import EditExistingEvaluation from "./llmRE/EditExistingEvaluation";
import TaskDiscussion from "./study/study-dashboard/TaskDiscussions";
import ReactGA from 'react-ga4';

//Prod
//const TRACKING_ID = "G-ZLWS6D2W1K"

//Demo
//const TRACKING_ID = "G-5SG34LECRC"

//Dev
const TRACKING_ID = "G-7SV9ZZKV16"

import { useFetchUserQuery } from '../store';

import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../static/custom.css';
import AdminPasswordReset from "./auth/AdminPasswordReset";
import ParticipantDashboard from "./participant-dashboard/ParticipantDashboard";
import CreateNewConsent from "./consent/CreateNewConsent";
import AssignNewParticipantsConsent from "./consent/AssignNewParticipantsConsent";
import AssignNewParticipants from "./study/study-dashboard/AssignNewParticipants";
import UnassignParticipants from "./study/study-dashboard/UnassignParticipants";
import ViewConsentStatusTable from "./consent/ViewConsentStatusTable";

import ProtectedRoute from "./ProtectedRoute";



const App = () => {

    ReactGA.initialize(TRACKING_ID);

    const { data: user } = useFetchUserQuery();


    return (
        <div className='container-fluid'>
            <BrowserRouter>
                <Header user={user} />

                <Routes>
                    <Route path='/' element={<Landing />} />
                    <Route path='/home' element={
                        <ProtectedRoute>
                            <Home />
                        </ProtectedRoute>

                    } />
                    <Route path='/login' element={<Login />} />
                    <Route path='/participant-config' element={
                        <ProtectedRoute>
                            <ParticipantInitialConfig user={user} />
                        </ProtectedRoute>
                    } />
                    <Route path="/signup" element={<SignUp />} />
                    <Route path="/study/:studyId" element={
                        <ProtectedRoute>
                            <Study user={user} />

                        </ProtectedRoute>
                    } />
                    <Route path='/study/new' element={
                        <ProtectedRoute>
                            <StudyNewWizard />
                        </ProtectedRoute>


                    } />
                    <Route path='/study/dashboard/:studyId' element={
                        <ProtectedRoute>
                            <StudyDashboard />
                        </ProtectedRoute>

                    } />
                    <Route path='/study-dashboard/task-discussions/:studyId' element={
                        <ProtectedRoute>
                            <TaskDiscussion />
                        </ProtectedRoute>

                    } />
                    <Route path='/study-dashboard/assign-participants/:studyId' element={
                        <ProtectedRoute>
                            <AssignNewParticipants />
                        </ProtectedRoute>

                    } />
                    <Route path='/study-dashboard/unassign-participants/:studyId' element={
                        <ProtectedRoute>
                            <UnassignParticipants />
                        </ProtectedRoute>

                    } />
                    <Route path='/study-dashboard/consent-table' element={
                        <ProtectedRoute>
                            <ViewConsentStatusTable />
                        </ProtectedRoute>

                    } />

                    <Route path='/study/response/:studyId' element={
                        <ProtectedRoute>
                            <StudyResponseWizard user={user} />

                        </ProtectedRoute>
                    } />
                    <Route path='/study/response/task/:taskId' element={
                        <ProtectedRoute>
                            <StudyResponse user={user} />
                        </ProtectedRoute>

                    } />
                    <Route path='/password_reset' element={<PasswordReset />} />
                    <Route path='/discussion/:taskId' element={
                        <ProtectedRoute>
                            <DiscussionBoard />
                        </ProtectedRoute>

                    } />
                    <Route path='/discussion/landing/:studyId' element={
                        <ProtectedRoute>
                            <DiscussionBoardLanding />
                        </ProtectedRoute>
                    } />
                    <Route path='/admin/password-reset' element={<AdminPasswordReset />} />
                    <Route path='/llm-response-evaluation' element={
                        <ProtectedRoute>
                            <LLMRELanding
                                currentUserRole={user?.role}
                                currentUserFirst={user?.firstName}
                                currentUserLast={user?.lastName}
                                currentUserUsername={user?.username}
                            />
                        </ProtectedRoute>

                    } />
                    <Route path='/llm-response-evaluation/create' element={
                        <ProtectedRoute>
                            <LLMRECreate />
                        </ProtectedRoute>

                    } />
                    <Route path="/llm-response-evaluation/:evaluationId" element={
                        <ProtectedRoute>
                            <LLMResponseEvaluation />
                        </ProtectedRoute>

                    } />
                    <Route path="/llm-response-evaluation/:evaluationId/edit" element={
                        <ProtectedRoute>
                            <EditExistingEvaluation />
                        </ProtectedRoute>
                    } />
                    <Route
                        path="/llm-response-evaluation/readonly/:evaluationId/:responseId"
                        element={
                            <ProtectedRoute>
                                <READONLY_LLMResponseEvaluation />

                            </ProtectedRoute>
                        }
                    />
                    <Route path="/participant-dashboard" element={
                        <ProtectedRoute>
                            <ParticipantDashboard />
                        </ProtectedRoute>
                    } />
                    <Route path="/consent/new" element={
                        <ProtectedRoute>
                            <CreateNewConsent />
                        </ProtectedRoute>
                    } />
                    <Route path="/consent/assign-participant" element={
                        <ProtectedRoute>
                            <AssignNewParticipantsConsent />
                        </ProtectedRoute>

                    } />
                </Routes>
            </BrowserRouter>
        </div>
    );
};

export default App;
