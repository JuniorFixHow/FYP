import { Timestamp } from "firebase/firestore";
import { addData } from "../miscellaneous/endpoints";
// import jwt from 'jsonwebtoken';


export const checkTimeSince = (time)=>{
    const t2 = new Date();
    let t = (t2 - time ) / (1000*3600*24);
    hr = (t2 - time ) / (1000*3600);
    min = (t2 - time ) / (1000*60)
// console.log(t/365)
    if(t>365){
        return `${(Math.floor(t/365))} years ago`;
    }
    else if(t===365){
        return `${(Math.floor(t/365))} year ago`;
    }
    else if(t===30){
        return `${(Math.floor(t/30))} month ago`;
    }
    else if(t>30 && t<365){
        return `${(Math.floor(t/30))} months ago`;
    }
    else if(t===7){
        return `${(Math.floor(t/7))} week ago`;
    }
    else if(t>7 && t <30){
        return `${(Math.floor(t/7))} weeks ago`;
    }
    else if(t===1){
        return `${(Math.floor(t/1))} yesterday`;
    }
    else if(t>1 && t< 7){
        return `${(Math.floor(t/1))} days ago`;
    }
    else if(hr===1){
        return `${(Math.floor(hr/1))} an hour ago`;
    }
    else if(hr>1 && hr < 24){
        return `${(Math.floor(hr/1))} hours ago`;
    }
    else if(min===1){
        return `${(Math.floor(min/1))} a minute ago`;
    }
    else if(min>1 && min < 60){
        return `${(Math.floor(min/1))} minutes ago`;
    }
    else if(min<1){
        return `just now`;
    }
}

export const createGroupNotification = async(id, image, title, message, uid)=>{
    const data ={
        senderId: id,
        image,
        title,
        message,
        read: false,
        receiverId: uid,
        createdAt: Timestamp.fromDate(new Date())
    }

    try {
        await addData('noti', data);
    } catch (error) {
        console.log(error)
    }
}

export const convertFileSize = (size)=>{
    const fz = Math.round(size/1000);
    const conv = Math.round(fz / 1000);
    if(fz < 1000){
        return fz + ' KB'
    }
    else{
        return conv + ' MB'
    }
}

export const sendUniversalNotification = async(title, content, receiver)=>{
    const message = {
        to: receiver,
        sound: 'default',
        title,
        body: content,
        data: {},
      };
    
    try {
        await fetch('https://exp.host/--/api/v2/push/send', {
            method: 'POST',
            headers: {
              Accept: 'application/json',
              'Accept-encoding': 'gzip, deflate',
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(message),
          });
    } catch (error) {
        console.log(error)
    }
}

export const fetchUnique = (arr)=>{
    var newArr=[];

    for(var i=0;i<arr.length;i++)
    {
        const str =arr[i];
        if(newArr.indexOf(str)==-1)
            {
            newArr.push(str);
            }
    }
    return newArr;
}
