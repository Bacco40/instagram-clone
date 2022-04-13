import React,{useEffect, useState} from "react";
import Message from './Message';
import {getFirestore,collection,getDocs,where,query,doc,getDoc,updateDoc,arrayUnion,setDoc} from 'firebase/firestore';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { library } from "@fortawesome/fontawesome-svg-core";
import{faPenToSquare} from '@fortawesome/free-solid-svg-icons';
import{faPaperPlane} from '@fortawesome/free-regular-svg-icons';
import { async } from "@firebase/util";
library.add(faPenToSquare,faPaperPlane);

function Direct({data, closeFollow, openDirect}) {
  const [tempMessageUser, setTempMessageUser] = useState();
  const [tempUserData,setTempUserData] = useState();
  const [selected,setSelected] = useState();
  const [prevSelected, setPrevSelected] = useState();
  const [accountMasterId,setAccountMasterId] = useState();
  const [userMessaged,setUserMessaged] = useState();
  const [messageContent, setMessageContent] = useState();
  const [selectedData,setSelectedData] = useState();

  function startAtTop(){
    window.scroll({
      top: 0, 
      left: 0, 
      behavior: 'smooth' 
    });
  }

  async function recoveUserData(){
    const docRef = doc(getFirestore(), "Accounts", `${tempMessageUser}`);
    const docSnap = await getDoc(docRef);
    setTempUserData(docSnap.data());
    setPrevSelected(selected);
    setSelected(tempMessageUser);
  }

  async function recoveAccountMaster(){
    const accountRef = query(collection(getFirestore(), 'Accounts'), where("username", "==", data.username));
    const querySnapshot = await getDocs(accountRef);
    querySnapshot.forEach((doc) => {
        setAccountMasterId(doc.id);
    });
  }

  async function recoveMessagedUser(){
    const messages = doc(getFirestore(), 'Messages',`${accountMasterId}`);
    let docSnap = await getDoc(messages);
    docSnap=docSnap.data();
    let arrayUser = [] ;
    let arrayUserDetail = [] ;
    let arrayUserDetailTemp = [] ;
    let index = 0;
    for(let i=0;i<docSnap.Messages.length;i++){
      let isIn=false;
      for(let a=0;a<arrayUser.length;a++){
        if(arrayUser[a] === docSnap.Messages[i].chatWith){
          isIn=true;
        }
      }
      if(isIn === false){
        arrayUser[index]=docSnap.Messages[i].chatWith;
        index++;
      }
    }
    for(let b=0;b<arrayUser.length;b++){
      const accountRef = doc(getFirestore(), 'Accounts',`${arrayUser[b]}`);
      const Snap = await getDoc(accountRef);
      arrayUserDetailTemp[0]=Snap.data();
      arrayUserDetail[b]=arrayUserDetailTemp.concat(arrayUser[b])
    }
    setUserMessaged(arrayUserDetail);
  }

  async function newMessage(){
    const message=document.querySelector('#message');
    if(message.value !== "" && selected){
      let messageRef=doc(getFirestore(), "Messages", `${accountMasterId}`);
      let docSnap = await getDoc(messageRef);
      if(docSnap.data()){
        await updateDoc(messageRef,{
          Messages: arrayUnion({
            chatWith:selected,
            message: message.value,
            timestamp: Date.now(),
            read: false,
            idSender: accountMasterId
          })
        });
      }
      else{
        await setDoc(doc(getFirestore(), "Messages", `${accountMasterId}`), {
          Messages: [{
            chatWith:selected,
            message: message.value,
            timestamp: Date.now(),
            read: false,
            idSender: accountMasterId
          }]
        });
      }
      messageRef=doc(getFirestore(), "Messages", `${selected}`);
      docSnap = await getDoc(messageRef);
      if(docSnap.data()){
        messageRef=doc(getFirestore(), "Messages", `${selected}`);
        await updateDoc(messageRef,{
          Messages: arrayUnion({
            chatWith:accountMasterId,
            message: message.value,
            timestamp: Date.now(),
            read: false,
            idSender: accountMasterId
          })
        });
      }
      else{
        await setDoc(doc(getFirestore(), "Messages", `${selected}`), {
          Messages: [{
            chatWith:accountMasterId,
            message: message.value,
            timestamp: Date.now(),
            read: false,
            idSender: accountMasterId
          }]
        });
      }
      message.value="";
      recoveMessage();
    }
  }

  function selectUserToMessage(e){
    setPrevSelected(selected);
    setSelected(e.target.id);
  }

  async function recoveMessage(){
    if(selected){
      let arrayMessage = [];
      let index = 0;
      let messageRef=doc(getFirestore(), "Messages", `${accountMasterId}`);
      const querySnapshot = await getDoc(messageRef);
      messageRef = querySnapshot.data();
      for(let i=0;i<messageRef.Messages.length;i++){
        if(messageRef.Messages[i].chatWith === selected){
          arrayMessage[index]=messageRef.Messages[i];
          index++;
        }
      }
      arrayMessage.sort((a,b) => a.timestamp - b.timestamp); 
      setMessageContent(arrayMessage);
    }
  }

  async function recoveSelectedData(){
    if(selected){
      const accountRef = doc(getFirestore(), 'Accounts',`${selected}`);
      const Snap = await getDoc(accountRef);
      setSelectedData(Snap.data());
    }
  }

  useEffect(()=>{
    if(userMessaged){
      userMessaged[0].map((user) => (setSelected(user)))
    }
  },[userMessaged])

  useEffect(()=>{
    if(selected ){
      recoveMessage();
      recoveSelectedData();
      if(document.querySelector(`.topDataDirect2[id="${prevSelected}"]`)){
        document.querySelector(`.topDataDirect2[id="${prevSelected}"]`).style.cssText="background-color:white;";
      }
      document.querySelector(`.topDataDirect2[id="${selected}"]`).style.cssText="background-color: rgb(243, 237, 237);";
    }
  },[selected])

  useEffect(()=>{
    if(accountMasterId){
      recoveMessagedUser();
    }
  },[accountMasterId])

  useEffect(()=>{
    if(tempMessageUser){
      recoveUserData();
    }
  },[tempMessageUser])

  useEffect(()=>{
    if(data){
      recoveAccountMaster();
    }
  },[data])

  useEffect(()=>{
    startAtTop();
  },[])

  return (
    <div className="directContent">
        {data &&
        <>
          <div className="sideBar">
            <div className="topDataDirect" >
              <img className="homeProfilePic" src={data.profilePic} alt="profile pic" referrerPolicy="no-referrer"/>
              <div className="directTop">
                <div className="profileNameHome">Messages</div>
                <div className="profileNameHome" id="iconNew" onClick={(e)=>openDirect(e)}><FontAwesomeIcon icon="fa-solid fa-pen-to-square"/></div>
              </div>
            </div>
            <div className="userToMessage">
              {tempUserData && !document.querySelector(`.topDataDirect2[id="${selected}"]`) &&
                <div className="topDataDirect2" id={tempMessageUser}>
                  <img className="homeProfilePic" id={tempMessageUser} src={tempUserData.profilePic} alt="profile pic" referrerPolicy="no-referrer"/>
                  <div className="profileData" id={tempMessageUser}>
                      <div className="profileNameHome" id={tempMessageUser}>{tempUserData.name}</div>
                      <div className="profileUserHome" id={tempMessageUser}>@{tempUserData.username}</div>
                  </div>
              </div>
              }
              {userMessaged && userMessaged.map((user,index) => (
                <div className="topDataDirect2" id={user[1]} key={index} onClick={(e) => selectUserToMessage(e)}>
                  <img className="homeProfilePic" id={user[1]} src={user[0].profilePic} alt="profile pic" referrerPolicy="no-referrer"/>
                  <div className="profileData" id={user[1]}>
                      <div className="profileNameHome" id={user[1]}>{user[0].name}</div>
                      <div className="profileUserHome" id={user[1]}>@{user[0].username}</div>
                  </div>
              </div>
              ))}
            </div>
          </div>
          <div className="messageContainer">
            <div className="messagesContainer">
              {messageContent && selectedData && messageContent.map((message,index)=>(
                <div className="singleMessage" key={index}>
                  {message.idSender === selected &&
                    <img src={selectedData.profilePic} className="commentPic" alt="profile pic"/>
                  }
                  {message.idSender !== selected &&
                    <div></div>
                  }
                  <div className="actualMessage">{message.message}</div>
                  {message.idSender === accountMasterId &&
                    <img src={data.profilePic} className="commentPic" alt="profile pic"/>
                  }
                </div>
              ))}
            </div>
            <div className="sendMessage">
              <input type="text" className="search" id="message" placeholder="New Message..."/>
              <FontAwesomeIcon icon="fa-regular fa-paper-plane" onClick={newMessage}/>
            </div>
          </div>
          <Message data={data} closeFollow={closeFollow} setTempMessageUser={setTempMessageUser}/>
        </>
        }
    </div>
  );
}

export default Direct;