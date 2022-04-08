import React,{useEffect, useState} from "react";
import { useParams, useNavigate} from 'react-router-dom';
import Followers from './Followers';
import {Link} from 'react-router-dom';
import UserPost from './UserPost';
import loadingGif from './loading.gif';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { library } from "@fortawesome/fontawesome-svg-core";
import {
  getAuth,
  onAuthStateChanged,  
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  query,
  getDocs,
  doc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  where
} from 'firebase/firestore';
import{faComment} from '@fortawesome/free-regular-svg-icons';
import { async } from "@firebase/util";
library.add(faComment);

function UserProfile({closeFollow,openFollowing,setOpenFollowing,addFollow,removeFollow,openFollow,data}) {
  const {username} = useParams();
  const [userData, setUserData] = useState();
  const [postsData,setPostsData] = useState();
  const [userFollowed,setUserFollowed] = useState("Follow");
  const [idAccount,setIdAccount] = useState();
  let redirect =useNavigate();

  function startAtTop(){
    window.scroll({
      top: 0, 
      left: 0, 
      behavior: 'smooth' 
    });
  }

  async function recoveUserData(){
    const userData2 = query(collection(getFirestore(), 'Accounts'), where("username", "==", username ));
    const querySnapshot = await getDocs(userData2);
    querySnapshot.forEach((doc) => {
      setUserData(doc.data());
    });
  }

  async function checkAccountMaster(){
    const userAccount = query(collection(getFirestore(), 'Accounts'), where("mail", "==", data.mail ));
    const querySnapshot2 = await getDocs(userAccount);
    querySnapshot2.forEach((doc) => {
      setIdAccount(doc.id);
    });
  }

  async function profilePosts(){
    const userPosts = query(collection(getFirestore(), 'Posts'), where("username", "==", username ));
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

  function checkUserFollowed(){
    let exist = null;
    for(let i=0; i<userData.followers.length;i++){
      if(userData.followers[i].id === idAccount){
        exist = true;
      }
    }
    if(exist === true){
      setUserFollowed("Unfollow");
    }else{
      setUserFollowed("Follow");
    }
  }

  function clickFollow(e){
    if(userFollowed === "Follow" && !data){
      redirect('/register');
    }
    if(userFollowed === "Follow" && data){
      addFollow(e,idAccount);
    }
    if(userFollowed === "Unfollow" && data){
      removeFollow(e,idAccount);
    }
    recoveUserData();
  }

  useEffect(()=>{
    if(userData){
      checkUserFollowed();
    }
  },[userData])

  useEffect(()=>{
    if(userData && data !== undefined){
      if(userData.mail !== data.mail){
        checkAccountMaster();
        profilePosts();
      }else{
        redirect('/profile');
      }
    }
  },[userData,data])

  useEffect(()=>{
    if(data){
      recoveUserData();
    }
  },[data])

  useEffect(()=>{
    startAtTop();
    recoveUserData();
    if(document.querySelector('.disable-outside-clicks2')){
      closeFollow();
    }
  },[username])

  return (
    <div className="externalProfile">
        {userData &&
            <div className="profile">
            <div className="coverContainer">
              <img className="profileCover" src={userData.coverPic} alt="cover pic"/>
            </div>
            <div className="profileTopSection">
              <img className="profilePicBig" src={userData.profilePic} alt="profile pic" referrerPolicy="no-referrer"/> 
              <div className="profileButtons">
                <button className="followNewProfile" id={userData.username} onClick={(e) => clickFollow(e)}>{userFollowed}</button>
                <button id="newMessage" > <FontAwesomeIcon icon="fa-regular fa-comment" /> </button>
              </div>
            </div>
            <div className="profileContents">
              <div className="profileDetail">
                <div className="profileName">{userData.name}</div>
                <div className="profileUser">@{userData.username}</div>
                <div className="userPost">
                  <div className="profileNumber">{postsData && postsData.length}</div>
                  <div className="profilePart2">  Posts</div>
                </div><hr/>
                <div className="detailSection">
                  <div className="following" value="following" onClick={(e)=>openFollow(e)}>
                    <div className="profileNumber" value="following">{userData.following.length}</div>
                    <div className="profilePart" value="following"> Following </div>
                  </div>
                  <div className="following" value="followers" onClick={(e)=>openFollow(e)}>
                    <div className="profileNumber" value="followers">{userData.followers.length}</div>
                    <div className="profilePart" value="followers"> Followers </div>
                  </div>
                </div>
                <hr/>
                <div className="bio">
                  <div className="bioTitle">Bio:</div>
                  <div>{userData.bio}</div>
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
            <Followers 
                closeFollow={closeFollow} 
                userData={userData} 
                data={data}
                openFollowing={openFollowing} 
                setOpenFollowing={setOpenFollowing}
                addFollow={addFollow}
                removeFollow={removeFollow}
            />
          </div>
        }
    </div>
  );
}

export default UserProfile;