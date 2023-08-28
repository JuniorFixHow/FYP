import { collection, doc, getDoc, getDocs, query, serverTimestamp, setDoc, where, addDoc, onSnapshot, deleteDoc, Timestamp } from 'firebase/firestore';
import {db} from '../../firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';




export const addPhoneUser = async({uid, phoneNumber}, sId, token)=>{
    
    const initialPhoneData = {
        id: uid,
        phone: phoneNumber,
        image:"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSpbF9MRc872DyqrFDJJ3MRq68r08IaEKCNGzAqYNpeSK38HOao_E2_50CtB2V4TGM_5ag&usqp=CAU",
        sId,
        tokens:token,
        friends:[],
        folls:[],
        favs:[],
        groups:[],
        cc:[],
        blocked:[],
        level:'100',
        dep:'',
        interest:'',
        allowNoti:true,
        fullname:'',
        username:'',
        hidden:false,
        public:true,
        showFriends:true,
        desc:'',
        what: '',
        createdAt: Timestamp.fromDate(new Date())
    }
    // console.log(initialPhoneData)
    try {
        // const q = query(collection(db, "users"), where("id", "==", uid));
        const user = await getDoc(doc(db, "users", uid));
        if(user.exists()){
            console.log('User already exists')
            AsyncStorage.setItem('userInfo', JSON.stringify(user.data()));
            return user.data();
        }
        else{
            await setDoc(doc(db, "users", uid), initialPhoneData);
            const sub = await getDoc(doc(db, "users", uid));
            AsyncStorage.setItem('userInfo', JSON.stringify(sub.data()));
            return sub.data();
        }
    } catch (error) {
        console.log(error)
    }
}
export const addGoogleUser = async({uid, displayName, email, photoURL}, sId, token)=>{
    const initialGoogleData = {
        id: uid,
        phone:'',
        username: displayName.split(' ')[0],
        email,
        image: photoURL,
        fullname: displayName,
        sId,
        tokens:token,
        friends:[],
        folls:[],
        favs:[],
        cc:[],
        blocked:[],
        groups:[],
        level:'100',
        dep:'',
        allowNoti:true,
        what: '',
        interest:'',
        hidden:false,
        public:true,
        showFriends:true,
        desc:'',
        createdAt: Timestamp.fromDate(new Date()),
    }
   
    try {
        // const q = query(collection(db, "users"), where("id", "==", uid));
        const user = await getDoc(doc(db, "users", uid));
        if(user.exists()){
            console.log('User already exists')
            AsyncStorage.setItem('userInfo', JSON.stringify(user.data()));
            return user.data();
        }
        else{
            await setDoc(doc(db, "users", uid), initialGoogleData);
            const sub = await getDoc(doc(db, "users", uid));
            AsyncStorage.setItem('userInfo', JSON.stringify(sub.data()));
            return sub.data();
        }
        
    } catch (error) {
        console.log(error)
    }
}

export const getUserWithAuth = async(id)=>{
   try {
    const docRef = doc(db, "users", id);
    const res = await getDoc(docRef);
    AsyncStorage.setItem('userInfo', JSON.stringify(res.data()));
    return res.data();
   } catch (error) {
    console.log(error)
   }
}
export const getUser= async(id)=>{
   try {
    const docRef = doc(db, "users", id);
    const res = await getDoc(docRef);
    return res.data();
   } catch (error) {
    console.log(error)
   }
}
export const addData= async(coll, data)=>{
   try {
    const item = await addDoc(collection(db, coll), data);
    return item;
   } catch (error) {
    console.log(error);
    alert('Process failed. Try again');
   }
}
export const fetchData= async(coll)=>{
    
    const reference = collection(db, coll);
    const unsub = onSnapshot(
        reference, (snapshot)=>{
            let list = [];
            snapshot.docs.forEach((doc)=>{
                list.push({id:doc.id, ...doc.data()});
            });
            // console.log(list)
            return list;
        },
        (error)=>{
            console.log(error)
        }
    )
    // console.log(unsub)
    // return unsub;


}
export const deleteData= async(coll, id)=>{
   
   try {
        await deleteDoc(doc(db, coll, id));
   } catch (error) {
    console.log(error);
    alert('Process failed. Try again');
   }
}


