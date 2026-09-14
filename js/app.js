// Home page renderer.
//
// Everything visible here comes out of projects.json: the project cards under
// "Selected Work" and the poster grid under "Graphics". The rest of the file is
// the small stuff that gives the page its manner — scroll reveals, the drawn
// circle in the headline, the clock in the header.

// Order of categories shown on the home page
const CATEGORY_ORDER = ['Electrical', 'Mechanical', 'Software'];

// Cards sit a fraction off square. Fixed list rather than random so the page
// looks the same on every load.
const TILTS = [-0.8, 0.65, -0.45, 0.9, -0.7, 0.5, -0.35, 0.75];

// Poster tilts, same idea.
const GFX_TILTS = [-1.6, 1.2, -0.9, 1.5, -1.3];

// Tags an element with the projects.json path it was rendered from, so the
// inline editor can write changes back. Returns '' unless edit mode is on.
const editAttr = (path, type = 'text') => (window.editAttr ? window.editAttr(path, type) : '');

/* -------------------------------------------------------------------------- */
/* Project cards                                                               */
/* -------------------------------------------------------------------------- */

// Build a single project card element.
// `index` is the position in projects.json, used to build edit paths.
// `slot` is the position within its category grid, used only for the tilt.
function createProjectCard(project, index, slot) {
    const base = `projects.${index}`;

    const projectLink = document.createElement('a');
    projectLink.href = `project.html?id=${project.id}`;
    projectLink.className = 'project-link reveal';

    const projectDiv = document.createElement('div');
    projectDiv.className = 'project';
    projectDiv.style.setProperty('--tilt', `${TILTS[slot % TILTS.length]}deg`);

    const imageHTML = project.thumbnail
        ? `<img src="${project.thumbnail}" alt="${project.title}" loading="lazy">`
        : '';

    // Reference designator, silkscreen style: 01 / ELEC
    const desig = `${project.number} / ${(project.category || 'misc').slice(0, 4).toUpperCase()}`;

    const dateHTML = project.date
        ? `<span class="project-date"${editAttr(`${base}.date`)}>${project.date}</span>`
        : '';

    projectDiv.innerHTML = `
        <div class="project-image">
            ${imageHTML}
            <span class="project-desig">${desig}</span>
            ${dateHTML}
        </div>
        <div class="project-number"${editAttr(`${base}.number`)}>${project.number}</div>
        <h4 class="project-title"${editAttr(`${base}.title`)}>${project.title}</h4>
        <p class="project-description"${editAttr(`${base}.description`)}>${project.description}</p>
        <div class="project-tags">
            ${project.tags.map((tag, i) => `<span class="tag"${editAttr(`${base}.tags.${i}`)}>${tag}</span>`).join('')}
        </div>
    `;

    projectLink.appendChild(projectDiv);
    return projectLink;
}

function renderProjects(data) {
    const container = document.getElementById('projects-container');
    if (!container) return;

    // Group projects by category, remembering each project's position in
    // the JSON file so edits can be pointed back at the right entry.
    const grouped = {};
    const indexById = new Map();
    data.projects.forEach((project, index) => {
        indexById.set(project.id, index);
        const cat = project.category || 'Other';
        (grouped[cat] = grouped[cat] || []).push(project);
    });

    // Keep any categories not in the predefined order (appended after)
    const categories = [
        ...CATEGORY_ORDER,
        ...Object.keys(grouped).filter(c => !CATEGORY_ORDER.includes(c))
    ];

    categories.forEach(category => {
        const projects = grouped[category] || [];

        const group = document.createElement('div');
        group.className = 'project-category';

        const heading = document.createElement('h3');
        heading.className = 'category-title reveal';
        heading.innerHTML = `${category} <span class="category-count">${String(projects.length).padStart(2, '0')}</span>`;
        group.appendChild(heading);

        if (projects.length > 0) {
            const grid = document.createElement('div');
            grid.className = 'projects-grid';
            projects.forEach((project, slot) => {
                grid.appendChild(createProjectCard(project, indexById.get(project.id), slot));
            });
            group.appendChild(grid);
        } else {
            const empty = document.createElement('p');
            empty.className = 'category-empty reveal';
            empty.textContent = 'Nothing here yet.';
            group.appendChild(empty);
        }

        container.appendChild(group);
    });
}

/* -------------------------------------------------------------------------- */
/* Graphics design                                                             */
/* -------------------------------------------------------------------------- */

function renderGraphics(data) {
    const container = document.getElementById('graphics-container');
    const gfx = data.graphics;
    if (!container || !gfx) return;

    const items = (gfx.items || []).map((item, i) => `
        <figure class="gfx reveal" style="--rot: ${GFX_TILTS[i % GFX_TILTS.length]}deg">
            <button class="gfx-frame" type="button"
                    data-full="${item.src}"
                    data-caption="${item.title} — ${item.meta}">
                <img src="${item.src}" alt="${item.alt || item.title}" loading="lazy">
                <span class="gfx-num">${item.designator || ''}</span>
                <span class="gfx-zoom">Click to enlarge</span>
            </button>
            <figcaption>
                <h4 class="gfx-title">
                    <span${editAttr(`graphics.items.${i}.title`)}>${item.title}</span>
                    <span class="gfx-year"${editAttr(`graphics.items.${i}.year`)}>${item.year}</span>
                </h4>
                <p class="gfx-meta"${editAttr(`graphics.items.${i}.meta`)}>${item.meta}</p>
                <p class="gfx-note"${editAttr(`graphics.items.${i}.note`, 'html')}>${item.note}</p>
            </figcaption>
        </figure>
    `).join('');

    container.innerHTML = `
        <div class="section-head reveal">
            <p class="eyebrow"${editAttr('graphics.eyebrow')}>${gfx.eyebrow}</p>
            <h3 class="section-title"${editAttr('graphics.heading', 'html')}>${gfx.heading}</h3>
            <p class="section-intro"${editAttr('graphics.intro', 'html')}>${gfx.intro}</p>
        </div>
        <div class="graphics-grid">${items}</div>
    `;
}

// Click a poster to see it full size. The project pages have their own,
// more elaborate lightbox; this one only has to open and close.
function setupGraphicsLightbox() {
    const box = document.createElement('div');
    box.className = 'gfx-lightbox';
    box.innerHTML = `
        <button class="gfx-lightbox-close" type="button" aria-label="Close">&times;</button>
        <img src="" alt="">
        <p class="gfx-lightbox-caption"></p>
    `;
    document.body.appendChild(box);

    const img = box.querySelector('img');
    const caption = box.querySelector('.gfx-lightbox-caption');

    const close = () => {
        box.classList.remove('active');
        document.body.style.overflow = '';
    };

    document.addEventListener('click', e => {
        const frame = e.target.closest('.gfx-frame');
        if (!frame) return;
        img.src = frame.dataset.full;
        img.alt = frame.querySelector('img').alt;
        caption.textContent = frame.dataset.caption;
        box.classList.add('active');
        document.body.style.overflow = 'hidden';
    });

    box.addEventListener('click', close);

    document.addEventListener('keydown', e => {
        if (e.key === 'Escape' && box.classList.contains('active')) close();
    });
}

/* -------------------------------------------------------------------------- */
/* Page furniture                                                              */
/* -------------------------------------------------------------------------- */

// Copy the email address instead of opening a mail client nobody has set up.
function setupEmailCopy() {
    const toast = document.getElementById('toast');
    const email = 'yuankev@umich.edu';

    document.querySelectorAll('#email-link, #email-link-hero').forEach(link => {
        link.addEventListener('click', e => {
            e.preventDefault();
            navigator.clipboard.writeText(email).then(() => {
                toast.classList.add('show');
                setTimeout(() => toast.classList.remove('show'), 3000);
            }).catch(err => {
                console.error('Failed to copy email:', err);
                window.location.href = `mailto:${email}`;
            });
        });
    });
}

// Add a rule under the sticky header once the page is scrolled
function setupStickyHeader() {
    const header = document.querySelector('header');
    if (!header) return;

    const onScroll = () => {
        header.classList.toggle('scrolled', window.scrollY > 10);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
}

// Fade sections in as they come into view. Applied to anything tagged .reveal,
// including the cards built above, so it has to run after rendering.
function setupReveals() {
    const targets = document.querySelectorAll('.reveal');

    if (!('IntersectionObserver' in window) ||
        window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        targets.forEach(el => el.classList.add('is-in'));
        return;
    }

    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add('is-in');
            obs.unobserve(entry.target);
        });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.05 });

    // Stagger cards within a grid so a row doesn't arrive all at once
    targets.forEach(el => {
        const siblings = el.parentElement ? [...el.parentElement.children] : [];
        const i = siblings.indexOf(el);
        if (el.classList.contains('project-link') || el.classList.contains('gfx')) {
            el.style.transitionDelay = `${Math.min(i, 4) * 70}ms`;
        }
        observer.observe(el);
    });
}

// Draw the marker circle around "three" the first time it scrolls into view
function setupCircle() {
    const circled = document.querySelector('.circled');
    if (!circled) return;

    if (!('IntersectionObserver' in window)) {
        circled.classList.add('is-drawn');
        return;
    }

    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            // Let the headline settle before the pen lands
            setTimeout(() => entry.target.classList.add('is-drawn'), 450);
            obs.unobserve(entry.target);
        });
    }, { threshold: 0.6 });

    observer.observe(circled);
}

// Local time in the header — proof there's a person on the other end
function setupClock() {
    const el = document.getElementById('local-time');
    if (!el) return;

    const tick = () => {
        const time = new Intl.DateTimeFormat('en-US', {
            timeZone: 'America/Detroit',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        }).format(new Date());
        el.textContent = `Ann Arbor, MI — ${time}`;
    };

    tick();
    setInterval(tick, 30000);
}

// Smooth-scroll to in-page anchors with a fast ease-in-out animation
function setupSmoothScroll() {
    const HEADER_OFFSET = 96; // px of room above the target (matches scroll-margin-top)
    const DURATION = 600;     // ms — fixed so it always feels fast
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // easeInOutCubic: slow start, fast middle, slow end ("phase in / phase out")
    const ease = t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

    document.querySelectorAll('a[href^="#"]').forEach(link => {
        link.addEventListener('click', e => {
            const id = link.getAttribute('href');
            if (id === '#' || id.length < 2) return;

            const target = document.querySelector(id);
            if (!target) return;

            e.preventDefault();

            const startY = window.scrollY;
            const endY = target.getBoundingClientRect().top + startY - HEADER_OFFSET;

            if (prefersReduced) {
                window.scrollTo(0, endY);
                return;
            }

            const distance = endY - startY;
            let startTime = null;

            const step = now => {
                if (startTime === null) startTime = now;
                const progress = Math.min((now - startTime) / DURATION, 1);
                window.scrollTo(0, startY + distance * ease(progress));
                if (progress < 1) requestAnimationFrame(step);
            };

            requestAnimationFrame(step);
        });
    });
}

/* -------------------------------------------------------------------------- */

async function loadContent() {
    try {
        const response = await fetch('projects.json');
        const data = await response.json();
        renderProjects(data);
        renderGraphics(data);
    } catch (error) {
        console.error('Error loading content:', error);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    setupStickyHeader();
    setupEmailCopy();
    setupClock();
    setupCircle();
    setupGraphicsLightbox();

    // Reveals and anchor links have to wait for the rendered cards to exist
    loadContent().then(() => {
        setupReveals();
        setupSmoothScroll();
    });
});
