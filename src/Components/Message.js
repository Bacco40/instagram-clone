import React,{useEffect, useState} from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { library } from "@fortawesome/fontawesome-svg-core";
import{faXmark} from '@fortawesome/free-solid-svg-icons';
import{faImage} from '@fortawesome/free-regular-svg-icons';
import {getFirestore,collection,getDocs,where,query} from 'firebase/firestore';
library.add(faImage, faXmark);


function Message({closeFollow, data, setTempMessageUser}) {
  const [accountFollowing,setAccountFollowing] = useState([]);

  async function recoveAcoountsData(dataToCheck){
    const querySnapshot = await getDocs(collection(getFirestore(), 'Accounts'));
    let following = [];
    let index = 0;
    querySnapshot.forEach((doc) => {
      for(let i=0;i<dataToCheck.following.length; i++){
        if(doc.id === dataToCheck.following[i].id){
          following[index] = doc.data();
          index++;
        }
      }
    });
    setAccountFollowing(following);
  }

  async function recoveId(e){
    const accountRef = query(collection(getFirestore(), 'Accounts'), where("username", "==", e.target.id));
    const querySnapshot = await getDocs(accountRef);
    querySnapshot.forEach((doc) => {
        setTempMessageUser(doc.id);
    });
    closeFollow();
  }

  useEffect(()=>{
    if(data){
        recoveAcoountsData(data);
    }
  },[data])

  return (
    <div className="disable-outside-clicks2">
      <div className="followersContainer">
        <div id="formTop">
          <div className="followLabel">
            <div id="newMessageTitle" >New Message</div>
          </div>
          <div className="profileUserHome" ><FontAwesomeIcon icon="fa-solid fa-xmark" className="xMark" onClick={closeFollow}/></div>
        </div><hr/>
        <div className="followerList">
            {accountFollowing.map((account, index) => (
                <div className="singleFollower" key={index} onClick={ (e)=> recoveId(e)}>
                    <div className="singleFollowerTop" id={account.username}>
                        <img className="followProfilePic" id={account.username} src={account.profilePic} alt="profile pic" referrerPolicy="no-referrer"/>
                        <div className="profileData" id={account.username}>
                            <div className="profileNameHome" id={account.username}>{account.name}</div>
                            <div className="profileUserHome" id={account.username}>@{account.username}</div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
      </div> 
    </div>
  );
}

export default Message;