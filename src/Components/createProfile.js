import React,{useEffect, useRef, useState} from "react";
import{useNavigate}from "react-router-dom";
import background from './background.jpg';
import profilePic from './profile.jpeg';
import loadingGif from './loading.gif';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  addDoc,
  updateDoc,
  query,
  getDocs,
  doc,
  where,
  arrayUnion
} from 'firebase/firestore';
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL
} from 'firebase/storage';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { library } from "@fortawesome/fontawesome-svg-core";
import{faPenToSquare} from '@fortawesome/free-regular-svg-icons';
library.add(faPenToSquare);

function CreateProfile({username, getUserData, setNewUserLog}) {
  const inputBackground = useRef(null);
  const inputProfile = useRef(null);
  const [filePic,setFilePic] = useState();
  const [fileBack, setFileBack] = useState();
  const [backgroundUrl,setBackgroundUrl] = useState();
  const [profileUrl,setProfileUrl] = useState();
  const [type, setType] = useState(0);
  const [type2, setType2] = useState(0);
  const [loading,setLoading] = useState(false);
  const navigate = useNavigate();

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

  function uploadImage(e){
    const file = e.target.files[0];
    if (file.type.match('image.*') && e.target.id ==="inputBackground"){
      setBackgroundUrl(URL.createObjectURL(file));
      setFileBack(file)
      setType(1);
    }
    if (file.type.match('image.*') && e.target.id ==="inputProfile"){
      setProfileUrl(URL.createObjectURL(file));
      setFilePic(file);
      setType2(2);
    }
  }

  async function saveUserDetail(e){
    e.preventDefault();
    const name = document.querySelector('#displayName'); 
    const bio = document.querySelector('#bio');
    if(username && name.value.length>3 && name.value.length<20){
        setLoading(true);
      setNewUserLog(true);
      const provider = new GoogleAuthProvider();
      await signInWithPopup(getAuth(), provider);
      const userMail = getAuth().currentUser.email;
      const userAlreadyExist = query(collection(getFirestore(), 'Accounts'), where("mail", "==", userMail ));
      const querySnapshot = await getDocs(userAlreadyExist);
      let length=0;
      querySnapshot.forEach((doc) => {
        length+=1;
      })
      if(length === 0){
        try {
          const accountRef = await addDoc(collection(getFirestore(), 'Accounts'), {
            username: username,
            mail: getAuth().currentUser.email,
            name: name.value,
            bio: bio.value,
            profilePic: profilePic,
            coverPic: "https://firebasestorage.googleapis.com/v0/b/instagram-clone-9b54b.appspot.com/o/SSJGEQIJqzVJfJ3cGaPFynJfo9z1%2Fdefault_background%2Fbackground.jpg?alt=media&token=287b4062-4cc5-4da5-ae29-576aaf6ba61c",
            followers: [],
            following:[{id:"aHNNPx20S4uDYTpWxqMu"}],
            posts:[],
            Notifications:[]
          });
          const docRef = doc(getFirestore(), "Accounts", `aHNNPx20S4uDYTpWxqMu`);
          await updateDoc(docRef,{
            followers: arrayUnion({
                id: accountRef.id
            })
          });
          if(type === 1){
            const filePath = `${getAuth().currentUser.uid}/${accountRef.id}/${fileBack.name}`;
            const newImageRef = ref(getStorage(), filePath);
            const fileSnapshot = await uploadBytesResumable(newImageRef, fileBack);
            const publicImageUrl = await getDownloadURL(newImageRef);
            await updateDoc(accountRef,{
              coverPic: publicImageUrl,
              storageBackUri: fileSnapshot.metadata.fullPath
            });
          }
          if(type2 === 2){
            const filePath = `${getAuth().currentUser.uid}/${accountRef.id}/${filePic.name}`;
            const newImageRef = ref(getStorage(), filePath);
            const fileSnapshot = await uploadBytesResumable(newImageRef, filePic);
            const publicImageUrl = await getDownloadURL(newImageRef);
            await updateDoc(accountRef,{
              profilePic: publicImageUrl,
              storagePicUri: fileSnapshot.metadata.fullPath
            });
          }
          setNewUserLog(false);
          getUserData(userMail, 'profile');
        }
        catch(error) {
          console.error('Error uploading the account to Firebase Database', error);
        }
      }
      else{
        if(length!==0){
          setNewUserLog(false);
          getUserData(userMail, 'profile');
        }
      }
    }
    else{
      const error = document.querySelector('.formError');
      if(name.value.length<3){
        error.innerHTML = 'Username must be at least 3 character!';
        error.style.cssText = 'color:red;';
      }
      if(name.value.length>20){
        error.innerHTML = 'Username must be maximum 20 character!';
        error.style.cssText = 'color:red;';
      }
      if(username=== undefined){
          navigate('/register');
        }
    }
  }

  function imgEffect(e){
    const pic = document.querySelector(`#${e.target.id}`);
    pic.style.cssText =' opacity:0.6;';
    const icon = document.querySelector(`.updateImg[name="${e.target.id}"]`);
    icon.style.cssText = 'display:flex;';
  }

  function imgEffect2(e){
    const pic = document.querySelector(`#${e.target.id}`);
    pic.style.cssText ='opacity:1;';
    const icon = document.querySelector(`.updateImg[name="${e.target.id}"]`);
    icon.style.cssText = 'display:none;';
  }

  const onImgClick = () => {
    inputBackground.current.click();
  };

  const onPicClick = () => {
    inputProfile.current.click();
  };

  return (
    <div className="createUserContent">
        <div className="createUserForm">
            <form className="editForm">
                <div className="backgroundForm" onClick={onImgClick}>
                    <img id="backgroundForm" src={type === 1 ? backgroundUrl : background} alt="background pic" onMouseEnter={(e) => imgEffect(e)} onMouseLeave={(e) => imgEffect2(e) } />
                    <div className="updateImg" name="backgroundForm">
                        <div className="likes">
                            <FontAwesomeIcon icon="fa-regular fa-pen-to-square" />
                        </div>
                    </div>
                </div>
                <div className="formDesc">
                    <div className="profilePic" onClick={onPicClick} >
                      <img id="profilePic" src={type2 === 2 ? profileUrl :profilePic} alt="pic" referrerPolicy="no-referrer" onMouseEnter={(e) => imgEffect(e)} onMouseLeave={(e) => imgEffect2(e) } />
                      <div className="updateImg" name="profilePic">
                            <div className="likes">
                                <FontAwesomeIcon icon="fa-regular fa-pen-to-square" />
                            </div>
                        </div>
                    </div>
                    <div className="usernameForm">@{username}</div>
                </div>
                <div className="regForm">
                    <label className="formLabel" htmlFor="displayName">Display Name:</label>
                    <input type="text" className="search" id="displayName" defaultValue={username} minLength="3" placeholder={username}/> 
                    <div className="formError">Name must be 3-20 characters.</div>
                </div>
                <div className="regForm">
                    <label className="formLabel" htmlFor="bio">Bio:</label>
                    <textarea className="search" id="bio" minLength="3" placeholder={`Hi, my name is ${username}`} defaultValue={`Hi, my name is ${username}`}/>
                </div>
                {loading === false &&
                  <div className="buttons">
                      <button id="save" onClick={(e)=>saveUserDetail(e)}>Save</button>
                  </div>
                }
            </form>
            <input type='file' id='inputBackground' ref={inputBackground} style={{display: 'none'}} onChange={uploadImage}/>
            <input type='file' id='inputProfile' ref={inputProfile} style={{display: 'none'}} onChange={uploadImage}/>
            {loading === true &&
                <div>
                   <img src={loadingGif} className="loadingGifCreate" alt="loading..."/> 
                </div>
            }
        </div>
    </div>
  );
}

export default CreateProfile;