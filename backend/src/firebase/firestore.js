import { database } from './firebase.js'
import { addDoc, collection, doc, setDoc , serverTimestamp , updateDoc, documentId , getDoc} from "firebase/firestore"; 

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
    time
       ) =>{
    await setDoc(doc(database , "patient", id ),{
        email : email ,
        password : password,
        password_salt: salt,
        facial_id : facial_id,
        health_document : health_document ,
        start_date_timestamp : serverTimestamp(),
        lastupdate_time: time
    });
}

//creating reference to documents in firebase
export const getDocumentRef =async (table , id)=>{
    const ref = doc(database ,table, id);
    return ref
    
}



//https://www.jsowl.com/get-a-document-using-its-id-from-a-collection-in-firestore/
export const getDocuments_patients = async(paitent_id)=>{
    var list = []
    const docref = await getDocumentRef("patient" , paitent_id)
    const docSnap = await getDoc(docref)
    if (docSnap.exists()) {
        console.log(docSnap.data());
        return docSnap.data()
      }
      else {
        console.log("No such document!");
      }
    
}