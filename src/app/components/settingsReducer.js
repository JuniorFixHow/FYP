export const DarkModeReducer = (state, action)=>{
    switch(action.type){
        case 'LIGHT':{
            return {
                darkMode: false
            };
        }
        case 'DARK':{
            return {
                darkMode: true
            };
        }
        case 'TOGGLE':{
            return {
                darkMode: !state.darkMode
            };
        }
        default:
            return state;
    }
}



export const LangReducer = (state, action)=>{
    switch(action.type){
        case 'SYSDFT':{
            return {
                lang:'System Default'
            };
        }
        case 'ENGLISH':{
            return {
                lang:'English'
            };
        }
        case 'FRENCH':{
            return {
                lang:'French'
            };
        }
        case 'SPANISH':{
            return {
                lang:'Spanish'
            };
        }
        default:
            return state;
    }
}


export const FontReducer = (state, action)=>{
    switch(action.type){
        case 'SMALL':{
            return {
                font:13
            };
        }
        case 'MEDIUM':{
            return {
                font:16
            };
        }
        case 'LARGE':{
            return {
                font:20
            };
        }

        default:
            return state;
    }
}


export const ToneReducer = (state, action)=>{
    switch(action.type){
        case 'T1':{
            return{
                tone: alert('set tone 1')
            };
        }
        case 'T2':{
            return{
                tone: alert('set tone 2')
            };
        }
        case 'T3':{
            return{
                tone: alert('set tone 3')
            };
        }
        case 'SYSDFT':{
            return{
                tone: alert('System Default set')
            };
        }

        default:
            return state;
    }
}


export const EnterReducer = (state, action)=>{
    switch(action.type){
        case 'TOGGLE':{
            return {
                isEnter:!state.isEnter
            }
        }
        default:
            return state;
    }
}

export const NotiReducer = (state, action)=>{
    switch(action.type){
        case 'TOGGLE':{
            return {
                isNoti:!state.isNoti
            };
        }

        default:
            return state;
    }
}

export const ConvToneReducer = (state, action)=>{
    switch(action.type){
        case 'TOGGLE':{
            return {
                convtone:!state.convtone
            };
        }

        default:
            return state;
    }
}