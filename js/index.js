// 페이지 로드 시 실행
// 이미지 먼저 로드
window.addEventListener("DOMContentLoaded", function () {
    // 'load' 대신 'DOMContentLoaded'로 앞당김
    const imagesToPreload = [
        "files/images/pictures/gallery01.webp",
        "files/images/pictures/gallery02.webp",
        "files/images/pictures/gallery03.webp",
        "files/images/pictures/gallery04.webp",
        "files/images/pictures/gallery05.webp",
        "files/images/pictures/gallery06.webp",
        "files/images/pictures/gallery07.webp",
        "files/images/pictures/gallery08.webp",
        // 16개 전체 이미지 경로 작성
    ];

    imagesToPreload.forEach(function (src) {
        // 백그라운드에서 이미지 객체 생성 및 로드
        var img = new Image();
        img.src = src;
    });
});

window.onload = async function () {
    initFloatingPlayer();

    set_guestbook();
    await loadAndAnimateSVG();
    set_section_scroll();
    update_DDay();
};

// 섹션 등장
function set_section_scroll() {
    const sections = document.querySelectorAll("section");

    const defaultOptions = { root: null, threshold: 0.1 };
    const videoOptions = { root: null, threshold: 0.4 };

    const defaultObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add("is-visible");
                observer.unobserve(entry.target);
                // (오디오 중복 실행을 유발하던 문제가 되는 코드 완전 삭제 완료)
            }
        });
    }, defaultOptions);

    const videoObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add("is-visible");

                const video = entry.target.querySelector("#wedding-video");
                if (video) {
                    video.playbackRate = 0.8;
                    video.play();
                }
                observer.unobserve(entry.target);
            }
        });
    }, videoOptions);

    sections.forEach((section) => {
        if (section.id === "video-section") {
            videoObserver.observe(section);
        } else {
            defaultObserver.observe(section);
        }
    });
}

// ==========================================
// 🎵 자동 서랍형 뮤직 플레이어 (아이콘 상태 동기화 완벽 해결)
// ==========================================
function initFloatingPlayer() {
    const player = document.getElementById("floating-music-player");
    const albumCoverImg = player?.querySelector(".album-cover");
    const playPauseBtn = document.getElementById("mini-play-pause");
    const iconPlay = document.getElementById("mini-icon-play");
    const iconPause = document.getElementById("mini-icon-pause");
    const audio = document.getElementById("bgm");
    const progressBar = document.getElementById("mini-progress-bar");

    if (!player || !audio || player.dataset.initialized) return;
    player.dataset.initialized = "true";

    let autoCloseTimer = null;

    const closeDrawer = (delay) => {
        if (autoCloseTimer) clearTimeout(autoCloseTimer);
        autoCloseTimer = setTimeout(() => {
            player.classList.add("collapsed");
        }, delay);
    };

    closeDrawer(3000);
    audio.volume = 0.25;

    // ✨ [해결 1] 아이콘과 애니메이션을 변경해주는 전용 함수
    const updateUI = (isPlaying) => {
        if (isPlaying) {
            if (iconPlay) iconPlay.style.display = "none";
            if (iconPause) iconPause.style.display = "block";
            if (albumCoverImg) albumCoverImg.classList.remove("spin-paused");
        } else {
            if (iconPlay) iconPlay.style.display = "block";
            if (iconPause) iconPause.style.display = "none";
            if (albumCoverImg) albumCoverImg.classList.add("spin-paused");
        }
    };

    // ✨ [해결 2] 오디오의 실제 플레이/정지 이벤트에 UI를 무조건 동기화시킴!
    audio.addEventListener("play", () => updateUI(true));
    audio.addEventListener("pause", () => updateUI(false));

    // ✨ [해결 3] 페이지 로드 직후 이미 노래가 자동 재생 중이라면, 즉시 일시정지(⏸) 아이콘으로 변경!
    if (!audio.paused) {
        updateUI(true);
    }

    let isAudioUnlocked = false;

    // 문서 클릭 시 백그라운드 재생
    const stealthPlayAudio = (e) => {
        // e.target이 존재하는지, 그리고 closest를 지원하는지 확인 후 안전하게 실행
        if (e && e.target && typeof e.target.closest === "function") {
            if (e.target.closest("#floating-music-player")) return;
        }

        if (!audio.paused) return;

        audio
            .play()
            .then(() => {
                updateUI(true);
                removeStealthListeners();
            })
            .catch(() => {});
    };

    const removeStealthListeners = () => {
        ["click", "touchstart", "scroll"].forEach((evt) => {
            document.removeEventListener(evt, stealthPlayAudio);
        });
    };

    ["click", "touchstart", "scroll"].forEach((evt) => {
        document.addEventListener(evt, stealthPlayAudio, { passive: true });
    });

    // 재생/정지 버튼 클릭 이벤트
    if (playPauseBtn) {
        const toggleAudio = function (e) {
            e.preventDefault();
            e.stopPropagation();

            isAudioUnlocked = true;
            removeStealthListeners();

            if (audio.paused) {
                audio.play();
            } else {
                audio.pause();
            }
            closeDrawer(2000);
        };

        playPauseBtn.addEventListener("touchstart", toggleAudio, {
            passive: false,
        });
        playPauseBtn.addEventListener("click", toggleAudio);
    }

    // 플레이어 서랍 클릭 이벤트
    player.addEventListener("click", function (e) {
        if (e.target.closest("#mini-play-pause")) return;

        if (player.classList.contains("collapsed")) {
            player.classList.remove("collapsed");
        }
        closeDrawer(2000);
    });

    // 진행 바
    audio.addEventListener("timeupdate", () => {
        if (audio.duration) {
            const percentage = (audio.currentTime / audio.duration) * 100;
            if (progressBar) progressBar.style.width = percentage + "%";
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

                const paths = svgElement.querySelectorAll(
                    "path, polygon, rect",
                );
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
        displayElement.innerText = `드디어 오늘 예쁘게 만나요! 👰🤵✨`;
    } else {
        displayElement.innerText = `우리가 부부가 된 지 ${Math.abs(diffDays)}일째 되는 날입니다 🩷`;
    }
}

// 9. 이미지 갤러리
function changeMainImage(clickedThumb, imageSrc) {
    const mainView = document.querySelector(".gallery-main-view");

    // 1. 기존에 띄워져 있던 메인 이미지들을 모두 숨김 처리 및 투명도 0
    const currentImgs = mainView.querySelectorAll(".main-gallery-img");
    currentImgs.forEach((img) => {
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

        document
            .querySelectorAll(".close-modal, .modal-overlay")
            .forEach((btn) => {
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
                            <p class="book-slide-txt">${truncateByByte(item.message || "내용 없음")}</p>
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
// 방명록 미리보기 글자수
function truncateByByte(str, maxByte = 100) {
    let currentByte = 0;
    let truncatedStr = "";

    for (let i = 0; i < str.length; i++) {
        const charCode = str.charCodeAt(i);
        let charByte = 0;

        // 1. 이모지 체크 (Surrogate Pair 판별)
        // 이모지는 보통 2개의 charCode로 구성되므로 다음 글자까지 포함해서 체크합니다.
        if (charCode >= 0xd800 && charCode <= 0xdbff) {
            charByte = 4; // 이모지 4바이트
            i++; // 다음 서로게이트 페어 스킵
        }
        // 2. 한글 및 기타 다국어 (UTF-8 기준 한글은 보통 3바이트지만, 요청하신 2바이트 기준으로 작성)
        else if (charCode > 128) {
            charByte = 2;
        }
        // 3. 영문, 숫자, 특수문자
        else {
            charByte = 1;
        }

        // 바이트 합산 전 체크
        if (currentByte + charByte <= maxByte) {
            currentByte += charByte;
            // 이모지인 경우 실제 2글자(서로게이트 페어)를 다 가져와야 함
            truncatedStr += charByte === 4 ? str[i - 1] + str[i] : str[i];
        } else {
            return truncatedStr + "...";
        }
    }

    return truncatedStr;
}

// 방명록 전체보기
function showAllGuestbook() {
    const bodyContainer = document.getElementById("all-guestbook-body");
    const overlay = document.querySelector(".all-list-overlay");
    const modal = document.querySelector(".all-list-pop");

    if (
        !window.cachedGuestbookData ||
        window.cachedGuestbookData.length === 0
    ) {
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
            title: "정연재 ❤️ 장선홍 결혼식에 초대합니다.",
            description: "2026년 06월 27일 토요일 오후 6시",
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
