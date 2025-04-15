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




const App = () => {

    ReactGA.initialize(TRACKING_ID);

    const { data: user } = useFetchUserQuery();


  return (
    <div className='container-fluid'>
      <BrowserRouter>
      <Header user={user} />

      <Routes>
        <Route path='/' element={<Landing />} />
        <Route path='/home' element={<Home />} />
        <Route path='/login' element={<Login />} />
        <Route path='/participant-config' element={<ParticipantInitialConfig user={user}/>} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/study/:studyId" element={<Study user={user}  />} />
        <Route path='/study/new' element={<StudyNewWizard />} />
        <Route path='/study/dashboard/:studyId' element={<StudyDashboard />} />
        <Route path='/study/response/:studyId' element={<StudyResponseWizard user={user} />} />
        <Route path='/study/response/task/:taskId' element={<StudyResponse user={user} />} />
        <Route path='/password_reset' element={<PasswordReset />} />
        <Route path='/discussion/:taskId' element={<DiscussionBoard />} />
        <Route path='/discussion/landing/:studyId' element={<DiscussionBoardLanding />} />
        <Route path='/admin/password-reset' element= {<AdminPasswordReset />} />
      </Routes>
      </BrowserRouter>
    </div>
  );
};

export default App;
