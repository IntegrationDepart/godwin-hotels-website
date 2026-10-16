/**
 * GODWIN HOTELS — MAIN.JS
 * Core App Logic: Hero Slider, Scroll Reveal, FAQ, Booking Modal, Currency, Navbar
 */

document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initHeroSlider();
  initScrollReveal();
  initFAQ();
  initBookingModal();
  initBookingForms();
  initCurrencySelector();
  initDateDefaults();
});

/* ─────────────────────────────────────────
   NAVBAR: Scroll Effect + Mobile Toggle
───────────────────────────────────────── */
function initNavbar() {
  const navbar      = document.getElementById('navbar') || document.getElementById('siteHeader');
  const toggle      = document.getElementById('mobileToggle');
  const navLinks    = document.getElementById('navLinks');
  const menuIcon    = document.getElementById('menuIcon');

  // Scroll shadow
  const handleScroll = () => {
    if (window.scrollY > 60) {
      navbar?.classList.add('scrolled');
    } else {
      navbar?.classList.remove('scrolled');
    }
  };
  window.addEventListener('scroll', handleScroll, { passive: true });

  // Mobile toggle
  toggle?.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = navLinks?.classList.toggle('open');
    toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    if (menuIcon) {
      menuIcon.className = isOpen ? 'fa-solid fa-xmark' : 'fa-solid fa-bars';
    }
  });

  // Mobile Dropdown Click Handler (for iOS / Android touch screens)
  document.querySelectorAll('.nav-dropdown-toggle').forEach(dropToggle => {
    dropToggle.addEventListener('click', (e) => {
      if (window.innerWidth <= 1140) {
        e.preventDefault();
        e.stopPropagation();
        const dropMenu = dropToggle.nextElementSibling;
        const chevron = dropToggle.querySelector('.chevron');
        if (dropMenu) {
          const isMenuOpen = dropMenu.classList.toggle('show-mobile');
          if (chevron) {
            chevron.style.transform = isMenuOpen ? 'rotate(180deg)' : '';
          }
        }
      }
    });
  });

  // Close mobile drawer on nav link & dropdown item click (except dropdown toggle)
  document.querySelectorAll('.nav-link, .nav-dropdown-item').forEach(link => {
    link.addEventListener('click', () => {
      if (link.classList.contains('nav-dropdown-toggle')) {
        return; // Handled above
      }
      navLinks?.classList.remove('open');
      toggle?.setAttribute('aria-expanded', 'false');
      if (menuIcon) menuIcon.className = 'fa-solid fa-bars';
    });
  });

  // Close drawer on outside click
  document.addEventListener('click', (e) => {
    if (navbar && !navbar.contains(e.target)) {
      navLinks?.classList.remove('open');
      toggle?.setAttribute('aria-expanded', 'false');
      if (menuIcon) menuIcon.className = 'fa-solid fa-bars';
    }
  });
}

/* ─────────────────────────────────────────
   HERO SLIDER
───────────────────────────────────────── */
function initHeroSlider() {
  const slides = document.querySelectorAll('.hero-slide');
  const dots   = document.querySelectorAll('.hero-dot');
  if (!slides.length) return;

  let current   = 0;
  let interval  = null;
  const DELAY   = 5500;

  function goTo(index) {
    slides[current]?.classList.remove('active');
    dots[current]?.classList.remove('active');
    dots[current]?.setAttribute('aria-selected', 'false');

    current = (index + slides.length) % slides.length;

    slides[current]?.classList.add('active');
    dots[current]?.classList.add('active');
    dots[current]?.setAttribute('aria-selected', 'true');
  }

  function next() { goTo(current + 1); }

  function startAuto() {
    stopAuto();
    interval = setInterval(next, DELAY);
  }

  function stopAuto() {
    if (interval) { clearInterval(interval); interval = null; }
  }

  dots.forEach((dot, i) => {
    dot.addEventListener('click', () => { goTo(i); stopAuto(); startAuto(); });
  });

  // Pause on hover
  const heroEl = document.querySelector('.hero');
  heroEl?.addEventListener('mouseenter', stopAuto);
  heroEl?.addEventListener('mouseleave', startAuto);

  // Swipe support
  let touchStartX = 0;
  heroEl?.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
  heroEl?.addEventListener('touchend', e => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      goTo(diff > 0 ? current + 1 : current - 1);
      stopAuto(); startAuto();
    }
  });

  startAuto();
}

/* ─────────────────────────────────────────
   SCROLL REVEAL (Intersection Observer)
───────────────────────────────────────── */
function initScrollReveal() {
  const revealEls = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window)) {
    revealEls.forEach(el => el.classList.add('visible'));
    return;
  }
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  revealEls.forEach(el => io.observe(el));
}

/* ─────────────────────────────────────────
   FAQ ACCORDION
───────────────────────────────────────── */
function initFAQ() {
  document.querySelectorAll('.faq-question-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const item   = btn.closest('.faq-item');
      const isOpen = item.classList.contains('open');

      // Optionally close all others
      // document.querySelectorAll('.faq-item.open').forEach(el => el.classList.remove('open'));

      item.classList.toggle('open', !isOpen);
      btn.setAttribute('aria-expanded', (!isOpen).toString());
    });
  });
}

/* ─────────────────────────────────────────
   QUICK ROOM SEARCH SCROLL & PULSE
───────────────────────────────────────── */
let preselectedRoomFromReserve = null;

function goToQuickRoomSearch(destination, roomType) {
  const bookingSec = document.getElementById('booking');
  if (!bookingSec) return;

  if (roomType) {
    preselectedRoomFromReserve = roomType;
  }

  // Pre-select hotel in quick booking dropdown if present
  const hotelSelect = document.getElementById('bookingHotel');
  if (hotelSelect && destination) {
    for (let opt of hotelSelect.options) {
      if (
        (destination.toLowerCase().includes('grand') && opt.value.toLowerCase().includes('grand')) ||
        (destination.toLowerCase().includes('deluxe') && opt.value.toLowerCase().includes('deluxe'))
      ) {
        opt.selected = true;
        break;
      }
    }
  }

  // Smooth scroll with offset for fixed/sticky header
  const headerOffset = 90;
  const elementPosition = bookingSec.getBoundingClientRect().top;
  const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
  window.scrollTo({
    top: Math.max(0, offsetPosition),
    behavior: 'smooth'
  });

  // Pulse effect on the booking bar to catch attention
  const bar = bookingSec.querySelector('.booking-bar') || bookingSec;
  bar.classList.remove('booking-highlight-pulse');
  void bar.offsetWidth; // force reflow
  bar.classList.add('booking-highlight-pulse');

  // Focus on Check-In date or hotel selector
  setTimeout(() => {
    const checkin = document.getElementById('checkinDate');
    if (checkin) {
      try {
        checkin.focus({ preventScroll: true });
      } catch (err) {
        checkin.focus();
      }
    }
  }, 450);
}

window.goToQuickRoomSearch = goToQuickRoomSearch;

/* ─────────────────────────────────────────
   BOOKING MODAL
───────────────────────────────────────── */
function initBookingModal() {
  const modal     = document.getElementById('bookingModal');
  const closeBtn  = document.getElementById('closeBookingModal');
  const triggers  = document.querySelectorAll('.trigger-booking-modal');

  if (!modal) return;

  function openModal(destination, roomType, price) {
    if (destination) {
      const destSel = document.getElementById('modalDestination');
      if (destSel) {
        for (let opt of destSel.options) {
          if (opt.value === destination) { opt.selected = true; break; }
        }
      }
    }
    if (roomType) {
      const roomSel = document.getElementById('modalRoomType');
      if (roomSel) {
        for (let opt of roomSel.options) {
          if (opt.value === roomType) { opt.selected = true; break; }
        }
      }
    }
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
    updateBill();
  }

  function closeModal() {
    modal.classList.remove('open');
    document.body.style.overflow = '';
  }

  triggers.forEach(btn => {
    btn.addEventListener('click', (e) => {
      // If button text or intent is to Reserve a room, send them to quick room search instead
      const text = btn.textContent.trim().toLowerCase();
      if (text.includes('reserve') || btn.classList.contains('reserve-room-btn')) {
        e.preventDefault();
        goToQuickRoomSearch(btn.dataset.destination || null, btn.dataset.room || null);
        return;
      }
      openModal(
        btn.dataset.destination || null,
        btn.dataset.room || null,
        btn.dataset.price || null
      );
    });
  });

  closeBtn?.addEventListener('click', closeModal);
  modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

  // Bill updaters
  ['modalCheckin', 'modalCheckout', 'modalRoomType', 'modalGuests', 'modalRooms',
   'addonBreakfast', 'addonTransfer'].forEach(id => {
    document.getElementById(id)?.addEventListener('change', updateBill);
  });

  // Hotel selector change auto-selects corresponding room
  document.getElementById('modalDestination')?.addEventListener('change', (e) => {
    const isDeluxe = e.target.value.includes('Deluxe');
    const roomSel = document.getElementById('modalRoomType');
    if (roomSel) {
      for (let opt of roomSel.options) {
        const optIsDeluxe = opt.parentElement?.label?.includes('Deluxe') || opt.value.includes('Premier') || opt.value.includes('Standard');
        if (optIsDeluxe === isDeluxe) {
          opt.selected = true;
          break;
        }
      }
    }
    updateBill();
  });
}

function updateBill() {
  const checkin  = document.getElementById('modalCheckin')?.value;
  const checkout = document.getElementById('modalCheckout')?.value;
  const roomSel  = document.getElementById('modalRoomType');
  const guestSel = document.getElementById('modalGuests');
  const roomsSel = document.getElementById('modalRooms');
  const breakfast= document.getElementById('addonBreakfast');
  const transfer = document.getElementById('addonTransfer');

  const roomPrice  = parseInt(roomSel?.selectedOptions[0]?.dataset.price || 0);
  const guestCount = parseInt(guestSel?.value || 2);
  const roomCount  = parseInt(roomsSel?.value || 1);

  let nights = 1;
  if (checkin && checkout) {
    const diff = (new Date(checkout) - new Date(checkin)) / 86400000;
    nights = Math.max(1, Math.round(diff));
  }

  const bfCost     = breakfast?.checked ? 550 * guestCount * nights : 0;
  const trCost     = transfer?.checked  ? 950 : 0;

  const subtotal = roomPrice * nights * roomCount + bfCost + trCost;
  const gst      = Math.round(subtotal * 0.12);
  const total    = subtotal + gst;
  const symbol   = getCurrencySymbol();
  const rate     = getRate();

  setText('billNights',   `${nights} Night(s) × ${roomCount} Room(s)`);
  setText('billRoomRate', `${symbol}${fmt(roomPrice * rate)}`);
  setText('billAddons',   `${symbol}${fmt((bfCost + trCost) * rate)}`);
  setText('billSubtotal', `${symbol}${fmt(subtotal * rate)}`);
  setText('billTax',      `${symbol}${fmt(gst * rate)}`);
  setText('billTotal',    `${symbol}${fmt(total * rate)}`);
}

function setText(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}

/* ─────────────────────────────────────────
   QUICK BOOKING FORM (bar)
───────────────────────────────────────── */
function initBookingForms() {
  document.getElementById('quickBookingForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const hotel    = document.getElementById('bookingHotel')?.value;
    const checkin  = document.getElementById('checkinDate')?.value;
    const checkout = document.getElementById('checkoutDate')?.value;
    const guests   = document.getElementById('bookingGuests')?.value;

    if (checkin && checkout && new Date(checkout) <= new Date(checkin)) {
      alert('Check-out date must be after check-in date.');
      return;
    }

    // Pre-fill modal
    const destSel = document.getElementById('modalDestination');
    if (destSel && hotel) {
      for (let opt of destSel.options) {
        if (opt.value === hotel) { opt.selected = true; break; }
      }
    }
    if (checkin)  { const el = document.getElementById('modalCheckin');  if (el) el.value = checkin; }
    if (checkout) { const el = document.getElementById('modalCheckout'); if (el) el.value = checkout; }

    // Pre-fill guests
    const modalGuests = document.getElementById('modalGuests');
    if (modalGuests && guests) {
      if (guests.includes('1 Guest') || guests.includes('1 Adult')) modalGuests.value = '1';
      else if (guests.includes('3 Guest') || guests.includes('3 Adult')) modalGuests.value = '3';
      else if (guests.includes('4+') || guests.includes('Family')) modalGuests.value = '4';
      else modalGuests.value = '2';
    }

    // Auto-select room type based on preselected room or hotel
    const roomSel = document.getElementById('modalRoomType');
    if (roomSel) {
      let matched = false;
      if (preselectedRoomFromReserve) {
        for (let opt of roomSel.options) {
          if (
            opt.value.toLowerCase().includes(preselectedRoomFromReserve.toLowerCase()) ||
            preselectedRoomFromReserve.toLowerCase().includes(opt.value.toLowerCase())
          ) {
            opt.selected = true;
            matched = true;
            break;
          }
        }
      }
      if (!matched && hotel) {
        const isDeluxe = hotel.includes('Deluxe');
        for (let opt of roomSel.options) {
          const optIsDeluxe = opt.parentElement?.label?.includes('Deluxe') || opt.value.includes('Premier') || opt.value.includes('Standard');
          if (optIsDeluxe === isDeluxe) {
            opt.selected = true;
            break;
          }
        }
      }
    }

    document.getElementById('bookingModal')?.classList.add('open');
    document.body.style.overflow = 'hidden';
    updateBill();
  });

  // Global listeners for any reserve buttons
  document.querySelectorAll('.reserve-room-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      goToQuickRoomSearch(btn.dataset.destination || null, btn.dataset.room || null);
    });
  });

  // Global smooth scroll + pulse for all #booking anchor links
  document.querySelectorAll('a[href="#booking"]').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const dest = link.dataset.destination || (window.location.href.includes('godwin-deluxe') ? 'Hotel Godwin Deluxe' : (window.location.href.includes('grand-godwin') ? 'Hotel Grand Godwin' : null));
      const room = link.dataset.room || link.dataset.category || null;
      goToQuickRoomSearch(dest, room);
    });
  });

  document.getElementById('modalReservationForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const hotel    = document.getElementById('modalDestination')?.value;
    const checkin  = document.getElementById('modalCheckin')?.value;
    const checkout = document.getElementById('modalCheckout')?.value;
    const name     = document.getElementById('guestFullName')?.value;
    const phone    = document.getElementById('guestPhone')?.value;
    const email    = document.getElementById('guestEmail')?.value;

    if (!checkin || !checkout || !name || !phone || !email) {
      alert('Please fill in all required fields to complete your reservation.');
      return;
    }
    if (new Date(checkout) <= new Date(checkin)) {
      alert('Check-out date must be after check-in date.');
      return;
    }

    const total = document.getElementById('billTotal')?.textContent || '';

    // Asynchronously log inquiry to server API
    const apiEndpoint = window.location.pathname.includes('/hotel-') ? '../api/book.php' : 'api/book.php';
    try {
      fetch(apiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name,
          email: email,
          phone: phone,
          destination: hotel,
          room: document.getElementById('modalRoomType')?.value || 'Room',
          checkin: checkin,
          checkout: checkout,
          guests: document.getElementById('modalGuests')?.value || '2 Guests',
          total: total
        })
      }).catch(() => {});
    } catch (err) {}

    // WhatsApp handoff
    const msg = encodeURIComponent(
      `Hello Godwin Hotels Delhi,\n\nI have a booking query:\n\n` +
      `Hotel: ${hotel}\n` +
      `Guest Name: ${name}\n` +
      `Phone: ${phone}\n` +
      `Email: ${email}\n` +
      `Check-In: ${checkin}\n` +
      `Check-Out: ${checkout}\n` +
      `Room Type: ${document.getElementById('modalRoomType')?.value}\n` +
      `Guests: ${document.getElementById('modalGuests')?.value}\n` +
      `Grand Total: ${total}\n\n` +
      `Please assist with room availability and best rates. Thank you!`
    );
    window.open(`https://wa.me/918860081994?text=${msg}`, '_blank');
  });
}

/* ─────────────────────────────────────────
   CURRENCY SELECTOR
───────────────────────────────────────── */
const RATES = { INR: 1, USD: 0.012, EUR: 0.011, AED: 0.044 };
const SYMS  = { INR: '₹', USD: '$', EUR: '€', AED: 'د.إ ' };
let   selectedCurrency = 'INR';

function getCurrencySymbol() { return SYMS[selectedCurrency] || '₹'; }
function getRate()           { return RATES[selectedCurrency] || 1; }

function fmt(val) {
  return Math.round(val).toLocaleString('en-IN');
}

function initCurrencySelector() {
  const sel = document.getElementById('currencySelector');
  if (!sel) return;

  sel.addEventListener('change', () => {
    selectedCurrency = sel.value;
    updateAllPrices();
    updateBill();
  });
}

function updateAllPrices() {
  const symbol = getCurrencySymbol();
  const rate   = getRate();

  document.querySelectorAll('[data-base-price]').forEach(el => {
    const base = parseInt(el.dataset.basePrice);
    el.textContent = `${symbol}${fmt(base * rate)}`;
  });
}

/* ─────────────────────────────────────────
   DATE DEFAULTS
───────────────────────────────────────── */
function initDateDefaults() {
  const today    = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const toISO = d => d.toISOString().split('T')[0];
  const todayStr    = toISO(today);
  const tomorrowStr = toISO(tomorrow);

  ['checkinDate', 'modalCheckin'].forEach(id => {
    const el = document.getElementById(id);
    if (el) { el.min = todayStr; el.value = todayStr; }
  });
  ['checkoutDate', 'modalCheckout'].forEach(id => {
    const el = document.getElementById(id);
    if (el) { el.min = tomorrowStr; el.value = tomorrowStr; }
  });

  updateBill();
}
