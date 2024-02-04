import { database } from './firebase.js'
import { addDoc, collection, doc, setDoc , serverTimestamp , updateDoc} from "firebase/firestore"; 

export const patientDb = collection(database, 'patient')
export const docDb = collection(database, 'doctor')

//account creation 
export const patient_Acc_Creation = async(
    id,
    email,
    password,
    salt,
    facial_id,
    health_document ,
    classification ,
    id_classification,
    card,
    time
       ) =>{
    await setDoc(doc(database , "patient", id ),{
        email : email ,
        password : password,
        password_salt: salt,
        facial_id : facial_id,
        health_document : {document: health_document , classification: classification },
        id_card: {id_card : card , classification: id_classification},
        start_date_timestamp : serverTimestamp(),
        lastupdate_time: time
    });
}

//creating reference to documents in firebase
export const getDocumentRef =async (table , id)=>{
    const ref = doc(database ,table, id);
    return ref
    
}


export const doc_Acc_Creation = async() =>{
    await addDoc(docDb,{
        //to be continue (ask krishnaa for feilds)
    })
}


export const getDocuments = async()=>{
    
}