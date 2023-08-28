import { collection, onSnapshot, orderBy, query, where } from "firebase/firestore";
import { createContext, useContext, useEffect, useRef } from "react";
import { db } from "../../../../../firebase";
import { useState } from "react";
import { AppState } from "react-native";
import { AuthContext } from "../authContext/AuthContext";

export const FetchUsersContext = createContext();

export const FetchUsersContextProvider = ({children})=>{
    const {user} = useContext(AuthContext);
    const [students, setStudents] = useState([]);
    const [allGroups, setAllGroups] = useState([]);
    const [requests, setRequests] = useState([]);
    const [allReqs, setAllReqs] = useState([]);
    const [sysAlerts, setSysAlerts] = useState([]);
    const [chats, setChats] = useState([]);
    // const [privateChats, setPrivateChats] = useState([]);
    // const [groupChats, setGroupChats] = useState([]);


    const appState = useRef(AppState.currentState);
  const [appStateVisible, setAppStateVisible] = useState(appState.current);
// console.log('user this ', user)
    useEffect(()=>{
        const reference = collection(db, 'users');
        const unsub = onSnapshot(
            reference, {includeMetadataChanges:true}, (snapshot)=>{
                let list = [];
                snapshot.docs.forEach((doc)=>{
                    list.push({id:doc.id, ...doc.data()});
                });
                // console.log(list)
                if(list.length){
                    setStudents(list.sort((a, b)=>a.createdAt<b.createdAt ? 1:-1))
                }
            },
            (error)=>{
                console.log(error)
            },
            orderBy('createdAt', 'desc')
        )
        return ()=>{
            unsub();
        }
     },[])
    

     useEffect(()=>{
        const reference = collection(db, 'chats');
            //   const q = query(reference, where('members', 'array-contains', user?.id))
              const unsub = onSnapshot(
                  reference,  (snapshot)=>{
                      let list = [];
                      console.log(list)
                      snapshot.docs.forEach((doc)=>{
                          list.push({id:doc.id, ...doc.data()});
                          
                        });
                        // console.log(list.length>0)
                        setChats(list)
                        // if(list.length){
                        //     // setPrivateChats(list.filter(item=>item.members.filter(it=>it===user?.id)).sort((a, b)=>a.lastMsg.time<b.lastMsg.time ? 1:-1).filter(chat=>chat.roomType ==='private'))
                        //     // setGroupChats(list.filter(item=>item.members.filter(it=>it===user?.id)).sort((a, b)=>a.lastMsg.time<b.lastMsg.time ? 1:-1).filter(chat=>chat.roomType ==='group'))
                            
                        // }
                  },
                  (error)=>{
                      console.log(error)
                  },
                  orderBy('createdAt', 'asc')
              )
              return ()=>{
                unsub();
              }
    },[])
// console.log('chats here ', chats)

    useEffect(()=>{
        const reference = collection(db, 'groups');
        const unsub = onSnapshot(
            reference, {includeMetadataChanges:true}, (snapshot)=>{
                let list = [];
                snapshot.docs.forEach((doc)=>{
                    list.push({id:doc.id, ...doc.data()});
                });
                // console.log(list)
                if(list.length){
                    setAllGroups(list.sort((a, b)=>a.createdAt<b.createdAt ? 1:-1))
                }
            },
            (error)=>{
                console.log(error)
            },
            orderBy('createdAt', 'desc')
        )
        return ()=>{
            unsub();
        }
    },[])

    useEffect(()=>{
        const reference = collection(db, 'requests');
        const unsub = onSnapshot(
            reference, {includeMetadataChanges:true}, (snapshot)=>{
                let list = [];
                snapshot.docs.forEach((doc)=>{
                    list.push({id:doc.id, ...doc.data()});
                });
                // console.log(list)
                if(list.length){
                    setRequests(list.sort((a, b)=>a.createdAt<b.createdAt ? 1:-1))
                    setAllReqs(list.sort((a, b)=>a.createdAt<b.createdAt ? 1:-1))
                }
            },
            (error)=>{
                console.log(error)
            },
            orderBy('createdAt', 'desc')
        )
        return ()=>{
            unsub();
        }
    },[])

    useEffect(()=>{
        const reference = collection(db, 'noti');
        const unsub = onSnapshot(
            reference, {includeMetadataChanges:true}, (snapshot)=>{
                let list = [];
                snapshot.docs.forEach((doc)=>{
                    list.push({id:doc.id, ...doc.data()});
                });
                // console.log(list)
                if(list.length){
                    setSysAlerts(list.sort((a, b)=>a.createdAt<b.createdAt ? 1:-1))
                }
            },
            (error)=>{
                console.log(error)
            },
            orderBy('createdAt', 'desc')
        )
        return ()=>{
            unsub();
        }
    },[])

 

  
    //  const fetchData = async()=>{
    //     try {
    //         const users = await AsyncStorage.getItem('dbUsers');
    //         if(users){
    //             setStudents(prev=>[...JSON.parse(users)]);
    //         }

    //         const groups = await AsyncStorage.getItem('dbGroups');
    //         if(groups){
    //             setAllGroups(prev=>[...JSON.parse(groups)]);
    //         }

    //         const req = await AsyncStorage.getItem('dbRequests');
    //         if(req){
    //             setRequests(JSON.parse(req));
    //         }
    //         const notis = await AsyncStorage.getItem('dbNoti');
    //         if(notis){
    //             setSysAlerts(JSON.parse(notis));
    //         }
    //         // const chat = await AsyncStorage.getItem('chats');
    //         // if(chat){
    //         //     setChats(JSON.parse(chat));
    //         // }
    //     } catch (error) {
    //         console.log(error)
    //     }
    //  }


    //  useEffect(()=>{
    //     fetchData();
    // },[])

    useEffect(() => {
        const subscription = AppState.addEventListener('change', nextAppState => {
          if (
            appState.current.match(/inactive|background/) &&
            nextAppState === 'active'
          ) {
            console.log('App has come to the foreground!');
        }
        
            appState.current = nextAppState;
            setAppStateVisible(appState.current);
            console.log('AppState', appState.current);
            // if(sysAlerts.length){
            //     AsyncStorage.setItem('dbNoti', JSON.stringify(sysAlerts.sort((a, b)=>a.createdAt<b.createdAt ? 1:-1)));
            // }
            // if(requests.length){
            //     AsyncStorage.setItem('dbRequests', JSON.stringify(requests.sort((a, b)=>a.createdAt<b.createdAt ? 1:-1)));
            // }
            // if(allGroups.length){
            //     AsyncStorage.setItem('dbGroups', JSON.stringify(allGroups.sort((a, b)=>a.createdAt<b.createdAt ? 1:-1)));
            // }
            // if(students.length){
            //     AsyncStorage.setItem('dbUsers', JSON.stringify(students.sort((a, b)=>a.createdAt<b.createdAt ? 1:-1)));
            // }

            // if(chats.length){
            //     AsyncStorage.setItem('chats', JSON.stringify(chats.sort((a, b)=>a.createdAt<b.createdAt ? 1:-1)))
            //     AsyncStorage.setItem('pchats', JSON.stringify(chats.sort((a, b)=>a.createdAt<b.createdAt ? 1:-1).filter(chat=>chat.roomType ==='private')))
            //     AsyncStorage.setItem('gchats', JSON.stringify(chats.sort((a, b)=>a.createdAt<b.createdAt ? 1:-1).filter(chat=>chat.roomType ==='group')))
            // }
        });
    
        return () => {
          subscription.remove();
        };
      }, []);

    //   console.log(appStateVisible)
    return(
        <FetchUsersContext.Provider value={{
            students, 
            setStudents,
            allGroups,
            setAllGroups,
            requests,
            setRequests,
            sysAlerts,
            setSysAlerts,
            setChats,
            chats,
            allReqs
            // privateChats,
            // setPrivateChats,
            // groupChats,
            // setGroupChats
        }} >
            {children}
        </FetchUsersContext.Provider>
    )
}