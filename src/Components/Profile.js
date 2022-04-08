import React,{useEffect, useState} from "react";
import NewPost from './NewPost';
import Followers from './Followers';
import {Link} from 'react-router-dom';
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
  doc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  where
} from 'firebase/firestore';

function Profile({openUploadForm, closeUploadForm, setLogged, data, selected, setSelected}) {
  const [dataProfile, setDataProfile] = useState();
  const [loading, setLoading] = useState(true);
  const [postsData,setPostsData] = useState();
  const [openFollowing,setOpenFollowing] = useState(true);

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

  function openFollow(e){
    if(e.target.attributes.value.value === "following"){
      setOpenFollowing(true)
    }else{
      setOpenFollowing(false)
    }
    document.querySelector('.disable-outside-clicks2').style.cssText='display:flex;';
  }

  function closeFollow(){
    document.querySelector('.disable-outside-clicks2').style.cssText='display:none;';
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
    initialFirebaseAuth();
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
    initialFirebaseAuth();
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
              <Link className='editLink' to='/editProfile'>
                <button id="edit">Edit Profile</button>
              </Link>
              <button id="addPic" onClick={openUploadForm}> + </button>
            </div>
          </div>
          <div className="profileContents">
            <div className="profileDetail">
              <div className="profileName">{dataProfile.name}</div>
              <div className="profileUser">@{dataProfile.username}</div>
              <div className="userPost">
                <div className="profileNumber">{postsData && postsData.length}</div>
                <div className="profilePart2">  Posts</div>
              </div><hr/>
              <div className="detailSection">
                <div className="following" value="following"  onClick={(e)=>openFollow(e)}>
                  <div className="profileNumber" value="following">{dataProfile.following.length}</div>
                  <div className="profilePart" value="following"> Following </div>
                </div>
                <div className="following" value="followers" onClick={(e)=>openFollow(e)}>
                  <div className="profileNumber" value="followers">{dataProfile.followers.length}</div>
                  <div className="profilePart" value="followers"> Followers </div>
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
          <Followers 
            closeFollow={closeFollow} 
            data={dataProfile}
            openFollowing={openFollowing} 
            setOpenFollowing={setOpenFollowing}
            addFollow={addFollow}
            removeFollow={removeFollow}
          />
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