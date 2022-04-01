import React,{useEffect, useRef, useState} from "react";
import background from './background.jpg';
import {
  getAuth
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  addDoc,
  updateDoc
} from 'firebase/firestore';
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL
} from 'firebase/storage';

function CreateProfile({username,fullName, profilePicUrl, getUserData}) {
  const inputBackground = useRef(null);
  const inputProfile = useRef(null);
  const [filePic,setFilePic] = useState();
  const [fileBack, setFileBack] = useState();
  const [backgroundUrl,setBackgroundUrl] = useState();
  const [profileUrl,setProfileUrl] = useState();
  const [type, setType] = useState(0);
  const [type2, setType2] = useState(0);

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
    const userMail = getAuth().currentUser.email;
    try {
      const accountRef = await addDoc(collection(getFirestore(), 'Accounts'), {
        username: username,
        mail: getAuth().currentUser.email,
        name: name.value,
        bio: bio.value,
        profilePic: profilePicUrl,
        coverPic: "https://firebasestorage.googleapis.com/v0/b/instagram-clone-9b54b.appspot.com/o/SSJGEQIJqzVJfJ3cGaPFynJfo9z1%2Fdefault_background%2Fbackground.jpg?alt=media&token=287b4062-4cc5-4da5-ae29-576aaf6ba61c",
        followers: [],
        following:[],
        posts:[]
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
                    <img id="backgroundForm" src={type === 1 ? backgroundUrl : background} alt="background pic" />
                </div>
                <div className="formDesc">
                    <div className="profilePic">
                      <img id="profilePic" src={type2 === 2 ? profileUrl :profilePicUrl} alt="pic" referrerPolicy="no-referrer" onClick={onPicClick}/>
                    </div>
                    <div className="usernameForm">@{username}</div>
                </div>
                <div className="regForm">
                    <label className="formLabel" htmlFor="displayName">Display Name:</label>
                    <input type="text" className="search" id="displayName" defaultValue={fullName} minLength="3" placeholder={fullName}/> 
                    <div className="formError">Name must be 3-20 characters.</div>
                </div>
                <div className="regForm">
                    <label className="formLabel" htmlFor="bio">Bio:</label>
                    <textarea className="search" id="bio" minLength="3" placeholder={`Hi, my name is ${fullName}`} defaultValue={`Hi, my name is ${fullName}`}/>
                </div>
                <div className="buttons">
                    <button id="save" onClick={(e)=>saveUserDetail(e)}>Save</button>
                    <button id="preview">Preview Profile</button>
                </div>
            </form>
            <input type='file' id='inputBackground' ref={inputBackground} style={{display: 'none'}} onChange={uploadImage}/>
            <input type='file' id='inputProfile' ref={inputProfile} style={{display: 'none'}} onChange={uploadImage}/>
        </div>
    </div>
  );
}

export default CreateProfile;