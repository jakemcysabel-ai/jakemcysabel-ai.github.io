const LS="mock_auth",listeners=[];let current=JSON.parse(localStorage.getItem("mock_current")||"null");
const users=()=>JSON.parse(localStorage.getItem(LS)||"{}"),saveUsers=u=>localStorage.setItem(LS,JSON.stringify(u));
const err=code=>Object.assign(new Error(code),{code});
const setCur=u=>{current=u;localStorage.setItem("mock_current",JSON.stringify(u));listeners.forEach(f=>f(u))};
export const getAuth=()=>({});
export const onAuthStateChanged=(a,f)=>{listeners.push(f);setTimeout(()=>f(current),50);return()=>{}};
export async function createUserWithEmailAndPassword(a,email,pass){const u=users();if(pass.length<6)throw err("auth/weak-password");if(u[email])throw err("auth/email-already-in-use");const user={uid:"uid_"+Object.keys(u).length,email,displayName:null};u[email]={pass,user};saveUsers(u);setCur(user);return{user}}
export async function signInWithEmailAndPassword(a,email,pass){const r=users()[email];if(!r||r.pass!==pass)throw err("auth/invalid-credential");setCur(r.user);return{user:r.user}}
export async function updateProfile(user,{displayName}){const u=users();u[user.email].user.displayName=displayName;saveUsers(u);user.displayName=displayName;localStorage.setItem("mock_current",JSON.stringify(user))}
export async function signOut(){setCur(null)}
export async function sendPasswordResetEmail(){}
export class GoogleAuthProvider{}
export async function signInWithPopup(){throw err("auth/popup-closed-by-user")}
