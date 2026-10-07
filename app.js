const KEY='muenz.collection.v1';
const $=s=>document.querySelector(s);
const TYPES={J5:{label:'JÄGER 5 · SILVER ISSUE',text:'The first silver type of the imperial 20 Pfennig.',metal:'Silver · 900‰',weight:'1.111 g',years:'1873–1877'},J6:{label:'JÄGER 6 · COPPER-NICKEL I',text:'Copper-nickel type with the large shield on the eagle.',metal:'Copper-nickel',weight:'6.25 g',years:'1887–1888'},J14:{label:'JÄGER 14 · COPPER-NICKEL II',text:'Copper-nickel type with the small shield on the eagle.',metal:'Copper-nickel',weight:'6.25 g',years:'1890–1892'}};

Object.assign(TYPES,{
 J9:{denomination:'1 Mark',short:'Small eagle',label:'JÄGER 9 · SMALL EAGLE',text:'Silver 1 Mark with a small imperial eagle and a large shield.',metal:'Silver · 900‰',weight:'5.56 g',years:'1873–1887'},
 J17:{denomination:'1 Mark',short:'Large eagle',label:'JÄGER 17 · LARGE EAGLE',text:'Silver 1 Mark with a large imperial eagle and a small shield.',metal:'Silver · 900‰',weight:'5.56 g',years:'1891–1916'}
});
Object.assign(TYPES,{
 J7:{denomination:'50 Pfennig',short:'Early type',label:'JÄGER 7 · EARLY TYPE',text:'Early silver 50 Pfennig with the small imperial eagle; first reverse design.',metal:'Silver · 900‰',weight:'2.78 g',years:'1875–1877'},
 J8:{denomination:'50 Pfennig',short:'Oak-wreath type',label:'JÄGER 8 · OAK-WREATH TYPE',text:'Redesigned silver 50 Pfennig with the small imperial eagle and value in an oak wreath.',metal:'Silver · 900‰',weight:'2.78 g',years:'1877–1878'},
 J15:{denomination:'50 Pfennig',short:'Large eagle',label:'JÄGER 15 · LARGE EAGLE',text:'Later silver 50 Pfennig with the large imperial eagle and small shield.',metal:'Silver · 900‰',weight:'2.78 g',years:'1896–1903'}
});
Object.assign(TYPES.J5,{denomination:'20 Pfennig',short:'Silver'});
Object.assign(TYPES.J6,{denomination:'20 Pfennig',short:'Copper-nickel I'});
Object.assign(TYPES.J14,{denomination:'20 Pfennig',short:'Copper-nickel II'});
function renderSection(){
 const denomination=TYPES[currentType].denomination;
 const typeEntries=Object.entries(TYPES).filter(([,v])=>v.denomination===denomination);
 const showTypeCards=true;
 $('#pageTitle').textContent=denomination;
 $('#breadcrumbDenomination').textContent=denomination;
 $('#coinTitle').textContent=denomination;
 const sectionMeta={
  '20 Pfennig':{years:'1873–1892',description:'Explore 20 Pfennig — from silver to copper-nickel.'},
  '50 Pfennig':{years:'1875–1903',description:'Explore 50 Pfennig — three silver types across the imperial eagle redesign.'},
  '1 Mark':{years:'1873–1916',description:'Explore 1 Mark — two imperial eagle types in silver.'}
 }[denomination];
 $('#sectionYears').textContent='DEUTSCHES REICH · '+sectionMeta.years;
 $('#sectionDescription').textContent=t(sectionMeta.description);
 $('#typeCards').hidden=!showTypeCards;
 $('#typeTabs').hidden=showTypeCards;
 if(showTypeCards){
  $('#typeCards').innerHTML=typeEntries.map(([k,v])=>{
   const count=CATALOG.filter(r=>r.type===k).length;
   return `<button type="button" class="type-card${k===currentType?' selected':''}" data-type-card="${k}" aria-pressed="${k===currentType}"><span class="type-card-photo">${photoPair(k)}</span><span class="type-card-body"><span class="type-card-title">${t(v.short)}<small>${k}</small></span><span class="type-card-years">${v.years}</span><span class="type-card-meta">${count} ${t('entries')}</span></span></button>`;
  }).join('');
 }else{
  $('#typeCards').innerHTML='';
  $('#typeTabs').innerHTML=typeEntries.map(([k,v],i)=>`<button type="button" role="tab" aria-selected="${k===currentType}" data-type="${k}"><b>0${i+1}</b><span>${t(v.short)}<small>${v.years} · ${k}</small></span></button>`).join('');
 }
}

const MINTS={A:'Berlin',B:'Hanover',C:'Frankfurt',D:'Munich',E:'Dresden / Muldenhütten',F:'Stuttgart',G:'Karlsruhe',H:'Darmstadt',J:'Hamburg'};
let homeVisible=true;
let collection={},currentType='J5',filter='all',selectedId=null,editingId=null,pendingDeleteId=null,storageBroken=false;
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const num=n=>n==null?t("Unknown"):n.toLocaleString(locale());
const items=id=>collection[id]||[];
const serviceLabel=s=>s==='\u0414\u0440\u0443\u0433\u0430'?'Other':s;
function validCollection(c){if(!c||typeof c!=='object'||Array.isArray(c))return false;return Object.entries(c).every(([id,list])=>CATALOG.some(r=>r.id===id)&&Array.isArray(list)&&list.length<=1000&&new Set(list.map(s=>s.id)).size===list.length&&list.every(s=>s&&typeof s==='object'&&typeof s.id==='string'&&s.id.length<100&&['grade','service','certificate','date','seller','notes'].every(k=>typeof s[k]==='string'&&s[k].length<=2000)&&(['','NGC','PCGS','Other','\u0414\u0440\u0443\u0433\u0430'].includes(s.service))&&(s.price===null||(typeof s.price==='number'&&Number.isFinite(s.price)&&s.price>=0))));}
try{const raw=localStorage.getItem(KEY);if(raw){const parsed=JSON.parse(raw);if(!validCollection(parsed))throw Error('invalid');collection=parsed}}catch(e){storageBroken=true;setTimeout(()=>toast(t("Saved data could not be read. Changes are blocked to protect your existing records.")),300)}
function persist(next){if(storageBroken){toast(t("Saving is blocked. Restore a valid backup."));return false}try{localStorage.setItem(KEY,JSON.stringify(next));collection=next;return true}catch(e){toast(t("Could not save. Free up space or allow browser storage."));return false}}
let toastTimer;function toast(s){$('#toast').textContent=t(s);$('#toast').classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('#toast').classList.remove('show'),5500)}
function visibleRows(){const q=$('#search').value.trim().toLowerCase(),mint=$('#mintFilter').value;return CATALOG.filter(r=>r.type===currentType&&(!mint||r.mint===mint)&&(!q||`${r.year} ${r.mint} ${r.type} ${t(MINTS[r.mint])}`.toLowerCase().includes(q))&&(filter==='all'||filter==='owned'&&items(r.id).length>0||filter==='missing'&&!items(r.id).length||filter==='duplicates'&&items(r.id).length>1));}
function render(){renderDenominationCards();const owned=CATALOG.filter(r=>items(r.id).length).length,pieces=Object.values(collection).reduce((n,a)=>n+a.length,0),pct=Math.round(owned/CATALOG.length*100);$('#ownedStat').innerHTML=`${owned} <small>/ ${CATALOG.length} ${t("entries")}</small>`;$('#piecesStat').textContent=pieces;$('#navCount').textContent=pieces;$('#percent').textContent=pct+'%';$('#progress').style.width=pct+'%';$('#remaining').textContent=`${CATALOG.length-owned} ${t("missing entries")}`;
const rows=visibleRows();$('#resultCount').textContent=rows.length;$('#rows').innerHTML=rows.map(r=>{const a=items(r.id),grades=a.map(s=>[t(serviceLabel(s.service)),s.grade].filter(Boolean).join(' ')).filter(Boolean);return `<tr data-id="${r.id}"><td class="year">${r.year}${r.notes?`<span class="note-dot" title="${t("Catalogue note available")}">ⓘ</span>`:''}</td><td><span class="mint" title="${esc(t(MINTS[r.mint]))}">${r.mint}</span></td><td class="mintage">${num(r.mintage)}</td><td>${a.length?`<span class="owned-badge" title="${esc(grades.join(', '))}">${a.length} ${t("pcs")}${grades.length?' · '+esc(grades[0]):''}</span>`:`<span class="missing-badge">— ${t("Missing")}</span>`}</td><td><button class="add-row" aria-label="${t("Open")} ${r.year} ${r.mint}">+</button></td></tr>`}).join('');$('#empty').hidden=rows.length>0;$('#listSummary').textContent=`${rows.length} ${t("of")} ${CATALOG.filter(r=>r.type===currentType).length} ${t("entries")} · ${currentType}`;
document.querySelectorAll('[data-filter]').forEach(b=>b.classList.toggle('selected',b.dataset.filter===filter));document.querySelectorAll('[data-view]').forEach(b=>b.classList.toggle('active',b.dataset.view===(filter==='owned'?'owned':filter==='missing'?'missing':'catalog')));}
const PHOTOS = {"J5": {"yearMint": "1874 F", "author": "mvm", "source": "https://en.numista.com/6586", "license": "Copyright — permission not obtained", "licenseUrl": null, "files": ["images/j5-obverse.jpg", "images/j5-reverse.jpg"], "modified": false, "commercialUseCleared": false}, "J6": {"yearMint": "1887 D", "author": "smy77", "source": "https://en.numista.com/15608", "license": "CC BY-NC-SA 4.0", "licenseUrl": "https://creativecommons.org/licenses/by-nc-sa/4.0/", "files": ["images/j6-obverse.jpg", "images/j6-reverse.jpg"], "modified": false, "commercialUseCleared": false}, "J14": {"yearMint": "1892 E", "author": "tolnomur", "source": "https://en.numista.com/14842", "license": "CC BY-NC-SA 4.0", "licenseUrl": "https://creativecommons.org/licenses/by-nc-sa/4.0/", "files": ["images/j14-obverse.jpg", "images/j14-reverse.jpg"], "modified": false, "commercialUseCleared": false}};
Object.assign(PHOTOS,{"J9": {"yearMint": "1886 A", "author": "apuking", "source": "https://en.numista.com/7031", "license": "CC BY-SA 4.0", "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0/", "files": ["images/j9-obverse.jpg", "images/j9-reverse.jpg"], "modified": false, "commercialUseCleared": true}, "J17": {"yearMint": "1915 E", "author": "triple", "source": "https://en.numista.com/3412", "license": "Copyright — permission not obtained", "licenseUrl": null, "files": ["images/j17-obverse.jpg", "images/j17-reverse.jpg"], "modified": false, "commercialUseCleared": false}});
Object.assign(PHOTOS,{
 "J7":{"yearMint":"1876 A","author":"Jobel","provider":"Wikimedia Commons","source":"https://commons.wikimedia.org/wiki/File:50_Pfennig_Avers.jpg","license":"CC BY-SA 3.0","licenseUrl":"https://creativecommons.org/licenses/by-sa/3.0/","files":["https://upload.wikimedia.org/wikipedia/commons/4/41/50_Pfennig_Avers.jpg","https://upload.wikimedia.org/wikipedia/commons/4/40/50_Pfennig_Revers.jpg"],"modified":false,"commercialUseCleared":true},
 "J8":{"yearMint":"1877 A","author":"Heritage Auctions (via CoinVarieties)","provider":"CoinVarieties","source":"https://coinvarieties.com/index.php/Germany_1877-A_50_pfennig","license":"Preview reference only","licenseUrl":null,"files":["https://coinvarieties.com/images/thumb/3/34/H3067-31511o.jpg/300px-H3067-31511o.jpg","https://coinvarieties.com/images/thumb/5/55/H3067-31511r.jpg/300px-H3067-31511r.jpg"],"modified":false,"commercialUseCleared":false},
 "J15":{"yearMint":"1898 A","author":"Meta38a","provider":"Wikimedia Commons","source":"https://commons.wikimedia.org/wiki/File:Deutsches_Kaiserreich_50_Pfennig_1898_A_avers.png","license":"CC0 1.0","licenseUrl":"https://creativecommons.org/publicdomain/zero/1.0/","files":["https://upload.wikimedia.org/wikipedia/commons/9/97/Deutsches_Kaiserreich_50_Pfennig_1898_A_avers.png","https://upload.wikimedia.org/wikipedia/commons/0/0e/Deutsches_Kaiserreich_50_Pfennig_1898_A_revers.png"],"modified":false,"commercialUseCleared":true}
});
function renderDenominationCards(){
 const groups=[{name:'20 Pfennig',type:'J5',types:['J5','J6','J14'],years:'1873–1892',description:'Silver and copper-nickel'},{name:'50 Pfennig',type:'J7',types:['J7','J8','J15'],years:'1875–1903',description:'Three silver types'},{name:'1 Mark',type:'J9',types:['J9','J17'],years:'1873–1916',description:'Two imperial eagle types in silver'}];
 $('#denominationCards').innerHTML=groups.map(g=>{
  const rows=CATALOG.filter(r=>g.types.includes(r.type)),owned=rows.filter(r=>items(r.id).length).length;
  return `<button type="button" class="denomination-card" data-denomination-type="${g.type}"><span class="denomination-photo">${photoPair(g.type)}</span><span class="denomination-card-body"><span class="denomination-card-title">${g.name}<span aria-hidden="true">↗</span></span><span class="denomination-card-description">${t(g.description)}</span><span class="denomination-card-meta">${g.years} · ${g.types.length} ${t('types')} · ${rows.length} ${t('entries')}</span><span class="denomination-card-owned">${owned} / ${rows.length} ${t('owned entries')}</span><span class="denomination-card-action">${t('View types, years & mints')} →</span></span></button>`;
 }).join('');
}
function showHome(resetFilter=true){
 homeVisible=true;if(resetFilter)filter='all';
 $('#denominationHome').hidden=false;$('#denominationDetail').hidden=true;$('#denominationCrumb').hidden=true;
 $('#pageTitle').textContent=t('German Empire');$('#sectionYears').textContent='DEUTSCHES REICH · 1871–1918';
 $('#sectionDescription').textContent=t('Choose a denomination to explore its types, years and mint marks.');
 localize();render();
}

function photoPair(type){const p=PHOTOS[type];return `<span class="photo-pair photo-${type.toLowerCase()}">${p.files.map((src,i)=>`<img src="${src}" alt="${TYPES[type].denomination} ${p.yearMint} · ${type} · ${t(i?'Reverse':'Obverse')}" decoding="async">`).join('')}</span>`}
function renderPhoto(type){const p=PHOTOS[type];
 $('#coinArt').innerHTML=`<button id="zoom" aria-label="${t('Enlarge reference photograph')}">${photoPair(type)}</button><span>${t('REFERENCE PHOTOGRAPH')} · ${p.yearMint} <b>↗</b></span>`;
 $('#imageContent').innerHTML=photoPair(type);
 $('#imageCaption').textContent=`${type} · ${p.yearMint} · ${t('Reference photograph, not a specimen from your collection.')}`;
 $('#imageCredit').innerHTML=`© ${p.author} · <a href="${p.source}" target="_blank" rel="noopener">${p.provider||'Numista'}</a>${p.licenseUrl?` · <a href="${p.licenseUrl}" target="_blank" rel="noopener">${p.license}</a>`:''}`;
 $('#zoom').onclick=()=>$('#imageDialog').showModal();
}
function setType(type){if(!TYPES[type])return;homeVisible=false;$('#denominationHome').hidden=true;$('#denominationDetail').hidden=false;$('#denominationCrumb').hidden=false;currentType=type;renderSection();const typeInfo=TYPES[type];$('#typeLabel').textContent=t(typeInfo.label);$('#typeDescription').textContent=t(typeInfo.text);$('#metal').textContent=t(typeInfo.metal);$('#weight').textContent=t(typeInfo.weight);$('#years').textContent=typeInfo.years;$('#typeTotal').textContent=CATALOG.filter(r=>r.type===type).length;renderPhoto(type);document.querySelectorAll('[data-type]').forEach(b=>b.setAttribute('aria-selected',b.dataset.type===type));const prev=$('#mintFilter').value;$('#mintFilter').innerHTML=`<option value="">${t("All mints")}</option>`+[...new Set(CATALOG.filter(r=>r.type===type).map(r=>r.mint))].map(m=>`<option value="${m}">${m} · ${t(MINTS[m])}</option>`).join('');if([...$('#mintFilter').options].some(o=>o.value===prev))$('#mintFilter').value=prev;localize();render()}
function renderSpecimens(){const a=items(selectedId);$('#specimens').innerHTML=a.length?a.map(s=>`<article class="specimen"><strong>${esc([t(serviceLabel(s.service)),s.grade].filter(Boolean).join(' ')||t("Ungraded specimen"))}</strong>${s.price!==null?` <small>· ${s.price.toLocaleString(locale(),{style:'currency',currency:'EUR'})}</small>`:''}<p>${esc([s.certificate?t("Certificate: ")+s.certificate:'',s.date,s.seller].filter(Boolean).join(' · '))}</p>${s.notes?`<p>${esc(s.notes)}</p>`:''}${pendingDeleteId===s.id?`<div class="delete-confirm" role="group" aria-label="${t('Delete this specimen?')}"><p>${t('Delete this specimen?')}</p><button type="button" class="quiet" data-cancel-delete="${esc(s.id)}">${t('Cancel')}</button><button type="button" class="danger" data-confirm-delete="${esc(s.id)}">${t('Delete')}</button></div>`:`<button type="button" class="quiet" data-edit="${esc(s.id)}">${t("Edit")}</button><button type="button" class="quiet" data-delete="${esc(s.id)}">${t("Delete")}</button>`}</article>`).join(''):`<p>${t("No specimens yet. Enter only the details you know.")}</p>`}
function resetForm(){pendingDeleteId=null;editingId=null;$('#specimenForm').reset();$('#formTitle').textContent=t("Add a specimen");$('#cancelEdit').hidden=true}
function openCoin(id){selectedId=id;resetForm();const r=CATALOG.find(r=>r.id===id);$('#detailType').textContent=`${r.type} · ${t(MINTS[r.mint])}`;$('#detailTitle').textContent=`${TYPES[r.type].denomination} · ${r.year} ${r.mint}`;$('#detailMintage').textContent=`${t("Mintage")}: ${num(r.mintage)}`;$('#detailNotes').hidden=!r.notes;$('#detailNotes').textContent=t(r.notes);renderSpecimens();$('#coinDialog').showModal()}
$('#typeTabs').onclick=e=>{const b=e.target.closest('[data-type]');if(b)setType(b.dataset.type)};$('#typeCards').onclick=e=>{const card=e.target.closest('[data-type-card]');if(card)setType(card.dataset.typeCard)};$('#denominationCards').onclick=e=>{const card=e.target.closest('[data-denomination-type]');if(card){$('#search').value='';$('#mintFilter').value='';setType(card.dataset.denominationType);$('#backToDenominations').focus()}};$('#backToDenominations').onclick=()=>{showHome(false);$('#denominationCards [data-denomination-type]')?.focus()};document.querySelectorAll('[data-empire-home]').forEach(b=>b.onclick=()=>showHome());document.querySelectorAll('[data-filter]').forEach(b=>b.onclick=()=>{filter=b.dataset.filter;render()});document.querySelectorAll('[data-view]').forEach(b=>b.onclick=()=>{filter=b.dataset.view==='catalog'?'all':b.dataset.view;showHome(false)});$('#search').oninput=render;$('#mintFilter').onchange=render;$('#clearFilters').onclick=()=>{$('#search').value='';$('#mintFilter').value='';filter='all';render()};$('#rows').onclick=e=>{const row=e.target.closest('tr[data-id]');if(row)openCoin(row.dataset.id)};
document.querySelectorAll('[data-close]').forEach(b=>b.onclick=()=>b.closest('dialog').close());$('#about').onclick=$('#sources').onclick=()=>$('#infoDialog').showModal();$('#cancelEdit').onclick=resetForm;
$('#specimenForm').onsubmit=e=>{e.preventDefault();const f=new FormData(e.target);const s={id:editingId||crypto.randomUUID(),grade:f.get('grade').trim(),service:f.get('service'),certificate:f.get('certificate').trim(),price:f.get('price')===''?null:Number(f.get('price')),date:f.get('date'),seller:f.get('seller').trim(),notes:f.get('notes').trim()};const a=[...items(selectedId)],i=a.findIndex(x=>x.id===s.id);if(i>=0)a[i]=s;else a.push(s);const next={...collection,[selectedId]:a};if(!validCollection(next)){toast(t("Please check the details you entered."));return}if(persist(next)){resetForm();renderSpecimens();render();toast(t("Specimen saved in this browser."))}};
$('#specimens').onclick=e=>{
 const cancel=e.target.closest('[data-cancel-delete]'),confirmDelete=e.target.closest('[data-confirm-delete]'),del=e.target.closest('[data-delete]'),edit=e.target.closest('[data-edit]');
 if(cancel){pendingDeleteId=null;renderSpecimens();return}
 if(confirmDelete){
  const id=confirmDelete.dataset.confirmDelete;
  if(id!==pendingDeleteId||!items(selectedId).some(s=>s.id===id))return;
  const next={...collection,[selectedId]:items(selectedId).filter(s=>s.id!==id)};
  if(persist(next)){resetForm();renderSpecimens();render();toast(t('Specimen deleted.'))}
  return;
 }
 if(del){pendingDeleteId=del.dataset.delete;renderSpecimens();$('#specimens [data-cancel-delete]')?.focus();return}
 if(edit){const s=items(selectedId).find(x=>x.id===edit.dataset.edit);if(!s)return;pendingDeleteId=null;renderSpecimens();editingId=s.id;for(const key of ['grade','service','certificate','price','date','seller','notes'])$('#specimenForm').elements[key].value=(key==='service'?serviceLabel(s[key]):s[key])??'';$('#formTitle').textContent=t('Edit specimen');$('#cancelEdit').hidden=false;$('#formTitle').scrollIntoView({behavior:'smooth'})}
};
$('#backup').onclick=()=>{if(storageBroken){toast(t("The damaged record cannot be exported from this screen."));return}const blob=new Blob([JSON.stringify({app:'muenz',version:1,exportedAt:new Date().toISOString(),collection},null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='muenz-backup-'+new Date().toISOString().slice(0,10)+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);toast(t("Your backup is ready to download."))};
$('#importButton').onclick=()=>$('#importFile').click();$('#importFile').onchange=async e=>{const file=e.target.files[0];if(!file)return;try{if(file.size>5e6)throw Error();const backup=JSON.parse(await file.text());if(backup.app!=='muenz'||backup.version!==1||!validCollection(backup.collection))throw Error();const n=Object.values(backup.collection).reduce((sum,a)=>sum+a.length,0);if(!confirm(t("restoreConfirm",{n})))return;const wasBroken=storageBroken;storageBroken=false;if(persist(backup.collection)){render();toast(t("Backup restored."))}else storageBroken=wasBroken}catch(err){toast(t("Invalid backup. Choose a JSON file exported from this prototype."))}finally{e.target.value=''}};
$('#language').value=language;
$('#language').onchange=e=>{const wasHome=homeVisible;language=e.target.value==='de'?'de':'en';try{localStorage.setItem('muenz.language',language)}catch(err){}setType(currentType);if(wasHome)showHome(false);if(selectedId){const r=CATALOG.find(r=>r.id===selectedId);$('#detailType').textContent=`${r.type} · ${t(MINTS[r.mint])}`;$('#detailMintage').textContent=`${t('Mintage')}: ${num(r.mintage)}`;$('#detailNotes').textContent=t(r.notes);renderSpecimens();}$('#formTitle').textContent=t(editingId?'Edit specimen':'Add a specimen');};
setType('J5');showHome();

