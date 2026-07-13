// Order of categories shown on the home page
const CATEGORY_ORDER = ['Electrical', 'Mechanical', 'Software'];

// Build a single project card element
function createProjectCard(project) {
    const projectLink = document.createElement('a');
    projectLink.href = `project.html?id=${project.id}`;
    projectLink.className = 'project-link';

    const projectDiv = document.createElement('div');
    projectDiv.className = 'project';

    // Create image element or placeholder
    let imageHTML = '';
    if (project.thumbnail) {
        imageHTML = `<img src="${project.thumbnail}" alt="${project.title}">`;
    }

    const dateHTML = project.date
        ? `<span class="project-date">${project.date}</span>`
        : '';

    projectDiv.innerHTML = `
        <div class="project-image">
            ${imageHTML}
            ${dateHTML}
        </div>
        <div class="project-number">${project.number}</div>
        <h4 class="project-title">${project.title}</h4>
        <p class="project-description">${project.description}</p>
        <div class="project-tags">
            ${project.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
        </div>
    `;

    projectLink.appendChild(projectDiv);
    return projectLink;
}

// Load projects from JSON, grouped into category sections
async function loadProjects() {
    try {
        const response = await fetch('projects.json');
        const data = await response.json();
        const container = document.getElementById('projects-container');

        // Group projects by category
        const grouped = {};
        data.projects.forEach(project => {
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
            heading.className = 'category-title';
            heading.innerHTML = `${category} <span class="category-count">${projects.length}</span>`;
            group.appendChild(heading);

            if (projects.length > 0) {
                const grid = document.createElement('div');
                grid.className = 'projects-grid';
                projects.forEach(project => grid.appendChild(createProjectCard(project)));
                group.appendChild(grid);
            } else {
                const empty = document.createElement('p');
                empty.className = 'category-empty';
                empty.textContent = 'Projects coming soon.';
                group.appendChild(empty);
            }

            container.appendChild(group);
        });
    } catch (error) {
        console.error('Error loading projects:', error);
    }
}

// Email copy functionality
function setupEmailCopy() {
    const emailLink = document.getElementById('email-link');
    const toast = document.getElementById('toast');
    
    if (emailLink) {
        emailLink.addEventListener('click', (e) => {
            e.preventDefault();
            const email = 'yuankev@umich.edu';
            
            // Copy to clipboard
            navigator.clipboard.writeText(email).then(() => {
                // Show toast
                toast.classList.add('show');
                
                // Hide toast after 3 seconds
                setTimeout(() => {
                    toast.classList.remove('show');
                }, 3000);
            }).catch(err => {
                console.error('Failed to copy email:', err);
            });
        });
    }
}

// Add a shadow to the sticky header once the page is scrolled
function setupStickyHeader() {
    const header = document.querySelector('header');
    if (!header) return;

    const onScroll = () => {
        header.classList.toggle('scrolled', window.scrollY > 10);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
}

// Smooth-scroll to in-page anchors with a fast ease-in-out animation
function setupSmoothScroll() {
    const HEADER_OFFSET = 128; // px of room above the target (matches scroll-margin-top)
    const DURATION = 600;      // ms — fixed so it always feels fast
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

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    loadProjects();
    setupEmailCopy();
    setupStickyHeader();
    setupSmoothScroll();
});