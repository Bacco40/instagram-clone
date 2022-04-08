import React,{useEffect, useRef, useState} from "react";
import {Link} from 'react-router-dom';
import logo from './logo.webp';
import { doc, updateDoc, getFirestore, query,collection,getDocs,where} from "firebase/firestore";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { library } from "@fortawesome/fontawesome-svg-core";
import{faHouse, faMagnifyingGlass,faHeart, faComment, faUser} from '@fortawesome/free-solid-svg-icons';
library.add(faHouse, faHeart, faComment,faUser, faMagnifyingGlass);

function NavbarStart({pageSelected, data, oldUser}) {
  const wrapperRef = useRef(null);
  useOutsideAlerter(wrapperRef);
  const [open, setOpen] = useState(false);
  const [notifications,setNotifications] = useState(0);
  const [numNotifications,setNumNotifications] = useState(0); 

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

  async function showNotification(e){
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
    startAtTop();
    if(data){
      setNumNotifications(data.Notifications.length);
    }
  },[data])

  return (
    <nav className="homeNav">
        <Link className='siteName' to='/instagram-clone'>
            <div className="Title" id="Title" onClick={pageSelected}>
                <img className="logo" id="Title"  src={logo} alt="Instagram logo"/>
                <div className="pagTitle" id="Title" >Instagram</div>
            </div> 
        </Link>  
        <div className="searchBox">
            <label htmlFor="search"><FontAwesomeIcon icon="fa-solid fa-magnifying-glass" /></label>  
            <input type="text" className="search" placeholder="Search"/>     
        </div>
        <ul className="userOptions">           
            <Link className='Home' to='/instagram-clone'>
                <li className='list'> <FontAwesomeIcon className='Home' id="Home" icon="fa-solid fa-house" onClick={pageSelected}/></li>
            </Link>
            <Link className='Direct' to='/direct' >
                <li className='list'><FontAwesomeIcon className='Direct' id="Direct" icon="fa-solid fa-comment" onClick={pageSelected}/></li>
            </Link>
            <li className='list'ref={wrapperRef} >
              <FontAwesomeIcon className='Notification' id="Notification" icon="fa-solid fa-heart"  onClick={showNotification}/>
              {data  && numNotifications > 0 &&
                <div className="notificationNumber"><div className="notificationCircle">{data.Notifications.length}</div></div>
              }
              <div className="showNotification" >
                  {data && open === true && data.Notifications.length > 0 &&
                    <div className="notifications" >
                      {data.Notifications.map((notification, index) => (
                        <div className="singleComment" key={index}>
                          <img src={notification.profilePic} className="commentPic" alt="profile pic"/>
                          <div className="commentName">{notification.name}</div>
                          <div className="actualComment">{notification.action} your Post</div>
                        </div>
                        ))}
                    </div>
                  }
                  {data && open === true && data.Notifications.length === 0 &&
                    <div className="actualComment2">No New Notifications</div>
                  }
              </div>
            </li>
            <Link className='Profile' to='/profile' >
                <li className='list'><FontAwesomeIcon className='Profile' id="Profile" icon="fa-solid fa-user" onClick={(e)=>pageSelected(e)}/></li>
            </Link>
        </ul>
    </nav>
  );
}

export default NavbarStart;