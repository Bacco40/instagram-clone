import React,{useEffect, useState} from "react";
import { useLocation } from 'react-router-dom';
import NewPost from './NewPost';
import UserPost from './UserPost';
import loadingGif from './loading.gif';
import {
  getAuth,
  onAuthStateChanged,  
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  query,
  getDocs,
  where
} from 'firebase/firestore';

function Profile({openUploadForm, closeUploadForm, setLogged, data, selected, setSelected}) {
  const [dataProfile, setDataProfile] = useState();
  const [loading, setLoading] = useState(true);
  const [postsData,setPostsData] = useState();

  function startAtTop(){
    window.scroll({
      top: 0, 
      left: 0, 
      behavior: 'smooth' 
    });
  }

  function initialFirebaseAuth() {
    onAuthStateChanged(getAuth(), authStateObserverProfile);
  }
  
  function authStateObserverProfile(user) {
    if (user) {
      const userMail = getAuth().currentUser.email;
      getUserDataProfile(userMail);
    }else{
      setLogged(false);
    }
  }

  async function getUserDataProfile(mail){
    const userData = query(collection(getFirestore(), 'Accounts'), where("mail", "==", mail ));
    const querySnapshot = await getDocs(userData);
    querySnapshot.forEach((doc) => {
      setDataProfile(doc.data());
    });
    setLogged(true);
    setLoading(false);
    const path = window.location.pathname
    if( path === '/profile' ){
      const icon = document.querySelector(`#${selected}`);
      icon.style.cssText='color:rgb(209, 202, 202);';
      setSelected('Profile');
    }
    profilePosts();
  }

  async function profilePosts(){
    const userMail = getAuth().currentUser.email;
    const userPosts = query(collection(getFirestore(), 'Posts'), where("mail", "==", userMail ));
    const querySnapshot = await getDocs(userPosts);
    let array=[];
    let index=0;
    querySnapshot.forEach((doc) => {
      let posts = doc.data();
      const mail = [posts.mail];
      const picture = posts.picture;
      const profilePic = posts.profilePic;
      const username = posts.username;
      const name = posts.name;
      const likes= [posts.likes];
      const comments = [posts.comments];
      const description = posts.description;
      const date = posts.date;
      const link = posts.link;
      const id = doc.id;
      array[index] =mail.concat(picture,profilePic,username,name,likes,comments,description,date,link,id);
      index++;
    });
    setPostsData(array);
  }

  useEffect(()=>{
    startAtTop();
    if(data){
      setDataProfile(data);
      profilePosts();
      setLoading(false);
    }else{
      initialFirebaseAuth();
    }
  },[])

  return (
    <div className="profileContent">
      {loading === false &&
        <div className="profile">
          <div className="coverContainer">
            <img className="profileCover" src={dataProfile.coverPic} alt="cover pic"/>
          </div>
          <div className="profileTopSection">
            <img className="profilePicBig" src={dataProfile.profilePic} alt="profile pic" referrerPolicy="no-referrer"/> 
            <div className="profileButtons">
              <button id="edit">Edit Profile</button>
              <button id="addPic" onClick={openUploadForm}> + </button>
            </div>
          </div>
          <div className="profileContents">
            <div className="profileDetail">
              <div className="profileName">{dataProfile.name}</div>
              <div className="profileUser">@{dataProfile.username}</div>
              <div className="userPost">
                <div className="profileNumber">{postsData && postsData.length}</div>
                <div className="profilePart">  Posts</div>
              </div><hr/>
              <div className="detailSection">
                <div className="following">
                  <div className="profileNumber">{dataProfile.following.length}</div>
                  <div className="profilePart"> Following </div>
                </div>
                <div className="following">
                  <div className="profileNumber">{dataProfile.followers.length}</div>
                  <div className="profilePart"> Followers </div>
                </div>
              </div>
              <hr/>
              <div className="bio">
                <div className="bioTitle">Bio:</div>
                <div>{dataProfile.bio}</div>
              </div>
            </div>
            <div className="profilePosts">
              {postsData && postsData !== undefined && 
                <div className="allPost">
                  {postsData.map((post, index) => (
                    <UserPost key={index} post={post}/>
                  ))}
                </div>
              }
            </div>
          </div>
          <NewPost closeUploadForm={closeUploadForm} data={dataProfile} profilePosts={(e) => profilePosts(e)}/>
        </div>
      }
      {loading === true &&
        <div className="loadingTime">
          <img src={loadingGif} alt="loading..."/>
        </div>
      }
  </div>
  );
}

export default Profile;