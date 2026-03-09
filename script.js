/* =========================
   TackleNearMe - Frontend Logic (Frontend Only)
   Uses localStorage for demo persistence
   ========================= */

// ---------- Helpers ----------
const $  = (sel, root=document) => root.querySelector(sel);
const $$ = (sel, root=document) => [...root.querySelectorAll(sel)];
const fmtCurrency = (n) => `₱${Number(n).toLocaleString('en-PH')}`;

// ✅ Proper <img> generator (prevents alt text leaking into the page)
function imgTag(src, alt=''){
  const safeSrc = String(src||'').replace(/"/g,'&quot;');
  const safeAlt = String(alt||'').replace(/"/g,'&quot;');
  return `<img src="${safeSrc}" alt="${safeAlt}">`;
}

// ---------- Auth / Session (frontend-only) ----------
function isLoggedIn(){ return Boolean(localStorage.getItem('username')); }
function logout(){
  localStorage.removeItem('username');
  localStorage.removeItem('role');
  alert('Logged out.');
  location.href = 'login-user.html';
}
function adminLogin(){
  const user = $('#admin-username')?.value?.trim();
  const pass = $('#admin-password')?.value?.trim();
  if(user === 'admin' && pass === '1234'){
    localStorage.setItem('username', user);
    localStorage.setItem('role','admin');
    alert('Logged in as Admin.');
    location.href = 'admin-dashboard.html';
  }else{
    alert('Invalid admin credentials');
  }
}
function userLogin(){
  const user = $('#user-username')?.value?.trim();
  const pass = $('#user-password')?.value?.trim();
  if(user === 'user' && pass === '1234'){
    localStorage.setItem('username', user);
    localStorage.setItem('role','user');
    alert('Welcome!');
    location.href = 'index.html';
  }else{
    alert('Invalid user credentials');
  }
}
function showGreeting(){
  const name = localStorage.getItem('username');
  const role = localStorage.getItem('role');
  const greeting = $('#user-greeting');
  const logoutBtn = $('.logout-btn');
  const authLinks = $('#auth-links');

  if(name){
    if($('#username-display')) $('#username-display').textContent = role==='admin' ? 'Admin' : name;
    if(greeting) greeting.style.display = 'inline';
    if(logoutBtn) logoutBtn.style.display = 'inline-flex';
    authLinks?.querySelectorAll('a[data-login]')?.forEach(a => a.style.display = 'none');
  }else{
    if(greeting) greeting.style.display = 'none';
    if(logoutBtn) logoutBtn.style.display = 'none';
    authLinks?.querySelectorAll('a[data-login]')?.forEach(a => a.style.display = 'inline-flex');
  }
}

// ---------- Catalog (seed + localStorage) ----------
const defaultProducts = [
  {id:'carbonx-spinning-rod-6-6', name:'CarbonX Spinning Rod 6\'6"', price:1490, stock:25, category:'rods', image_url:'https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcSl0xwWfW237lB0K7EfP6M5MVHmOu1Cb-dQoJaHVUiDvd4wmByRrmfkybng6ZJJ3RijrIok6wb1RgvsTF90aCKraCOf-SWZ'},
  {id:'aerocast-baitcaster-rod-7', name:'AeroCast Baitcaster Rod 7\'', price:1990, stock:15, category:'rods', image_url:'https://static.wixstatic.com/media/a850c7_379d0ae069454e4d9c42114d2e9dc35a~mv2.webp/v1/fill/w_498,h_498,al_c,lg_1,q_80,enc_avif,quality_auto/a850c7_379d0ae069454e4d9c42114d2e9dc35a~mv2.webp'},
  {id:'ultralight-creek-rod-5-6', name:'Ultralight Creek Rod 5\'6"', price:1290, stock:20, category:'rods', image_url:'https://images.unsplash.com/photo-1583417319070-4a69db38a8c5?q=80&w=1470&auto=format&fit=crop'},
  {id:'searunner-spinning-reel-3000', name:'SeaRunner Spinning Reel 3000', price:1850, stock:30, category:'reels', image_url:'https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcSSUo34OZr2ebAI_0asXXARJJY-mkYHWO_JnPfpfmLE8PyV9xm8uJMr3UIvclCsagcj3UtgFxilurATjJoRqXJDNQj0X5vT2pEnfm2ptT3Eua1d6AvMCw5c'},
  {id:'marlin-pro-baitcaster-200', name:'Marlin Pro Baitcaster 200', price:2350, stock:12, category:'reels', image_url:'https://www.meltontackle.com/media/catalog/product/cache/455bc35dddf0346f1f37e92f0806125d/a/b/abu-garcia-beast-200-baitcasting-reel-angled-handle-520134_1.jpg'},
  {id:'saltrunner-sw-5000', name:'SaltRunner SW 5000', price:2990, stock:10, category:'reels', image_url:'https://images.unsplash.com/photo-1595769816263-9b910be24d5d?q=80&w=1470&auto=format&fit=crop'},
  {id:'vortex-lure-kit-20', name:'Vortex Lure Kit (20 pcs)', price:590, stock:60, category:'lures', image_url:'https://m.media-amazon.com/images/I/51MZiJnTlXL._AC_SR290,290_.jpg'},
  {id:'deep-crank-70-hardbait', name:'Deep Crank 70 (Hardbait)', price:420, stock:50, category:'lures', image_url:'https://images.unsplash.com/photo-1627545993334-a3b8f1d27311?q=80&w=1470&auto=format&fit=crop'},
  {id:'soft-swimbait-4-5pcs', name:'Soft Swimbait 4" (5 pcs)', price:280, stock:80, category:'lures', image_url:'https://images.unsplash.com/photo-1558980664-10b0b4aa3d5c?q=80&w=1470&auto=format&fit=crop'},
  {id:'topwater-popper-90', name:'Topwater Popper 90', price:350, stock:70, category:'lures', image_url:'https://i.redd.it/j06u8mxokkhb1.jpg'},
  {id:'fluorocarbon-line-10lb-150m', name:'Fluorocarbon Line 10lb (150m)', price:420, stock:80, category:'line', image_url:'https://i.ebayimg.com/images/g/6TcAAOSwshdkZ7Js/s-l1600.webp'},
  {id:'braid-line-20lb-300m', name:'Braid Line 20lb (300m)', price:690, stock:60, category:'line', image_url:'https://images.unsplash.com/photo-1624026892404-2b071bc2bd95?q=80&w=1470&auto=format&fit=crop'},
  {id:'monofilament-12lb-200m', name:'Monofilament 12lb (200m)', price:260, stock:100, category:'line', image_url:'https://images.unsplash.com/photo-1624026892404-2b071bc2bd95?q=80&w=1470&auto=format&fit=crop'},
  {id:'tacklenearme-tackle-box-xl', name:'TackleNearMe Tackle Box XL', price:1280, stock:18, category:'tackle', image_url:'https://prod-static-b.chronocarpe.com/mg/product//f/7/f70d9ab236cf340e501b86958c6175b2a274a9b6_210247.jpg'},
  {id:'stainless-split-rings-100', name:'Stainless Split Rings (100 pcs)', price:180, stock:90, category:'tackle', image_url:'https://images-cdn.ubuy.co.in/6351a8d743223d6bdb38b5d2-orootl-stainless-steel-saltwater-fishing.jpg'},
  {id:'fishing-pliers-saltwater', name:'Fishing Pliers (Saltwater)', price:520, stock:35, category:'tackle', image_url:'https://images.unsplash.com/photo-1465146633011-14f8e0781093?q=80&w=1470&auto=format&fit=crop'},
  {id:'saltwater-hooks-50', name:'Saltwater Hooks (50 pcs)', price:350, stock:100, category:'hooks', image_url:'https://images-cdn.ubuy.co.in/6351a8d743223d6bdb38b5d2-orootl-stainless-steel-saltwater-fishing.jpg'},
  {id:'ewg-worm-hooks-25', name:'EWG Worm Hooks (25 pcs)', price:240, stock:100, category:'hooks', image_url:'https://www.wired2fish.com/wp-content/uploads/2021/09/78bc58d5-51d8-4952-98dd-cecdb831f1fd.jpg'},
  {id:'polarized-fishing-cap', name:'Polarized Fishing Cap', price:360, stock:40, category:'merchandise', image_url:'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSF0wOR-FWd5mhhC48xa1CYsKI30T4EYFMjjg&s'},
  {id:'uv-neck-gaiter', name:'UV Neck Gaiter', price:190, stock:60, category:'merchandise', image_url:'https://www.whitworths.com.au/media/catalog/product/2/0/20362_buf-0010-u-blk-_front_.jpg?quality=80&bg-color=255,255,255&fit=bounds&height=596&width=597&canvas=597:596'},
  {id:'non-slip-fishing-gloves', name:'Non-slip Fishing Gloves', price:420, stock:45, category:'merchandise', image_url:'https://i5.walmartimages.com/seo/Polarized-Fishing-Glasses-Hat-Visors-Sport-Clips-Cap-Clip-on-Sunglasses-For-Men-Fishing-Biking-Hiking-Golf-Tennis-Eyewear_e5fb0e4c-5701-48aa-964c-152a99e15788.302f704f3a923adc426343d0bb81992a.jpeg?odnHeight=768&odnWidth=768&odnBg=FFFFFF'}
];
function seedProducts(){
  if(!localStorage.getItem('products')){
    const now = Date.now();
    const seeded = defaultProducts.map((p, i) => ({ ...p, createdAt: now - (defaultProducts.length - i) * 60000 }));
    localStorage.setItem('products', JSON.stringify(seeded));
  }else{
    const list = JSON.parse(localStorage.getItem('products'));
    let changed = false;
    list.forEach((p, i) => {
      if(!p.createdAt){ p.createdAt = Date.now() - i*45000; changed = true; }
      if(!p.id){ p.id = p.name.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)+/g,'').slice(0,80); changed = true; }
    });
    if(changed) localStorage.setItem('products', JSON.stringify(list));
  }
}
function getProducts(){ return JSON.parse(localStorage.getItem('products')||'[]'); }
function setProducts(arr){ localStorage.setItem('products', JSON.stringify(arr)); }

// ---------- Cart ----------
function requireLogin(actionName='this action'){
  if(!isLoggedIn()){
    alert(`Please login to continue (${actionName}).`);
    location.href = 'login-user.html';
    return false;
  }
  return true;
}
function getCart(){ return JSON.parse(localStorage.getItem('cart')||'[]'); }
function setCart(c){ localStorage.setItem('cart', JSON.stringify(c)); }

function findProductById(id){ return getProducts().find(p => p.id === id); }

function addToCartById(id){
  if(!requireLogin('add to cart')) return;
  const prod = findProductById(id);
  if(!prod){ alert('Item not found.'); return; }
  if(prod.stock <= 0){ alert('Sorry, this item is out of stock.'); return; }

  const cart = getCart();
  const idx = cart.findIndex(i=> i.product_id === id);
  const currentQty = idx>-1 ? cart[idx].qty : 0;

  if(currentQty + 1 > prod.stock){
    alert(`Only ${prod.stock} left of "${prod.name}".`);
    return;
  }

  if(idx>-1){ cart[idx].qty += 1; }
  else { cart.push({ product_id:id, name:prod.name, price:prod.price, qty:1 }); }
  setCart(cart);
  alert(`${prod.name} added to cart`);
  updateCartBadge();
}
function selectProductById(id){
  if(!requireLogin('order')) return;
  addToCartById(id);
  location.href = 'delivery.html';
}

function displayCart(){
  const wrap = $('#cartItems');
  const totalEl = $('#total');
  if(!wrap || !totalEl) return;

  const cart = getCart();
  wrap.innerHTML = '';
  let total = 0;

  if(cart.length===0){
    wrap.innerHTML = `<p>Your cart is empty.</p>`;
  }else{
    cart.forEach((item,i)=>{
      const prod = findProductById(item.product_id);
      const stockAvailable = prod ? prod.stock : 0;

      if(stockAvailable === 0 && item.qty > 0){ item.qty = 0; setCart(cart); }
      if(item.qty > stockAvailable){ item.qty = stockAvailable; setCart(cart); }

      total += item.price * item.qty;

      const outNote = (stockAvailable === 0) ? `<div class="badge warn" style="margin:0 12px 12px;display:inline-block;">Out of stock</div>` : '';
      const stockNote = `<small style="color:#6b7280;display:block;margin:0 12px 12px;">Stock available: ${stockAvailable}</small>`;

      const div = document.createElement('div');
      div.className = 'card';
      div.innerHTML = `
        <div style="display:flex; gap:12px; align-items:center; padding:12px">
          <div style="flex:1">
            <h3 style="margin:0 0 6px">${item.name}</h3>
            <p style="margin:0 0 6px; color:#6b7280">${fmtCurrency(item.price)} × 
              <input type="number" min="0" value="${item.qty}" style="width:64px; padding:6px; border:1px solid #e5e7eb; border-radius:8px" data-i="${i}" class="qty">
            </p>
            <span>${fmtCurrency(item.price * item.qty)}</span>
            ${stockNote}
            ${outNote}
          </div>
          <button class="btn" data-rm="${i}" style="background:#ef4444">Remove</button>
        </div>
      `;
      wrap.appendChild(div);
    });
  }

  totalEl.textContent = `Total: ${fmtCurrency(total)}`;

  // Handlers
  $$('.qty', wrap).forEach(inp=>{
    inp.addEventListener('change', e=>{
      const i = Number(e.target.dataset.i);
      const cart = getCart();
      const item = cart[i];
      const prod = findProductById(item.product_id);
      const stockAvailable = prod ? prod.stock : 0;
      let val = Math.max(0, Number(e.target.value||0));
      if(val > stockAvailable){
        val = stockAvailable;
        alert(`Only ${stockAvailable} left in stock for "${item.name}".`);
      }
      cart[i].qty = val;
      setCart(cart);
      displayCart();
    });
  });
  $$('button[data-rm]', wrap).forEach(btn=>{
    btn.addEventListener('click', e=>{
      const i = Number(e.target.dataset.rm);
      const cart = getCart();
      cart.splice(i,1);
      setCart(cart);
      displayCart();
    });
  });
  updateCartBadge();
}

function updateCartBadge(){
  const badge = $('#cart-badge');
  if(!badge) return;
  const items = getCart();
  const totalQty = items.reduce((s,i)=>s + (i.qty||0), 0);
  if(isLoggedIn() && totalQty>0){
    badge.textContent = String(totalQty);
    badge.hidden = false;
  }else{
    badge.hidden = true;
  }
}

function checkout(){
  if(!requireLogin('checkout')) return;
  const cart = getCart();
  if(cart.length===0){ alert('Your cart is empty.'); return; }

  const prods = getProducts();
  for(const item of cart){
    const p = prods.find(x=>x.id===item.product_id);
    if(!p){ alert(`Product not found: ${item.name}`); return; }
    if(item.qty > p.stock){ alert(`Cannot order ${item.qty} of "${item.name}". Only ${p.stock} left.`); return; }
    if(p.stock <= 0){ alert(`"${item.name}" is out of stock.`); return; }
  }

  const newProds = prods.map(p=>{
    const inCart = cart.find(ci=>ci.product_id===p.id);
    if(inCart){ return {...p, stock: p.stock - inCart.qty}; }
    return p;
  });
  setProducts(newProds);

  const amount = cart.reduce((s,i)=>s + i.price*i.qty,0);
  const orders = JSON.parse(localStorage.getItem('orders')||'[]');
  const id = `TNM-${Date.now().toString().slice(-6)}`;
  const order = {
    id, amount, items:cart, date:new Date().toISOString().slice(0,10), status:'Pending', customer: localStorage.getItem('username') || 'Guest'
  };
  orders.unshift(order);
  localStorage.setItem('orders', JSON.stringify(orders));
  setCart([]);
  alert(`Order placed! ID: ${order.id}`);
  renderFeaturedProducts();
  renderShopProducts();
  displayCart();
  location.href = 'delivery.html';
}

// ---------- Filters ----------
function applyShopFilters(){
  const activeBtn = $('.filter-btn.active');
  const cat = activeBtn ? activeBtn.dataset.filter : 'all';
  const keyword = ($('#shop-search')?.value || '').trim().toLowerCase();

  const cards = $$('.card[data-category], .card[data-id]');
  cards.forEach(c=>{
    const cardCat = (c.dataset.category || '').toLowerCase();
    const name = (c.querySelector('h3')?.textContent || '').toLowerCase();
    const matchCat = (cat==='all') ? true : cardCat.includes(cat.toLowerCase());
    const matchKey = keyword ? (name.includes(keyword) || cardCat.includes(keyword)) : true;
    c.style.display = (matchCat && matchKey) ? '' : 'none';
  });
}
function initFilters(){
  const filterBtns = $$('.filter-btn');
  if(filterBtns.length===0) return;
  const allBtn = $('.filter-btn[data-filter="all"]');
  if(allBtn && !$('.filter-btn.active')){
    allBtn.classList.add('active'); allBtn.setAttribute('aria-pressed','true');
  }
  filterBtns.forEach(btn=>{
    btn.addEventListener('click', ()=>{
      filterBtns.forEach(b=>{ b.classList.remove('active'); b.setAttribute('aria-pressed','false'); });
      btn.classList.add('active'); btn.setAttribute('aria-pressed','true');
      applyShopFilters();
    });
  });
  $('#shop-search')?.addEventListener('input', applyShopFilters);
  applyShopFilters();
}
function applyShopFiltersByQuery(){
  const params = new URLSearchParams(location.search);
  const cat = params.get('cat'); const q = params.get('q');
  if(cat){ document.querySelector(`.filter-btn[data-filter="${cat}"]`)?.click(); }
  if(q){ const s=$('#shop-search'); if(s){ s.value = q; applyShopFilters(); } }
}

// ---------- Carousel ----------
function initCarousel(wrapperId, prevId, nextId){
  const wrap = $(wrapperId); if(!wrap) return;
  const container = $('.product-container', wrap);
  const prev = $(prevId), next = $(nextId);
  if(!container || !prev || !next) return;
  prev.addEventListener('click', () => container.scrollBy({left:-400, behavior:'smooth'}));
  next.addEventListener('click', () => container.scrollBy({left:400, behavior:'smooth'}));
  container.style.display = 'flex';
  container.style.overflowX = 'auto';
  container.style.scrollSnapType = 'x proximity';
  $$('.card', container).forEach(c => { c.style.minWidth='300px'; c.style.scrollSnapAlign='start'; }); /* wider cards */
}

// ---------- Locations Filter ----------
function filterBranches(){
  const selectCity = ($('#city-select')?.value || '').trim().toLowerCase();
  const keyword = ($('#search')?.value || '').trim().toLowerCase();
  const cards = $$('.branch-list .card');

  // Rules:
  // - If keyword provided: filter by keyword in city name (h3) or subtitle (p)
  // - Else if city selected: show exact city
  // - Else: show all
  cards.forEach(card=>{
    const cityName = (card.querySelector('h3')?.textContent || '').trim().toLowerCase();
    const subtitle = (card.querySelector('p')?.textContent || '').trim().toLowerCase();

    let show = true;
    if (keyword) {
      show = cityName.includes(keyword) || subtitle.includes(keyword);
    } else if (selectCity) {
      show = cityName === selectCity;
    } else {
      show = true;
    }
    card.style.display = show ? '' : 'none';
  });
}

function searchLocation(){ filterBranches(); }
function wireLocationFilters(){
  $('#city-select')?.addEventListener('change', filterBranches);
  $('#search')?.addEventListener('input', filterBranches);
  filterBranches(); // initial
}

// ---------- Admin (demo) ----------
function adminGuard(){
  const role = localStorage.getItem('role');
  if(role!=='admin'){ location.href = 'login-admin.html'; }
}
function renderAdminStats(){
  const orders = JSON.parse(localStorage.getItem('orders')||'[]');
  const revenue = orders.reduce((s,o)=> s + (o.amount||0), 0);
  const prods = getProducts();
  if($('#stat-orders')) $('#stat-orders').textContent = String(orders.length);
  if($('#stat-revenue')) $('#stat-revenue').textContent = fmtCurrency(revenue);
  if($('#stat-users')) $('#stat-users').textContent = String(42);
  if($('#stat-products')) $('#stat-products').textContent = String(prods.length);
  const ro = $('#recent-orders');
  if (ro) {
    ro.innerHTML = orders.length ? orders.slice(0,5).map(o=>`
      <tr>
        <td>${o.id}</td>
        <td>${o.customer}</td>
        <td>${fmtCurrency(o.amount)}</td>
        <td><span class="badge ${o.status==='Delivered'?'ok':o.status==='Pending'?'pending':'info'}">${o.status}</span></td>
      </tr>
    `).join('') : `<tr><td colspan="4">No recent orders</td></tr>`;
  }
}
function renderAdminOrders(){
  const tbody = $('#orders-tbody'); if(!tbody) return;
  const orders = JSON.parse(localStorage.getItem('orders')||'[]');
  tbody.innerHTML = orders.map(o=>`
    <tr>
      <td>${o.id}</td>
      <td>${o.customer}</td>
      <td>${fmtCurrency(o.amount)}</td>
      <td>${o.date}</td>
      <td><span class="badge ${o.status==='Delivered'?'ok':o.status==='Pending'?'pending':'info'}">${o.status}</span></td>
      <td>
        <button class="btn" data-view="${o.id}">View</button>
        <button class="btn" data-done="${o.id}" style="background:#16a34a">Mark Delivered</button>
      </td>
    </tr>
  `).join('');
  $$('button[data-view]').forEach(b=>{
    b.addEventListener('click', ()=>{
      const id = b.dataset.view;
      const orders = JSON.parse(localStorage.getItem('orders')||'[]');
      const order = orders.find(x=>x.id===id);
      if(!order) return;
      alert(`Order ${order.id}\nCustomer: ${order.customer}\nItems: ${order.items.map(i=>`${i.name} x${i.qty}`).join(', ')}\nAmount: ${fmtCurrency(order.amount)}\nStatus: ${order.status}`);
    });
  });
  $$('button[data-done]').forEach(b=>{
    b.addEventListener('click', ()=>{
      const id = b.dataset.done;
      const list = JSON.parse(localStorage.getItem('orders')||'[]');
      const idx = list.findIndex(o=>o.id===id);
      if(idx>-1){ list[idx].status = 'Delivered'; localStorage.setItem('orders', JSON.stringify(list)); renderAdminOrders(); renderAdminStats(); }
    });
  });
}
function renderAdminProducts(){
  const tbody = $('#products-tbody'); if(!tbody) return;
  const prods = getProducts();
  tbody.innerHTML = prods.map((p, i)=>`
    <tr>
      <td>${p.name}</td>
      <td>${fmtCurrency(p.price)}</td>
      <td>${p.stock}</td>
      <td>
        <button class="btn" data-edit="${i}" style="background:#1d4ed8">Edit</button>
        <button class="btn" data-del="${i}" style="background:#ef4444">Delete</button>
      </td>
    </tr>
  `).join('');
  $('#btn-add-product')?.addEventListener('click', ()=>{
    const name = prompt('Product name?'); if(!name) return;
    const price = Number(prompt('Price? (numbers only)')); if(!price) return;
    const stock = Number(prompt('Stock?')); if(Number.isNaN(stock)) return;
    const category = prompt('Category? (rods/reels/lures/line/tackle/hooks/merchandise)') || 'tackle';
    const image_url = prompt('Image URL?') || '';
    const id = name.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)+/g,'').slice(0,80);
    const list = getProducts();
    list.push({id, name, price, stock, category, image_url, createdAt: Date.now()});
    setProducts(list);
    renderAdminProducts();
    renderFeaturedProducts();
    renderShopProducts();
  });
  $$('button[data-del]').forEach(b=>{
    b.addEventListener('click', ()=>{
      const idx = Number(b.dataset.del);
      const list = getProducts();
      if(!confirm(`Delete ${list[idx].name}?`)) return;
      list.splice(idx,1);
      setProducts(list);
      renderAdminProducts();
      renderFeaturedProducts();
      renderShopProducts();
    });
  });
  $$('button[data-edit]').forEach(b=>{
    b.addEventListener('click', ()=>{
      const idx = Number(b.dataset.edit);
      const list = getProducts();
      const p = list[idx];
      const name = prompt('Product name?', p.name) || p.name;
      const price = Number(prompt('Price?', p.price)) || p.price;
      const stock = Number(prompt('Stock?', p.stock)) || p.stock;
      const id = name.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)+/g,'').slice(0,80);
      list[idx] = {...p, id, name, price, stock};
      setProducts(list);
      renderAdminProducts();
      renderFeaturedProducts();
      renderShopProducts();
    });
  });
}
function renderAdminUsers(){
  const tbody = $('#users-tbody'); if(!tbody) return;
  const defaults = [
    {username:'admin', email:'admin@tacklenear.me', role:'Admin', status:'Active'},
    {username:'user', email:'user@tacklenear.me', role:'Customer', status:'Active'},
    {username:'john_doe', email:'john@example.com', role:'Customer', status:'Active'},
    {username:'jane_smith', email:'jane@example.com', role:'Customer', status:'Inactive'},
  ];
  tbody.innerHTML = defaults.map(u=>`
    <tr>
      <td>${u.username}</td>
      <td>${u.email}</td>
      <td>${u.role}</td>
      <td><span class="badge ${u.status==='Active'?'ok':'pending'}">${u.status}</span></td>
      <td><button class="btn" aria-label="View ${u.username}">View</button></td>
    </tr>
  `).join('');
}

// ---------- Dropdown ----------
function initDropdown(){
  const toggle = $('#shopDropdownToggle') || $('#shopDropdown .dropdown-toggle') || $('#shopDropdown > a');
  const menu   = $('#shopDropdownMenu');
  if(!toggle || !menu) return;

  const closeMenu = () => { menu.classList.remove('open'); toggle.setAttribute('aria-expanded','false'); };
  const openMenu  = () => { menu.classList.add('open'); toggle.setAttribute('aria-expanded','true'); };

  toggle.addEventListener('click', (e)=>{
    if(e.button === 0) e.preventDefault();
    menu.classList.contains('open') ? closeMenu() : openMenu();
  });

  document.addEventListener('click', (e)=>{
    if(menu.classList.contains('open') && !menu.contains(e.target) && !toggle.contains(e.target)) closeMenu();
  });
  document.addEventListener('keydown', (e)=>{ if(e.key === 'Escape') closeMenu(); });
}

// ---------- Protect Cart link ----------
function protectCartLink(){
  const cartLink = $('#nav-cart');
  if(!cartLink) return;
  cartLink.addEventListener('click', (e)=>{
    if(!isLoggedIn()){
      e.preventDefault();
      alert('Please login to view your cart.');
      location.href = 'login-user.html';
    }
  });
}

// ---------- Dynamic Renders ----------
function renderFeaturedProducts(){
  const wrap = $('#featuredProducts');
  if(!wrap) return;
  const prods = getProducts()
    .slice()
    .sort((a,b)=> (b.createdAt||0) - (a.createdAt||0))
    .slice(0, 8);

  wrap.innerHTML = prods.map(p => {
    const sold = p.stock <= 0;
    return `
      <div class="card ${sold ? 'soldout':''}" data-id="${p.id}" data-category="${p.category}">
        ${sold ? '<span class="soldout-label">Out of stock</span>':''}
        ${imgTag(p.image_url, p.name)}
        <h3>${p.name}</h3>
        <span>${fmtCurrency(p.price)}</span>
      </div>
    `;
  }).join('');

  $$('.card[data-id]', wrap).forEach(c=>{
    if(c.classList.contains('soldout')) return;
    c.addEventListener('click', ()=>{
      const id = c.dataset.id;
      selectProductById(id);
    });
  });

  if($('#indexCarousel')) initCarousel('#indexCarousel', '#prevIce', '#nextIce');
}
function renderShopProducts(){
  const wrap = $('#shopProducts');
  if(!wrap) return;
  const prods = getProducts();

  wrap.innerHTML = prods.map(p=>{
    const sold = p.stock <= 0;
    return `
      <div class="card ${sold ? 'soldout':''}" data-category="${p.category}" data-id="${p.id}">
        ${sold ? '<span class="soldout-label">Out of stock</span>':''}
        ${imgTag(p.image_url, p.name)}
        <h3>${p.name}</h3>
        <p>${fmtCurrency(p.price)}</p>
      </div>
    `;
  }).join('');

  $$('.card[data-id]', wrap).forEach(c=>{
    if(c.classList.contains('soldout')) return;
    c.addEventListener('click', ()=>{
      const id = c.dataset.id;
      selectProductById(id);
    });
  });

  if($('#menuCarousel')) initCarousel('#menuCarousel', '#prevMenu', '#nextMenu');
  if($('.filter-btn')) initFilters();
}

// ---------- Boot ----------
document.addEventListener('DOMContentLoaded', ()=>{
  seedProducts();
  showGreeting();
  initDropdown();
  protectCartLink();

  if (document.body.id === 'cart-page' && !isLoggedIn()) {
    alert('Please login to view your cart.');
    location.href = 'login-user.html';
    return;
  }

  renderFeaturedProducts();
  renderShopProducts();

  if($('#cartItems')) displayCart();

  if (location.pathname.endsWith('shop.html')) applyShopFiltersByQuery();

  if (location.pathname.endsWith('locations.html')) wireLocationFilters();

  if(document.body.classList.contains('admin-page')){
    adminGuard();
    renderAdminStats();
    renderAdminOrders();
    renderAdminProducts();
    renderAdminUsers();
  }

  updateCartBadge();
});