// script.js - TAMIT Tours interactive behavior

(function(){
  // DOM shortcuts
  const themeToggle = document.getElementById('themeToggle');
  const langSelect = document.getElementById('langSelect');
  const translatable = document.querySelectorAll('[data-en]');
  const hero = document.querySelector('.hero');
  const galleryGrid = document.getElementById('galleryGrid');
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightboxImage');
  const lightboxCaption = document.getElementById('lightboxCaption');
  const lightboxClose = document.querySelector('.lightbox-close');
  const lbPrev = document.querySelector('.lightbox-prev');
  const lbNext = document.querySelector('.lightbox-next');

  // ========== Theme toggle ==========
  function updateThemeButton() {
    themeToggle.textContent = document.body.classList.contains('dark') ? '☀️' : '🌙';
  }
  themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark');
    updateThemeButton();
  });
  updateThemeButton();

  // ========== Language switch ==========
  langSelect.addEventListener('change', (e) => {
    const lang = e.target.value;
    translatable.forEach(el => {
      const text = el.getAttribute(`data-${lang}`);
      if (text) el.textContent = text;
    });
    document.dir = (lang === 'ar') ? 'rtl' : 'ltr';
  });

  // ========== Hero parallax small effect on scroll ==========
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!prefersReduced) {
    let lastScroll = 0;
    window.addEventListener('scroll', () => {
      const scroll = window.scrollY;
      if (Math.abs(scroll - lastScroll) > 8) {
        // add class to hero to slightly shift background
        if (scroll > 20) hero.classList.add('parallax');
        else hero.classList.remove('parallax');
        lastScroll = scroll;
      }
    }, { passive: true });
  }

  // ========== Dynamic gallery population (gallery1..gallery18) ==========
  // Place images in: images/gallery/gallery1.jpg ... gallery18.jpg
  const maxGallery = 30;
  for (let i=1;i<=maxGallery;i++){
    const imgPath = `images/gallery/gallery${i}.webp`;
    const img = new Image();
    img.src = imgPath;
    // only append when successfully loaded
    img.onload = (function(path, index){
      return function(){
        const wrapper = document.createElement('div');
        wrapper.className = 'thumb clickable';
        const el = document.createElement('img');
        el.dataset.index = galleryGrid.children.length; // will be updated
        el.src = path;
        el.alt = `Gallery`;
        wrapper.appendChild(el);
        galleryGrid.appendChild(wrapper);
        // attach click to open lightbox
        wrapper.addEventListener('click', () => openLightboxWithPath(path, `Gallery ${index}`));
      }
    })(imgPath, i);
    img.onerror = ()=>{ /* ignore missing images */ };
  }

  // ========== Attach location images to lightbox ==========
  document.querySelectorAll('.media.clickable').forEach(el => {
    el.addEventListener('click', (e)=>{
      openLightboxWithPath(e.target.src, e.target.alt || '');
    });
  });

  // ========== Lightbox management ==========
  let lbItems = []; // array of {src, caption}
  function rebuildLbItems(){
    lbItems = [];
    // collect gallery images
    document.querySelectorAll('#galleryGrid img').forEach(img => {
      lbItems.push({ src: img.src, caption: img.alt || '' });
    });
    // collect location images too (prepend if not duplicates)
    document.querySelectorAll('.card img').forEach(img=>{
      if (!lbItems.find(i=>i.src===img.src)) lbItems.unshift({ src: img.src, caption: img.alt || '' });
    });
  }

  // open with specific path (ensure items exist)
  let currentIndex = 0;
  function openLightboxWithPath(path, caption){
    rebuildLbItems();
    currentIndex = lbItems.findIndex(i=>i.src===path);
    if (currentIndex === -1){
      lbItems.push({ src: path, caption: caption});
      currentIndex = lbItems.length - 1;
    }
    showLightboxImage(currentIndex);
    lightbox.setAttribute('aria-hidden','false');
    document.body.style.overflow = 'hidden';
  }

  function showLightboxImage(index){
    if (!lbItems.length) return;
    const item = lbItems[(index + lbItems.length) % lbItems.length];
    currentIndex = (index + lbItems.length) % lbItems.length;
    lightboxImg.src = item.src;
   // hide caption entirely
lightboxCaption.textContent = "";

// keep alt for accessibility
lightboxImg.setAttribute('alt', item.caption || 'Image preview');

  }

  function closeLightbox(){
    lightbox.setAttribute('aria-hidden','true');
    document.body.style.overflow = '';
  }

  // button events
  lightboxClose.addEventListener('click', closeLightbox);
  lbPrev.addEventListener('click', () => showLightboxImage(currentIndex - 1));
  lbNext.addEventListener('click', () => showLightboxImage(currentIndex + 1));

  // close when backdrop clicked
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });

  // keyboard navigation
  window.addEventListener('keydown', (e) => {
    if (lightbox.getAttribute('aria-hidden') === 'false') {
      if (e.key === 'ArrowLeft') showLightboxImage(currentIndex - 1);
      if (e.key === 'ArrowRight') showLightboxImage(currentIndex + 1);
      if (e.key === 'Escape') closeLightbox();
    }
  });

  // ensure links to #book scroll smoothly but with playful bounce
  document.querySelectorAll('a[href^="#"]').forEach(a=>{
    a.addEventListener('click', (e)=>{
      const target = document.querySelector(a.getAttribute('href'));
      if (target){
        e.preventDefault();
        target.scrollIntoView({behavior:'smooth', block:'start'});
      }
    });
  });

  // booking form: subtle client-side animation and dummy submit
  const bookingForm = document.getElementById('bookingForm');

if (bookingForm) {
  bookingForm.addEventListener('submit', () => {

    // SAVE BOOKING DATA
    const bookingData = {
      name: document.getElementById("name")?.value || "",
      email: document.getElementById("email")?.value || "",
      tourDate: document.getElementById("tourDate")?.value || "",
      message: document.getElementById("message")?.value || ""
    };

    localStorage.setItem("bookingData", JSON.stringify(bookingData));

    // optional UX feedback (non-blocking)
    const btn = bookingForm.querySelector('.submit-btn');
    if (btn) {
      btn.textContent = 'Sending...';
      btn.disabled = true;
    }

    // ✅ DO NOT preventDefault → FormSubmit continues
  });
}


  // Initial content translation default (english already visible)
  // set initial direction
  document.dir = 'ltr';

})();
flatpickr("#tourDate", {
  dateFormat: "Y-m-d",
  minDate: "today",
  altInput: true,
  altFormat: "F j, Y",
  disableMobile: false // allow nice UI on mobile too
});

function saveBookingData() {
  const bookingData = {
    name: document.getElementById("name").value,
    email: document.getElementById("email").value,
    tourDate: document.getElementById("tour-date").value,
    message: document.getElementById("message").value
  };

  localStorage.setItem("bookingData", JSON.stringify(bookingData));
}


