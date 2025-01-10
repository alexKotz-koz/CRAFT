import { BrowserRouter, Routes, Route } from "react-router-dom";


import Header from './Header';
import SignUp from './auth/SignUp';
import Login from './auth/Login';
import Home from './Home';
import Landing from './Landing';
import StudyNewWizard from './study/StudyNewWizard';
import Study from './study/Study';
import PasswordReset from "./auth/PasswordReset";

import { useFetchUserQuery } from '../store';

import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import 'bootstrap/dist/css/bootstrap.min.css';
import StudyResponse from "./study/StudyResponse";

const App = () => {

  const { data: user } = useFetchUserQuery();


  return (
    <div className='container'>
      <BrowserRouter>
      <Header />

      <Routes>
        <Route path='/' element={<Landing />} />
        <Route path='/home' element={<Home />} />
        <Route path='/login' element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/study" element={<Study />} />
        <Route path='/study/new' element={<StudyNewWizard />} />
        <Route path='/study/response/:studyId' element={<StudyResponse user={user} />} />
        <Route path='/password_reset' element={<PasswordReset />} />
      </Routes>
      </BrowserRouter>
    </div>
  );
};

export default App;
