const projectsGrid =
    document.getElementById('projectsGrid');

const projectCount =
    document.getElementById('projectCount');

const visibleProjectCount =
    document.getElementById('visibleProjectCount');

const projectsEmpty =
    document.getElementById('projectsEmpty');

const filterButtons =
    document.querySelectorAll('[data-filter]');

const projectsHeader =
    document.querySelector('.projects-header');

let allProjects = [];
let currentFilter = 'all';

/* =========================================================
   UTIL
========================================================= */

function escapeHtml(value) {

    return String(value || '')
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');
}

function stripHtml(value) {

    const temp = document.createElement('div');

    temp.innerHTML = value || '';

    return temp.textContent.trim();
}

function getProjectName(project) {

    if (project.projectName) {
        return project.projectName;
    }

    if (project.name) {
        return project.name;
    }

    if (project.title) {

        const titleText = stripHtml(project.title);

        if (titleText) {
            return titleText;
        }
    }

    if (project.id) {
        return String(project.id).replaceAll('-', ' ');
    }

    return 'PROJECT';
}

function getProjectCategories(project) {

    if (Array.isArray(project.category)) {

        return project.category.map(function (item) {
            return String(item).toLowerCase();
        });
    }

    const typeText =
        String(project.type || '').toLowerCase();

    const categories = [];

    if (typeText.includes('cafe24')) {
        categories.push('cafe24');
    }

    if (typeText.includes('wordpress')) {
        categories.push('wordpress');
    }

    if (typeText.includes('landing')) {
        categories.push('landing');
    }

    if (
        typeText.includes('design')
        || typeText.includes('web design')
    ) {
        categories.push('design');
    }

    if (typeText.includes('publishing')) {
        categories.push('publishing');
    }

    return categories;
}

/* =========================================================
   LOAD
========================================================= */

async function loadProjects() {

    if (!projectsGrid) return;

    try {

        const listResponse = await fetch(
            './projects/projects.json',
            {
                cache: 'no-store'
            }
        );

        if (!listResponse.ok) {
            throw new Error(
                '프로젝트 목록을 불러오지 못했습니다.'
            );
        }

        const folders = await listResponse.json();

        if (!Array.isArray(folders)) {
            throw new Error(
                'projects.json 형식이 올바르지 않습니다.'
            );
        }

        const projectResults = await Promise.allSettled(

            folders.map(async function (folder) {

                const response = await fetch(
                    './projects/'
                    + folder
                    + '/project.json',
                    {
                        cache: 'no-store'
                    }
                );

                if (!response.ok) {
                    throw new Error(
                        folder
                        + ' 프로젝트 정보를 불러오지 못했습니다.'
                    );
                }

                const project = await response.json();

                project.folderName = folder;

                return project;
            })
        );

        allProjects = projectResults
            .filter(function (result) {
                return result.status === 'fulfilled';
            })
            .map(function (result) {
                return result.value;
            });

        projectResults
            .filter(function (result) {
                return result.status === 'rejected';
            })
            .forEach(function (result) {
                console.error(result.reason);
            });

        projectCount.textContent =
            String(allProjects.length).padStart(2, '0');

        renderProjects(allProjects);

    } catch (error) {

        console.error(error);

        projectsGrid.innerHTML = `
            <p class="projects-load-error">
                프로젝트를 불러오지 못했습니다.
            </p>
        `;

        projectCount.textContent = '00';
        visibleProjectCount.textContent = '00';
    }
}

/* =========================================================
   RENDER
========================================================= */

function renderProjects(projects) {

    projectsGrid.innerHTML = '';

    projectsEmpty.hidden = projects.length !== 0;

    visibleProjectCount.textContent =
        String(projects.length).padStart(2, '0');

    projects.forEach(function (project, index) {

        const card = document.createElement('a');

        card.className = 'project-card';

        card.href =
            './work/project.html?id='
            + encodeURIComponent(project.folderName);

        card.dataset.category =
            getProjectCategories(project).join(' ');

        const imagePath =
            './projects/'
            + project.folderName
            + '/'
            + project.thumbnail;

        const imageAlt =
            project.imageAlt
            || getProjectName(project)
            || project.number
            || '프로젝트 썸네일';

        card.innerHTML = `
            <div class="project-card-image">

                <img
                    src="${escapeHtml(imagePath)}"
                    alt="${escapeHtml(imageAlt)}"
                    loading="lazy"
                >

                <span class="project-view">
                    VIEW PROJECT
                    <i aria-hidden="true">↗</i>
                </span>

            </div>

            <div class="project-card-info">

                <div>
                    <span class="project-number">
                        ${escapeHtml(project.number || 'PROJECT')}
                    </span>

                    <h2>
                        ${escapeHtml(getProjectName(project))}
                    </h2>
                </div>

                <p>
                    ${escapeHtml(project.type || '')}
                </p>

            </div>
        `;

        projectsGrid.appendChild(card);

        requestAnimationFrame(function () {

            setTimeout(function () {
                card.classList.add('is-visible');
            }, index * 80);
        });
    });
}

/* =========================================================
   FILTER
========================================================= */

filterButtons.forEach(function (button) {

    button.addEventListener('click', function () {

        currentFilter =
            button.dataset.filter || 'all';

        filterButtons.forEach(function (item) {
            item.classList.remove('active');
        });

        button.classList.add('active');

        if (currentFilter === 'all') {
            renderProjects(allProjects);
            return;
        }

        const filteredProjects =
            allProjects.filter(function (project) {

                return getProjectCategories(project)
                    .includes(currentFilter);
            });

        renderProjects(filteredProjects);
    });
});

/* =========================================================
   HEADER
========================================================= */

function updateHeader() {

    if (!projectsHeader) return;

    projectsHeader.classList.toggle(
        'is-scrolled',
        window.scrollY > 30
    );
}

window.addEventListener(
    'scroll',
    updateHeader,
    {
        passive: true
    }
);

updateHeader();

/* =========================================================
   INIT
========================================================= */

loadProjects();