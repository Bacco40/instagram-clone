import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import {BrowserRouter} from 'react-router-dom';
import { initializeApp } from 'firebase/app';

initializeApp({
  apiKey: "AIzaSyCVM0FAxd0gaddMggVqwyJKeCYIn_XDJGM",
  authDomain: "instagram-clone-9b54b.firebaseapp.com",
  projectId: "instagram-clone-9b54b",
  storageBucket: "instagram-clone-9b54b.appspot.com",
  messagingSenderId: "641831023180",
  appId: "1:641831023180:web:4a637a174a824229bc3ae9"
})


ReactDOM.render(
  <React.StrictMode>
    <BrowserRouter basename='/'>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
  document.getElementById('root')
);
