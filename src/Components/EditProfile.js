import React,{useEffect, useRef, useState} from "react";
import loadingGif from './loading.gif';
import{useNavigate}from "react-router-dom";
import {
  getAuth
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  query,
  getDocs,
  where,
  updateDoc,
  doc
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
import{faXmark} from '@fortawesome/free-solid-svg-icons';
library.add(faPenToSquare,faXmark);

function EditProfile({data, getUserData}) {
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
    setLoading(true);
    const name = document.querySelector('#displayName'); 
    const bio = document.querySelector('#bio');
    const userMail = getAuth().currentUser.email;
    try {
        let accountRef = query(collection(getFirestore(), 'Accounts'), where("mail", "==", data.mail ));
        const querySnapshot = await getDocs(accountRef);
        let reference=null;
        querySnapshot.forEach((doc) => {
            reference=doc.id;
        });
        accountRef=doc(getFirestore(), "Accounts", `${reference}`);
        await updateDoc(accountRef,{
            name: name.value,
            bio: bio.value
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
      getUserData(userMail, 'profile');
    }
    catch(error) {
      console.error('Error uploading the account to Firebase Database', error);
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
            <div id="formTopEdit">
                <div className="profileUserHome" ><FontAwesomeIcon icon="fa-solid fa-xmark" className="xMark" onClick={() => navigate(-1)}/></div>
            </div>
            <form className="editForm">
                <div className="backgroundForm" onClick={onImgClick}>
                    <img id="backgroundForm" src={type === 1 ? backgroundUrl : data.coverPic} alt="background pic" onMouseEnter={(e) => imgEffect(e)} onMouseLeave={(e) => imgEffect2(e) } />
                    <div className="updateImg" name="backgroundForm">
                        <div className="likes">
                            <FontAwesomeIcon icon="fa-regular fa-pen-to-square" />
                        </div>
                    </div>
                </div>
                <div className="formDesc">
                    <div className="profilePic" onClick={onPicClick} >
                        <img id="profilePic" src={type2 === 2 ? profileUrl : data.profilePic} alt="pic" referrerPolicy="no-referrer"  onMouseEnter={(e) => imgEffect(e)} onMouseLeave={(e) => imgEffect2(e) } />
                        <div className="updateImg" name="profilePic">
                            <div className="likes">
                                <FontAwesomeIcon icon="fa-regular fa-pen-to-square" />
                            </div>
                        </div>
                    </div>
                    <div className="usernameForm">@{data.username}</div>
                </div>
                <div className="regForm">
                    <label className="formLabel" htmlFor="displayName">Display Name:</label>
                    <input type="text" className="search" id="displayName" defaultValue={data.name} minLength="3" placeholder={data.name}/> 
                    <div className="formError">Name must be 3-20 characters.</div>
                </div>
                <div className="regForm">
                    <label className="formLabel" htmlFor="bio">Bio:</label>
                    <textarea className="search" id="bio" minLength="3" placeholder={data.bio} defaultValue={data.bio}/>
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

export default EditProfile;