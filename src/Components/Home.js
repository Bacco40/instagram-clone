import React,{useEffect} from "react";
import LogIn from './LogIn';

function Home({oldUserLog,logged,data, signOutUser,openUploadForm,closeUploadForm}) {

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

  return (
    <div className="homeContent">
        <div className="Posts">
            <h1>Amazing Posts</h1>
        </div>
        <div className="logIn">
            <LogIn 
              oldUserLog={oldUserLog} 
              logged={logged} 
              data={data} 
              signOutUser={signOutUser}
              openUploadForm={openUploadForm}
              closeUploadForm={closeUploadForm}
            />
        </div>
    </div>
  );
}

export default Home;