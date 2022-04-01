import React,{useEffect} from "react";
import {Link} from 'react-router-dom';
import logo from './logo.webp';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { library } from "@fortawesome/fontawesome-svg-core";
import{faHouse, faMagnifyingGlass,faHeart, faComment, faUser} from '@fortawesome/free-solid-svg-icons';
library.add(faHouse, faHeart, faComment,faUser, faMagnifyingGlass);

function NavbarStart({pageSelected}) {

  function startAtTop(){
    window.scroll({
      top: 0, 
      left: 0, 
      behavior: 'smooth' 
    });
  }

  useEffect(()=>{
    startAtTop();
  },[])

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
            <Link className='Notification' to='/instagram-clone/' >
                <li className='list'><FontAwesomeIcon className='Notification' id="Notification" icon="fa-solid fa-heart" onClick={pageSelected}/></li>
            </Link>
            <Link className='Profile' to='/profile' >
                <li className='list'><FontAwesomeIcon className='Profile' id="Profile" icon="fa-solid fa-user" onClick={pageSelected}/></li>
            </Link>
        </ul>
    </nav>
  );
}

export default NavbarStart;