(() => {
  const KEY = 'thumbgrab-language';
  const saved = localStorage.getItem(KEY);
  const detected = (navigator.language || 'en').toLowerCase().startsWith('es') ? 'es' : 'en';
  let lang = saved === 'es' || saved === 'en' ? saved : detected;
  const en = {
    'Sin anuncios':'No ads','YOUTUBE THUMBNAIL DOWNLOADER':'YOUTUBE THUMBNAIL DOWNLOADER','Descarga la miniatura.':'Download the thumbnail.','Sin rodeos.':'No nonsense.',
    'Pega la URL de un video, Short o enlace youtu.be. Te mostramos las miniaturas disponibles al instante.':'Paste a YouTube video, Short, or youtu.be URL. We show the available thumbnails instantly.',
    'Buscar':'Find','Compatible con:':'Works with:','RESULTADOS':'RESULTS','Miniaturas disponibles':'Available thumbnails','Copiar ID':'Copy ID','Copiado ✓':'Copied ✓',
    'Máxima resolución':'Maximum resolution','Alta calidad':'High quality','Calidad media':'Medium quality','Básica':'Basic','Abrir':'Open','Descargar':'Download',
    'Hecha para ser simple':'Made to be simple',
    'Esta página fue vibecodeada por diversión. No tiene anuncios, popups, cuentas, cookies raras ni botones falsos. Solo existe porque me molestan las páginas de descarga llenas de anuncios XD.':'This page was vibecoded for fun. It has no ads, popups, accounts, weird cookies, or fake buttons. It only exists because ad-filled download sites annoy me XD.',
    'No afiliado con YouTube. Usa las miniaturas respetando los derechos de sus autores.':'Not affiliated with YouTube. Use thumbnails while respecting their creators’ rights.',
    'URL de YouTube':'YouTube URL',
    'No pude encontrar miniaturas para ese video. Revisa que la URL sea correcta y que el video exista.':'I could not find thumbnails for that video. Check that the URL is correct and the video exists.',
    'No reconozco esa URL de YouTube. Prueba con un enlace normal, un Short o un enlace youtu.be.':'I do not recognize that YouTube URL. Try a regular link, a Short, or a youtu.be link.',
    'No se pudo descargar':'Could not download'
  };
  const t = v => lang === 'en' ? (en[v] || v) : v;
  function tx(node){const raw=node.nodeValue||'';const s=raw.trim();if(!s)return;const n=t(s);if(n!==s){node.nodeValue=(raw.match(/^\s*/)?.[0]||'')+n+(raw.match(/\s*$/)?.[0]||'')}}
  function el(e){if(!(e instanceof Element))return;['placeholder','title','aria-label','alt'].forEach(a=>{const v=e.getAttribute(a);if(v&&en[v]&&lang==='en')e.setAttribute(a,en[v])});e.childNodes.forEach(n=>n.nodeType===3&&tx(n))}
  function tree(root=document.body){if(!root)return;if(root instanceof Element)el(root);const w=document.createTreeWalker(root,NodeFilter.SHOW_ELEMENT|NodeFilter.SHOW_TEXT);let n;while(n=w.nextNode())n.nodeType===3?tx(n):el(n);document.documentElement.lang=lang;document.title=lang==='en'?'ThumbGrab — YouTube Thumbnail Downloader':'ThumbGrab — YouTube Thumbnail Downloader'}
  function selector(){const h=document.querySelector('.topbar');if(!h||document.getElementById('languageSwitcher'))return;const st=document.createElement('style');st.textContent='.language-switcher{margin-left:auto;padding:7px 10px;border:1px solid rgba(255,255,255,.09);background:rgba(255,255,255,.035);border-radius:10px;color:inherit;font:600 12px Inter,system-ui;outline:none;cursor:pointer}.topbar{gap:12px}.badge{margin-left:0!important}';document.head.appendChild(st);const s=document.createElement('select');s.id='languageSwitcher';s.className='language-switcher';s.innerHTML='<option value="es">🌐 Español</option><option value="en">🌐 English</option>';s.value=lang;s.onchange=()=>{localStorage.setItem(KEY,s.value);location.reload()};h.insertBefore(s,h.querySelector('.badge'))}
  window.PageI18n={get lang(){return lang},t};
  const start=()=>{selector();tree();new MutationObserver(ms=>{for(const m of ms){m.addedNodes.forEach(n=>n.nodeType===1?tree(n):n.nodeType===3&&tx(n));if(m.type==='characterData')tx(m.target)}selector()}).observe(document.documentElement,{subtree:true,childList:true,characterData:true})};
  document.readyState==='loading'?document.addEventListener('DOMContentLoaded',start):start();
})();
