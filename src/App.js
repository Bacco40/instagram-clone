import './App.css';
import Navbar from './Components/Navbar';
import Home from './Components/Home';
import Direct from './Components/Direct';
import Profile from './Components/Profile';
import Register from './Components/Register';
import CreateProfile from './Components/createProfile';
import OpenPost from './Components/OpenPost';
import { Route, Routes, useNavigate} from 'react-router-dom';
import { getApps } from 'firebase/app'; 
import { useEffect, useState } from 'react';
import {
  getAuth,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  addDoc,
  query,
  getDocs,
  where,
  deleteDoc,
  updateDoc,
  doc,
  serverTimestamp,
} from 'firebase/firestore';
import { async } from '@firebase/util';

function App() {
  const firebaseApp = getApps()[0]; 
  const [logged,setLogged] = useState(null);
  const [tempUsername, setTempUsername] = useState();
  const [tempUserPic, setTempUserPic] = useState();
  const [tempFullName,setTempFullName] = useState();
  const [data, setData] = useState();
  const [selected, setSelected] = useState('Home');
  const [userLogged, setUserLogged] = useState(false);
  let redirect =useNavigate();

  function pageSelected(e){
    const prevIcon = document.querySelector(`#${selected}`);
    prevIcon.style.cssText='color:rgb(209, 202, 202);';
    let page = e.target.id;
    if(page === ""){
      page = e.target.classList[2];
    }
    if(page === undefined){
      page = e.target.farthestViewportElement.id;
    }
    if(page === "Title"){
      page='Home';
    }
    if(page === selected){
      prevIcon.style.cssText='color:black;';
    }
    setSelected(page);
  }

  function initFirebaseAuth() {
    onAuthStateChanged(getAuth(), authStateObserver);
  }

  async function getUserData(mail, string){
    const userData = query(collection(getFirestore(), 'Accounts'), where("mail", "==", mail ));
    const querySnapshot = await getDocs(userData);
    querySnapshot.forEach((doc) => {
      setData(doc.data());
    });
    setLogged(true);
    if(string === 'profile'){
      redirect('/profile');
    }
  }

  function authStateObserver(user) {
    if (user) {
      setUserLogged(true);
    }else{
      setLogged(false);
    }
  }

  async function signIn() {
    var provider = new GoogleAuthProvider();
    await signInWithPopup(getAuth(), provider);
  }

  function signOutUser() {
    signOut(getAuth()); 
    setData();
    setUserLogged(false);
    setLogged(false);
  }

  function oldUserLog(e){
    e.preventDefault();
    oldUser();
  }

  async function oldUser(){
    if(userLogged === false){
      await signIn();
    }
    else{
      const userMail = getAuth().currentUser.email;
      const userAlreadyExist = query(collection(getFirestore(), 'Accounts'), where("mail", "==", userMail ));
      const querySnapshot = await getDocs(userAlreadyExist);
      let length=0;
      querySnapshot.forEach((doc) => {
        length+=1;
      })
      if(length === 1){
        getUserData(userMail);
        setLogged(true);
      }
      else{
        redirect('/register');
      }
    }
  }

  async function newUser(e){
    e.preventDefault();
    await signIn();
    const userMail = getAuth().currentUser.email;
    const userAlreadyExist = query(collection(getFirestore(), 'Accounts'), where("mail", "==", userMail ));
    const querySnapshot = await getDocs(userAlreadyExist);
    let length=0;
    querySnapshot.forEach((doc) => {
      length+=1;
    })
    if(length === 0){
      const name= document.querySelector('#username');
      setTempUsername(name.value);
      setTempFullName(getAuth().currentUser.displayName);
      setTempUserPic(getAuth().currentUser.photoURL);
      redirect('/createProfile');
    }else{
      getUserData(userMail);
    }
  }

  function openUploadForm(){
    document.querySelector('.disable-outside-clicks').style.cssText='display:flex;';
  }

  function closeUploadForm(){
    document.querySelector('.disable-outside-clicks').style.cssText='display:none;';
  }

  useEffect(()=>{
    if(userLogged === true){
      oldUser();
    }
  },[userLogged])

  useEffect(()=>{
    const icon = document.querySelector(`#${selected}`);
    icon.style.cssText='color:black;';
  },[selected])

  useEffect(()=>{
    const icon = document.querySelector(`#${selected}`);
    icon.style.cssText='color:black;';
    initFirebaseAuth();
  },[])

  return (
    <div className="App">
      <Navbar pageSelected={(e)=>pageSelected(e)} data={data} oldUser={oldUser}/>
      <Routes>
        <Route path='/instagram-clone' element={
          <Home 
            oldUserLog={(e)=>oldUserLog(e)} 
            logged={logged} 
            data={data}
            signOutUser={signOutUser}
            openUploadForm={openUploadForm}
            closeUploadForm={closeUploadForm}
            oldUser={oldUser}
          />
        }/>  
        <Route path='/direct' element={<Direct/>}/>  
        <Route path='/profile' element={
          <Profile 
            openUploadForm={openUploadForm} 
            closeUploadForm={closeUploadForm}
            setLogged={setLogged}
            data={data}
            selected={selected}
            setSelected={setSelected}
          />
        }/>  
        <Route path='/register' element={<Register newUser={newUser} oldUserLog={(e)=>oldUserLog(e)}/>}/>  
        <Route path='/createProfile' element={
          <CreateProfile 
            username={tempUsername} 
            fullName={tempFullName} 
            profilePicUrl={tempUserPic}
            getUserData={getUserData}
          />
        }/>  
        <Route path='/profile/:id' element={<OpenPost data={data} oldUser={oldUser}/>}/>
      </Routes>
    </div>
  );
}

export default App;
