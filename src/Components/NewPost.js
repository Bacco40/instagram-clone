import React,{useRef, useState} from "react";
import loadingGif from './loading.gif';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { library } from "@fortawesome/fontawesome-svg-core";
import{faXmark} from '@fortawesome/free-solid-svg-icons';
import{faImage} from '@fortawesome/free-regular-svg-icons';
import {getAuth} from 'firebase/auth';
  import {
    getFirestore,
    collection,
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
  library.add(faImage, faXmark);


function NewPost({closeUploadForm, data, profilePosts,recovePost,from, oldUser}) {
  const post = useRef(null)
  const [postUrl,setPostUrl] = useState();
  const [postFile, setPostFile] = useState();
  const [imageUploaded, setImageUploaded] = useState(false);
  const [loading,setLoading] = useState(false);

  async function savePost(e){
    e.preventDefault();
    const description = document.querySelector('.postDescription');
    if(postFile){
        setLoading(true);
        try {
            const postRef = await addDoc(collection(getFirestore(), 'Posts'), {
                username: data.username,
                mail: getAuth().currentUser.email,
                name: data.name,
                profilePic: data.profilePic,
                picture: "",
                likes: [],
                comments:[],
                description: description.value,
                date: serverTimestamp(),
                link:""
            });
            let accountRef = query(collection(getFirestore(), 'Accounts'), where("mail", "==", getAuth().currentUser.email ));
            const querySnapshot = await getDocs(accountRef);
            let reference=null;
            querySnapshot.forEach((doc) => {
                reference=doc.id;
            });
            accountRef=doc(getFirestore(), "Accounts", `${reference}`);
            await updateDoc(accountRef,{
                posts: arrayUnion({
                    postId:postRef.id
                })
            });
            const filePath = `${getAuth().currentUser.uid}/${postRef.id}/${postFile.name}`;
            const newImageRef = ref(getStorage(), filePath);
            const fileSnapshot = await uploadBytesResumable(newImageRef, postFile);
            const publicImageUrl = await getDownloadURL(newImageRef);
            await updateDoc(postRef,{
                picture: publicImageUrl,
                storagePickUri: fileSnapshot.metadata.fullPath 
            });
        }
        catch(error) {
            console.error('Error uploading the post to Firebase Database', error);
        }
        setLoading(false);
        closeForm();
        if(from === 'Home'){
            oldUser();
            recovePost();
        }
        else{
            profilePosts();
        }
    }
  }

  function imagePreview(e){
    const file = e.target.files[0];
    if (file.type.match('image.*')){
        setPostUrl(URL.createObjectURL(file));
        setPostFile(file)
        setImageUploaded(true);
      }
  }

  function closeForm(){
      setImageUploaded(false);
      setPostFile();
      closeUploadForm();
      const description = document.querySelector('.postDescription');
      description.value="";
  }

  function uploadPost(){
      post.current.click();
  }

  return (
    <div className="disable-outside-clicks">
        <form className="uploadPic">
            <div id="formTop">
                <div className="profileUserHome">Create New Post</div>
                <div className="profileUserHome" ><FontAwesomeIcon icon="fa-solid fa-xmark" className="xMark" onClick={closeForm}/></div>
            </div><hr/>
            <div className="postContainer" onClick={uploadPost}>
                {imageUploaded === false && 
                    <FontAwesomeIcon icon="fa-regular fa-image" className="imageIcon"/>
                }
                {imageUploaded === true &&
                    <img className="postPrev" src={postUrl} alt="user post"/>
                }
            </div>
            <textarea className="postDescription" placeholder="Enter Caption..."/>
            {loading === false &&
                <button className="uploadBtn" onClick={(e)=>savePost(e)} >Post</button>
            }
            {loading === true &&
                <div>
                   <img src={loadingGif} className="loadingGif" alt="loading..."/> 
                </div>
            }
            <input type='file' id='imageUpload' ref={post} style={{display: 'none'}} onChange={imagePreview}/>
        </form>
    </div>
  );
}

export default NewPost;