// Get project ID from URL
function getProjectId() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id');
}

// Load project data
async function loadProject() {
    try {
        const response = await fetch('projects.json');
        const data = await response.json();
        const projectId = getProjectId();
        
        const project = data.projects.find(p => p.id === projectId);
        
        if (!project) {
            document.getElementById('project-content').innerHTML = '<p>Project not found.</p>';
            return;
        }
        
        // Update page title
        document.title = `${project.title} - Kevin Yuan`;
        
        // Generate project content
        const content = generateProjectContent(project, data.projects);
        document.getElementById('project-content').innerHTML = content;
        
    } catch (error) {
        console.error('Error loading project:', error);
        document.getElementById('project-content').innerHTML = '<p>Error loading project.</p>';
    }
}

// Generate project HTML content
function generateProjectContent(project, allProjects) {
    let html = '';
    
    // Project Hero with background image
    const backgroundImage = project.thumbnail ? `style="background-image: url('${project.thumbnail}');"` : '';
    html += `
        <section class="project-hero" ${backgroundImage}>
            <div class="project-hero-content">
                <div class="project-meta">
                    <span class="meta-item">${project.meta.role}</span>
                    <span class="meta-item">${project.meta.timeline}</span>
                    <span class="meta-item">${project.meta.teamSize}</span>
                </div>
                <h2>${project.title}</h2>
                <p class="project-subtitle">${project.subtitle}</p>
                <div class="project-tech-tags">
                    ${project.techTags.map(tag => `<span class="tech-tag">${tag}</span>`).join('')}
                </div>
            </div>
        </section>
    `;
    
    // Render sections
    if (project.sections && project.sections.length > 0) {
        project.sections.forEach(section => {
            html += renderSection(section);
        });
    } else {
        // Default content if no sections defined
        html += `
            <section class="project-content">
                <h3 class="content-heading">Overview</h3>
                <p>${project.description}</p>
            </section>
        `;
    }
    
    // Navigation
    html += generateNavigation(project, allProjects);
    
    return html;
}

// Render individual section based on type
function renderSection(section) {
    let html = '';
    
    switch(section.type) {
        case 'overview':
        case 'problem':
        case 'learnings':
            html += `
                <section class="project-content">
                    <h3 class="content-heading">${section.heading}</h3>
                    <p>${section.content}</p>
                </section>
            `;
            break;
            
        case 'technical':
            html += `
                <section class="project-content">
                    <h3 class="content-heading">${section.heading}</h3>
                    <p>${section.content}</p>
            `;
            if (section.subsections) {
                section.subsections.forEach(sub => {
                    html += `
                        <h4 class="subsection-heading">${sub.heading}</h4>
                        <p>${sub.content}</p>
                    `;
                });
            }
            html += `</section>`;
            break;
            
        case 'gallery':
            html += `<section class="image-gallery">`;
            
            html += `<div class="gallery-${section.layout}">`;
            section.images.forEach(img => {
                html += `
                    <figure class="gallery-image">
                        <img src="${img.src}" alt="${img.alt}">
                        <figcaption>${img.caption}</figcaption>
                    </figure>
                `;
            });
            html += `</div>`;
            
            html += `</section>`;
            break;
            
        case 'results':
            html += `
                <section class="project-content">
                    <h3 class="content-heading">${section.heading}</h3>
                    <p>${section.content}</p>
            `;
            if (section.metrics) {
                html += `<div class="results-grid">`;
                section.metrics.forEach(metric => {
                    html += `
                        <div class="result-item">
                            <div class="result-number">${metric.value}</div>
                            <div class="result-label">${metric.label}</div>
                        </div>
                    `;
                });
                html += `</div>`;
            }
            html += `</section>`;
            break;
            
        case 'full-width-image':
            html += `
                <section class="full-width-image">
                    <figure>
                        <img src="${section.src}" alt="${section.alt}">
                        <figcaption>${section.caption}</figcaption>
                    </figure>
                </section>
            `;
            break;

        case 'video':
            html += `
                <section class="project-content">
                    <div class="video-container">
                        <video controls playsinline muted loop>
                            <source src="${section.src}" type="video/${section.format || 'mp4'}">
                        </video>
                    </div>
                    ${section.caption ? `<figcaption class="video-caption">${section.caption}</figcaption>` : ''}
                </section>
            `;
            break;
    }
    
    return html;
}

// Generate project navigation
function generateNavigation(currentProject, allProjects) {
    const currentIndex = allProjects.findIndex(p => p.id === currentProject.id);
    const prevProject = currentIndex > 0 ? allProjects[currentIndex - 1] : null;
    const nextProject = currentIndex < allProjects.length - 1 ? allProjects[currentIndex + 1] : null;
    
    let html = `<section class="project-navigation">`;
    
    if (prevProject) {
        html += `
            <a href="project.html?id=${prevProject.id}" class="nav-project prev-project">
                <span class="nav-label">Previous Project</span>
                <span class="nav-title">${prevProject.title}</span>
            </a>
        `;
    } else {
        html += `<div></div>`;
    }
    
    html += `
        <a href="index.html#work" class="nav-project back-home">
            <span class="nav-label">Back to</span>
            <span class="nav-title">All Projects</span>
        </a>
    `;
    
    if (nextProject) {
        html += `
            <a href="project.html?id=${nextProject.id}" class="nav-project next-project">
                <span class="nav-label">Next Project</span>
                <span class="nav-title">${nextProject.title}</span>
            </a>
        `;
    } else {
        html += `<div></div>`;
    }
    
    html += `</section>`;
    
    return html;
}

// Lightbox functionality for gallery images
function initLightbox() {
    // Create lightbox element
    const lightbox = document.createElement('div');
    lightbox.className = 'lightbox';
    lightbox.innerHTML = `
        <span class="lightbox-close">&times;</span>
        <div class="lightbox-image-container">
            <div class="lightbox-image-inner">
                <img src="" alt="Expanded view">
            </div>
        </div>
        <div class="lightbox-controls">
            <button class="lightbox-btn zoom-out">Zoom Out (−)</button>
            <span class="lightbox-zoom-level">100%</span>
            <button class="lightbox-btn zoom-in">Zoom In (+)</button>
            <button class="lightbox-btn zoom-reset">Reset</button>
        </div>
    `;
    document.body.appendChild(lightbox);
    
    const lightboxImg = lightbox.querySelector('img');
    const imageInner = lightbox.querySelector('.lightbox-image-inner');
    const imageContainer = lightbox.querySelector('.lightbox-image-container');
    const closeBtn = lightbox.querySelector('.lightbox-close');
    const zoomInBtn = lightbox.querySelector('.zoom-in');
    const zoomOutBtn = lightbox.querySelector('.zoom-out');
    const zoomResetBtn = lightbox.querySelector('.zoom-reset');
    const zoomLevelDisplay = lightbox.querySelector('.lightbox-zoom-level');
    
    let zoomLevel = 1;
    let isPanning = false;
    let startX, startY, scrollLeft, scrollTop;
    let baseWidth = 0;
    let baseHeight = 0;
    
    function updateZoom() {
        zoomLevelDisplay.textContent = `${Math.round(zoomLevel * 100)}%`;
        
        if (zoomLevel === 1) {
            // At 100%, fit to viewport and center
            lightboxImg.style.width = '';
            lightboxImg.style.height = '';
            lightboxImg.style.maxWidth = '90vw';
            lightboxImg.style.maxHeight = '90vh';
            imageInner.style.width = '';
            imageInner.style.height = '';
            imageContainer.style.justifyContent = 'center';
            imageContainer.style.alignItems = 'center';
            imageContainer.style.cursor = 'default';
            imageContainer.scrollLeft = 0;
            imageContainer.scrollTop = 0;
            
            // Capture the rendered size at 100% for zoom calculations
            requestAnimationFrame(() => {
                baseWidth = lightboxImg.offsetWidth;
                baseHeight = lightboxImg.offsetHeight;
            });
        } else {
            // When zoomed, set explicit dimensions on both wrapper and image
            if (baseWidth && baseHeight) {
                const zoomedWidth = baseWidth * zoomLevel;
                const zoomedHeight = baseHeight * zoomLevel;
                
                // Set dimensions on inner wrapper so container knows the content size
                imageInner.style.width = `${zoomedWidth}px`;
                imageInner.style.height = `${zoomedHeight}px`;
                
                // Set dimensions on image
                lightboxImg.style.width = `${zoomedWidth}px`;
                lightboxImg.style.height = `${zoomedHeight}px`;
                lightboxImg.style.maxWidth = 'none';
                lightboxImg.style.maxHeight = 'none';
                
                imageContainer.style.justifyContent = 'flex-start';
                imageContainer.style.alignItems = 'flex-start';
                imageContainer.style.cursor = 'grab';
            }
        }
    }
    
    // Add click handlers to all gallery images
    document.addEventListener('click', (e) => {
        // Check if clicked element is a gallery image
        if (e.target.matches('.gallery-image img')) {
            lightboxImg.src = e.target.src;
            lightboxImg.alt = e.target.alt;
            zoomLevel = 1;
            
            // Wait for image to load before updating zoom
            lightboxImg.onload = () => {
                updateZoom();
            };
            
            lightbox.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    });
    
    // Zoom in
    zoomInBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        zoomLevel = Math.min(zoomLevel + 0.25, 2); // Max 200%
        updateZoom();
    });
    
    // Zoom out
    zoomOutBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        zoomLevel = Math.max(zoomLevel - 0.25, 1); // Min 100%
        updateZoom();
    });
    
    // Reset zoom
    zoomResetBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        zoomLevel = 1;
        updateZoom();
        imageContainer.scrollLeft = 0;
        imageContainer.scrollTop = 0;
    });
    
    // Panning functionality
    imageContainer.addEventListener('mousedown', (e) => {
        if (zoomLevel > 1) {
            isPanning = true;
            imageContainer.style.cursor = 'grabbing';
            startX = e.pageX - imageContainer.offsetLeft;
            startY = e.pageY - imageContainer.offsetTop;
            scrollLeft = imageContainer.scrollLeft;
            scrollTop = imageContainer.scrollTop;
        }
    });
    
    imageContainer.addEventListener('mouseleave', () => {
        isPanning = false;
        if (zoomLevel > 1) {
            imageContainer.style.cursor = 'grab';
        }
    });
    
    imageContainer.addEventListener('mouseup', () => {
        isPanning = false;
        if (zoomLevel > 1) {
            imageContainer.style.cursor = 'grab';
        }
    });
    
    imageContainer.addEventListener('mousemove', (e) => {
        if (!isPanning) return;
        e.preventDefault();
        const x = e.pageX - imageContainer.offsetLeft;
        const y = e.pageY - imageContainer.offsetTop;
        const walkX = (x - startX) * 2;
        const walkY = (y - startY) * 2;
        imageContainer.scrollLeft = scrollLeft - walkX;
        imageContainer.scrollTop = scrollTop - walkY;
    });
    
    // Close lightbox when clicking on background (not controls or image)
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox || e.target === closeBtn) {
            lightbox.classList.remove('active');
            document.body.style.overflow = '';
            zoomLevel = 1;
            updateZoom();
        }
    });
    
    // Close on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && lightbox.classList.contains('active')) {
            lightbox.classList.remove('active');
            document.body.style.overflow = '';
            zoomLevel = 1;
            updateZoom();
        }
        // Keyboard shortcuts for zoom
        if (lightbox.classList.contains('active')) {
            if (e.key === '+' || e.key === '=') {
                e.preventDefault();
                zoomLevel = Math.min(zoomLevel + 0.25, 2); // Max 200%
                updateZoom();
            } else if (e.key === '-') {
                e.preventDefault();
                zoomLevel = Math.max(zoomLevel - 0.25, 1); // Min 100%
                updateZoom();
            } else if (e.key === '0') {
                e.preventDefault();
                zoomLevel = 1;
                updateZoom();
                imageContainer.scrollLeft = 0;
                imageContainer.scrollTop = 0;
            }
        }
    });
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    loadProject().then(() => {
        initLightbox();
    });
});