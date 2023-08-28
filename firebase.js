// import firebase from 'firebase/compat/app';
// import 'firebase/compat/auth';
// import 'firebase/compat/firestore';


// export const firebaseConfig = {
//   apiKey: "AIzaSyDwNm1js1mqZvn-v_A-B-ugv5v0KPX_Hk0",
//   authDomain: "chattestone-c5c02.firebaseapp.com",
//   projectId: "chattestone-c5c02",
//   storageBucket: "chattestone-c5c02.appspot.com",
//   messagingSenderId: "758698820015",
//   appId: "1:758698820015:web:b6bf574e16f5fd422a6f5a"
// };

// if(!firebase.apps.length){
//     firebase.initializeApp(firebaseConfig);
// }
//  export {firebase};

// import { initializeApp } from "firebase/app";
// import { getAuth} from 'firebase/auth';
// import { getFirestore} from 'firebase/firestore';

// export const firebaseConfig = {
//   apiKey: "AIzaSyDwNm1js1mqZvn-v_A-B-ugv5v0KPX_Hk0",
//   authDomain: "chattestone-c5c02.firebaseapp.com",
//   projectId: "chattestone-c5c02",
//   storageBucket: "chattestone-c5c02.appspot.com",
//   messagingSenderId: "758698820015",
//   appId: "1:758698820015:web:c8f682442b9026712a6f5a"
// };

// // Initialize Firebase
// const app = initializeApp(firebaseConfig);
// export const auth = getAuth();
// export const db = getFirestore();

import 'expo-firestore-offline-persistence'
import { enableIndexedDbPersistence, initializeFirestore, memoryLocalCache, persistentLocalCache, persistentMultipleTabManager, persistentSingleTabManager} from 'firebase/firestore';
import { initializeApp,} from 'firebase/app';
import { getStorage} from 'firebase/storage';
import {getAuth} from 'firebase/auth';
// import { getMessaging} from "firebase/messaging";



export const firebaseConfig = {
  apiKey: "AIzaSyCOJvUmZR-pEJFbBohtvvgEp0n1-hfSadg",
  authDomain: "findme-25a2d.firebaseapp.com",
  projectId: "findme-25a2d",
  storageBucket: "findme-25a2d.appspot.com",
  messagingSenderId: "270556400804",
  appId: "1:270556400804:web:a7e525aa5c0d92cc1caa31"
};

export const app = initializeApp(firebaseConfig);
// enableIndexedDbPersistence()
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
  localCache: persistentLocalCache(/*settings*/{tabManager: persistentSingleTabManager()})
  })
  
  export const auth = getAuth();
  export const storage = getStorage(app);
  // export const messaging = getMessaging(app);
  