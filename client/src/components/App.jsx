import { useDispatch } from 'react-redux';
import { useEffect } from 'react';
import { fetchUser } from '../store/slices/authSlice';
import { BrowserRouter, Routes, Route } from "react-router-dom";


import Header from './Header';
import SignUp from './SignUp';
import Login from './Login';
import Home from './Home';
import NewStudy from './study/NewStudy';
import Study from './study/Study';

import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import 'bootstrap/dist/css/bootstrap.min.css';

const App = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchUser());
  }, [dispatch]);

  return (
    <div className='container'>
      <BrowserRouter>
      <Header />
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/login' element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/study" element={<Study />} />
        <Route path='/study/new' element={<NewStudy />} />
      </Routes>
      </BrowserRouter>
    </div>
  );
};

export default App;
