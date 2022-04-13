import React from "react";
import {Link} from 'react-router-dom';
import NewPost from './NewPost';
import Followers from './Followers';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { library } from "@fortawesome/fontawesome-svg-core";
import{faCirclePlus} from '@fortawesome/free-solid-svg-icons';
library.add(faCirclePlus);

function LogIn({oldUserLog,recovePost,logged, data, signOutUser, openUploadForm, closeUploadForm,
  closeFollow,openFollowing,setOpenFollowing,addFollow,removeFollow,openFollow}) {

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
            <Link className="topData" to='/profile'>
              <img className="homeProfilePic" src={data.profilePic} alt="profile pic" referrerPolicy="no-referrer"/>
              <div className="profileData">
                <div className="profileNameHome">{data.name}</div>
                <div className="profileUserHome">@{data.username}</div>
              </div>
            </Link>
            <hr/>
            <div className="detailSection">
              <Link className="following" to='/profile'>
                <div className="profileNumber">{data.posts.length}</div>
                <div className="loggedDetail">  Posts</div>
              </Link>
              <div className="following" value="following" onClick={(e)=>openFollow(e)}>
                <div className="profileNumber" value="following">{data.following.length}</div>
                <div className="loggedDetail" value="following"> Following </div>
              </div>
              <div className="following" value="followers" onClick={(e)=>openFollow(e)}>
                <div className="profileNumber" value="followers">{data.followers.length}</div>
                <div className="loggedDetail" value="followers"> Followers </div>
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
      <NewPost closeUploadForm={closeUploadForm} data={data} recovePost={recovePost}/>
      <Followers 
          closeFollow={closeFollow} 
          data={data} 
          openFollowing={openFollowing} 
          setOpenFollowing={setOpenFollowing}
          addFollow={addFollow}
          removeFollow={removeFollow}
      />
    </div>
  );
}

export default LogIn;