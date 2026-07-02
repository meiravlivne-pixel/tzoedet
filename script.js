
const e=['😌','🙂','😅','😓']; const p=['😀','🙂','😐','🙁'];
let st={effort:null,pain:null};
const walks=JSON.parse(localStorage.getItem('walks')||'[]');
function mk(id,arr,key){const d=document.getElementById(id);arr.forEach((x,i)=>{let b=document.createElement('span');b.className='choice';b.textContent=x;b.onclick=()=>{st[key]=i;[...d.children].forEach(c=>c.classList.remove('sel'));b.classList.add('sel');};d.appendChild(b);});}
mk('effort',e,'effort');mk('pain',p,'pain');
document.getElementById('startBtn').onclick=()=>document.getElementById('walk').classList.remove('hidden');
function render(){let l=document.getElementById('log');l.innerHTML='';walks.slice().reverse().forEach(w=>{l.innerHTML+=`<div>${w.date} | ${w.minutes} דק׳ | ${e[w.effort]??''} | ${p[w.pain]??''}</div>`})}
document.getElementById('saveBtn').onclick=()=>{walks.push({date:new Date().toLocaleDateString('he-IL'),minutes:minutes.value,effort:st.effort,pain:st.pain});localStorage.setItem('walks',JSON.stringify(walks));walk.classList.add('hidden');minutes.value='';render();}
render();
