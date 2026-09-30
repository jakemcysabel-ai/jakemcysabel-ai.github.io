const K="mock_db",db=()=>JSON.parse(localStorage.getItem(K)||"{}"),subs={};
export const initializeFirestore=()=>({}),persistentLocalCache=()=>({}),persistentMultipleTabManager=()=>({});
export const doc=(d,...p)=>p.join("/"),serverTimestamp=()=>Date.now();
const snap=(path,meta)=>{const v=db()[path];return{exists:()=>!!v,data:()=>v,metadata:meta}};
export function onSnapshot(path,opts,next){(subs[path]??=[]).push(next);setTimeout(()=>{next(snap(path,{fromCache:true,hasPendingWrites:false}));setTimeout(()=>next(snap(path,{fromCache:false,hasPendingWrites:false})),100)},30);return()=>{subs[path]=subs[path].filter(f=>f!==next)}}
export async function setDoc(path,data,o){const d=db();d[path]={...(o?.merge?d[path]:{}),...data};localStorage.setItem(K,JSON.stringify(d));(subs[path]||[]).forEach(f=>f(snap(path,{fromCache:false,hasPendingWrites:true})));await new Promise(r=>setTimeout(r,50));(subs[path]||[]).forEach(f=>f(snap(path,{fromCache:false,hasPendingWrites:false})))}
