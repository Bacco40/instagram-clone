import './App.css';
import Navbar from './Components/Navbar';
import Home from './Components/Home';
import Direct from './Components/Direct';
import Profile from './Components/Profile';
import Register from './Components/Register';
import CreateProfile from './Components/createProfile';
import OpenPost from './Components/OpenPost';
import EditProfile from './Components/EditProfile';
import UserProfile from './Components/UserProfile';
import { Route, Routes, useNavigate} from 'react-router-dom';
import { getApps } from 'firebase/app'; 
import { useEffect, useState } from 'react';
import {
  getAuth,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  signOut
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  query,
  getDocs,
  where,
  updateDoc,
  doc,
  arrayRemove,
  arrayUnion
} from 'firebase/firestore';

function App() {
  const firebaseApp = getApps()[0]; 
  const [logged,setLogged] = useState(null);
  const [tempUsername, setTempUsername] = useState();
  const [data, setData] = useState();
  const [selected, setSelected] = useState('Home');
  const [userLogged, setUserLogged] = useState(false);
  const [newUserLog, setNewUserLog] = useState(false);
  const [openFollowing,setOpenFollowing] = useState(true);
  const [messageUser,setMessageUser] = useState();
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
      const icon = document.querySelector(`#${selected}`);
      icon.style.cssText='color:rgb(209, 202, 202);';
      setSelected('Profile');
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
    const provider = new GoogleAuthProvider();
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
    const username = document.querySelector('#username').value;
    const userAlreadyExist = query(collection(getFirestore(), 'Accounts'), where("username", "==", username ));
    const querySnapshot = await getDocs(userAlreadyExist);
    let length=0;
    querySnapshot.forEach(() => {
      length+=1;
    })
    if(username.length>3 && username.indexOf(' ') === -1 && username.length<15 && length === 0){
      setTempUsername(username);
      redirect('/createProfile');
    }else{
      const error = document.querySelector('.formError');
      if(username.length<3){
        error.innerHTML = 'Username must be at least 3 character!';
        error.style.cssText = 'color:red;';
      }
      if(username.indexOf(' ') !== -1){
        error.innerHTML = 'Username must be without space!';
        error.style.cssText = 'color:red;';
      }
      if(username.length>15){
        error.innerHTML = 'Username must be maximum 15 character!';
        error.style.cssText = 'color:red;';
      }
      if(length !== 0){
        error.innerHTML = 'Sorry,this username is not available!';
        error.style.cssText = 'color:red;';
      }
    }
  }

  function openUploadForm(){
    if(document.querySelector('.logIn')){
      document.querySelector('.logIn').style.cssText='z-index:4;';
    }
    document.querySelector('.disable-outside-clicks').style.cssText='display:flex;';
  }

  function closeUploadForm(){
    if(document.querySelector('.logIn')){
      document.querySelector('.logIn').style.cssText='z-index:3;';
    }
    document.querySelector('.disable-outside-clicks').style.cssText='display:none;';
  }

  function openFollow(e){
    if(e.target.attributes.value.value === "following"){
      setOpenFollowing(true)
    }else{
      setOpenFollowing(false)
    }
    if(document.querySelector('.logIn')){
      document.querySelector('.logIn').style.cssText='z-index:4;';
    }
    document.querySelector('.disable-outside-clicks2').style.cssText='display:flex;';
  }

  function closeFollow(){
    if(document.querySelector('.logIn')){
      document.querySelector('.logIn').style.cssText='z-index:3;';
    }
    document.querySelector('.disable-outside-clicks2').style.cssText='display:none;';
  }

  function openDirect(){
    document.querySelector('.disable-outside-clicks2').style.cssText='display:flex;';
  }

  async function addFollow(e,accountId){
    e.preventDefault();
    let userRef= null;
    const userData = query(collection(getFirestore(), 'Accounts'), where("username", "==", e.target.id ));
    const querySnapshot = await getDocs(userData);
    querySnapshot.forEach((doc) => {
      userRef= doc.id;
    });
    const documentRef = doc(getFirestore(), "Accounts", `${userRef}`);
    await updateDoc(documentRef,{
      followers: arrayUnion({
        id:accountId
      })
    });
    const documentRef2 = doc(getFirestore(), "Accounts", `${accountId}`);
    await updateDoc(documentRef2,{
      following: arrayUnion({
        id:userRef
      })
    });
    oldUser();
  }

  async function removeFollow(e, accountId){
    e.preventDefault();
    let userRef= null;
    const userData = query(collection(getFirestore(), 'Accounts'), where("username", "==", e.target.id ));
    const querySnapshot = await getDocs(userData);
    querySnapshot.forEach((doc) => {
      userRef= doc.id;
    });
    const documentRef = doc(getFirestore(), "Accounts", `${userRef}`);
    await updateDoc(documentRef,{
      followers: arrayRemove({
        id:accountId
      })
    });
    const documentRef2 = doc(getFirestore(), "Accounts", `${accountId}`);
    await updateDoc(documentRef2,{
      following: arrayRemove({
        id:userRef
      })
    });
    oldUser();
  }

  function messageUserProfile(e){
    if(data){
      setMessageUser(e.target.name);
    }
    else{
      redirect('/register');
    }
  }

  useEffect(()=>{
    if(userLogged === true && newUserLog === false){
      oldUser();
    }
  },[userLogged,newUserLog])

  useEffect(()=>{
    if(messageUser){
      redirect('/direct');
    }
  },[messageUser])

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
      <Navbar pageSelected={(e)=>pageSelected(e)} data={data} oldUser={oldUser} signOutUser={signOutUser}/>
      <Routes>
        <Route path='/' element={
          <Home 
            oldUserLog={(e)=>oldUserLog(e)} 
            logged={logged} 
            data={data}
            signOutUser={signOutUser}
            openUploadForm={openUploadForm}
            closeUploadForm={closeUploadForm}
            oldUser={oldUser}
            closeFollow={closeFollow} 
            openFollow={openFollow} 
            openFollowing={openFollowing}
            setOpenFollowing={setOpenFollowing}
            addFollow={addFollow}
            removeFollow={removeFollow}
          />
        }/>  
        <Route path='/direct' element={
          <Direct data={data} 
            closeFollow={closeFollow} 
            openDirect={openDirect} 
            messageUser={messageUser} 
            setMessageUser={setMessageUser}
          />
        }/>  
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
            getUserData={getUserData}
            setNewUserLog={setNewUserLog}
          />
        }/>  
        <Route path='/:id' element={<OpenPost data={data} oldUser={oldUser}/>}/>
        <Route path='/editProfile' element={<EditProfile data={data} getUserData={getUserData}/>}/> 
        <Route path='/profile/:username' element={
          <UserProfile
            closeFollow={closeFollow} 
            openFollow={openFollow} 
            openFollowing={openFollowing}
            setOpenFollowing={setOpenFollowing}
            addFollow={addFollow}
            removeFollow={removeFollow}
            data={data}
            authStateObserver={authStateObserver}
            messageUserProfile={messageUserProfile}
          />
        }/>
      </Routes>
    </div>
  );
}

export default App;
