import React,{useEffect} from "react";

function Direct() {

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
    <div className="directContent">
        <h1>Direct</h1>
    </div>
  );
}

export default Direct;