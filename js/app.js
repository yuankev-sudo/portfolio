// Load projects from JSON
async function loadProjects() {
    try {
        const response = await fetch('projects.json');
        const data = await response.json();
        const projectsGrid = document.getElementById('projects-grid');
        
        data.projects.forEach(project => {
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
            
            projectDiv.innerHTML = `
                <div class="project-image">
                    ${imageHTML}
                </div>
                <div class="project-number">${project.number}</div>
                <h4 class="project-title">${project.title}</h4>
                <p class="project-description">${project.description}</p>
                <div class="project-tags">
                    ${project.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                </div>
            `;
            
            projectLink.appendChild(projectDiv);
            projectsGrid.appendChild(projectLink);
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

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    loadProjects();
    setupEmailCopy();
});