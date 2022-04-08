import React,{useEffect,useState} from "react";
import {
    getFirestore,
    collection,
    query,
    where,
    getDocs
  } from 'firebase/firestore';

function Follow({accountUsername,addFollow,accountId, userMail}) {
    const [exist,setExist] = useState();
    const [accountMaster, setAccountMaster] = useState();
    const [loading, setLoading] = useState(true);

    async function recoveuserData(){
        const accountRef = query(collection(getFirestore(), 'Accounts'), where("mail", "==", userMail));
        const querySnapshot2 = await getDocs(accountRef);
        querySnapshot2.forEach((doc) => {
            setAccountMaster(doc.data());
        }); 
        setExist(document.querySelector(`.Unfollow[id="${accountUsername}"]`));
    }

    useEffect(() => {
        if(accountMaster !== undefined && accountMaster.username === accountUsername){
            setExist(true);
        }
        if(accountMaster !== undefined){
            setLoading(false);
        }
    }, [accountMaster]);

    useEffect(() => {
        if(userMail){
            recoveuserData();
        }
      }, [userMail]);

  return (
      <>
        {exist === null && loading === false &&
            <button className="Unfollow" id={accountUsername} onClick={(e) => addFollow(e,accountId)}>Follow</button>
        }
        {exist !== null && loading === false &&
            <></>
        }
      </>
  );
}

export default Follow;