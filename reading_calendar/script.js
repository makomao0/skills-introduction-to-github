let currentYear = new Date().getFullYear();
let currentMonth = new Date().getMonth();
let selectedDate = null;

function renderCalendar() {
    const calendar = document.getElementById('calendar');
    calendar.innerHTML = '';
    const entries = JSON.parse(localStorage.getItem('entries') || '{}');
    const keyPrefix = `${currentYear}-${currentMonth + 1}`;

    for (let i = 1; i <= new Date(currentYear, currentMonth + 1, 0).getDate(); i++) {
        const dateKey = `${keyPrefix}-${i}`;
        const entry = entries[dateKey] || {};
        const cell = document.createElement('div');
        cell.className = 'calendar-cell';
        cell.innerHTML = `<div class="day-number">${i}</div>${entry.stamp ? `<div>${entry.stamp}</div>` : ''}`;
        cell.onclick = () => {
            selectedDate = dateKey;
            loadForm(dateKey);
            openModal(dateKey);
        };
        calendar.appendChild(cell);
    }
    document.getElementById('monthLabel').textContent = `${currentYear}年 ${currentMonth + 1}月`;
}

function renderBookmarks(filter = 'all') {
    const list = document.getElementById('bookmark-list');
    if (!list) return;
    list.innerHTML = '';
    const entries = JSON.parse(localStorage.getItem('entries') || '{}');
    const groups = { '💘': [], '😭': [], '💧': [], '😲': [], '😴': [] };
    Object.entries(entries).forEach(([dateKey, entry]) => {
        if (filter === '読了' && entry.status !== '読了') return;
        if (filter === '未読' && entry.status !== '未読') return;
        if (filter === 'favorite' && !entry.favorite) return;
        if (['💘','😭','💧','😲','😴'].includes(filter) && entry.stamp !== filter) return;
        const stamp = entry.stamp || '💘';
        if (groups[stamp]) groups[stamp].push({dateKey, entry});
    });
    Object.entries(groups).forEach(([stamp,cards])=>{
        if(cards.length>0){
            const heading=document.createElement('h3');
            heading.textContent=`${stamp} の本`;
            list.appendChild(heading);
            cards.forEach(({dateKey,entry})=>{
                const card=document.createElement('div');
                card.className='bookmark-card';
                if(entry.stamp==='💘') card.classList.add('heart');
                if(entry.stamp==='😭') card.classList.add('cry');
                if(entry.stamp==='💧') card.classList.add('tears');
                if(entry.stamp==='😲') card.classList.add('surprise');
                if(entry.stamp==='😴') card.classList.add('sleepy');
                card.innerHTML=`<h4>${entry.title || '(未記入)'} ${entry.favorite?'⭐':''}</h4>
<p><strong>著者:</strong> ${entry.author || '-'}</p>
<p><strong>感想:</strong> ${entry.impression || '-'}</p>
<p><strong>お気に入りの一文:</strong> ${entry.quote || '-'}</p>
<p><strong>ステータス:</strong> ${entry.status || '未読'}</p>`;
                card.onclick=()=>{selectedDate=dateKey;loadForm(dateKey);openModal(dateKey);};
                list.appendChild(card);
            });
        }
    });
}

document.querySelectorAll('.filter-buttons button').forEach(button=>{
    button.onclick=()=>{ renderBookmarks(button.getAttribute('data-filter')); };
});

function loadForm(dateKey){
    const entries=JSON.parse(localStorage.getItem('entries')||'{}');
    const entry=entries[dateKey]||{};
    document.getElementById('calendar-edit-title').value=entry.title||'';
    document.getElementById('calendar-edit-author').value=entry.author||'';
    document.getElementById('calendar-edit-impression').value=entry.impression||'';
    document.getElementById('calendar-edit-quote').value=entry.quote||'';
    document.getElementById('favorite-check').checked=!!entry.favorite;
    document.querySelectorAll('#calendar-edit-stamps .stamp').forEach(stamp=>{
        stamp.classList.toggle('selected', stamp.textContent===entry.stamp);
    });
    if(entry.status){
        document.querySelectorAll('input[name="status"]').forEach(r=>{ r.checked = (r.value===entry.status); });
    }
}

function openModal(){
    const modal=document.getElementById('edit-modal');
    modal.style.display='flex';
    const content=modal.querySelector('.modal-content');
    content.style.animation='modalFadeIn 0.3s forwards';
}
function closeModal(){
    const modal=document.getElementById('edit-modal');
    const content=modal.querySelector('.modal-content');
    content.style.animation='modalFadeOut 0.3s forwards';
    setTimeout(()=>{ modal.style.display='none'; },300);
}

document.getElementById('calendar-edit-save').onclick=()=>{
    if(!selectedDate) return;
    const entries=JSON.parse(localStorage.getItem('entries')||'{}');
    entries[selectedDate]={
        title:document.getElementById('calendar-edit-title').value,
        author:document.getElementById('calendar-edit-author').value,
        impression:document.getElementById('calendar-edit-impression').value,
        quote:document.getElementById('calendar-edit-quote').value,
        stamp:document.querySelector('#calendar-edit-stamps .stamp.selected')?.textContent||'',
        status:document.querySelector('input[name="status"]:checked')?.value||'未読',
        favorite:document.getElementById('favorite-check').checked
    };
    localStorage.setItem('entries',JSON.stringify(entries));
    alert('保存しました！');
    closeModal();
    renderCalendar();
    renderBookmarks();
};

document.getElementById('calendar-edit-delete').onclick=()=>{
    if(!selectedDate) return;
    const entries=JSON.parse(localStorage.getItem('entries')||'{}');
    delete entries[selectedDate];
    localStorage.setItem('entries',JSON.stringify(entries));
    alert('削除しました');
    closeModal();
    renderCalendar();
    renderBookmarks();
};

document.getElementById('calendar-edit-close').onclick=closeModal;
document.getElementById('edit-modal').addEventListener('click',e=>{ if(e.target.id==='edit-modal') closeModal(); });
document.querySelectorAll('#calendar-edit-stamps .stamp').forEach(stamp=>{ stamp.onclick=()=>{document.querySelectorAll('#calendar-edit-stamps .stamp').forEach(s=>s.classList.remove('selected')); stamp.classList.add('selected');};});

document.getElementById('prevMonth').onclick=()=>{ currentMonth--; if(currentMonth<0){currentMonth=11;currentYear--;} renderCalendar(); };
document.getElementById('nextMonth').onclick=()=>{ currentMonth++; if(currentMonth>11){currentMonth=0;currentYear++;} renderCalendar(); };

function renderChart(){
    const canvas=document.getElementById('stampChart');
    if(!canvas) return;
    const entries=JSON.parse(localStorage.getItem('entries')||'{}');
    const counts={'💘':0,'😭':0,'💧':0,'😲':0,'😴':0};
    Object.values(entries).forEach(e=>{ if(e.stamp && counts[e.stamp]!==undefined) counts[e.stamp]++; });
    const ctx=canvas.getContext('2d');
    new Chart(ctx,{type:'bar',data:{labels:Object.keys(counts),datasets:[{label:'スタンプ使用数',data:Object.values(counts),backgroundColor:['#e76f51','#f4a261','#2a9d8f','#457b9d','#b5838d']}]} ,options:{responsive:true,plugins:{legend:{display:false}},scales:{y:{beginAtZero:true}}});
}

document.querySelectorAll('.nav a').forEach(link=>{
    link.onclick=(e)=>{ e.preventDefault(); const target=link.getAttribute('data-target'); document.querySelectorAll('main > section').forEach(s=>s.style.display='none'); document.querySelector('.'+target).style.display='block'; if(target==='bookmark-page') renderBookmarks(); if(target==='mypage-page') renderChart(); };
});

document.addEventListener('DOMContentLoaded',()=>{ renderCalendar(); renderBookmarks(); });

// --- Book recommendation based on impression text ---
async function fetchBookByKeyword(keyword){
    const res=await fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(keyword)}&maxResults=5`);
    const data=await res.json();
    if(data.items && data.items.length>0){
        const chosen=data.items[Math.floor(Math.random()*data.items.length)].volumeInfo;
        return { title:chosen.title, authors:(chosen.authors||['不明']).join(', '), description:chosen.description||'説明なし', thumbnail:chosen.imageLinks?.thumbnail||'', infoLink:chosen.infoLink };
    }
    throw new Error('本が見つかりません');
}
function displayBookCard(book){
    const html=`<div class="recommend-card"><h3>${book.title}</h3><p><strong>著者:</strong> ${book.authors}</p><p><strong>あらすじ:</strong> ${book.description}</p>${book.thumbnail?`<img src="${book.thumbnail}" alt="表紙">`:''}<br><a href="${book.infoLink}" target="_blank">📖 詳しく読む</a></div>`;
    document.getElementById('book-card').innerHTML=html;
}

document.getElementById('analyze-btn').addEventListener('click',async()=>{
    const text=document.getElementById('impression-text').value;
    let keyword='小説';
    if(/泣|悲|涙/.test(text)) keyword='感動 小説';
    else if(/笑|面白|楽しい/.test(text)) keyword='コメディ 小説';
    else if(/恋|ラブ|ときめき/.test(text)) keyword='恋愛 小説';
    else if(/謎|ミステリ|推理/.test(text)) keyword='ミステリー 小説';
    else if(/癒|ほっこり|リラックス/.test(text)) keyword='癒し 小説';
    try{
        const book=await fetchBookByKeyword(keyword);
        displayBookCard(book);
    }catch(err){
        alert('おすすめ本を取得できませんでした');
        console.error(err);
    }
});
