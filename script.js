
const E=['😌','🙂','😅','😓'],P=['😀','🙂','😐','🙁'];
let sel={e:null,p:null};
let walks=JSON.parse(localStorage.getItem('walks')||'[]');
function build(id,arr,key){const d=document.getElementById(id);arr.forEach((x,i)=>{let s=document.createElement('span');s.className='choice';s.textContent=x;s.onclick=()=>{sel[key]=i;[...d.children].forEach(c=>c.classList.remove('sel'));s.classList.add('sel')};d.appendChild(s);});}
build('effort',E,'e');build('pain',P,'p');
startBtn.onclick=()=>walkCard.classList.remove('hidden');
saveBtn.onclick=()=>{
 walks.push({date:new Date().toLocaleDateString('he-IL'),minutes:+minutes.value,e:sel.e,p:sel.p});
 localStorage.setItem('walks',JSON.stringify(walks));
 walkCard.classList.add('hidden');minutes.value='';
 render();
}
function render(){
 const tl=document.getElementById('timeline');
 tl.innerHTML=walks.slice().reverse().map(w=>`<div>🚶 ${w.date} · ${w.minutes} דק׳ · ${E[w.e]??''} ${P[w.p]??''}</div>`).join('');
 weekSummary.textContent=`בוצעו ${walks.length} הליכות`;
 const last3=walks.slice(-3);
 if(last3.length===3){
   const maxPain=Math.max(...last3.map(x=>x.p??0));
   const st=document.querySelector('.status');
   st.className='card status';
   if(maxPain<=1){st.classList.add('green');recommendation.textContent='אפשר לשקול להוסיף 2 דקות.';}
   else if(maxPain==2){st.classList.add('yellow');recommendation.textContent='כדאי להישאר באותו עומס.';}
   else {st.classList.add('red');recommendation.textContent='כדאי להפחית עומס או לנוח.';}
 }
}
render();
