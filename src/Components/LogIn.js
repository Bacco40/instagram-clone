import React from "react";
import {Link} from 'react-router-dom';
import NewPost from './NewPost';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { library } from "@fortawesome/fontawesome-svg-core";
import{faCirclePlus} from '@fortawesome/free-solid-svg-icons';
library.add(faCirclePlus);

function LogIn({oldUserLog,logged, data, signOutUser, openUploadForm, closeUploadForm}) {

  return (
    <div className="logIn">
      {logged === false && 
        <div className="logIn">
          <Link className='register' to='/register' >
              <button id="signUp"> Sign Up </button>
          </Link>
          <button id="logIn" onClick={oldUserLog}> Log In </button>
        </div>
      }
      {logged === true && data &&
        <div className="logIn">
          <div className="profileDetail">
            <div className="topData">
              <img className="homeProfilePic" src={data.profilePic} alt="profile pic" referrerPolicy="no-referrer"/>
              <div className="profileData">
                <div className="profileNameHome">{data.name}</div>
                <div className="profileUserHome">@{data.username}</div>
              </div>
            </div>
            <hr/>
            <div className="detailSection">
              <div className="following">
                <div className="profileNumber">{data.posts.length}</div>
                <div className="loggedDetail">  Posts</div>
              </div>
              <div className="following">
                <div className="profileNumber">{data.following.length}</div>
                <div className="loggedDetail"> Following </div>
              </div>
              <div className="following">
                <div className="profileNumber">{data.followers.length}</div>
                <div className="loggedDetail"> Followers </div>
              </div>
              <div className="following" onClick={openUploadForm} id="addDescription" >
                <div className="addPost" > <FontAwesomeIcon icon="fa-solid fa-circle-plus" /> </div>
                <div className="loggedDetail"> New Post </div>
              </div>
            </div>
          </div>
          <button id="signUp" onClick={signOutUser}>Log Out</button>
      </div>
      }  
      <NewPost closeUploadForm={closeUploadForm} data={data}/>
    </div>
  );
}

export default LogIn;