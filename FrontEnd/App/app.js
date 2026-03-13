const $  = (sel, root=document) => root.querySelector(sel);
const $$ = (sel, root=document) => [...root.querySelectorAll(sel)];
const fmtCurrency = (n) => `₱${Number(n).toLocaleString('en-PH')}`;

function imgTag(src, alt=''){
  const safeSrc = String(src||'').replace(/"/g,'&quot;');
  const safeAlt = String(alt||'').replace(/"/g,'&quot;');
  return `<img src="${safeSrc}" alt="${safeAlt}">`;
}

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

function adminGuard(){
  if(localStorage.getItem('role') !== 'admin'){ 
    alert('Access Denied: Admins Only');
    location.href = 'login-admin.html'; 
  }
}

// 1. Add to the Auth Section
function sellerLogin(){
  const user = $('#seller-username')?.value?.trim();
  const pass = $('#seller-password')?.value?.trim();
  if(user === 'seller' && pass === '1234'){
    localStorage.setItem('username', user);
    localStorage.setItem('role','seller');
    alert('Seller Portal Active.');
    location.href = 'seller-dashboard.html';
  } else {
    alert('Invalid seller credentials');
  }
}

if($('#username-display')) {
  const role = localStorage.getItem('role');
  const name = localStorage.getItem('username');
  $('#username-display').textContent = role === 'admin' ? 'Admin' : role === 'seller' ? 'Seller' : name;
}

function sellerGuard(){
  const role = localStorage.getItem('role');
  if(role !== 'seller'){ location.href = 'login-seller.html'; }
}

document.addEventListener('DOMContentLoaded', ()=>{

  if(location.pathname.endsWith('seller-dashboard.html')){
    sellerGuard();
    if($('#seller-name-display')) $('#seller-name-display').textContent = localStorage.getItem('username');
    renderAdminProducts();

    const myProds = getProducts().length;
    if($('#seller-stat-products')) $('#seller-stat-products').textContent = String(myProds);
  }
});

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
  if(cart.length === 0){ alert('Your cart is empty.'); return; }

  const prods = getProducts();
  // Validate stock before processing
  for(const item of cart){
    const p = prods.find(x => x.id === item.product_id);
    if(!p || item.qty > p.stock){ 
      alert(`Cannot order ${item.qty} of "${item.name}". Stock is insufficient.`); 
      return; 
    }
  }

  // Deduct stock
  const newProds = prods.map(p => {
    const inCart = cart.find(ci => ci.product_id === p.id);
    if(inCart){ return {...p, stock: p.stock - inCart.qty}; }
    return p;
  });
  setProducts(newProds);

  // --- NEW SEQUENTIAL ID LOGIC ---
  const orders = JSON.parse(localStorage.getItem('orders') || '[]');
  
  // If there are orders, the new ID is the last ID + 1. Otherwise, start at 1.
  const nextIdNumber = orders.length > 0 ? (orders.length + 1) : 1;
  const id = `TNM-${nextIdNumber.toString().padStart(4, '0')}`; 
  // Result: TNM-0001, TNM-0002, etc.

  const amount = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const order = {
    id, 
    amount, 
    items: cart, 
    date: new Date().toISOString().slice(0, 10), 
    status: 'Pending', 
    customer: localStorage.getItem('username') || 'Guest'
  };

  orders.unshift(order); // Add to the beginning of the array
  localStorage.setItem('orders', JSON.stringify(orders));
  
  setCart([]);
  alert(`Order placed successfully! Your Order ID is: ${order.id}`);
  
  // Refresh UI
  if (typeof renderFeaturedProducts === 'function') renderFeaturedProducts();
  if (typeof renderShopProducts === 'function') renderShopProducts();
  if (typeof displayCart === 'function') displayCart();
  
  location.href = 'delivery.html';
}

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

function filterBranches(){
  const selectCity = ($('#city-select')?.value || '').trim().toLowerCase();
  const keyword = ($('#search')?.value || '').trim().toLowerCase();
  const cards = $$('.branch-list .card');

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
  filterBranches();
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

function renderAdminModeration() {
    const products = getProducts();
    const tbody = $('#admin-moderation-tbody');
    if (!tbody) return;

    if (products.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" style="text-align:center; padding:20px;">No active listings to moderate.</td></tr>';
        return;
    }

    tbody.innerHTML = products.map((p, i) => `
        <tr>
            <td style="display:flex; align-items:center; gap:10px;">
                <img src="${p.image_url}" style="width:40px;height:40px;object-fit:cover;border-radius:4px;" onerror="this.src='https://via.placeholder.com/40'">
                <strong>${p.name}</strong>
            </td>
            <td>${fmtCurrency(p.price)}</td>
            <td>${p.stock}</td>
            <td>
                <button onclick="adminDeleteProduct(${i})" style="background:#dc2626; color:white; border:none; padding:6px 12px; border-radius:4px; cursor:pointer;">
                    Remove Listing
                </button>
            </td>
        </tr>
    `).join('');
}

function adminDeleteProduct(index) {
    const list = getProducts();
    if (confirm(`ADMIN ACTION: Permanently remove "${list[index].name}" for safety/policy reasons?`)) {
        list.splice(index, 1);
        setProducts(list);
        renderAdminModeration(); 
    }
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
function renderAdminUsers() {
    const tbody = $('#users-tbody');
    if (!tbody) return;

    let users = JSON.parse(localStorage.getItem('users_list'));
    if (!users) {
        users = [
            { id: 1, username: 'admin', email: 'admin@tacklenear.me', role: 'Admin', status: 'Active' },
            { id: 2, username: 'seller_jin', email: 'jin@nox.com', role: 'Seller', status: 'Active' },
            { id: 3, username: 'buyer_test', email: 'test@user.com', role: 'Customer', status: 'Active' }
        ];
        localStorage.setItem('users_list', JSON.stringify(users));
    }

    if($('#user-count-badge')) $('#user-count-badge').textContent = users.length;

    tbody.innerHTML = users.map((u, index) => `
        <tr>
            <td><strong>${u.username}</strong></td>
            <td>${u.email}</td>
            <td><span class="badge info">${u.role}</span></td>
            <td><span class="badge ${u.status === 'Active' ? 'ok' : 'pending'}">${u.status}</span></td>
            <td>
                <button class="btn" onclick="deleteUser(${index})" style="background:#ef4444; border:none; padding:5px 10px; border-radius:4px; color:white; cursor:pointer;">
                    Remove
                </button>
            </td>
        </tr>
    `).join('');
}

function deleteUser(index) {
    let users = JSON.parse(localStorage.getItem('users_list'));
    if (confirm(`Are you sure you want to remove ${users[index].username}?`)) {
        users.splice(index, 1);
        localStorage.setItem('users_list', JSON.stringify(users));
        renderAdminUsers(); 
    }
}

// --- SELLER DASHBOARD LOGIC ---

function sellerAddProduct() {
    const seller = localStorage.getItem('username');
    const name = prompt('Product Name?'); if(!name) return;
    const price = Number(prompt('Price?')) || 0;
    const stock = Number(prompt('Stock?')) || 0;
    const img = prompt('Image URL?');

    const list = getProducts();
    list.push({
        id: name.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now().toString().slice(-4),
        name, price, stock, owner: seller, image_url: img, createdAt: Date.now()
    });
    setProducts(list);
    renderSellerDashboard();
}

function renderSellerDashboard() {
    const seller = localStorage.getItem('username');
    const allProds = getProducts();
    const myProds = allProds.filter(p => p.owner === seller);
    
    // Render Products
    const pTable = $('#seller-products-tbody');
    if(pTable) {
        pTable.innerHTML = myProds.map(p => `
            <tr>
                <td><strong>${p.name}</strong></td>
                <td>${fmtCurrency(p.price)}</td>
                <td>${p.stock}</td>
                <td><button class="btn btn-red" onclick="deleteMyProduct('${p.id}')">Delete</button></td>
            </tr>
        `).join('');
    }

    // Render Orders (Only those containing seller's items)
    const allOrders = JSON.parse(localStorage.getItem('orders') || '[]');
    const myOrders = allOrders.filter(o => o.items.some(item => {
        const p = allProds.find(ap => ap.id === item.product_id);
        return p && p.owner === seller;
    }));

    if($('#seller-stat-products')) $('#seller-stat-products').textContent = myProds.length;
    if($('#seller-stat-orders')) $('#seller-stat-orders').textContent = myOrders.length;

    const oTable = $('#seller-orders-tbody');
    if(oTable) {
        oTable.innerHTML = myOrders.map(o => `
            <tr>
                <td>${o.id}</td>
                <td>${o.customer}</td>
                <td>${o.items.map(i => i.name).join(', ')}</td>
                <td><button class="btn btn-green" onclick="shipOrder('${o.id}')">Mark Shipped</button></td>
            </tr>
        `).join('');
    }
}

function deleteMyProduct(id) {
    if(!confirm('Delete listing?')) return;
    const newList = getProducts().filter(p => p.id !== id);
    setProducts(newList);
    renderSellerDashboard();
}

// Update the DOMContentLoaded to route correctly
document.addEventListener('DOMContentLoaded', () => {
    const path = location.pathname;
    if(path.includes('seller-dashboard.html')) {
        sellerGuard();
        renderSellerDashboard();
    }
    if(path.includes('admin-dashboard.html')) {
        adminGuard();
        renderAdminStats();
        renderAdminUsers();
    }
    // Set customer body class dynamically if on shop/index
    if(path.includes('index.html') || path.includes('shop.html')) {
        document.body.classList.add('customer-site');
    }
});

function deleteMyProduct(id) {
  if(!confirm('Delete this listing?')) return;
  let list = JSON.parse(localStorage.getItem('products') || '[]');
  list = list.filter(p => p.id !== id);
  localStorage.setItem('products', JSON.stringify(list));
  renderSellerDashboard();
}

function shipOrder(orderId) {
    let orders = JSON.parse(localStorage.getItem('orders') || '[]');
    const idx = orders.findIndex(o => o.id === orderId);
    if (idx > -1) {
        orders[idx].status = 'Shipped';
        localStorage.setItem('orders', JSON.stringify(orders));
        alert(`Order ${orderId} marked as Shipped!`);
        renderSellerOrders(); 
    }
}

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

function renderPromoProducts() {
    const wrap = $('#promo-container'); // Add this ID to your updates.html section
    if (!wrap) return;
    
    const promos = getProducts().filter(p => p.category === 'promo' || p.price < 2000);
    wrap.innerHTML = promos.map(p => `
        <div class="card">
            <img src="${p.image_url}" alt="${p.name}">
            <h3>${p.name} — Promo</h3>
            <p>${fmtCurrency(p.price)}</p>
            <button class="order btn" onclick="selectProductById('${p.id}')">Order Now</button>
        </div>
    `).join('');
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

document.addEventListener('DOMContentLoaded', () => {
  seedProducts();
  showGreeting();
  initDropdown();
  protectCartLink();

  renderFeaturedProducts();
  renderShopProducts();
  renderPromoProducts(); // <--- ADD THIS LINE HERE
  
  if ($('#cartItems')) displayCart();
  const path = location.pathname;

  if (document.body.classList.contains('admin-page')) {
    adminGuard();
    renderAdminStats();
    renderAdminOrders();
    renderAdminUsers();

    if (path.includes('admin-products.html')) {
        renderAdminModeration(); 
    }
  }
  if (path.includes('seller-dashboard.html')) {
    sellerGuard();
    renderAdminProducts();
    if($('#seller-stat-products')) {
        $('#seller-stat-products').textContent = getProducts().length;
    }
  }

  updateCartBadge();
});