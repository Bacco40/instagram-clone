import React,{useEffect,useState} from "react";
import LogIn from './LogIn';
import { doc, getDoc,getFirestore} from "firebase/firestore";

function Home({oldUserLog,logged,data, signOutUser,openUploadForm,closeUploadForm, oldUser,
  closeFollow,openFollowing,setOpenFollowing,addFollow,removeFollow,openFollow}) {
  
  const [postsdata,setPostsData] = useState(); 

  function startAtTop(){
    window.scroll({
      top: 0, 
      left: 0, 
      behavior: 'smooth' 
    });
  }

  async function recovePost(){
    let arrayId =[];
    let arrayPosts = [];
    let userId = [];
    let index =0;
    for(let i=0;i<data.posts.length;i++){
      arrayId[index]=data.posts[i];
      index++;
    }
    for(let a=0;a<data.following.length;a++){
      userId[a] = data.following[a];
    }
    for(let b=0;b<userId.length;b++){
      const accountRef = doc(getFirestore(), "Accounts", `${userId[b].id}`);
      const docSnap = await getDoc(accountRef);
      const userData =docSnap.data();
      for(let c=0;c<userData.posts.length;c++){
        arrayId[index] = userData.posts[c];
        index++;
      }
    }
    for(let d=0;d<arrayId.length;d++){
      const postRef = doc(getFirestore(), "Posts", `${arrayId[d].postId}`);
      const docSnapshot = await getDoc(postRef);
      arrayPosts[d]=docSnapshot.data();
    }
    setPostsData(arrayPosts);
  }

  useEffect(()=>{
    if(data){
      recovePost();
    }
  },[data])

  useEffect(()=>{
    startAtTop();
    if(data){
      oldUser();
      recovePost();
    }
  },[])

  return (
    <div className="homeContent">
        <div className="Posts">
          {postsdata &&
            <>
            {postsdata.map((post,index) =>(
              <></>
            ))}
            </>
          }
        </div>
        <div className="logIn">
            <LogIn 
              oldUserLog={oldUserLog} 
              logged={logged} 
              data={data} 
              signOutUser={signOutUser}
              openUploadForm={openUploadForm}
              closeUploadForm={closeUploadForm}
              closeFollow={closeFollow} 
              openFollow={openFollow} 
              openFollowing={openFollowing}
              setOpenFollowing={setOpenFollowing}
              addFollow={addFollow}
              removeFollow={removeFollow}
            />
        </div>
    </div>
  );
}

export default Home;