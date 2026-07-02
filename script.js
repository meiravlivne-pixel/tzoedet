const E=['😌','🙂','😅','😓'],P=['😀','🙂','😐','🙁'];
let state={},editIndex=null,deleteIndex=null;
let walks=JSON.parse(localStorage.getItem('walks')||'[]');
function build(id,arr,key){let d=document.getElementById(id);arr.forEach((x,i)=>{let b=document.createElement('span');b.className='choice';b.textContent=x;b.onclick=()=>{state[key]=i;[...d.children].forEach(c=>c.classList.remove('selected'));b.classList.add('selected')};d.appendChild(b);});}
build('effort',E,'e');build('pain',P,'p');
startBtn.onclick=()=>{editIndex=null;walkForm.classList.remove('hidden');};
saveBtn.onclick=()=>{const w={date:new Date().toLocaleDateString('he-IL'),minutes:+minutes.value,e:state.e,p:state.p};if(editIndex===null)walks.push(w);else walks[editIndex]=w;localStorage.setItem('walks',JSON.stringify(walks));walkForm.classList.add('hidden');minutes.value='';render();};
function render(){list.innerHTML='';walks.forEach((w,i)=>{let r=document.createElement('div');r.className='rowItem';r.innerHTML=`<span>${w.date} • ${w.minutes} דק׳</span><span><button onclick='editWalk(${i})'>✏️</button> <button onclick='askDelete(${i})'>🗑️</button></span>`;list.appendChild(r);});}
window.editWalk=i=>{editIndex=i;const w=walks[i];minutes.value=w.minutes;state.e=w.e;state.p=w.p;walkForm.classList.remove('hidden');}
window.askDelete=i=>{deleteIndex=i;dialog.classList.remove('hidden');}
confirmDelete.onclick=()=>{walks.splice(deleteIndex,1);localStorage.setItem('walks',JSON.stringify(walks));dialog.classList.add('hidden');render();}
cancelDelete.onclick=()=>dialog.classList.add('hidden');
render();
