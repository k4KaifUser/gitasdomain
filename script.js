/*
  ============================================
  script.js — MyToken Website Logic
  ============================================
  JavaScript controls how everything BEHAVES.
  Clicking buttons, switching pages, showing
  data, handling login — all JS!

  HOW IT CONNECTS:
  The index.html file has this line at the
  bottom of <body>:
    <script src="script.js"></script>
  That's how HTML and JS talk to each other!
  JS can find any HTML element using its "id".
  Example: document.getElementById('toast')
  ============================================
*/


/* ============================================
   SAMPLE DATA
   This is the list of tokens shown on the
   Browse page. In a real app this would come
   from a database/server.
   ============================================ */
const tokens = [
  {
    id: 1,
    platform: 'Swiggy',
    emoji: '🧡',
    value: '₹100 off on ₹199+',
    price: 7,
    category: 'food',
    desc: 'First 3 orders. Min order ₹199.',
    seller: 'Priya S.',
    badge: 'hot',
    code: 'SWGY100NEW',
    listed: '2 hrs ago'
  },
  {
    id: 2,
    platform: 'Google Pay',
    emoji: '🟢',
    value: '₹51 cashback',
    price: 5,
    category: 'payment',
    desc: 'On first UPI payment of ₹100+.',
    seller: 'Amit K.',
    badge: 'new',
    code: 'GPAY51BACK',
    listed: '5 hrs ago'
  },
  {
    id: 3,
    platform: 'Zomato',
    emoji: '❤️',
    value: '60% off up to ₹120',
    price: 7,
    category: 'food',
    desc: 'Valid on Pro orders only.',
    seller: 'Sneha R.',
    badge: '',
    code: 'ZOM60PRO',
    listed: '1 day ago'
  },
  {
    id: 4,
    platform: 'Amazon',
    emoji: '📦',
    value: '₹200 off on ₹500+',
    price: 10,
    category: 'shopping',
    desc: 'Electronics category only.',
    seller: 'Raj M.',
    badge: 'hot',
    code: 'AMZN200EL',
    listed: '3 hrs ago'
  },
  {
    id: 5,
    platform: 'PhonePe',
    emoji: '📱',
    value: '₹25 cashback',
    price: 5,
    category: 'payment',
    desc: 'On recharge of ₹100+.',
    seller: 'Deepa V.',
    badge: 'new',
    code: 'PPE25RCH',
    listed: '6 hrs ago'
  },
  {
    id: 6,
    platform: 'Paytm',
    emoji: '💙',
    value: '₹75 cashback',
    price: 7,
    category: 'payment',
    desc: 'On movie ticket booking.',
    seller: 'Karan J.',
    badge: '',
    code: 'PTMCINE75',
    listed: '2 days ago'
  },
  {
    id: 7,
    platform: 'Flipkart',
    emoji: '🛒',
    value: 'Extra 15% off',
    price: 5,
    category: 'shopping',
    desc: 'Fashion & accessories.',
    seller: 'Anita P.',
    badge: 'new',
    code: 'FLK15FAB',
    listed: '4 hrs ago'
  },
  {
    id: 8,
    platform: 'Swiggy',
    emoji: '🧡',
    value: 'Free delivery for 30 days',
    price: 10,
    category: 'food',
    desc: 'Swiggy One trial membership.',
    seller: 'Vikram S.',
    badge: 'hot',
    code: 'SWGY1FREE',
    listed: '1 hr ago'
  },
];


/* ============================================
   CURRENT USER STATE
   This object stores info about who is
   currently logged in. Like a "memory" for
   the current session.
   ============================================ */
let loggedIn = false;   // is the user logged in? true/false

let currentUser = {
  name:   'Rahul K.',
  phone:  '9876543210',
  earned: 7,
  shared: 7,
  used:   3,
  wallet: 7,
};

// The user's own submitted tokens (shown on Dashboard)
let mySubmissions = [
  { platform: 'Google Pay', emoji: '🟢', code: 'GPAY51BACK', value: '₹51 cashback',  status: 'active',  earned: 1 },
  { platform: 'Swiggy',     emoji: '🧡', code: 'SWGY50OFF',  value: '₹50 off',        status: 'sold',    earned: 1 },
  { platform: 'Amazon',     emoji: '📦', code: 'AMZN100',    value: '₹100 off',       status: 'pending', earned: 0 },
];

// Which token is the user currently trying to "use"
let currentToken = null;

// Which platform is selected on the Submit form
let selectedPlatform = '';

// Secret admin logo click counter
let logoClicks = 0;


/* ============================================
   PAGE NAVIGATION
   Shows one page and hides all the others.
   Also highlights the correct nav link.
   ============================================ */
function goTo(pageName) {

  // 1. Hide ALL pages
  document.querySelectorAll('.page').forEach(function(page) {
    page.classList.remove('active');
  });

  // 2. Remove "active" highlight from ALL nav links
  document.querySelectorAll('.nav-link').forEach(function(link) {
    link.classList.remove('active');
  });

  // 3. Show only the requested page
  document.getElementById('page-' + pageName).classList.add('active');

  // 4. Highlight the correct nav link
  const navEl = document.getElementById('nav-' + pageName);
  if (navEl) navEl.classList.add('active');

  // 5. Special actions for certain pages
  if (pageName === 'browse') {
    renderTokens(tokens); // draw all token cards
  }

  if (pageName === 'dashboard') {
    if (!loggedIn) {
      openModal('loginModal'); // force login first
      return;
    }
    renderDashboard(); // draw dashboard data
  }

  if (pageName === 'submit' && !loggedIn) {
    openModal('loginModal'); // force login first
    return;
  }

  // Scroll back to top when changing page
  window.scrollTo(0, 0);
}


/* ============================================
   MODAL (POPUP) FUNCTIONS
   ============================================ */

// Show a modal by adding the "open" class
function openModal(modalId) {
  document.getElementById(modalId).classList.add('open');
}

// Hide a modal by removing the "open" class
function closeModal(modalId) {
  document.getElementById(modalId).classList.remove('open');
}


/* ============================================
   LOGIN — STEP 1: Send OTP
   ============================================ */
function sendOTP() {
  const phone = document.getElementById('phoneInput').value;

  // Validation: phone must be exactly 10 digits
  if (phone.length !== 10) {
    showToast('Enter a valid 10-digit number!');
    return; // stop here if invalid
  }

  // Show the phone number in step 2
  document.getElementById('phoneDisplay').textContent = phone;

  // Hide step 1, show step 2
  document.getElementById('loginStep1').style.display = 'none';
  document.getElementById('loginStep2').style.display = 'block';

  showToast('OTP sent to +91 ' + phone + ' (Demo: 1234)');
}


/* ============================================
   LOGIN — Auto-move between OTP boxes
   When you type 1 digit, cursor jumps to
   the next box automatically.
   ============================================ */
function otpNext(inputBox, index) {
  // Get all 4 OTP boxes
  const allBoxes = document.querySelectorAll('.otp-input');

  // If this box has a value AND it's not the last box
  if (inputBox.value.length === 1 && index < 3) {
    allBoxes[index + 1].focus(); // move cursor to next box
  }
}


/* ============================================
   LOGIN — STEP 2: Verify OTP
   ============================================ */
function verifyOTP() {
  const allBoxes = document.querySelectorAll('.otp-input');

  // Combine all 4 box values into one string e.g. "1234"
  const otp = Array.from(allBoxes).map(function(box) {
    return box.value;
  }).join('');

  if (otp === '1234') {
    // ✅ Correct OTP!
    loggedIn = true;
    closeModal('loginModal');

    // Change nav button from "Login" to "My Account"
    document.getElementById('navAuthArea').innerHTML =
      '<button class="nav-btn solid" onclick="goTo(\'dashboard\')">👤 My Account</button>';

    showToast('🎉 Welcome back, ' + currentUser.name + '!');

    // Reset login form for next time
    document.getElementById('loginStep1').style.display = 'block';
    document.getElementById('loginStep2').style.display = 'none';
    allBoxes.forEach(function(box) { box.value = ''; });
    document.getElementById('phoneInput').value = '';

  } else {
    // ❌ Wrong OTP
    showToast('Wrong OTP! Use 1234 for demo');
  }
}


/* ============================================
   BROWSE PAGE — Render Token Cards
   This function takes the tokens array and
   builds HTML cards and puts them on the page.
   ============================================ */
function renderTokens(tokenList) {
  const grid = document.getElementById('tokensGrid');

  // If no tokens match filter, show empty message
  if (!tokenList.length) {
    grid.innerHTML = '<div class="empty"><span class="icon">🔍</span><p>No tokens found</p></div>';
    return;
  }

  // Build HTML for each token card using .map()
  // .map() loops through every token and creates a string of HTML
  grid.innerHTML = tokenList.map(function(token) {
    return `
      <div class="token-card" data-cat="${token.category}">
        <div class="token-top">
          <div class="platform-badge" style="background:${getPlatformBg(token.platform)}">
            ${token.emoji}
          </div>
          <div class="token-info">
            <h4>${token.platform}</h4>
            <span>Listed ${token.listed} · by ${token.seller}</span>
          </div>
          ${token.badge === 'hot' ? '<span class="badge-hot">🔥 Hot</span>' : ''}
          ${token.badge === 'new' ? '<span class="badge-new">✨ New</span>' : ''}
        </div>
        <div class="token-value">
          <div class="token-amount">${token.value}</div>
          <div class="token-price">Unlock for ₹${token.price}</div>
        </div>
        <div class="token-desc">${token.desc}</div>
        <div class="token-footer">
          <div class="seller-info">Seller: <strong>${token.seller}</strong></div>
          <button class="btn-use" onclick="openUseModal(${token.id})">Use Token →</button>
        </div>
      </div>
    `;
  }).join(''); // join all cards into one big string
}


/* ============================================
   Helper: Background colour for each platform
   ============================================ */
function getPlatformBg(platformName) {
  const colorMap = {
    'Swiggy':     '#fff3e0',
    'Zomato':     '#fce4ec',
    'Google Pay': '#e8f5e9',
    'PhonePe':    '#e3f2fd',
    'Amazon':     '#fff8e1',
    'Paytm':      '#e8eaf6',
    'Flipkart':   '#ffe8e8',
  };
  return colorMap[platformName] || '#f5f5f5'; // default grey if not found
}


/* ============================================
   BROWSE PAGE — Filter by Category
   Called when you click "Food", "Payments" etc.
   ============================================ */
function filterCat(category, clickedBtn) {
  // Remove "active" from all filter buttons
  document.querySelectorAll('.filter-btn').forEach(function(btn) {
    btn.classList.remove('active');
  });
  // Highlight the clicked button
  clickedBtn.classList.add('active');

  // Filter tokens array
  if (category === 'all') {
    renderTokens(tokens); // show everything
  } else {
    const filtered = tokens.filter(function(token) {
      return token.category === category;
    });
    renderTokens(filtered);
  }
}


/* ============================================
   BROWSE PAGE — Search Filter
   Called every time you type in the search box.
   ============================================ */
function filterTokens(searchText) {
  const lower = searchText.toLowerCase();
  const filtered = tokens.filter(function(token) {
    return token.platform.toLowerCase().includes(lower) ||
           token.value.toLowerCase().includes(lower);
  });
  renderTokens(filtered);
}


/* ============================================
   USE TOKEN MODAL — Open
   Shows the modal with info about a specific token.
   ============================================ */
function openUseModal(tokenId) {
  // Must be logged in to use a token
  if (!loggedIn) {
    openModal('loginModal');
    return;
  }

  // Find the token by its id
  currentToken = tokens.find(function(t) { return t.id === tokenId; });

  // Fill in the modal with this token's info
  document.getElementById('useTokenEmoji').textContent      = currentToken.emoji;
  document.getElementById('useTokenPlatform').textContent   = currentToken.platform;
  document.getElementById('useTokenPlatform2').textContent  = currentToken.platform;
  document.getElementById('useTokenValue').textContent      = currentToken.value;
  document.getElementById('useTokenCode').innerHTML         = '🔒 LOCKED<span class="copy-hint">Pay to reveal code</span>';
  document.getElementById('payBtn').style.display           = 'block';
  document.getElementById('payBtn').textContent             = 'Pay ₹' + currentToken.price + ' & Unlock';

  openModal('useTokenModal');
}


/* ============================================
   USE TOKEN MODAL — Pay & Unlock
   Reveals the actual code after payment.
   (In a real app, this would call a payment API)
   ============================================ */
function payAndUnlock() {
  // Show the real token code
  document.getElementById('useTokenCode').innerHTML =
    currentToken.code + '<span class="copy-hint">Tap to copy!</span>';

  // Hide the pay button
  document.getElementById('payBtn').style.display = 'none';

  // Update user stats
  currentUser.used++;
  currentUser.wallet = Math.max(0, currentUser.wallet - currentToken.price);

  showToast('✅ Token unlocked! Tap code to copy.');
}


/* ============================================
   USE TOKEN MODAL — Copy Code
   Copies the token code to the clipboard.
   ============================================ */
function copyCode() {
  if (!currentToken) return;
  navigator.clipboard.writeText(currentToken.code).catch(function() {
    // clipboard might fail on some browsers — that's OK
  });
  showToast('📋 Code copied: ' + currentToken.code);
}


/* ============================================
   SUBMIT PAGE — Select Platform
   Highlights the clicked platform box.
   ============================================ */
function selectPlatform(clickedEl, platformName) {
  // Remove "selected" from all platform options
  document.querySelectorAll('.platform-opt').forEach(function(opt) {
    opt.classList.remove('selected');
  });
  // Add "selected" to the clicked one
  clickedEl.classList.add('selected');
  selectedPlatform = platformName; // remember the choice
}


/* ============================================
   SUBMIT PAGE — Submit Token Form
   Validates the form and adds token to the list.
   ============================================ */
function submitToken() {
  // Must be logged in
  if (!loggedIn) {
    openModal('loginModal');
    return;
  }

  // Validation checks
  if (!selectedPlatform) {
    showToast('Please select a platform!');
    return;
  }

  const code  = document.getElementById('tokenCode').value.trim();
  const value = document.getElementById('tokenValue').value.trim();
  const upi   = document.getElementById('upiId').value.trim();

  if (!code)  { showToast('Please enter the token code!');  return; }
  if (!value) { showToast('Please describe the token value!'); return; }
  if (!upi)   { showToast('Please enter your UPI ID!');     return; }

  // Map platform names to emojis
  const emojiMap = {
    'Google Pay': '🟢',
    'PhonePe':    '📱',
    'Swiggy':     '🧡',
    'Zomato':     '❤️',
    'Amazon':     '📦',
    'Paytm':      '💙',
    'Flipkart':   '🛒',
    'Other':      '✨',
  };

  // Create a new submission object
  const newToken = {
    platform: selectedPlatform,
    emoji:    emojiMap[selectedPlatform] || '✨',
    code:     code.toUpperCase(),
    value:    value,
    status:   'pending', // admin needs to approve first
    earned:   0,
  };

  // Add it to the front of the submissions list
  mySubmissions.unshift(newToken);
  currentUser.shared++;

  showToast('🎉 Token submitted! Under review — you\'ll earn ₹1 when approved!');

  // Clear the form
  document.getElementById('tokenCode').value  = '';
  document.getElementById('tokenValue').value = '';
  document.getElementById('tokenExpiry').value = '';
  document.getElementById('tokenDesc').value  = '';
  document.getElementById('upiId').value      = '';
  document.querySelectorAll('.platform-opt').forEach(function(opt) {
    opt.classList.remove('selected');
  });
  selectedPlatform = '';

  // Go to dashboard after 1.5 seconds
  setTimeout(function() { goTo('dashboard'); }, 1500);
}


/* ============================================
   DASHBOARD — Render User Data
   Fills in all the dashboard info from
   the currentUser object.
   ============================================ */
function renderDashboard() {
  // Update user info at top
  document.getElementById('dashName').textContent  = currentUser.name;
  document.getElementById('dashPhone').textContent = '+91 ' + currentUser.phone;
  document.getElementById('dashAvatar').textContent = currentUser.name[0]; // first letter

  // Update stat cards
  document.getElementById('dashEarned').textContent  = currentUser.earned;
  document.getElementById('dashShared').textContent  = currentUser.shared;
  document.getElementById('dashUsed').textContent    = currentUser.used;
  document.getElementById('dashWallet').textContent  = currentUser.wallet;
  document.getElementById('withdrawBalance').textContent = currentUser.wallet;

  // Build the list of submitted tokens
  const list = document.getElementById('myTokensList');
  list.innerHTML = mySubmissions.map(function(token) {
    // Pick the right status badge style
    let statusHTML = '';
    if (token.status === 'active')  statusHTML = '<span class="status-badge status-active">✅ Active</span>';
    if (token.status === 'sold')    statusHTML = '<span class="status-badge status-sold">💰 Sold</span>';
    if (token.status === 'pending') statusHTML = '<span class="status-badge status-pending">⏳ Pending</span>';

    return `
      <div class="my-token-row">
        <div class="platform">${token.emoji}</div>
        <div class="details">
          <div class="name">${token.platform} — ${token.value}</div>
          <div class="meta">Code: ${token.code} · Earned: ₹${token.earned}</div>
        </div>
        ${statusHTML}
      </div>
    `;
  }).join('');
}


/* ============================================
   DASHBOARD — Withdraw Earnings
   ============================================ */
function withdrawEarnings() {
  if (currentUser.wallet < 10) {
    showToast('Minimum ₹10 needed to withdraw. Keep sharing!');
    return;
  }
  showToast('💸 Withdrawal request submitted! UPI credit in 24 hrs.');
  currentUser.wallet = 0;
  document.getElementById('dashWallet').textContent = '0';
  document.getElementById('withdrawBalance').textContent = '0';
}


/* ============================================
   ADMIN PAGE — Switch Tabs
   Shows different tables based on which tab
   you click.
   ============================================ */
function adminTab(tabName, clickedBtn) {
  // Highlight clicked tab
  document.querySelectorAll('.admin-tab').forEach(function(tab) {
    tab.classList.remove('active');
  });
  clickedBtn.classList.add('active');

  const tableDiv = document.getElementById('adminTable');

  if (tabName === 'pending') {
    // Tokens waiting for approval
    tableDiv.innerHTML = `
      <table>
        <thead>
          <tr>
            <th>Platform</th><th>Code</th><th>Value</th>
            <th>Seller</th><th>Submitted</th><th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${[
            { p: 'Swiggy',  e: '🧡', c: 'SWGY2025', v: '₹80 off',       s: 'Rahul K.',  d: '2 min ago'  },
            { p: 'Amazon',  e: '📦', c: 'AMZN200X', v: '₹200 off',      s: 'Priya S.',  d: '10 min ago' },
            { p: 'Paytm',   e: '💙', c: 'PTM50CB',  v: '₹50 cashback',  s: 'Amit R.',   d: '22 min ago' },
          ].map(function(t) {
            return `
              <tr>
                <td>${t.e} ${t.p}</td>
                <td><code style="background:#f5f5f5;padding:3px 8px;border-radius:6px;font-weight:700;">${t.c}</code></td>
                <td>${t.v}</td>
                <td>${t.s}</td>
                <td style="color:#888;font-size:13px;">${t.d}</td>
                <td style="display:flex;gap:6px;">
                  <button class="action-btn action-approve" onclick="adminAction('approve','${t.c}')">✅ Approve</button>
                  <button class="action-btn action-reject"  onclick="adminAction('reject','${t.c}')">❌ Reject</button>
                </td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    `;

  } else if (tabName === 'active') {
    // All live tokens
    tableDiv.innerHTML = `
      <table>
        <thead>
          <tr><th>Platform</th><th>Code</th><th>Value</th><th>Price</th><th>Seller</th><th>Status</th></tr>
        </thead>
        <tbody>
          ${tokens.slice(0, 5).map(function(t) {
            return `
              <tr>
                <td>${t.emoji} ${t.platform}</td>
                <td><code style="background:#f5f5f5;padding:3px 8px;border-radius:6px;font-weight:700;">${t.code}</code></td>
                <td>${t.value}</td>
                <td>₹${t.price}</td>
                <td>${t.seller}</td>
                <td><span class="status-badge status-active">✅ Active</span></td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    `;

  } else if (tabName === 'users') {
    // All registered users
    const users = [
      { n: 'Rahul K.',  p: '98765xxxxx', s: 7,  u: 3,  w: '₹7',  j: 'Jan 2025' },
      { n: 'Priya S.',  p: '87654xxxxx', s: 12, u: 8,  w: '₹12', j: 'Feb 2025' },
      { n: 'Amit K.',   p: '76543xxxxx', s: 3,  u: 15, w: '₹3',  j: 'Mar 2025' },
      { n: 'Sneha R.',  p: '65432xxxxx', s: 9,  u: 5,  w: '₹9',  j: 'Jan 2025' },
    ];
    tableDiv.innerHTML = `
      <table>
        <thead>
          <tr><th>Name</th><th>Phone</th><th>Tokens Shared</th><th>Tokens Used</th><th>Wallet</th><th>Joined</th></tr>
        </thead>
        <tbody>
          ${users.map(function(u) {
            return `
              <tr>
                <td><strong>${u.n}</strong></td>
                <td style="color:#888;">${u.p}</td>
                <td>${u.s}</td>
                <td>${u.u}</td>
                <td style="color:#06D6A0;font-weight:700;">${u.w}</td>
                <td style="color:#888;font-size:13px;">${u.j}</td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    `;

  } else if (tabName === 'transactions') {
    // Payment history
    const txns = [
      { type: 'Token Used',   user: 'Rahul K.',  amt: '+₹7',  p: 'Swiggy',     t: '2 min ago',  c: '#06D6A0' },
      { type: 'Seller Paid',  user: 'Priya S.',  amt: '-₹1',  p: 'Swiggy',     t: '2 min ago',  c: '#FF4D9E' },
      { type: 'Token Used',   user: 'Amit K.',   amt: '+₹5',  p: 'Google Pay', t: '15 min ago', c: '#06D6A0' },
      { type: 'Withdrawal',   user: 'Sneha R.',  amt: '-₹10', p: 'Bank',       t: '1 hr ago',   c: '#FF4D9E' },
    ];
    tableDiv.innerHTML = `
      <table>
        <thead>
          <tr><th>Type</th><th>User</th><th>Amount</th><th>Platform</th><th>Time</th></tr>
        </thead>
        <tbody>
          ${txns.map(function(tx) {
            return `
              <tr>
                <td><strong>${tx.type}</strong></td>
                <td>${tx.user}</td>
                <td style="color:${tx.c};font-weight:700;font-family:'Baloo 2',cursive;">${tx.amt}</td>
                <td>${tx.p}</td>
                <td style="color:#888;font-size:13px;">${tx.t}</td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    `;
  }
}


/* ============================================
   ADMIN — Approve or Reject a token
   ============================================ */
function adminAction(action, code) {
  if (action === 'approve') {
    showToast('✅ Token ' + code + ' approved and listed!');
  } else {
    showToast('❌ Token ' + code + ' rejected.');
  }
  // Refresh the pending tab after a moment
  setTimeout(function() {
    adminTab('pending', document.querySelector('.admin-tab'));
  }, 500);
}


/* ============================================
   TOAST NOTIFICATION
   Shows a small popup message at the bottom
   of the screen, then hides it after 3 seconds.
   ============================================ */
function showToast(message) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.classList.add('show');    // CSS slides it up

  // Remove after 3 seconds
  setTimeout(function() {
    toast.classList.remove('show'); // CSS slides it back down
  }, 3000);
}


/* ============================================
   INITIALISE ON PAGE LOAD
   These run automatically when the page loads.
   ============================================ */

// Draw token cards on the browse page (so they're ready)
renderTokens(tokens);

// Set up the default admin tab view
adminTab('pending', document.querySelector('.admin-tab'));

// SECRET: Click the logo 5 times to open Admin Panel
document.getElementById('logoBtn').addEventListener('click', function() {
  logoClicks++;
  if (logoClicks >= 5) {
    logoClicks = 0;
    // Hide all pages, show admin
    document.querySelectorAll('.page').forEach(function(p) {
      p.classList.remove('active');
    });
    document.getElementById('page-admin').classList.add('active');
    showToast('🛡️ Admin Panel unlocked! Shhh 🤫');
  }
});