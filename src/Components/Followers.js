import React,{useEffect, useState} from "react";
import {Link} from 'react-router-dom';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { library } from "@fortawesome/fontawesome-svg-core";
import{faXmark} from '@fortawesome/free-solid-svg-icons';
import{faImage} from '@fortawesome/free-regular-svg-icons';
import Follow from './Follow';
import Following from './Following';
import {getAuth} from 'firebase/auth';
  import {
    getFirestore,
    collection,
    FieldPath,
    addDoc,
    updateDoc,
    serverTimestamp,
    query,
    doc,
    where,
    getDocs,
    arrayUnion
  } from 'firebase/firestore';
  import {
    getStorage,
    ref,
    uploadBytesResumable,
    getDownloadURL
  } from 'firebase/storage';
import { async } from "@firebase/util";
  library.add(faImage, faXmark);


function Followers({closeFollow, data, openFollowing, setOpenFollowing,addFollow,removeFollow,userData}) {
  const [accountFollowers,setAccountFollowers] = useState([]);
  const [accountFollowing,setAccountFollowing] = useState([]);
  const [accountId,setAccountId] = useState();
  const [userMail,setUserMail] = useState();

  async function recoveAcoountsData(dataToCheck){
    const querySnapshot = await getDocs(collection(getFirestore(), 'Accounts'));
    let following = [];
    let followers = [];
    let index = 0;
    querySnapshot.forEach((doc) => {
      for(let i=0;i<dataToCheck.following.length; i++){
        if(doc.id === dataToCheck.following[i].id){
          following[index] = doc.data();
          index++;
        }
      }
      for(let i=0;i<dataToCheck.followers.length; i++){
        if(doc.id === dataToCheck.followers[i].id){
          followers[index] = doc.data();
          index++;
        }
      }
    });
    setAccountFollowers(followers);
    setAccountFollowing(following);
  }

  async function recoveId(){
    const accountRef = query(collection(getFirestore(), 'Accounts'), where("mail", "==", userMail));
    const querySnapshot2 = await getDocs(accountRef);
    querySnapshot2.forEach((doc) => {
        setAccountId(doc.id);
    });
  }

  useEffect(()=>{
    const followersSelected = document.querySelector('#followers');
    const followingSelected = document.querySelector('#following');
    if(openFollowing === true){
      followersSelected.style.cssText = "";
      followingSelected.style.cssText = "font-weight:bold; color:black;border-bottom: 2px solid black;";
    }else{
      followersSelected.style.cssText = "font-weight:bold; color:black;border-bottom: 2px solid black;";
      followingSelected.style.cssText = "";
    }
  },[openFollowing])

  useEffect(()=>{
    if(data && userData ){
      setUserMail(data.mail)
      recoveAcoountsData(userData);
    }else{
      if(data){
        setUserMail(data.mail)
        recoveAcoountsData(data);
      }
    }
  },[data,userData])

  useEffect(()=>{
    if(userMail !== undefined){
      recoveId();
    }
  },[userMail])

  return (
    <div className="disable-outside-clicks2">
      <div className="followersContainer">
        <div id="formTop">
          <div className="followLabel">
            <div id="following" onClick={()=>setOpenFollowing(true)}>Following</div>
            <div id="followers" onClick={()=>setOpenFollowing(false)}>Followers</div>
          </div>
          <div className="profileUserHome" ><FontAwesomeIcon icon="fa-solid fa-xmark" className="xMark" onClick={closeFollow}/></div>
        </div><hr/>
        {openFollowing === true &&
          <div className="followerList">
            {accountFollowing.map((account, index) => (
              <Link key={index} className="singleFollower" to={`/profile/${account.username}`}>
                <div className="singleFollowerTop">
                  <img className="followProfilePic" src={account.profilePic} alt="profile pic" referrerPolicy="no-referrer"/>
                  <div className="profileData">
                    <div className="profileNameHome">{account.name}</div>
                    <div className="profileUserHome">@{account.username}</div>
                  </div>
                </div>
                {account.followers.map((followers,index) => (
                  <React.Fragment key={index}>
                    {followers.id === accountId &&
                      <button className="Follow" key={index} id={account.username} onClick={(e) => removeFollow(e,accountId)}>Unfollow</button>
                    }
                  </React.Fragment>
                ))}
                <Following accountUsername={account.username} addFollow={addFollow} accountId={accountId} userMail={userMail}/>
              </Link>
            ))}
          </div>
        }
        {openFollowing === false &&
          <div className="followerList">
            {accountFollowers.map((account, index) => (
              <Link key={index} className="singleFollower" to={`/profile/${account.username}`}>
                <div className="singleFollowerTop">
                  <img className="followProfilePic" src={account.profilePic} alt="profile pic" referrerPolicy="no-referrer"/>
                  <div className="profileData">
                    <div className="profileNameHome">{account.name}</div>
                    <div className="profileUserHome">@{account.username}</div>
                  </div>
                </div>
                {account.followers.map((followers,index) => (
                  <>
                    {followers.id === accountId &&
                      <button className="Unfollow" key={index} id={account.username} onClick={(e) => removeFollow(e,accountId)}>Unfollow</button>
                    }
                  </>
                ))}
                <Follow accountUsername={account.username} addFollow={addFollow} accountId={accountId} userMail={userMail}/>        
              </Link>
            ))}
          </div>
        }
      </div> 
    </div>
  );
}

export default Followers;