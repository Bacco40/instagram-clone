import React,{useEffect,useState} from "react";
import LogIn from './LogIn';
import HomePost from './HomePost';
import loadingGif from './loading2.gif';
import { doc, getDoc,getFirestore} from "firebase/firestore";

function Home({oldUserLog,logged,data, signOutUser,openUploadForm,closeUploadForm, oldUser,
  closeFollow,openFollowing,setOpenFollowing,addFollow,removeFollow,openFollow}) {
  
  const [postsdata,setPostsData] = useState(); 
  const [loading,setLoading] = useState(true);
  const [from,setFrom] = useState('Home');

  function startAtTop(){
    window.scroll({
      top: 0, 
      left: 0, 
      behavior: 'smooth' 
    });
  }

  async function recovePost(){
    setLoading(true)
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
    arrayPosts.sort((a,b) => b.date - a.date); 
    setPostsData(arrayPosts);
  }

  async function recoveDefaultPost(){
    setLoading(true)
    let userId =["0F2Ys6I2yk3kkFVIZ3Fs","CSmoGiGCzFWVGiBlLnin","aHNNPx20S4uDYTpWxqMu","kDF43uAbTBFzZkyiUkc7"];
    let arrayPosts = [];
    let arrayId = [];
    let index =0;
    for(let b=0;b<userId.length;b++){
      const accountRef = doc(getFirestore(), "Accounts", `${userId[b]}`);
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
    arrayPosts.sort((a,b) => b.date - a.date);
    setPostsData(arrayPosts);
  }

  useEffect(()=>{
    if(postsdata){
      setLoading(false)
    }
  },[postsdata])

  useEffect(()=>{
    if(data && loading === true){
      recovePost();
    }
  },[data])

  useEffect(()=>{
    if(logged === false){
      recoveDefaultPost();
    }
  },[logged])


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
          {loading === true && !postsdata &&
            <img src={loadingGif} className="loadingGif3" alt="loading..."/>
          }
          {postsdata &&
            <>
            {postsdata.map((post,index) =>(
              <HomePost key={index} post={post} data={data} oldUser={oldUser} setLoading={setLoading}/>
            ))}
            </>
          }
        </div>
        <div className="logIn">
            <LogIn 
              oldUserLog={oldUserLog} 
              recovePost={recovePost}
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
              from={from}
              oldUser={oldUser}
              loadingHome={setLoading}
            />
        </div>
    </div>
  );
}

export default Home;