const sections = document.querySelectorAll('.visual, .section');
const navLinks = document.querySelectorAll('.side-nav a');

let current = 0;
let isMoving = false;

/* =========================================================
   NAV
========================================================= */

function updateNav(index) {

    navLinks.forEach(function (link) {
        link.classList.remove('active');
    });

    if (navLinks[index]) {
        navLinks[index].classList.add('active');
    }

    if (index === 0) {
        document.body.classList.add('is-main');
    } else {
        document.body.classList.remove('is-main');
    }
}

/* =========================================================
   MOBILE CHECK
========================================================= */

function isMobile() {
    return window.innerWidth <= 1024;
}

/* =========================================================
   SECTION MOVE
========================================================= */

function moveSection(index) {

    if (index < 0 || index >= sections.length) return;
    if (isMoving) return;

    isMoving = true;

    if (current === 0 && index !== 0) {

        const visual = document.querySelector('.visual');

        if (visual) {
            visual.classList.add('motion-out');
        }

        setTimeout(function () {

            current = index;

            sections[current].scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });

            updateNav(current);

            setTimeout(function () {
                isMoving = false;
            }, 850);

        }, 420);

        return;
    }

    current = index;

    sections[current].scrollIntoView({
        behavior: 'smooth',
        block: 'start'
    });

    updateNav(current);
    restartVisualMotion();

    setTimeout(function () {
        isMoving = false;
    }, 850);
}

/* =========================================================
   WHEEL
========================================================= */

window.addEventListener('wheel', function (e) {

    if (isMobile()) return;

    if (e.target.closest('.work-list')) {

        e.preventDefault();

        if (
            !workIsChanging
            && Math.abs(e.deltaY) > 20
        ) {
            if (e.deltaY > 0) {
                moveWork(1);
            } else {
                moveWork(-1);
            }
        }

        return;
    }

    e.preventDefault();

    if (isMoving) return;

    if (e.deltaY > 0) {
        moveSection(current + 1);
    } else {
        moveSection(current - 1);
    }

}, {
    passive: false
});

/* =========================================================
   NAV CLICK
========================================================= */

document.querySelectorAll('.side-nav a, .gnb a, .logo a').forEach(function (link) {

    link.addEventListener('click', function (e) {

        const href = this.getAttribute('href');

        if (!href || href.charAt(0) !== '#') return;

        const target = document.querySelector(href);

        if (!target) return;

        e.preventDefault();

        const index = Array.from(sections).indexOf(target);

        if (index !== -1) {
            moveSection(index);
        }
    });
});

/* =========================================================
   FIRST LOAD
========================================================= */

function initSectionByHash() {

    const hash = window.location.hash;
    const target = hash ? document.querySelector(hash) : sections[0];

    if (!target) {
        current = 0;
        updateNav(0);
        return;
    }

    const index = Array.from(sections).indexOf(target);

    if (index !== -1) {

        current = index;

        sections[current].scrollIntoView({
            behavior: 'auto',
            block: 'start'
        });

        updateNav(current);
        restartVisualMotion();
    }
}

window.addEventListener('load', initSectionByHash);
window.addEventListener('pageshow', initSectionByHash);

/* =========================================================
   RESIZE
========================================================= */

let resizeTimer = null;

window.addEventListener('resize', function () {

    clearTimeout(resizeTimer);

    resizeTimer = setTimeout(function () {

        if (!isMobile() && sections[current]) {

            sections[current].scrollIntoView({
                behavior: 'auto',
                block: 'start'
            });
        }

    }, 150);
});

/* =========================================================
   ABOUT SLIDER
========================================================= */

const aboutPages = document.querySelectorAll('.about-page');
const aboutPrev = document.querySelector('.about-prev');
const aboutNext = document.querySelector('.about-next');
const aboutCount = document.querySelector('.about-count');

let aboutIndex = 0;

function updateAbout() {

    if (!aboutPages.length) return;

    aboutPages.forEach(function (page) {
        page.classList.remove('active');
    });

    aboutPages[aboutIndex].classList.add('active');

    if (aboutCount) {

        aboutCount.textContent =
            String(aboutIndex + 1).padStart(2, '0')
            + ' / '
            + String(aboutPages.length).padStart(2, '0');
    }
}

if (aboutPrev) {

    aboutPrev.addEventListener('click', function () {

        aboutIndex--;

        if (aboutIndex < 0) {
            aboutIndex = aboutPages.length - 1;
        }

        updateAbout();
    });
}

if (aboutNext) {

    aboutNext.addEventListener('click', function () {

        aboutIndex++;

        if (aboutIndex >= aboutPages.length) {
            aboutIndex = 0;
        }

        updateAbout();
    });
}

updateAbout();

/* =========================================================
   WORK DATA
========================================================= */

const workList = document.querySelector('#workList');
const workPrev = document.querySelector('.work-prev');
const workNext = document.querySelector('.work-next');
const workPagination = document.querySelector('.work-pagination');

let workProjects = [];
let workIndex = 0;
let workIsChanging = false;
let workChangeTimer = null;

/* =========================================================
   WORK LOAD
========================================================= */

async function loadWorkProjects() {

    if (!workList) return;

    try {

        const listResponse = await fetch('./projects/projects.json', {
            cache: 'no-store'
        });

        if (!listResponse.ok) {
            throw new Error('프로젝트 목록을 불러오지 못했습니다.');
        }

        const projectFolders = await listResponse.json();

        if (!Array.isArray(projectFolders)) {
            throw new Error('projects.json 형식이 올바르지 않습니다.');
        }

        const projects = await Promise.all(

            projectFolders.map(async function (folderName) {

                const response = await fetch(
                    './projects/' + folderName + '/project.json',
                    {
                        cache: 'no-store'
                    }
                );

                if (!response.ok) {
                    throw new Error(
                        folderName
                        + ' 프로젝트 정보를 불러오지 못했습니다.'
                    );
                }

                const project = await response.json();

                project.folderName = folderName;

                return project;
            })
        );

        /*
         * featured: true가 설정된 프로젝트가 있으면
         * 해당 프로젝트를 우선 사용합니다.
         *
         * featured가 하나도 없으면 projects.json 순서대로
         * 앞의 4개를 메인 대표 프로젝트로 사용합니다.
         */
        const featuredProjects = projects.filter(function (project) {
            return project.featured === true;
        });

        const sourceProjects =
            featuredProjects.length
                ? featuredProjects
                : projects;

        workProjects = sourceProjects
            .slice()
            .sort(function (a, b) {

                const orderA =
                    Number.isFinite(Number(a.featuredOrder))
                        ? Number(a.featuredOrder)
                        : 9999;

                const orderB =
                    Number.isFinite(Number(b.featuredOrder))
                        ? Number(b.featuredOrder)
                        : 9999;

                return orderA - orderB;
            })
            .slice(0, 4);

        if (!workProjects.length) {
            throw new Error('노출할 프로젝트가 없습니다.');
        }

        renderWorkProjects();

    } catch (error) {

        console.error(error);

        workList.innerHTML = `
            <div class="work-load-error">
                프로젝트를 불러오지 못했습니다.
            </div>
        `;
    }
}

/* =========================================================
   WORK RENDER
========================================================= */

function renderWorkProjects() {

    if (!workList || !workProjects.length) return;

    workList.innerHTML = '';

    const projectCount = workProjects.length;

    for (let position = 0; position < projectCount; position++) {

        const projectIndex =
            (workIndex + position) % projectCount;

        const project = workProjects[projectIndex];

        const item = document.createElement('a');

        item.className =
            'work-item work-position-' + (position + 1);

        item.href =
            './work/project.html?id='
            + encodeURIComponent(project.folderName);

        const thumb = document.createElement('div');
        thumb.className = 'thumb';

        const image = document.createElement('img');

        image.src =
            './projects/'
            + project.folderName
            + '/'
            + project.thumbnail;

        image.alt =
            project.imageAlt
            || project.number
            || '프로젝트 썸네일';

        thumb.appendChild(image);

        const info = document.createElement('div');
        info.className = 'work-info';

        const title = document.createElement('h3');
        title.textContent =
            project.number || 'PROJECT';

        const type = document.createElement('p');
        type.textContent =
            project.type || '';

        info.appendChild(title);
        info.appendChild(type);

        item.appendChild(thumb);
        item.appendChild(info);

        workList.appendChild(item);
    }

    renderWorkPagination();
}

function renderWorkPagination() {

    if (!workPagination || !workProjects.length) return;

    workPagination.innerHTML = '';

    workProjects.forEach(function (_, index) {

        const dot = document.createElement('button');

        dot.type = 'button';
        dot.classList.toggle('active', index === workIndex);
        dot.setAttribute(
            'aria-label',
            '대표 프로젝트 ' + (index + 1) + ' 보기'
        );

        dot.addEventListener('click', function () {

            if (index === workIndex || workIsChanging) return;

            workIsChanging = true;
            workList.classList.add('is-changing');

            setTimeout(function () {

                workIndex = index;
                renderWorkProjects();

                requestAnimationFrame(function () {
                    workList.classList.remove('is-changing');

                    setTimeout(function () {
                        workIsChanging = false;
                    }, 260);
                });

            }, 220);
        });

        workPagination.appendChild(dot);
    });
}

/* =========================================================
   WORK MOVE
========================================================= */

function moveWork(direction) {

    if (
        !workProjects.length
        || workProjects.length < 2
        || workIsChanging
    ) {
        return;
    }

    workIsChanging = true;

    clearTimeout(workChangeTimer);

    workList.classList.add('is-changing');

    workChangeTimer = setTimeout(function () {

        workIndex += direction;

        if (workIndex < 0) {
            workIndex = workProjects.length - 1;
        }

        if (workIndex >= workProjects.length) {
            workIndex = 0;
        }

        renderWorkProjects();

        requestAnimationFrame(function () {

            requestAnimationFrame(function () {

                workList.classList.remove('is-changing');

                setTimeout(function () {
                    workIsChanging = false;
                }, 260);
            });
        });

    }, 220);
}

if (workPrev) {

    workPrev.addEventListener('click', function () {
        moveWork(-1);
    });
}

if (workNext) {

    workNext.addEventListener('click', function () {
        moveWork(1);
    });
}

/* =========================================================
   WORK CARD CLICK
========================================================= */

if (workList) {

    workList.addEventListener('click', function (event) {

        const item = event.target.closest('.work-item');

        if (!item) return;

        /*
         * 모바일에서는 모든 프로젝트 카드를
         * 정상적인 링크로 작동시킨다.
         */
        if (isMobile()) {
            return;
        }

        /*
         * PC에서만 양 끝의 작은 카드를 클릭하면
         * 상세페이지로 이동하지 않고 한 칸 넘긴다.
         */
        if (item.classList.contains('work-position-1')) {

            event.preventDefault();
            moveWork(-1);

            return;
        }

        if (item.classList.contains('work-position-4')) {

            event.preventDefault();
            moveWork(1);
        }
    });
}

/* =========================================================
   WORK TOUCH SWIPE
========================================================= */

let workTouchStartX = 0;
let workTouchEndX = 0;

if (workList) {

    workList.addEventListener(
        'touchstart',
        function (event) {

            workTouchStartX =
                event.changedTouches[0].clientX;

        },
        {
            passive: true
        }
    );

    workList.addEventListener(
        'touchend',
        function (event) {

            workTouchEndX =
                event.changedTouches[0].clientX;

            const distance =
                workTouchEndX - workTouchStartX;

            if (Math.abs(distance) < 45) return;

            if (distance < 0) {
                moveWork(1);
            } else {
                moveWork(-1);
            }

        },
        {
            passive: true
        }
    );
}

/* =========================================================
   WORK KEYBOARD
========================================================= */

if (workList) {

    workList.setAttribute('tabindex', '0');

    workList.addEventListener('keydown', function (event) {

        if (event.key === 'ArrowLeft') {

            event.preventDefault();
            moveWork(-1);
        }

        if (event.key === 'ArrowRight') {

            event.preventDefault();
            moveWork(1);
        }
    });
}

/* =========================================================
   MOBILE MAIN HEADER
========================================================= */

function checkMainSection() {

    const visual = document.querySelector('#visual');

    if (!visual) return;

    const rect = visual.getBoundingClientRect();

    if (
        rect.top <= 10
        && rect.bottom > window.innerHeight * 0.5
    ) {
        document.body.classList.add('is-main');
    } else {
        document.body.classList.remove('is-main');
    }
}

/* =========================================================
   VISUAL MOTION
========================================================= */

function restartVisualMotion() {

    const visual = document.querySelector('.visual');

    if (!visual) return;

    visual.classList.remove('motion-active');
    visual.classList.remove('motion-out');

    if (current === 0) {

        void visual.offsetWidth;

        visual.classList.add('motion-active');
    }
}

/* =========================================================
   INIT
========================================================= */

restartVisualMotion();
loadWorkProjects();