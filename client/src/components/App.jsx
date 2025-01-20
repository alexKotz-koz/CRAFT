import { BrowserRouter, Routes, Route } from "react-router-dom";

import Header from './Header';
import SignUp from './auth/SignUp';
import Login from './auth/Login';
import Home from './Home';
import Landing from './Landing';
import StudyNewWizard from './study/StudyNewWizard';
import Study from './study/Study';
import PasswordReset from "./auth/PasswordReset";
import StudyResponse from "./study/StudyResponse";
import DiscussionBoard from "./discussion-board/DiscussionBoard";
import StudyStatistics from "./study/study-dashboard/StudyStatistics";

import { useFetchUserQuery } from '../store';

import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import 'bootstrap/dist/css/bootstrap.min.css';



const App = () => {

  const { data: user } = useFetchUserQuery();


  return (
    <div className='container-fluid'>
      <BrowserRouter>
      <Header />

      <Routes>
        <Route path='/' element={<Landing />} />
        <Route path='/home' element={<Home />} />
        <Route path='/login' element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/study/:studyId" element={<Study user={user}  />} />
        <Route path='/study/new' element={<StudyNewWizard />} />
        <Route path='/study/statistics/:studyId' element={<StudyStatistics />} />
        <Route path='/study/response/:studyId' element={<StudyResponse user={user} />} />
        <Route path='/password_reset' element={<PasswordReset />} />
        <Route path='/discussion/:studyId' element={<DiscussionBoard />} />
      </Routes>
      </BrowserRouter>
    </div>
  );
};

export default App;
