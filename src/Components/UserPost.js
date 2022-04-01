import React,{useEffect} from "react";
import {Link} from 'react-router-dom';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { library } from "@fortawesome/fontawesome-svg-core";
import{faHeart, faComment} from '@fortawesome/free-solid-svg-icons';
library.add( faHeart, faComment);

function UserPost({post}) {

  function startAtTop(){
    window.scroll({
      top: 0, 
      left: 0, 
      behavior: 'smooth' 
    });
  }

  function imgEffect(e){
    const pic = document.querySelector(`.profilePost[src="${e.target.src}"]`);
    pic.style.cssText =' opacity:0.6;';
    const icon = document.querySelector(`.postNotification[name="${e.target.src}"]`);
    icon.style.cssText = 'display:flex;';
  }

  function imgEffect2(e){
    const pic = document.querySelector(`.profilePost[src="${e.target.src}"]`);
    pic.style.cssText ='opacity:1;';
    const icon = document.querySelector(`.postNotification[name="${e.target.src}"]`);
    icon.style.cssText = 'display:none;';
  }

  useEffect(()=>{
    startAtTop();
  },[])

  return (
    <div className="postContainer">
        <Link className="profilePost" to={`/profile/${post[10]}`}>
          <img className="profilePost" src={post[1]} alt="user post" onMouseEnter={(e) => imgEffect(e)} onMouseLeave={(e) => imgEffect2(e) }/>
        </Link>
        <div className="postNotification" name={post[1]}>
          <div className="likes">
            <div className="numLikes">{post[5].length}</div>
            <FontAwesomeIcon icon="fa-solid fa-heart" />
          </div>
          <div className="likes">
            <div className="numLikes">{post[6].length}</div>
            <FontAwesomeIcon icon="fa-solid fa-comment" />
          </div>
        </div>
    </div>
  );
}

export default UserPost;