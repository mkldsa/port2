document.addEventListener('DOMContentLoaded', function () {

    const projectMain = document.querySelector('#project');

    const projectNumber = document.querySelector('#projectNumber');
    const projectTitle = document.querySelector('#projectTitle');
    const projectType = document.querySelector('#projectType');
    const projectTools = document.querySelector('#projectTools');

    const projectInfo = document.querySelector('#projectInfo');
    const projectLinkBox = document.querySelector('#projectLinkBox');
    const projectLink = document.querySelector('#projectLink');

    const projectImage = document.querySelector('#projectImage');

    const overviewTitle = document.querySelector('#overviewTitle');
    const overviewText = document.querySelector('#overviewText');

    const workPointTitle = document.querySelector('#workPointTitle');
    const workPointText = document.querySelector('#workPointText');

    const projectError = document.querySelector('#projectError');

    function getProjectId() {

        const params = new URLSearchParams(window.location.search);

        return params.get('id');
    }

    async function loadProject(projectId) {

        const projectPath =
            '../projects/'
            + encodeURIComponent(projectId)
            + '/project.json';

        const response = await fetch(projectPath, {
            cache: 'no-store'
        });

        if (!response.ok) {
            throw new Error('프로젝트 정보를 불러오지 못했습니다.');
        }

        return response.json();
    }

    function renderProject(project, projectId) {

        document.title =
            project.browserTitle
            || project.number
            || 'PORTFOLIO PROJECT';

        projectNumber.textContent =
            project.number || 'PROJECT';

        projectTitle.innerHTML =
            project.title || 'WEB DESIGN<br>PROJECT';

        projectType.textContent =
            project.type || '-';

        projectTools.textContent =
            project.tools || '-';

        /* ===============================
           프로모션 프로젝트 클래스 추가
        =============================== */

        document.body.classList.remove('promotion-project');

        if (
            Array.isArray(project.category) &&
            project.category.includes('promotion')
        ) {
            document.body.classList.add('promotion-project');
        }

        /* =============================== */

        renderProjectLink(project.link);
        renderProjectImage(project, projectId);

        overviewTitle.textContent =
            project.overviewTitle || 'OVERVIEW';

        overviewText.textContent =
            project.overviewText || '';

        workPointTitle.textContent =
            project.workPointTitle || 'WORK POINT';

        workPointText.textContent =
            project.workPointText || '';
    }

    function renderProjectLink(link) {

        if (!link) {

            projectLinkBox.hidden = true;
            projectInfo.classList.add('has-no-link');

            return;
        }

        projectLinkBox.hidden = false;
        projectInfo.classList.remove('has-no-link');

        projectLink.href = link;
        projectLink.textContent = link;
    }

    function renderProjectImage(project, projectId) {

        if (!project.mainImage) {

            projectImage.style.display = 'none';

            return;
        }

        projectImage.src =
            '../projects/'
            + encodeURIComponent(projectId)
            + '/'
            + project.mainImage;

        projectImage.alt =
            project.imageAlt
            || project.number
            || '프로젝트 대표 이미지';

        projectImage.addEventListener(
            'error',
            function () {

                console.error(
                    '이미지를 불러오지 못했습니다:',
                    this.src
                );

                this.style.display = 'none';
            },
            {
                once: true
            }
        );
    }

    function showProjectError() {

        const sections = projectMain.querySelectorAll(
            '.project-visual, .project-section'
        );

        sections.forEach(function (section) {

            if (section !== projectError) {
                section.hidden = true;
            }
        });

        projectError.hidden = false;

        document.title = 'PROJECT NOT FOUND';
    }

    async function initProject() {

        const projectId = getProjectId();

        if (!projectId) {

            showProjectError();

            return;
        }

        try {

            const project = await loadProject(projectId);

            renderProject(project, projectId);

        } catch (error) {

            console.error(error);

            showProjectError();
        }
    }

    initProject();

});