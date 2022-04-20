import React,{useEffect, useRef, useState} from "react";
import {Link,useNavigate} from 'react-router-dom';
import logo from './logo.webp';
import loadingGif from './loading2.gif';
import { doc, updateDoc, getFirestore, query,collection,getDocs,where,getDoc} from "firebase/firestore";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { library } from "@fortawesome/fontawesome-svg-core";
import{faHouse, faMagnifyingGlass,faHeart, faComment, faUser, faArrowRightToBracket,faArrowRightFromBracket} from '@fortawesome/free-solid-svg-icons';
library.add(faHouse, faHeart, faComment,faUser, faMagnifyingGlass, faArrowRightToBracket,faArrowRightFromBracket);

function NavbarStart({pageSelected, data, oldUser,signOutUser}) {
  const wrapperRef = useRef(null);
  const wrapperRef2 = useRef(null);
  useOutsideAlerter(wrapperRef);
  useOutsideAlerter2(wrapperRef2);
  const [open, setOpen] = useState(false);
  const [openProfile, setOpenProfile] = useState(false);
  const [notifications,setNotifications] = useState(0);
  const [numNotifications,setNumNotifications] = useState(0); 
  const [notificationsData,setNotificationsData] = useState();
  const [accountFound,setAccountFound] = useState();
  const [openSearch,setOpenSearch] = useState(false);
  const [loadingSearch,setLoadingSearch] = useState(true);
  let redirect=useNavigate();

  function startAtTop(){
    window.scroll({
      top: 0, 
      left: 0, 
      behavior: 'smooth' 
    });
  }

  async function removeNotifications(){
    let accountRef = query(collection(getFirestore(), 'Accounts'), where("mail", "==", data.mail ));
    const querySnapshot = await getDocs(accountRef);
    let reference=null;
    querySnapshot.forEach((doc) => {
        reference=doc.id;
    });
    accountRef=doc(getFirestore(), "Accounts", `${reference}`);
    await updateDoc(accountRef,{
        Notifications:[]
    });
  }

  function showNotification(e){
    pageSelected(e);
    if(data){
      if(open === false ){
        setOpen(true);
        removeNotifications();
        setNumNotifications(0);
      }else{
        setOpen(false);
      }
    }
    else{
      if(open === false ){
        setOpen(true);
      }else{
        setOpen(false);
      }
    }
  }

  function showProfile(e){
    pageSelected(e);
    if(openProfile === false ){
      setOpenProfile(true);
    }else{
      setOpenProfile(false);
    }
  }

  async function recoveNotificationsData(){
    let arrayAccounts =[];
    let arrayPost=[];
    let arrayAndAction =[];
    for(let i=0;i<data.Notifications.length;i++){
        const accountDocRef = doc(getFirestore(), "Accounts", `${data.Notifications[i].id}`);
        const docSnap = await getDoc(accountDocRef);
        const postDocRef = doc(getFirestore(), "Posts", `${data.Notifications[i].post}`);
        const docSnap2 = await getDoc(postDocRef);
        arrayAccounts[0]=docSnap.data();
        arrayPost[0]=docSnap2.data();
        arrayAndAction[i] =arrayAccounts.concat(arrayPost,data.Notifications[i].action,data.Notifications[i].post);
    }
    setNotificationsData(arrayAndAction);
  }

  function useOutsideAlerter(ref) {
    useEffect(() => {
      function handleClickOutside(event) {
        if (ref.current && !ref.current.contains(event.target)) {
          setOpen(false);
        }
      }
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("click", handleClickOutside);
      };
    }, [ref]);
  }

  function useOutsideAlerter2(ref) {
    useEffect(() => {
      function handleClickOutside(event) {
        if (ref.current && !ref.current.contains(event.target)) {
          setOpenProfile(false);
        }
      }
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("click", handleClickOutside);
      };
    }, [ref]);
  }

  async function searchUser(e){
    if(e.target.value !== ""){
      setOpenSearch(true);
      setLoadingSearch(true);
      document.querySelector('.showSearch').style.cssText='display:flex;';
      let toCheck = e.target.value.toLowerCase();
      let accounts=[];
      const accountsFound =[];
      let index=0;
      let index2=0;
      let accountsRef = collection(getFirestore(), 'Accounts');
      const querySnapshot = await getDocs(accountsRef);
      querySnapshot.forEach((doc) => {
        accounts[index]=doc.data();
        index++;
      });
      for(let i=0;i<accounts.length;i++){
        if(accounts[i].username.toLowerCase().startsWith(toCheck)){
          accountsFound[index2]=accounts[i];
          index2++;
        }
      }
      setAccountFound(accountsFound);
      setLoadingSearch(false);
    }else{
      setAccountFound();
      setOpenSearch(false);
    }
  }

  function LogOutNav(){
    signOutUser();
    setOpenProfile(false);
    redirect('/register');
  }

  function goToProfile(){
    document.querySelector('.showSearch').style.cssText='display:none;';
    document.querySelector('.search').value="";
    setAccountFound();
  }

  useEffect(()=>{
    if(data) {
      oldUser();
    }
  },[notifications])

  useEffect(()=>{
    const menu = document.querySelector('.showNotification');
    if(open === true){
      menu.style.cssText='display:flex;';
    }else{
      menu.style.cssText='display:none;';
      setNotifications(notifications+1);
    }
  },[open])

  useEffect(()=>{
    const menu = document.querySelector('.showProfile');
    if(openProfile === true){
      menu.style.cssText='display:flex;';
    }else{
      menu.style.cssText='display:none;';
    }
  },[openProfile])

  useEffect(()=>{
    if(data){
      setNumNotifications(data.Notifications.length);
      recoveNotificationsData();
    }
  },[data])

  useEffect(()=>{
    startAtTop();
  },[])

  return (
    <nav className="homeNav">
        <Link className='siteName' to='/'>
            <div className="Title" id="Title" onClick={pageSelected}>
                <img className="logo" id="Title"  src={logo} alt="Instagram logo"/>
                <div className="pagTitle" id="Title" >Instagram</div>
            </div> 
        </Link>  
        <div className="searchBox">
            <label htmlFor="search"><FontAwesomeIcon icon="fa-solid fa-magnifying-glass" /></label>  
            <input type="text" className="search" placeholder="Search" onChange={(e) => searchUser(e)}/>   
            <div className="showSearch" >
              {data && openSearch === true && accountFound &&
                <div className="notifications" >
                  {loadingSearch === false && accountFound.length > 0 && accountFound.map((account, index) => (
                    <Link className="actualNotification" key={index} to={`/profile/${account.username}`} onClick={()=>goToProfile(account.username)}>
                      <img src={account.profilePic} className="commentPic" alt="profile pic"/>
                      <div className="commentName">{account.name}</div>
                      <div className="actualComment">@{account.username}</div>
                    </Link>
                  ))}
                  {loadingSearch === true &&
                    <img src={loadingGif} className="loadingGif2" alt="loading..."/>
                  }
                  {loadingSearch === false && accountFound.length === 0 &&
                    <div className="noResults">No Results</div>
                  }
                </div>
              } 
            </div> 
        </div>
        <ul className="userOptions">           
            <Link className='Home' to='/'>
                <li className='list'> <FontAwesomeIcon className='Home' id="Home" icon="fa-solid fa-house" onClick={pageSelected}/></li>
            </Link>
            <Link className='Direct'  to= {data ?'/direct' : '/register'}>
                <li className='list'><FontAwesomeIcon className='Direct' id="Direct" icon="fa-solid fa-comment" onClick={pageSelected}/></li>
            </Link>
            <li className='list'ref={wrapperRef} >
              <FontAwesomeIcon className='Notification' id="Notification" icon="fa-solid fa-heart" onClick={showNotification}/>
              {data  && numNotifications > 0 &&
                <div className="notificationNumber"><div className="notificationCircle">{data.Notifications.length}</div></div>
              }
              <div className="showNotification" >
                  {data && open === true && notificationsData.length > 0 &&
                    <div className="notifications" >
                      {notificationsData !== undefined && notificationsData.map((notification, index) => (
                        <div className="singleNotification" key={index}>
                          <div className="actualNotification">
                            <Link className="actualNotification" to={`/profile/${notification[0].username}`}>
                              <img src={notification[0].profilePic} className="commentPic" alt="profile pic"/>
                              <div className="commentName">{notification[0].name}</div>
                            </Link>  
                            <div className="actualComment">{notification[2]} your Post</div>
                          </div>
                          <Link className="imgNotContainer" to={`/${notification[3]}`}>
                            <img className="notificationImg"src={notification[1].picture} alt={notification[1].description}/>
                          </Link>
                        </div>
                        ))}
                    </div>
                  }
                  {data && open === true && data.Notifications.length === 0 &&
                    <div className="actualComment2">No New Notifications</div>
                  }
                  {data === undefined && open === true &&
                    <Link className="actualNotification" to={`/register`} onClick={()=>setOpen(false)}>
                      <div className="actualComment2">Log In <FontAwesomeIcon icon="fa-solid fa-arrow-right-to-bracket" /></div>
                    </Link>
                  }
              </div>
            </li>
            <li className='list' ref={wrapperRef2}>
              <FontAwesomeIcon className='Profile' id="Profile" icon="fa-solid fa-user" onClick={(e)=>showProfile(e)}/>
              <div className="showProfile" >
                {data && openProfile === true && 
                  <div className="profileMenu" >
                    <Link className="actualNotification" to={`/profile`} onClick={()=>setOpenProfile(false)}>
                      <div className="actualComment2">Go to Profile</div>
                    </Link>  
                    <div className="actualComment2" onClick={LogOutNav}>Log Out <FontAwesomeIcon icon="fa-solid fa-arrow-right-from-bracket" /></div>
                  </div>
                }
                {data === undefined && openProfile === true &&
                  <Link className="actualNotification" to={`/register`} onClick={()=>setOpenProfile(false)}>
                    <div className="actualComment2">Log In <FontAwesomeIcon icon="fa-solid fa-arrow-right-to-bracket" /></div>
                  </Link>
                }
              </div>
            </li>
        </ul>
    </nav>
  );
}

export default NavbarStart;