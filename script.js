document.addEventListener('DOMContentLoaded', () => {

    // --- PART 1: Intersection Observer for scroll-based animations (pages 2-10) ---
    const scrollPages = document.querySelectorAll('#page5, #custom-text, #request, #quran-quote, #love-story, #gallery, #rsvp-wish, #gift');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            } else {
                // Allow exit animation by removing the active class
                entry.target.classList.remove('active');
            }
        });
    }, { threshold: 0.15 });

    scrollPages.forEach(page => observer.observe(page));

    // --- PART 2: Cross-fade from page 1 to page 2 ---
    const openBtn     = document.getElementById('open-invitation');
    const openingPage = document.getElementById('opening');
    const requestPage = document.getElementById('page5');
    const audio       = document.getElementById('wedding-music');
    const musicBtn    = document.getElementById('music-control');

    if (openBtn && openingPage && requestPage) {
        openBtn.addEventListener('click', () => {
            // Play music on interaction (browser requirement)
            if (audio) {
                // Ensure music button is visible after opening
                if (musicBtn) musicBtn.style.display = 'flex';
                
                audio.play()
                    .then(() => {
                        musicBtn.classList.add('playing');
                        musicBtn.classList.remove('pause');
                    })
                    .catch(e => {
                        console.log("Audio play failed:", e);
                        // Show button even if play fails so user can try manual play
                        if (musicBtn) musicBtn.classList.add('pause');
                    });
            }

            // Simultaneously: fade out page 1, fade in page 2, and enable body scrolling
            document.body.classList.add('opened');
            openingPage.classList.add('fade-away');   // page 1 → opacity: 0
            requestPage.classList.add('fade-in');      // page 2 → opacity: 1
            requestPage.classList.add('active');       // trigger content animation

            // After transition ends, remove the fixed overlay from the flow entirely
            setTimeout(() => {
                openingPage.style.display = 'none';
            }, 1600);
        });
    }

    // --- PART 2.5: Music Toggle ---
    if (musicBtn && audio) {
        musicBtn.addEventListener('click', () => {
            if (audio.paused) {
                audio.play();
                musicBtn.classList.add('playing');
                musicBtn.classList.remove('pause');
            } else {
                audio.pause();
                musicBtn.classList.remove('playing');
                musicBtn.classList.add('pause');
            }
        });
    }

    // --- PART 3: Dynamic Guest Name from URL (?to=Nama+Tamu) ---
    const urlParams        = new URLSearchParams(window.location.search);
    const guestNameParam   = urlParams.get('to');
    const guestNameElement = document.querySelector('.guest-name');
    if (guestNameParam && guestNameElement) {
        guestNameElement.innerText = guestNameParam.replace(/\+/g, ' ');
    }

    // --- PART 4: Draggable Elements (Clouds) ---
    const draggables = document.querySelectorAll('.draggable');
    let activeDrag = null;
    let offsetX = 0;
    let offsetY = 0;

    draggables.forEach(elem => {
        // Mouse event
        elem.addEventListener('mousedown', (e) => {
            activeDrag = elem;
            const rect = elem.getBoundingClientRect();
            offsetX = e.clientX - rect.left;
            offsetY = e.clientY - rect.top;
        });
        
        // Touch event
        elem.addEventListener('touchstart', (e) => {
            activeDrag = elem;
            const rect = elem.getBoundingClientRect();
            const touch = e.touches[0];
            offsetX = touch.clientX - rect.left;
            offsetY = touch.clientY - rect.top;
        }, {passive: true});
    });

    document.addEventListener('mousemove', (e) => {
        if (!activeDrag) return;
        moveElement(e.clientX, e.clientY);
    });

    document.addEventListener('touchmove', (e) => {
        if (!activeDrag) return;
        const touch = e.touches[0];
        moveElement(touch.clientX, touch.clientY);
    }, {passive: false});

    function moveElement(clientX, clientY) {
        const parent = activeDrag.parentElement;
        const parentRect = parent.getBoundingClientRect();
        
        let newLeft = clientX - parentRect.left - offsetX;
        let newTop = clientY - parentRect.top - offsetY;

        // Terapkan posisi baru
        activeDrag.style.left = newLeft + 'px';
        activeDrag.style.top = newTop + 'px';
        activeDrag.style.right = 'auto'; // Hapus aturan right jika ada
    }

    document.addEventListener('mouseup', () => { activeDrag = null; });
    document.addEventListener('touchend', () => { activeDrag = null; });

    // --- PART 5: Countdown Timer (Halaman 3 — Save The Date) ---
    // Target: 24 Agustus 2026, pukul 09:00 WIB (UTC+7)
    const weddingDate = new Date('2026-08-24T09:00:00+07:00');

    const elDays    = document.getElementById('cd-days');
    const elHours   = document.getElementById('cd-hours');
    const elMinutes = document.getElementById('cd-minutes');
    const elSeconds = document.getElementById('cd-seconds');
    const cdGrid    = document.getElementById('countdown-grid');

    function pad(n) {
        return String(n).padStart(2, '0');
    }

    function animateTick(el) {
        el.classList.remove('tick');
        // Force reflow so the animation restarts
        void el.offsetWidth;
        el.classList.add('tick');
        setTimeout(() => el.classList.remove('tick'), 260);
    }

    function updateCountdown() {
        const now  = new Date();
        const diff = weddingDate - now;

        if (diff <= 0) {
            // Wedding day has arrived!
            if (cdGrid) {
                cdGrid.innerHTML = '<div class="countdown-done">Hari Bahagia Telah Tiba! 🎊</div>';
            }
            return;
        }

        const totalSeconds = Math.floor(diff / 1000);
        const days    = Math.floor(totalSeconds / 86400);
        const hours   = Math.floor((totalSeconds % 86400) / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        if (elDays)    { const v = pad(days);    if (elDays.textContent    !== v) { elDays.textContent    = v; animateTick(elDays);    } }
        if (elHours)   { const v = pad(hours);   if (elHours.textContent   !== v) { elHours.textContent   = v; animateTick(elHours);   } }
        if (elMinutes) { const v = pad(minutes); if (elMinutes.textContent !== v) { elMinutes.textContent = v; animateTick(elMinutes); } }
        if (elSeconds) { const v = pad(seconds); if (elSeconds.textContent !== v) { elSeconds.textContent = v; animateTick(elSeconds); } }
    }

    // Run immediately, then every second
    updateCountdown();
    setInterval(updateCountdown, 1000);

    // --- PART 5.5: Combined RSVP + Ucapan Form Submission ---
    const combinedForm = document.getElementById('rsvp-wish-form');
    const wishesBox = document.getElementById('wishes-box');
    if (combinedForm && wishesBox) {
        combinedForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const nameInput = document.getElementById('rsvp-name');
            const statusInput = document.getElementById('rsvp-status');
            const guestsInput = document.getElementById('rsvp-guests');
            const contentInput = document.getElementById('rsvp-wish-content');
            
            const name = nameInput.value;
            const status = statusInput.value;
            const guests = guestsInput.value;
            const content = contentInput.value;
            
            let statusText = 'akan hadir';
            if (status === 'tidak') statusText = 'tidak dapat hadir';
            else if (status === 'ragu') statusText = 'masih ragu';
            
            // Create a new wish item with attendance badge
            const wishItem = document.createElement('div');
            wishItem.className = 'wish-item new-wish';
            wishItem.innerHTML = `
                <h5 class="wish-sender">${name} <span class="wish-badge badge-${status === 'akan hadir' ? 'hadir' : status === 'tidak' ? 'tidak' : 'ragu'}">${statusText} (${guests} orang)</span></h5>
                <p class="wish-text">${content}</p>
            `;
            
            // Prepend wish to box (so newest is first)
            wishesBox.insertBefore(wishItem, wishesBox.firstChild);
            
            // Smoothly scroll wishes box to top
            wishesBox.scrollTop = 0;
            
            // Reset form
            combinedForm.reset();
        });
    }

});

// Expose copyToClipboard globally for the HTML onclick handler
window.copyToClipboard = function(elementId, btn) {
    const textEl = document.getElementById(elementId);
    if (!textEl) return;
    
    const textToCopy = textEl.innerText || textEl.textContent;
    navigator.clipboard.writeText(textToCopy)
        .then(() => {
            const originalText = btn.innerText;
            btn.innerText = "✓ Disalin!";
            btn.classList.add('copied');
            
            setTimeout(() => {
                btn.innerText = originalText;
                btn.classList.remove('copied');
            }, 2000);
        })
        .catch(err => {
            console.error('Gagal menyalin teks: ', err);
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = textToCopy;
            document.body.appendChild(textArea);
            textArea.select();
            try {
                document.execCommand('copy');
                const originalText = btn.innerText;
                btn.innerText = "✓ Disalin!";
                btn.classList.add('copied');
                setTimeout(() => {
                    btn.innerText = originalText;
                    btn.classList.remove('copied');
                }, 2000);
            } catch (e) {
                btn.innerText = "Gagal menyalin";
            }
            document.body.removeChild(textArea);
        });
};

// Expose revealGiftCards globally for the HTML onclick handler
window.revealGiftCards = function(btn) {
    const container = document.getElementById('gift-cards-container');
    if (!container) return;
    
    if (container.style.display === 'none' || container.style.display === '') {
        // Tampilkan kartu rekening dengan animasi fade-in
        container.style.display = 'flex';
        container.style.opacity = '0';
        container.style.transition = 'opacity 0.5s ease';
        setTimeout(() => {
            container.style.opacity = '1';
        }, 10);
        
        if (btn) {
            btn.innerText = "Sembunyikan Rekening";
        }
    } else {
        // Sembunyikan kartu rekening dengan animasi fade-out
        container.style.opacity = '0';
        container.style.transition = 'opacity 0.5s ease';
        
        setTimeout(() => {
            container.style.display = 'none';
        }, 500); // Menunggu animasi memudar selesai (500ms)
        
        if (btn) {
            btn.innerText = "Lihat Rekening Kado Digital";
        }
    }
};
