//import React from 'react';
import { Routes, Route, Navigate } from 'react-router';

import HomePage from "./pages/HomePage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import SignupPage from "./pages/SignupPage.jsx";
import NotificationsPage from "./pages/NotificationsPage.jsx";
import CallPage from "./pages/CallPage.jsx";
import ChatPage from "./pages/ChatPage.jsx";
import OnboardingPage from "./pages/OnboardingPage.jsx";

import { Toaster, toast } from 'react-hot-toast';
import {useEffect, useState} from "react";
import {useQuery} from "@tanstack/react-query";
import axios from "axios";
import { axiosInstance } from './lib/axios.js';

const App = () => {

  const {data: authData, isLoading, error}= useQuery({
    queryKey:["authuser"],

    queryFn: async() =>{
      const res= await axiosInstance.get("https://localhost:5001/api/auth/me");
      return res.data;
    },
    retry: false,
  })

  const authUser= authData?.user

  console.log(authData);

  return(
     <div className="h-screen " data-theme="night">
      <button onClick={() => toast.success("")}></button>
      <Routes>
        <Route path="/" element= {authUser ? <HomePage /> : <Navigate to= "/login" />} />
        <Route path="/signup" element= {!authUser ? <SignupPage />: <Navigate to= "/"/>} />
        <Route path="/login" element= {!authUser ? <LoginPage />: <Navigate to= "/"/>} />
        <Route path="/notifications" element= {authUser ? <NotificationsPage />: <Navigate to= "/login" />} />
        <Route path="/call" element= {authUser ? <CallPage />: <Navigate to= "/login" />} />
        <Route path="/chat" element= {authUser ? <ChatPage />: <Navigate to= "/login" />} />
        <Route path="/onboarding" element= {authUser ? <OnboardingPage />: <Navigate to= "/login" />} />
      </Routes>

      <Toaster />
    </div>
  )
}

export default App
