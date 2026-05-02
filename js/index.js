// 페이지 로드 시 실행
// 이미지 먼저 로드
window.addEventListener('DOMContentLoaded', function () { // 'load' 대신 'DOMContentLoaded'로 앞당김
    const imagesToPreload = [
        "files/images/pictures/gallery01.webp",
        "files/images/pictures/gallery02.webp",
        "files/images/pictures/gallery03.webp",
        "files/images/pictures/gallery04.webp",
        "files/images/pictures/gallery05.webp",
        "files/images/pictures/gallery06.webp",
        "files/images/pictures/gallery07.webp",
        "files/images/pictures/gallery08.webp"
        // 16개 전체 이미지 경로 작성
    ];

    imagesToPreload.forEach(function (src) {
        // 백그라운드에서 이미지 객체 생성 및 로드
        var img = new Image();
        img.src = src;
    });
});

window.onload = async function () {
    // 1. 플로팅 BGM 초기화
    initFloatingPlayer();

    set_guestbook();
    await loadAndAnimateSVG();
    set_section_scroll();
    update_DDay();
    document.getElementById("bgm").play();
};

// 섹션 등장
function set_section_scroll() {
    const sections = document.querySelectorAll("section");
    const audio = document.getElementById("bgm"); // 오디오 태그 가져오기
    let isAudioPlayed = false; // 오디오가 재생되었는지 확인하는 변수

    // 1. 일반 섹션용 옵션 (10% 보일 때)
    const defaultOptions = { root: null, threshold: 0.1 };

    // 2. 비디오 섹션 전용 옵션 (30% 보일 때)
    const videoOptions = { root: null, threshold: 0.4 };
    // --- 일반 섹션 옵저버 ---
    const defaultObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add("is-visible");
                observer.unobserve(entry.target);
            }
        });
    }, defaultOptions);

    // --- 비디오 섹션 전용 옵저버 ---
    const videoObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add("is-visible"); // 등장 애니메이션 실행

                const video = entry.target.querySelector("#wedding-video");
                if (video) {
                    video.playbackRate = 0.8; // 0.8 배속
                    video.play();
                }

                observer.unobserve(entry.target); // 한 번 실행 후 감시 종료
            }
        });
    }, videoOptions);

    // 섹션별로 어떤 옵저버를 붙일지 결정
    sections.forEach((section) => {
        if (section.id === "video-section") {
            videoObserver.observe(section); // 비디오는 0.3 버전 옵저버가 감시
        } else {
            defaultObserver.observe(section); // 나머지는 0.1 버전 옵저버가 감시
        }
    });
}

// ==========================================
// 🎵 자동 서랍형 뮤직 플레이어 (최종 통합본)
// ==========================================
function initFloatingPlayer() {
    const player = document.getElementById("floating-music-player");
    const albumCoverImg = player?.querySelector(".album-cover");
    const iconPlay = document.getElementById("mini-icon-play");
    const iconPause = document.getElementById("mini-icon-pause");
    const audio = document.getElementById("bgm");
    const progressBar = document.getElementById("mini-progress-bar");

    if (!player || !audio) return;

    // 1. 처음 입장 시 3초 뒤 자동으로 닫기
    let autoCloseTimer = setTimeout(() => {
        player.classList.add("collapsed");
    }, 3000);

    audio.volume = 0.25;

    // ✨ 2. [단일화된 BGM 자동재생 로직] 
    const forcePlayAudio = () => {
        audio.play().then(() => {
            iconPlay.style.display = "none";
            iconPause.style.display = "block";
            if (albumCoverImg) albumCoverImg.classList.remove("spin-paused");

            // 재생에 성공하면 모든 감시기 끄기 (중복 방지)
            document.removeEventListener('click', forcePlayAudio);
            document.removeEventListener('touchstart', forcePlayAudio);
            document.removeEventListener('touchend', forcePlayAudio); // 아이폰 필수
            document.removeEventListener('scroll', forcePlayAudio);
        }).catch(err => {
            // 에러 나면 조용히 다음 터치를 기다림
        });
    };

    // 로드되자마자 일단 한번 찔러보기
    forcePlayAudio();

    // 3. 화면의 모든 스크롤/터치에 반응하도록 감시기 달아두기
    document.addEventListener('click', forcePlayAudio, { passive: true });
    document.addEventListener('touchstart', forcePlayAudio, { passive: true });
    document.addEventListener('touchend', forcePlayAudio, { passive: true }); // 아이폰 필수
    document.addEventListener('scroll', forcePlayAudio, { passive: true });

    // 4. 플레이어 직접 클릭 시 제어 (열기/닫기/재생/정지)
    function handlePlayerInteraction(e) {
        e.stopPropagation(); // 플레이어 클릭이 배경 클릭으로 번지지 않게 막음
        
        if (autoCloseTimer) clearTimeout(autoCloseTimer);

        if (player.classList.contains("collapsed")) {
            player.classList.remove("collapsed");
            autoCloseTimer = setTimeout(() => {
                player.classList.add("collapsed");
            }, 2000);
        } else {
            if (audio.paused) {
                forcePlayAudio();
            } else {
                audio.pause();
                iconPlay.style.display = "block";
                iconPause.style.display = "none";
                if (albumCoverImg) albumCoverImg.classList.add("spin-paused");
            }
            autoCloseTimer = setTimeout(() => {
                player.classList.add("collapsed");
            }, 2000);
        }
    }

    player.addEventListener("click", handlePlayerInteraction);

    // 5. 진행 바 업데이트
    audio.addEventListener("timeupdate", () => {
        if (audio.duration) {
            const percentage = (audio.currentTime / audio.duration) * 100;
            progressBar.style.width = percentage + "%";
        }
    });
}

// 3. Save the date
// 기존 배열 (그대로 사용)
const svgFiles = [
    "S.svg",
    "a.svg",
    "v.svg",
    "e.svg",
    "space",
    "space",
    "space",
    "T.svg",
    "h.svg",
    "e-1.svg",
    "space",
    "space",
    "space",
    "D.svg",
    "a-1.svg",
    "T-1.svg",
    "e-2.svg",
];
// ✨ 2. SVG 파일 순차적으로 불러오기 (viewBox 방어 코드 추가)
async function loadAndAnimateSVG() {
    const container = document.getElementById("svg-container");
    if (!container) return;

    container.innerHTML = "";
    let currentDelay = 0.3;

    for (const fileName of svgFiles) {
        if (fileName === "space") {
            const space = document.createElement("div");
            space.style.width = "7px";
            container.appendChild(space);
            continue;
        }

        try {
            const response = await fetch(`files/images/svg2/${fileName}`);
            if (!response.ok) {
                console.warn(`파일 찾을 수 없음: ${fileName}`); // 오류 파악을 위한 로그
                continue;
            }
            const svgText = await response.text();

            const letterWrap = document.createElement("div");
            letterWrap.className = "letter-wrap";
            letterWrap.innerHTML = svgText;
            container.appendChild(letterWrap);

            const svgElement = letterWrap.querySelector("svg");
            if (svgElement) {
                // viewBox 방어 코드
                if (!svgElement.getAttribute("viewBox")) {
                    const w = svgElement.getAttribute("width") || "50";
                    const h = svgElement.getAttribute("height") || "50";
                    svgElement.setAttribute(
                        "viewBox",
                        `0 0 ${parseFloat(w)} ${parseFloat(h)}`,
                    );
                }

                // ✨ [정렬 핵심 코드] 원본 SVG의 비율을 가져와서 높이를 동적으로 설정!
                const viewBox = svgElement.getAttribute("viewBox");
                if (viewBox) {
                    // 띄어쓰기나 쉼표로 분리하여 원본 높이값을 가져옵니다
                    const vbParts = viewBox.split(/[\s,]+/);
                    const vbHeight = parseFloat(vbParts[3]);

                    // 💡 0.8 숫자를 조절해서 'Save The Date' 전체 글자 크기를 키우거나 줄이세요! (예: 1.0, 0.5)
                    svgElement.style.height = `${vbHeight * 0.8}px`;
                    svgElement.style.width = "auto";
                }

                const paths = svgElement.querySelectorAll("path, polygon, rect");
                paths.forEach((path) => {
                    path.classList.add("draw-path");

                    const length = path.getTotalLength() + 5;
                    path.style.setProperty("--path-length", length);
                    path.style.strokeDasharray = length;
                    path.style.strokeDashoffset = length;

                    path.style.animationDelay = `${currentDelay}s`;
                });

                currentDelay += 0.3;
            }
        } catch (error) {
            console.error(`${fileName} 로드 실패:`, error);
        }
    }
}

// 6. 양가부모님 성함 + 신랑 신부 이름 + 연락처 메세지 보내기
// 6. 혼주 연락처 모달 제어
function openModal() {
    const overlay = document.getElementById("modal-overlay");
    const content = overlay.querySelector(".modal-content");
    overlay.style.display = "block";
    content.style.display = "block";
    document.body.style.overflow = "hidden";
}

function closeModal() {
    document.getElementById("modal-overlay").style.display = "none";
    document.body.style.overflow = "auto";
}

// 8. 연재♥선홍 의 결혼식 OO전
function update_DDay() {
    const targetDate = new Date("2026-06-27T00:00:00"); // 결혼식 당일
    const today = new Date();

    // 시간 단위를 무시하고 날짜 차이만 계산하기 위해 정규화
    targetDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    const diffTime = targetDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    const displayElement = document.getElementById("wd_d-day");

    if (diffDays > 0) {
        displayElement.innerText = `${diffDays}일 남았습니다`;
    } else if (diffDays === 0) {
        displayElement.innerText = `오늘이 바로 그날입니다! ✨`;
    } else {
        displayElement.innerText = `결혼한 지 ${Math.abs(diffDays)}일째 되는 날입니다 🩷`;
    }
}

// 9. 이미지 갤러리
function changeMainImage(clickedThumb, imageSrc) {
    const mainView = document.querySelector(".gallery-main-view");
    
    // 1. 기존에 띄워져 있던 메인 이미지들을 모두 숨김 처리 및 투명도 0
    const currentImgs = mainView.querySelectorAll(".main-gallery-img");
    currentImgs.forEach(img => {
        img.classList.remove("active-gallery");
        img.style.opacity = 0;
    });

    // 2. 이미 존재하는 이미지인지 확인
    let targetImg = mainView.querySelector(`img[src="${imageSrc}"]`);

    if (!targetImg) {
        // 3. 없으면 새로 생성하여 추가 (필요할 때만 로드 및 렌더링)
        const newImg = document.createElement("img");
        newImg.className = "main-gallery-img active-gallery";
        newImg.src = imageSrc;
        newImg.alt = "메인 갤러리 사진";
        newImg.style.opacity = 0;
        
        mainView.appendChild(newImg);
        
        setTimeout(() => {
            newImg.style.opacity = 1;
        }, 50);
    } else {
        // 4. 이미 생성된 적이 있으면 표시
        targetImg.classList.add("active-gallery");
        setTimeout(() => {
            targetImg.style.opacity = 1;
        }, 50);
    }

    // 5. 썸네일 활성화 상태 변경
    const allThumbs = document.querySelectorAll(".thumbnail-grid .thumb");
    allThumbs.forEach((thumb) => {
        thumb.classList.remove("active-thumb");
    });
    clickedThumb.classList.add("active-thumb");
}

// 10. 결혼식장 장소(카카오맵, 내비 API 활용)
function startNavigation() {
    if (!Kakao.isInitialized()) {
        Kakao.init("669f1c6f440657e143d516895413ef21");
    }

    const xpos = document.getElementById("wd_xpos").value;
    const ypos = document.getElementById("wd_ypos").value;

    Kakao.Navi.start({
        name: "더뉴컨벤션",
        x: parseFloat(xpos),
        y: parseFloat(ypos),
        coordType: "wgs84",
    });
}
function openNaverMap() {
    const destinationName = encodeURIComponent("더뉴컨벤션웨딩"); // 한글은 인코딩 필수
    const lat = 37.5562637915563;
    const lng = 126.8368847974;
    // 네이버지도 앱 실행 주소 (모바일용)
    const appUrl = `nmap://route/car?dlat=${lat}&dlng=${lng}&dname=${destinationName}&appname=mangekyou93.github.io`;

    // 네이버지도 웹 실행 주소 (앱이 없을 때나 PC용)
    const webUrl = `https://map.naver.com/v5/directions/-/${lng},${lat},${destinationName}/-/car`;

    // 모바일인지 확인 후 처리
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    if (isMobile) {
        // 앱 실행 시도
        location.href = appUrl;

        // 잠시 후 앱 실행이 안 되었을 경우 웹으로 이동 (딜레이 활용)
        setTimeout(function () {
            if (!document.hidden) {
                window.location.href = webUrl;
            }
        }, 1500);
    } else {
        // PC일 경우 바로 웹으로 이동
        window.open(webUrl);
    }
}
function openTMap() {
    const destinationName = encodeURIComponent("더뉴컨벤션웨딩");
    const lat = 37.5562637915563; // 위도
    const lng = 126.8368847974; // 경도

    // 티맵 앱 실행 주소 (모바일용)
    const appUrl = `tmap://route?goalname=${destinationName}&goalx=${lng}&goaly=${lat}`;

    // 앱 미설치 시 이동할 웹 페이지 (티맵은 웹 길찾기보다 스토어 이동이 일반적입니다)
    const storeUrl = /iPhone|iPad|iPod/i.test(navigator.userAgent)
        ? "https://apps.apple.com/kr/app/id431589174"
        : "https://play.google.com/store/apps/details?id=com.skt.tmap.ku";

    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    if (isMobile) {
        // 앱 실행 시도
        location.href = appUrl;

        // 1.5초 후에도 반응이 없으면(앱이 없으면) 스토어로 이동
        setTimeout(function () {
            if (!document.hidden) {
                window.location.href = storeUrl;
            }
        }, 1500);
    } else {
        // PC의 경우 티맵은 웹 서비스를 제공하지 않으므로 안내 메시지나 다른 지도를 권장
        alert("티맵 길안내는 모바일 기기에서만 이용 가능합니다.");
    }
}

// 11. 계좌번호
// 아코디언
function toggleAccount(element) {
    const coverWrap = element.nextElementSibling;

    // 다른 아코디언을 닫고 싶다면 아래 주석을 해제하세요
    // document.querySelectorAll('.cover_wrap').forEach(el => { if(el !== coverWrap) el.style.display = 'none'; });
    // document.querySelectorAll('.account_tit').forEach(el => { if(el !== element) el.classList.remove('on'); });

    if (coverWrap.style.display === "none" || coverWrap.style.display === "") {
        coverWrap.style.display = "block";
        element.classList.add("on");
    } else {
        coverWrap.style.display = "none";
        element.classList.remove("on");
    }
}

// 복사 함수
function copyToClipboard(text) {
    if (navigator.clipboard && window.isSecureContext) {
        // HTTPS 환경
        navigator.clipboard.writeText(text).then(() => {
            // alert("계좌번호가 복사되었습니다.");
        });
    } else {
        // HTTP 환경 및 하위 호환
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.position = "fixed"; // 스크롤 방지
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
            document.execCommand("copy");
            // alert("계좌번호가 복사되었습니다.");
        } catch (err) {
            console.error("복사 실패", err);
        }
        document.body.removeChild(textArea);
    }
}

// 12. 방명록
const GAS_URL =
    "https://script.google.com/macros/s/AKfycbxepXniKsewiA82hNyGDSW_0Ht8Fksbk8xeUQ1S9-LEoRmz5FrWXjSYPG38go7LwnRTSQ/exec";
// 방명록 전역 변수 (캐시)
window.cachedGuestbookData = [];
// 방명록 세팅
async function set_guestbook() {
    try {
        const isGuestBookLoaded = await fetchGuestbook();

        // 1. Swiper 초기화 (전역 변수로 할당하여 어디서든 접근 가능하게)
        window.guestSwiper = new Swiper(".guest-swiper", {
            slidesPerView: 1.2,
            spaceBetween: 15,
            centeredSlides: false,
        });

        // 2. 요소 선택 및 이벤트 바인딩
        const btnOpenAll = document.querySelector(".btn-open-all");
        const btnOpenWrite = document.querySelector(".btn-open-write");
        const allListPop = document.querySelector(".all-list-pop");
        const allListOverlay = document.querySelector(".all-list-overlay");
        const writeWrap = document.querySelector(".write-wrap");
        const writeOverlay = document.querySelector(".write-overlay");

        const fadeIn = (el) => {
            if (!el) return;
            el.style.display = "block";
            setTimeout(() => {
                el.style.opacity = "1";
            }, 10);
        };

        const fadeOut = (el) => {
            if (!el) return;
            el.style.opacity = "0";
            setTimeout(() => {
                el.style.display = "none";
            }, 200);
        };

        btnOpenAll?.addEventListener("click", () => {
            fadeIn(allListOverlay);
            fadeIn(allListPop);
        });

        btnOpenWrite?.addEventListener("click", () => {
            fadeIn(writeOverlay);
            fadeIn(writeWrap);
        });

        document.querySelectorAll(".close-modal, .modal-overlay").forEach((btn) => {
            btn.addEventListener("click", () => {
                fadeOut(allListOverlay);
                fadeOut(allListPop);
                fadeOut(writeOverlay);
                fadeOut(writeWrap);
            });
        });
    } catch (error) {
        console.error("방명록 로드 실패:", error);
    }
}

// 방명록 조회
async function fetchGuestbook() {
    let result = true;
    showLoading(true);

    try {
        // GAS 호출 시 redirect 처리를 위해 follow 설정 (fetch 기본값이긴 합니다)
        const response = await fetch(GAS_URL);
        const data = await response.json();

        const listWrapper = document.getElementById("guestbook-list");
        if (!listWrapper) return false;

        listWrapper.innerHTML = "";

        // 데이터가 배열인지 확인 후 렌더링
        if (Array.isArray(data)) {
            // [핵심] 전역 변수에 데이터 저장 (나중에 전체보기에서 사용)
            window.cachedGuestbookData = data;

            data.reverse().forEach((item) => {
                // GAS 시트 첫 줄(Header) 이름과 정확히 일치해야 합니다.
                // 만약 에러가 난다면 console.log(item)으로 Key값을 확인해보세요.
                const slide = `
                    <div class="swiper-slide book-slide-box">
                        <div class="book-article">
                            <p class="book-who"><span class="from-em">FROM.</span> ${item.name || "익명"}</p>
                            <p class="book-slide-txt">${item.message || "내용 없음"}</p>
                            <p class="book-date"><span>${item.date ? new Date(item.date).toLocaleDateString() : ""}</span></p>
                        </div>
                    </div>`;
                listWrapper.insertAdjacentHTML("beforeend", slide);
            });
        }

        // 4. Swiper 업데이트 (데이터가 비동기로 로드된 후 슬라이드 크기 재계산)
        if (window.guestSwiper) {
            window.guestSwiper.update();
        }
    } catch (error) {
        console.error("방명록 로드 실패:", error);
        result = false;
    } finally {
        showLoading(false);
    }

    return result;
}

// 방명록 전체보기
function showAllGuestbook() {
    const bodyContainer = document.getElementById("all-guestbook-body");
    const overlay = document.querySelector(".all-list-overlay");
    const modal = document.querySelector(".all-list-pop");

    if (!window.cachedGuestbookData || window.cachedGuestbookData.length === 0) {
        bodyContainer.innerHTML =
            '<p class="all-gb-empty">등록된 메시지가 없습니다.</p>';
    } else {
        const html = window.cachedGuestbookData
            .map(
                (item) => `
            <div class="all-gb-card">
                <div class="all-gb-top">
                    <p class="all-gb-name"><span class="all-gb-from">FROM.</span> ${item.name}</p>
                    <p class="all-gb-date">${item.date ? new Date(item.date).toLocaleDateString() : ""}</p>
                </div>
                <p class="all-gb-content">${item.message}</p>
            </div>
        `,
            )
            .join("");

        bodyContainer.innerHTML = html;
    }

    overlay.style.display = "block";
    modal.style.display = "block";
    document.body.style.overflow = "hidden";
}
function closeAllGuestbook() {
    const overlay = document.querySelector(".all-list-overlay");
    const modal = document.querySelector(".all-list-pop");

    overlay.style.display = "none";
    modal.style.display = "none";
    document.body.style.overflow = "auto"; // 스크롤 복구
}

// 방명록 등록
let isSubmitting = false;
async function writeGuestbook() {
    if (isSubmitting) return;

    const nameInput = document.getElementById("write_guest_name");
    const msgInput = document.getElementById("write_guest_text");
    const submitBtn = document.querySelector(".btn-guestbook-submit");
    if (!nameInput.value || !msgInput.value) {
        alert("성함과 메시지를 모두 입력해주세요.");
        return;
    }

    const payload = {
        name: nameInput.value,
        message: msgInput.value,
    };

    try {
        isSubmitting = true;
        submitBtn.disabled = true;
        submitBtn.style.opacity = "0.5"; // 시각적으로도 막혔음을 표시
        submitBtn.style.pointerEvents = "none"; // 클릭 이벤트 자체를 차단
        submitBtn.innerHTML = `작성중...`;

        // 입력창 초기화 및 모달 닫기
        nameInput.value = "";
        msgInput.value = "";
        document.querySelector(".write-overlay").click(); // 닫기 이벤트 트리거
        setTimeout(() => {
            alert("축하해 주셔서 감사합니다!");
        }, 100);
        showLoading(true);

        // GAS doPost 호출
        await fetch(GAS_URL, {
            method: "POST",
            body: JSON.stringify(payload),
        });

        // 목록 새로고침
        fetchGuestbook();
    } catch (error) {
        alert("등록에 실패했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
        isSubmitting = false;
        submitBtn.disabled = false;
        submitBtn.innerHTML = `작성하기`;
        submitBtn.style.opacity = "1";
        submitBtn.style.pointerEvents = "auto";
        submitBtn.innerHTML = originalContent;
    }
}
// 방명록 로딩
function showLoading(isLoading) {
    const loader = document.getElementById("guestbook-loader"); // 별도의 로딩 레이어
    if (!loader) return;
    loader.style.display = isLoading ? "flex" : "none";
}

// 13. 카카오톡으로 공유하기, 청첩장 주소 복사하기
function shareKakao() {
    if (!Kakao.isInitialized()) {
        Kakao.init("669f1c6f440657e143d516895413ef21");
    }

    Kakao.Share.sendDefault({
        objectType: "feed",
        content: {
            title: "정연재 ❤️ 장선홍 결혼식에 초대합니다",
            description:
                "2026년 06월 27일 토요일 오후 6시\n더뉴컨벤션 웨딩홀 2층 더뉴홀",
            imageUrl:
                "https://mangekyou93.github.io/yhwedding0627/files/images/pictures/thumbnail_image.webp", // 대표 이미지 경로
            link: {
                mobileWebUrl: "https://mangekyou93.github.io/yhwedding0627",
                webUrl: "https://mangekyou93.github.io/yhwedding0627",
            },
        },
        buttons: [
            {
                title: "모바일 청첩장 보기",
                link: {
                    mobileWebUrl: "https://mangekyou93.github.io/yhwedding0627",
                    webUrl: "https://mangekyou93.github.io/yhwedding0627",
                },
            },
        ],
    });
}

// URL 복사
function copyUrl() {
    const url = window.location.href; // 현재 페이지 주소
    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(url).then(() => {
            // alert("청첩장 주소가 복사되었습니다.");
        });
    } else {
        const textArea = document.createElement("textarea");
        textArea.value = url;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
        // alert("청첩장 주소가 복사되었습니다.");
    }
}
