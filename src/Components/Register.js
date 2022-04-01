import React,{useEffect} from "react";
import logo from './logo.webp';

function Register({newUser, oldUserLog}) {

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
    <div className="registerContent">
        <div className="registrationForm">
            <form className="form">
                <div className="formTitle">
                    <img className="logoBig" src={logo} alt="logo"/>
                    <div className="titleForm">Sign Up</div>
                </div>
                <div className="searchBox">
                    <input type="text" className="search" id="username" minLength="3" placeholder="@ Username"/> 
                    <div className="formError">Name must be 3-15 characters.</div>
                </div>
                <div className="buttons">
                    <button id="signUp" onClick={newUser}>Sign Up With Google</button>
                    <div className="formLogIn">
                        <div className="formMessage">Already have an account?</div>
                        <button id="logIn" onClick={oldUserLog}>Log In</button>
                    </div> 
                </div>
            </form>
        </div>
    </div>
  );
}

export default Register;