 // Simple mobile-first memory matching game (Thai UI) with level selection.
 // Uses image assets for picture faces.

 const IMAGES = [
   '1/35246.jpg',
   '1/35256 (1).jpg',
   '1/35247 (1).jpg',
   '1/35255.jpg',
   '1/35259 (1).jpg',
   '1/35247.jpg',
   '1/35259.jpg',
   '1/35253.jpg',
   '1/35256.jpg',
   '1/35255 (1).jpg',
   '1/35253 (1).jpg',
   '1/35246 (1).jpg'
 ];

 // default level pairs (can be changed by UI)
 let PAIRS = 6;

 const boardEl = document.getElementById('board');
 const movesEl = document.getElementById('moves');
 const pairsEl = document.getElementById('pairs');
 const restartBtn = document.getElementById('restart');
 const overlay = document.getElementById('overlay');
 const playAgain = document.getElementById('playAgain');
 const levelSelect = document.getElementById('levelSelect');

 let first = null;
 let second = null;
 let lock = false;
 let moves = 0;
 let matched = 0;

 function shuffle(arr){
   for(let i=arr.length-1;i>0;i--){
     const j = Math.floor(Math.random()*(i+1));
     [arr[i],arr[j]]=[arr[j],arr[i]];
   }
   return arr;
 }

 function makeDeck(){
   const available = IMAGES.slice();
   const pick = shuffle(available).slice(0, PAIRS);
   const deck = shuffle([...pick, ...pick]);
   return deck;
 }

 function renderBoard(){
   boardEl.innerHTML = '';
   const deck = makeDeck();
   deck.forEach((face, i) => {
     const card = document.createElement('button');
     card.className = 'card';
     card.setAttribute('aria-label','การ์ด ปิด');
     card.type = 'button';
     card.dataset.face = face;
     card.dataset.index = i;
     card.innerHTML = `
       <div class="cardInner face back"><img src="${face}" alt="" style="width:100%;height:100%;object-fit:cover;display:block"></div>
       <div class="cardInner face front"><div class="faceContent">❓</div></div>
     `;
     card.addEventListener('click', onCardClick);
     boardEl.appendChild(card);
   });

   moves = 0; matched = 0; first = null; second = null; lock = false;
   updateHUD();
   hideOverlay();
 }

 function updateHUD(){
   movesEl.textContent = `ครั้ง: ${moves}`;
   pairsEl.textContent = `จับคู่: ${matched}/${PAIRS}`;
 }

 function onCardClick(e){
   const el = e.currentTarget;
   if (lock || el.classList.contains('flipped') || el.classList.contains('locked')) return;
   flip(el);
   if (!first){
     first = el;
     return;
   }
   if (first === el) return;
   second = el;
   moves++;
   updateHUD();

   // if player exceeded allowed moves -> lose
   if (moves > maxMovesAllowed()){
     setTimeout(() => {
       // show lose overlay
       showResult({win:false});
     }, 250);
     return;
   }

   if (first.dataset.face === second.dataset.face){
     // match
     first.classList.add('locked');
     second.classList.add('locked');
     matched++;
     // show small success peek in overlay image when finishing
     const face = first.dataset.face;
     first = null;
     second = null;
     if (matched === PAIRS) {
       setTimeout(() => showResult({win:true, imageSrc: face}), 400);
     }
     return;
   }
   // not match
   lock = true;
   setTimeout(() => {
     unflip(first);
     unflip(second);
     first = null;
     second = null;
     lock = false;
   }, 700);
 }

 function flip(card){
   card.classList.add('flipped');
   card.setAttribute('aria-label','การ์ด เปิด');
 }

 function unflip(card){
   card.classList.remove('flipped');
   card.setAttribute('aria-label','การ์ด ปิด');
 }

 function maxMovesAllowed(){
   // simple limit so player can "lose" if too many moves (tweak multiplier as desired)
   return PAIRS * 5;
 }

 function showResult({win=true, imageSrc='' } = {}){
   overlay.classList.remove('hidden');
   overlay.setAttribute('aria-hidden','false');
   const card = overlay.querySelector('#resultCard');
   const img = overlay.querySelector('#resultImage');
   const txt = overlay.querySelector('#resultText');

   card.classList.toggle('loss', !win);
   if (win){
     txt.textContent = `สำเร็จ! จับคู่ ${PAIRS} คู่ใน ${moves} ครั้ง`;
     img.src = imageSrc || '';
     img.alt = 'รูปที่จับคู่แล้ว';
   } else {
     txt.textContent = `แพ้! เกิน ${maxMovesAllowed()} ครั้ง`;
     // show a neutral sad image (pick one from assets)
     img.src = IMAGES[0];
     img.alt = 'แพ้';
   }
 }

 function hideOverlay(){
   overlay.classList.add('hidden');
   overlay.setAttribute('aria-hidden','true');
 }

 // Level buttons handling
 function setLevel(pairs){
   PAIRS = pairs;
   // update active button UI
   const buttons = levelSelect.querySelectorAll('.levelBtn');
   buttons.forEach(b=>{
     const p = Number(b.dataset.pairs);
     if (p === pairs){
       b.classList.add('active');
       b.setAttribute('aria-checked','true');
     } else {
       b.classList.remove('active');
       b.setAttribute('aria-checked','false');
     }
   });
   renderBoard();
 }

 levelSelect.addEventListener('click', (e)=>{
   const b = e.target.closest('.levelBtn');
   if (!b) return;
   const pairs = Number(b.dataset.pairs) || 6;
   setLevel(pairs);
 });

 restartBtn.addEventListener('click', () => {
   renderBoard();
 });
 playAgain.addEventListener('click', () => {
   renderBoard();
 });

 window.addEventListener('resize', () => {
   // CSS handles responsive layout
 });

 // initialize (default level button already marked as active in HTML)
 renderBoard();