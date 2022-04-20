import React,{useEffect, useState, useRef} from "react";
import{useNavigate,Link}from "react-router-dom";
import heartSolid from './heart-solid.jpg';
import { doc, getDoc, updateDoc,deleteDoc, getFirestore, arrayUnion, arrayRemove,query,collection,getDocs,where,Timestamp} from "firebase/firestore";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { library } from "@fortawesome/fontawesome-svg-core";
import{faEllipsisH, faXmark, faShareNodes} from '@fortawesome/free-solid-svg-icons';
import{faHeart, faComment,faPaperPlane, faTrashCan} from '@fortawesome/free-regular-svg-icons';
library.add( faHeart, faComment,faEllipsisH, faPaperPlane,faXmark, faTrashCan,faShareNodes);

function HomePost({post,data,oldUser,setLoading}) {
  const [accountMasterId,setAccountMasterId] = useState();
  const [userPost,setUserPost] = useState();
  const [commentData,setCommentData] = useState();
  const [notification,setNotification] =useState(0);
  const [open, setOpen] = useState(false);
  const [userLiked,setUserLiked] = useState(false);
  const [currentPostId, setCurrentPostId] = useState();
  const wrapperRef = useRef(null);
  useOutsideAlerter(wrapperRef);
  const navigate = useNavigate();

  async function checkAccountMaster(){
    const userAccount = query(collection(getFirestore(), 'Accounts'), where("mail", "==", data.mail ));
    const querySnapshot2 = await getDocs(userAccount);
    querySnapshot2.forEach((doc) => {
      setAccountMasterId(doc.id);
    });
  }

  async function recoveUserPost(){
    let accountRef = query(collection(getFirestore(), 'Accounts'), where("mail", "==", post.mail ));
    const querySnapshot = await getDocs(accountRef);
    querySnapshot.forEach((doc) => {
        setUserPost(doc.data());
    });
  }

  async function recoveCommenterData(){
    let arrayAccounts =[];
    let arrayAndComment =[];
    for(let i=0;i<post.comments.length;i++){
        const accountDocRef = doc(getFirestore(), "Accounts", `${post.comments[i].id}`);
        const docSnap = await getDoc(accountDocRef);
        arrayAccounts[0]=docSnap.data();
        arrayAndComment[i] =arrayAccounts.concat(post.comments[i]);
    }
    setCommentData(arrayAndComment);
  }

    async function recovePostId(){
        let postRef = query(collection(getFirestore(), 'Posts'), where("picture", "==", post.picture ));
        const querySnapshot = await getDocs(postRef);
        querySnapshot.forEach((doc) => {
            postRef = doc.id;
        });
        setCurrentPostId(postRef);
    }

    async function copyUrl(){
        navigator.clipboard.writeText(`https://bacco40.github.io/instagram-clone/${currentPostId}`);
        document.querySelector(`.deletePost2[name="${post.picture}"]`).style.cssText="display:none;"; 
    }

    async function deletePost(){
        const postRef=doc(getFirestore(), "Posts", `${currentPostId}`);
        await deleteDoc(postRef);
        const accountRef=doc(getFirestore(), "Accounts", `${accountMasterId}`);
        await updateDoc(accountRef,{
            posts: arrayRemove({
                postId: postRef.id
            })
        });
        document.querySelector(`.deletePost2[name="${post.picture}"]`).style.cssText="display:none;"; 
        setLoading(true);
        oldUser();
    }

  function openMenu(){
    if(open === false){
        document.querySelector(`.deletePost2[name="${post.picture}"]`).style.cssText="display:flex;"; 
        setOpen(true);
    }else{
        document.querySelector(`.deletePost2[name="${post.picture}"]`).style.cssText="display:flex;"; 
        setOpen(false);
    }
  }

  function useOutsideAlerter(ref) {
    useEffect(() => {
      function handleClickOutside(event) {
        if (ref.current && !ref.current.contains(event.target)) {
            document.querySelector(`.deletePost2[name="${post.picture}"]`).style.cssText="display:none;";
        }
      }
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, [ref]);
  }

  async function userLikedPost(e){
    e.preventDefault();
    if(data){ 
        const postRef=doc(getFirestore(), "Posts", `${currentPostId}`);
        await updateDoc(postRef,{
            likes: arrayUnion({
                mail:data.mail
            })      
        })
        let accountRef = query(collection(getFirestore(), 'Accounts'), where("mail", "==", post.mail ));
        const querySnapshot2 = await getDocs(accountRef);
        let reference=null;
        querySnapshot2.forEach((doc) => {
            reference=doc.id;
        });
        accountRef=doc(getFirestore(), "Accounts", `${reference}`);
        await updateDoc(accountRef,{
            Notifications: arrayUnion({
                id:accountMasterId,
                action: "liked",
                post:currentPostId,
                time: Timestamp.now()
            })
        });
        setNotification(notification+1);
        setLoading(true);
    }
    if(!data){
        navigate('/register');
    }
  }

  async function userRemovedLike(e){
    e.preventDefault();
    if(data){
        const postRef=doc(getFirestore(), "Posts", `${currentPostId}`);
        await updateDoc(postRef,{
            likes: arrayRemove({
                mail:data.mail
            })
        });
        setNotification(notification+1);
        setLoading(true);
    }
  }

  function currentUserLiked(){
    let isIn = 0;
    for(let i=0; i<post.likes.length; i++){
        if(post.likes[i].mail === data.mail){
            isIn=1;
        }
    }
    if(isIn === 0){
        setUserLiked(false);
    }else{
        setUserLiked(true);
    }
  }

  function hoverHeart(){
    document.querySelector(`#likePost[name="${post.picture}"]`).style.cssText="color:red;";
  }

  function removeHover(){
    document.querySelector(`#likePost[name="${post.picture}"]`).style.cssText="color:black;";
  }

  function addCommentEnter(e){
    if (e.key === 'Enter') {
        addComment(e);
    }
  }

  async function addComment(e){
    e.preventDefault();
    const comment = document.querySelector(`.addCommentHome[name="${post.picture}"]`);
    if(data && comment.value !== ""){
        const postRef=doc(getFirestore(), "Posts", `${currentPostId}`);
        await updateDoc(postRef,{
            comments: arrayUnion({
                id: accountMasterId,
                comment: comment.value
            })
        });
        comment.value = "";
        let accountRef = query(collection(getFirestore(), 'Accounts'), where("mail", "==", post.mail ));
        const querySnapshot2 = await getDocs(accountRef);
        let reference=null;
        querySnapshot2.forEach((doc) => {
            reference=doc.id;
        });
        accountRef=doc(getFirestore(), "Accounts", `${reference}`);
        await updateDoc(accountRef,{
            Notifications: arrayUnion({
                id:accountMasterId,
                action: "commented",
                post:currentPostId,
                time: Timestamp.now()
            })
        });
        setNotification(notification+1);
        setLoading(true);
    }
    if(!data){
        navigate('/register');
    }
  }

  useEffect(()=>{
    if(data) {
        oldUser();
    }
  },[notification])

  useEffect(()=>{
    if(data && post){
        recoveUserPost();
        recovePostId();
        currentUserLiked();
        checkAccountMaster();
        recoveCommenterData();
    }
    if(post){
        recoveUserPost();
        recovePostId(); 
    }
  },[data,post])
  
  return (
    <>
    {userPost && post && 
        <div className="singlePostHome" >
            <div className="postTopPart">
                <Link className="topData" to={`/profile/${userPost.username}`}>
                    <img className="postProfilePic" src={userPost.profilePic} alt="profile pic" referrerPolicy="no-referrer"/>
                    <div className="profileData">
                        <div className="profileNamePost">{userPost.name}</div>
                        <div className="profileUserPost">@{post.username}</div>
                    </div>
                </Link>
                <div ref={wrapperRef} className="iconPost">
                    <FontAwesomeIcon icon="fa-solid fa-ellipsis-h" onClick={openMenu} />
                    <div className="deletePost2" name={post.picture}>
                        <div className="deletePost3" >
                            {data && post.mail === data.mail &&
                                <div className="menuBtn" onClick={deletePost}>Delete Post &nbsp;<FontAwesomeIcon icon="fa-regular fa-trash-can" /></div>
                            }
                            <div className="menuBtn" onClick={copyUrl}>Copy Link &nbsp;&nbsp;&nbsp;&nbsp;<FontAwesomeIcon icon="fa-solid fa-share-nodes" /></div>
                        </div>
                    </div>
                </div>
            </div>
            <Link className="imgHomeContainer" to={`/${currentPostId}`}>
                <img className="fullImgHome"src={post.picture} alt={post.description}/>
            </Link>
            <div className="postIcon">
                <div className="leftSideIcon">
                    {userLiked === false &&
                        <FontAwesomeIcon icon="fa-regular fa-heart" className="userLiked" name={post.picture} id="likePost" onMouseEnter={hoverHeart} onMouseLeave={removeHover} onClick={(e) => userLikedPost(e)}/> 
                    }
                    {userLiked === true && 
                        <img src={heartSolid} className="userLiked" alt="user like" onClick={(e) => userRemovedLike(e)}/>
                    }
                    <FontAwesomeIcon icon="fa-regular fa-comment" />
                </div>
                <FontAwesomeIcon icon="fa-solid fa-share-nodes" className="share" onClick={copyUrl}/>
            </div>
            <div className="likesNumber2">{post.likes.length} Likes</div>
            <div className="commentNumber2">
                <Link className="commentName" to={`/profile/${userPost.username}`}>{userPost.name} :</Link>
                {post.description}
            </div>
            {commentData !== undefined && commentData.length>2 && 
                <Link className="commentNumber" to={`/${currentPostId}`}>View all {commentData.length} comments</Link>
            }
            {commentData !== undefined && commentData.length<=1 && 
                <div className="commentNumber"> {commentData.length} comment</div>
            }
            {commentData !== undefined && commentData.length === 2 && 
                <div className="commentNumber"> {commentData.length} comments</div>
            }
            <div className="commentSection">
                {post.comments && commentData !== undefined && 
                    <div className="commentContainer">
                    {commentData.map((comment, index) => (
                        <React.Fragment key={index}>
                            {index<2 &&
                                <Link className="singleComment" key={index} to={`/profile/${comment[0].username}`}>
                                    <div className="commentName">{comment[0].name} :</div>
                                    <div className="actualComment">{comment[1].comment}</div>
                                </Link>
                            }
                        </React.Fragment>
                    ))}
                    </div>
                }
            </div>
            <div className="writeComment2">
                <input type="text" className="addCommentHome" name={post.picture} placeholder="Add a Comment..." onKeyDown={(e) => addCommentEnter(e)}/>
                <button className="confirmComment">
                    <FontAwesomeIcon className="iconPost" id="addComment" icon="fa-regular fa-paper-plane" onClick={(e) => addComment(e)}/>
                </button>
            </div>
        </div>
    }
    </>
  );
}

export default HomePost;