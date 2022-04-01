import React,{useEffect, useState} from "react";
import{useNavigate}from "react-router-dom";
import { useParams } from 'react-router-dom';
import { doc, getDoc, updateDoc, getFirestore, arrayUnion } from "firebase/firestore";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { library } from "@fortawesome/fontawesome-svg-core";
import{faEllipsisVertical, faXmark} from '@fortawesome/free-solid-svg-icons';
import{faHeart, faComment,faPaperPlane} from '@fortawesome/free-regular-svg-icons';
library.add( faHeart, faComment,faEllipsisVertical, faPaperPlane,faXmark);

function OpenPost({data}) {
  const {id} = useParams();
  const docRef = doc(getFirestore(), "Posts", `${id}`);
  const [dataPost,setDataPost] = useState();
  const navigate = useNavigate();

  function startAtTop(){
    window.scroll({
      top: 0, 
      left: 0, 
      behavior: 'smooth' 
    });
  }

  async function addComment(e){
    e.preventDefault();
    const comment = document.querySelector('.addComment');
    if(data && comment.value !== ""){
        await updateDoc(docRef,{
            comments: arrayUnion({
                profilePic: data.profilePic ,
                name: data.name,
                comment: comment.value
            })
        });
        comment.value = "";
        recovePostData();
    }
  }

  async function recovePostData(){
    const docSnap = await getDoc(docRef);
    setDataPost(docSnap.data());
  }

  useEffect(()=>{
    startAtTop();
    recovePostData();
  },[])

  return (
    <div className="singlePostPage">
        {dataPost &&
            <div className="fullPagePost">
                <div className="fullPageImg">
                    <img className="fullImg"src={dataPost.picture} alt={dataPost.description}/>
                </div>
                <div className="fullPostDescription">
                    <div className="topIcon">
                        <FontAwesomeIcon className="iconPost" icon="fa-solid fa-ellipsis-vertical" />
                        <FontAwesomeIcon className="iconPost" icon="fa-solid fa-xmark" onClick={() => navigate(-1)}/>
                    </div>
                    <div className="topData">
                    <img className="homeProfilePic" src={dataPost.profilePic} alt="profile pic" referrerPolicy="no-referrer"/>
                    <div className="profileData">
                        <div className="profileNameHome">{dataPost.name}</div>
                        <div className="profileUserHome">@{dataPost.username}</div>
                    </div>
                    </div>
                    <div className="singlePostDescription">{dataPost.description}</div><hr/>
                    <div className="commentSection">
                        {dataPost.comments && dataPost.comments !== undefined && 
                            <div className="commentContainer">
                            {dataPost.comments.map((comment, index) => (
                                <div className="singleComment" key={index}>
                                    <img src={comment.profilePic} className="commentPic" alt="profile pic"/>
                                    <div className="commentName">{comment.name}:</div>
                                    <div className="actualComment">{comment.comment}</div>
                                </div>
                            ))}
                            </div>
                        }
                    </div>
                    <div className="postIcon">
                        <div className="leftSideIcon">
                        <FontAwesomeIcon icon="fa-regular fa-heart" />  
                        <FontAwesomeIcon icon="fa-regular fa-comment" />
                        </div>
                    </div>
                    <div className="likesNumber">{dataPost.likes.length} Likes</div><hr/>
                    <div className="writeComment">
                        <input type="text" className="addComment" placeholder="Add a Comment..."/>
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