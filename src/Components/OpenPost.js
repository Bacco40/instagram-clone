import React,{useEffect, useState, useRef} from "react";
import{useNavigate}from "react-router-dom";
import { useParams } from 'react-router-dom';
import heartSolid from './heart-solid.jpg';
import { doc, getDoc, updateDoc,deleteDoc, getFirestore, arrayUnion, arrayRemove,query,collection,getDocs,where,Timestamp} from "firebase/firestore";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { library } from "@fortawesome/fontawesome-svg-core";
import{faEllipsisVertical, faXmark, faShareNodes} from '@fortawesome/free-solid-svg-icons';
import{faHeart, faComment,faPaperPlane, faTrashCan} from '@fortawesome/free-regular-svg-icons';
import { async } from "@firebase/util";
library.add( faHeart, faComment,faEllipsisVertical, faPaperPlane,faXmark, faTrashCan,faShareNodes);

function OpenPost({data, oldUser}) {
  const {id} = useParams();
  const docRef = doc(getFirestore(), "Posts", `${id}`);
  const [dataPost,setDataPost] = useState();
  const [userPost,setUserPost] = useState();
  const [userLiked,setUserLiked] = useState(false);
  const [commentData, setCommentData] = useState();
  const [notification,setNotification] =useState(0);
  const [open, setOpen] = useState(false);
  const [idAccount, setIdAccount] = useState();
  const navigate = useNavigate();
  const wrapperRef = useRef(null);
  useOutsideAlerter(wrapperRef);

  function startAtTop(){
    window.scroll({
      top: 0, 
      left: 0, 
      behavior: 'smooth' 
    });
  }

  function addCommentEnter(e){
    if (e.key === 'Enter') {
        addComment(e);
    }
  }

  async function addComment(e){
    e.preventDefault();
    const comment = document.querySelector('.addComment');
    if(data && comment.value !== ""){
        await updateDoc(docRef,{
            comments: arrayUnion({
                id: idAccount,
                comment: comment.value
            })
        });
        comment.value = "";
        let accountRef = query(collection(getFirestore(), 'Accounts'), where("mail", "==", dataPost.mail ));
        const querySnapshot = await getDocs(accountRef);
        let reference=null;
        querySnapshot.forEach((doc) => {
            reference=doc.id;
        });
        accountRef=doc(getFirestore(), "Accounts", `${reference}`);
        await updateDoc(accountRef,{
            Notifications: arrayUnion({
                profilePic: data.profilePic,
                name: data.name,
                action: "commented" ,
                time: Timestamp.now()
            })
        });
        setNotification(notification+1);
        recovePostData();
    }
    if(!data){
        navigate('/register');
    }
  }

  async function userLikedPost(e){
    e.preventDefault();
    if(data){
        await updateDoc(docRef,{
            likes: arrayUnion({
                mail:data.mail
            })
        });
        let accountRef = query(collection(getFirestore(), 'Accounts'), where("mail", "==", dataPost.mail ));
        const querySnapshot = await getDocs(accountRef);
        let reference=null;
        querySnapshot.forEach((doc) => {
            reference=doc.id;
        });
        accountRef=doc(getFirestore(), "Accounts", `${reference}`);
        await updateDoc(accountRef,{
            Notifications: arrayUnion({
                profilePic: data.profilePic,
                name: data.name,
                action: "liked",
                time: Timestamp.now()
            })
        });
        setNotification(notification+1);
        recovePostData();
    }
    if(!data){
        navigate('/register');
    }
  }

  async function userRemovedLike(e){
    e.preventDefault();
    if(data){
        await updateDoc(docRef,{
            likes: arrayRemove({
                mail:data.mail
            })
        });
        recovePostData();
        setUserLiked(false);
    }
  }

  function currentUserLiked(){
    for(let i=0; i<dataPost.likes.length; i++){
        if(dataPost.likes[i].mail === data.mail){
            setUserLiked(true);
        }
    }
  }

  async function checkAccountMaster(){
    const userAccount = query(collection(getFirestore(), 'Accounts'), where("mail", "==", data.mail ));
    const querySnapshot2 = await getDocs(userAccount);
    querySnapshot2.forEach((doc) => {
      setIdAccount(doc.id);
    });
  }

  async function recovePostData(){
    const docSnap = await getDoc(docRef);
    setDataPost(docSnap.data());
  }

  function useOutsideAlerter(ref) {
    useEffect(() => {
      function handleClickOutside(event) {
        if (ref.current && !ref.current.contains(event.target)) {
            document.querySelector('.deletePost').style.cssText="display:none;";
        }
      }
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, [ref]);
  }

  function hoverHeart(){
      document.querySelector('#likePost').style.cssText="color:red;";
  }

  function removeHover(){
    document.querySelector('#likePost').style.cssText="color:black;";
}

function openMenu(){
    if(open === false){
        document.querySelector('.deletePost').style.cssText="display:flex;"; 
        setOpen(true);
    }else{
        document.querySelector('.deletePost').style.cssText="display:flex;"; 
        setOpen(false);
    }
}

function copyUrl(){
    navigator.clipboard.writeText(window.location.href);
}

async function deletePost(){
    navigate(-1);
    await deleteDoc(docRef);
    let accountRef = query(collection(getFirestore(), 'Accounts'), where("mail", "==", data.mail ));
    const querySnapshot = await getDocs(accountRef);
    let reference=null;
    querySnapshot.forEach((doc) => {
        reference=doc.id;
    });
    accountRef=doc(getFirestore(), "Accounts", `${reference}`);
    await updateDoc(accountRef,{
        posts: arrayRemove({
            postId: docRef.id
        })
    });
}

async function recoveUserPost(){
    let accountRef = query(collection(getFirestore(), 'Accounts'), where("mail", "==", dataPost.mail ));
    const querySnapshot = await getDocs(accountRef);
    querySnapshot.forEach((doc) => {
        setUserPost(doc.data());
    });
}

async function recoveCommenterData(){
    let arrayAccounts =[];
    let arrayAndComment =[];
    for(let i=0;i<dataPost.comments.length;i++){
        const accountDocRef = doc(getFirestore(), "Accounts", `${dataPost.comments[i].id}`);
        const docSnap = await getDoc(accountDocRef);
        arrayAccounts[0]=docSnap.data();
        arrayAndComment[i] =arrayAccounts.concat(dataPost.comments[i]);
    }
    setCommentData(arrayAndComment);
}

useEffect(()=>{
    if(data) {
        oldUser();
    }
  },[notification])

  useEffect(()=>{
    startAtTop();
    recovePostData();
  },[])

  useEffect(()=>{
    if(data && dataPost){
        recoveUserPost();
        currentUserLiked(); 
        checkAccountMaster();
        recoveCommenterData();
    }
  },[data,dataPost])

  return (
    <div className="singlePostPage" >
        {dataPost && userPost &&
            <div className="fullPagePost">
                <div className="fullPageImg">
                    <img className="fullImg"src={dataPost.picture} alt={dataPost.description}/>
                </div>
                <div className="fullPostDescription">
                    <div className="topIcon">
                        <div ref={wrapperRef} className="iconPost">
                            <FontAwesomeIcon icon="fa-solid fa-ellipsis-vertical" onClick={openMenu} />
                            <div className="deletePost" >
                                {data && dataPost.mail === data.mail &&
                                    <div className="menuBtn" onClick={deletePost}>Delete Post &nbsp;<FontAwesomeIcon icon="fa-regular fa-trash-can" /></div>
                                }
                                <div className="menuBtn" onClick={copyUrl}>Copy Link &nbsp;&nbsp;&nbsp;&nbsp;<FontAwesomeIcon icon="fa-solid fa-share-nodes" /></div>
                            </div>
                        </div>
                        <FontAwesomeIcon className="iconPost" icon="fa-solid fa-xmark" onClick={() => navigate(-1)}/>
                    </div>
                    <div className="topData">
                    <img className="homeProfilePic" src={userPost.profilePic} alt="profile pic" referrerPolicy="no-referrer"/>
                    <div className="profileData">
                        <div className="profileNameHome">{userPost.name}</div>
                        <div className="profileUserHome">@{dataPost.username}</div>
                    </div>
                    </div>
                    <div className="singlePostDescription">{dataPost.description}</div><hr/>
                    <div className="commentSection">
                        {dataPost.comments && commentData !== undefined && 
                            <div className="commentContainer">
                            {commentData.map((comment, index) => (
                                <div className="singleComment" key={index}>
                                    <img src={comment[0].profilePic} className="commentPic" alt="profile pic"/>
                                    <div className="commentName">{comment[0].name}:</div>
                                    <div className="actualComment">{comment[1].comment}</div>
                                </div>
                            ))}
                            </div>
                        }
                    </div>
                    <div className="postIcon">
                        <div className="leftSideIcon">
                        {userLiked === false &&
                            <FontAwesomeIcon icon="fa-regular fa-heart" className="userLiked" id="likePost" onMouseEnter={hoverHeart} onMouseLeave={removeHover} onClick={(e) => userLikedPost(e)}/> 
                        }
                        {userLiked === true && 
                            <img src={heartSolid} className="userLiked" alt="user like" onClick={(e) => userRemovedLike(e)}/>
                        }
                        <FontAwesomeIcon icon="fa-regular fa-comment" />
                        </div>
                    </div>
                    <div className="likesNumber">{dataPost.likes.length} Likes</div><hr/>
                    <div className="writeComment">
                        <input type="text" className="addComment" placeholder="Add a Comment..." onKeyDown={(e) => addCommentEnter(e)}/>
                        <button className="confirmComment">
                            <FontAwesomeIcon className="iconPost" icon="fa-regular fa-paper-plane" onClick={(e) => addComment(e)}/>
                        </button>
                    </div>
                </div>
            </div>
        }
    </div>
  );
}

export default OpenPost;