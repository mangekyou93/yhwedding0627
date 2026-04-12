// 페이지 로드 시 실행
window.onload = function() {
    set_section_scroll();
    update_DDay();
    set_guestbook();
};

// 섹션 등장
function set_section_scroll() {
    const sections = document.querySelectorAll('section');

    const observerOptions = {
        root: null, // 브라우저 뷰포트 기준
        threshold: 0.1 // 10% 정도 보였을 때 실행
    };

    const sectionObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // 화면에 들어오면 클래스 추가
                entry.target.classList.add('is-visible');
                // 한 번 나타난 후에는 감시 중단 (다시 사라지는 걸 원치 않을 때)
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    sections.forEach(section => {
        sectionObserver.observe(section);
    });
}

// 1. 오디오
function toggleAudio() {
    const audio = document.getElementById('bgm');
    const icon = document.getElementById('bgm-icon');
    if (audio.paused) {
        icon.setAttribute('src', 'files/images/icons/pause.svg');
        audio.play();
    } else {
        icon.setAttribute('src', 'files/images/icons/play.svg');
        audio.pause();
    }
}

// 6. 양가부모님 성함 + 신랑 신부 이름 + 연락처 메세지 보내기
// 6. 혼주 연락처 모달 제어
function openModal() {
    const overlay = document.getElementById('modal-overlay');
    const content = overlay.querySelector('.modal-content');
    overlay.style.display = 'block';
    content.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    document.getElementById('modal-overlay').style.display = 'none';
    document.body.style.overflow = 'auto';
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

    const displayElement = document.getElementById('wd_d-day');

    if (diffDays > 0) {
        displayElement.innerText = `${diffDays}일 남았습니다`;
    } else if (diffDays === 0) {
        displayElement.innerText = `오늘이 바로 그날입니다! ✨`;
    } else {
        displayElement.innerText = `결혼한 지 ${Math.abs(diffDays)}일째 되는 날입니다 🩷`;
    }
}

// 9. 이미지 갤러리
let gallerySwiper;
function initSwiper() {
    gallerySwiper = new Swiper(".mySwiper", {
        loop: true,
        navigation: {
            nextEl: ".swiper-button-next",
            prevEl: ".swiper-button-prev",
        },
        pagination: {
            el: ".swiper-pagination",
            clickable: true,
        },
    });
}

function openSlider(index) {
    const modal = document.getElementById('gallery-modal');
    modal.style.display = 'flex';
    
    if (!gallerySwiper) {
        initSwiper();
    }
    gallerySwiper.slideToLoop(index, 0); // 클릭한 이미지 인덱스로 이동
    document.body.style.overflow = 'hidden'; // 스크롤 방지
}

function closeSlider() {
    const modal = document.getElementById('gallery-modal');
    modal.style.display = 'none';
    document.body.style.overflow = 'auto'; // 스크롤 허용
}

// 10. 결혼식장 장소(카카오맵, 내비 API 활용)
function startNavigation() {
    if (!Kakao.isInitialized()) {
        Kakao.init('669f1c6f440657e143d516895413ef21');
    }
    
    const xpos = document.getElementById('wd_xpos').value;
    const ypos = document.getElementById('wd_ypos').value;

    Kakao.Navi.start({
        name: '더뉴컨벤션',
        x: parseFloat(xpos),
        y: parseFloat(ypos),
        coordType: 'wgs84',
    });
}
function openNaverMap() {
    const destinationName = encodeURIComponent('더뉴컨벤션웨딩'); // 한글은 인코딩 필수
    const lat = 37.5562;
    const lng = 126.8368;
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
        setTimeout(function() {
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
    const destinationName = encodeURIComponent('더뉴컨벤션웨딩');
    const lat = 37.5593; // 위도
    const lng = 126.8327; // 경도

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
        setTimeout(function() {
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
        element.classList.add('on');
    } else {
        coverWrap.style.display = "none";
        element.classList.remove('on');
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
            document.execCommand('copy');
            // alert("계좌번호가 복사되었습니다.");
        } catch (err) {
            console.error('복사 실패', err);
        }
        document.body.removeChild(textArea);
    }
}

// 12. 방명록
const GAS_URL = 'https://script.google.com/macros/s/AKfycbxepXniKsewiA82hNyGDSW_0Ht8Fksbk8xeUQ1S9-LEoRmz5FrWXjSYPG38go7LwnRTSQ/exec';
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
        const btnOpenAll = document.querySelector('.btn-open-all');
        const btnOpenWrite = document.querySelector('.btn-open-write');
        const allListPop = document.querySelector('.all-list-pop');
        const allListOverlay = document.querySelector('.all-list-overlay');
        const writeWrap = document.querySelector('.write-wrap');
        const writeOverlay = document.querySelector('.write-overlay');

        const fadeIn = (el) => {
            if(!el) return;
            el.style.display = 'block';
            setTimeout(() => { el.style.opacity = '1'; }, 10);
        };
        
        const fadeOut = (el) => {
            if(!el) return;
            el.style.opacity = '0';
            setTimeout(() => { el.style.display = 'none'; }, 200);
        };

        btnOpenAll?.addEventListener('click', () => {
            fadeIn(allListOverlay);
            fadeIn(allListPop);
        });

        btnOpenWrite?.addEventListener('click', () => {
            fadeIn(writeOverlay);
            fadeIn(writeWrap);
        });

        document.querySelectorAll('.close-modal, .modal-overlay').forEach(btn => {
            btn.addEventListener('click', () => {
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
        
        const listWrapper = document.getElementById('guestbook-list');
        if (!listWrapper) return false;
        
        listWrapper.innerHTML = ''; 

        // 데이터가 배열인지 확인 후 렌더링
        if (Array.isArray(data)) {
            // [핵심] 전역 변수에 데이터 저장 (나중에 전체보기에서 사용)
            window.cachedGuestbookData = data;

            data.reverse().forEach(item => {
                // GAS 시트 첫 줄(Header) 이름과 정확히 일치해야 합니다.
                // 만약 에러가 난다면 console.log(item)으로 Key값을 확인해보세요.
                const slide = `
                    <div class="swiper-slide book-slide-box">
                        <div class="book-article">
                            <p class="book-who"><span class="from-em">FROM.</span> ${item.name || '익명'}</p>
                            <p class="book-slide-txt">${item.message || '내용 없음'}</p>
                            <p class="book-date"><span>${item.date ? new Date(item.date).toLocaleDateString() : ''}</span></p>
                        </div>
                    </div>`;
                listWrapper.insertAdjacentHTML('beforeend', slide);
            });
        }

        // 4. Swiper 업데이트 (데이터가 비동기로 로드된 후 슬라이드 크기 재계산)
        if (window.guestSwiper) {
            window.guestSwiper.update();
        }

    } catch (error) {
        console.error("방명록 로드 실패:", error);
        result = false;
    }
    finally {
        showLoading(false);
    }

    return result;
}

// 방명록 전체보기
function showAllGuestbook() {
    const bodyContainer = document.getElementById('all-guestbook-body');
    const overlay = document.querySelector('.all-list-overlay');
    const modal = document.querySelector('.all-list-pop');

    if (!window.cachedGuestbookData || window.cachedGuestbookData.length === 0) {
        bodyContainer.innerHTML = '<p class="all-gb-empty">등록된 메시지가 없습니다.</p>';
    } else {
        const html = window.cachedGuestbookData.map((item) => `
            <div class="all-gb-card">
                <div class="all-gb-top">
                    <p class="all-gb-name"><span class="all-gb-from">FROM.</span> ${item.name}</p>
                    <p class="all-gb-date">${item.date ? new Date(item.date).toLocaleDateString() : ''}</p>
                </div>
                <p class="all-gb-content">${item.message}</p>
            </div>
        `).join('');
        
        bodyContainer.innerHTML = html;
    }

    overlay.style.display = 'block';
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}
function closeAllGuestbook() {
    const overlay = document.querySelector('.all-list-overlay');
    const modal = document.querySelector('.all-list-pop');
    
    overlay.style.display = 'none';
    modal.style.display = 'none';
    document.body.style.overflow = 'auto'; // 스크롤 복구
}

// 방명록 등록
let isSubmitting = false;
async function writeGuestbook() {
    if (isSubmitting) return;

    const nameInput = document.getElementById('write_guest_name');
    const msgInput = document.getElementById('write_guest_text');
    const submitBtn = document.querySelector('.btn-guestbook-submit');
    if (!nameInput.value || !msgInput.value) {
        alert("성함과 메시지를 모두 입력해주세요.");
        return;
    }

    const payload = {
        name: nameInput.value,
        message: msgInput.value
    };

    try {
        isSubmitting = true;
        submitBtn.disabled = true;
        submitBtn.style.opacity = '0.5'; // 시각적으로도 막혔음을 표시
        submitBtn.style.pointerEvents = 'none'; // 클릭 이벤트 자체를 차단
        submitBtn.innerHTML = `작성중...`;
        
        // 입력창 초기화 및 모달 닫기
        nameInput.value = '';
        msgInput.value = '';
        document.querySelector('.write-overlay').click(); // 닫기 이벤트 트리거
        setTimeout(() => { alert("축하해 주셔서 감사합니다!"); }, 100);
        showLoading(true);

        // GAS doPost 호출
        await fetch(GAS_URL, {
            method: 'POST',
            body: JSON.stringify(payload)
        });
        
        // 목록 새로고침
        fetchGuestbook();
        
    } catch (error) {
        alert("등록에 실패했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
        isSubmitting = false;
        submitBtn.disabled = false;
        submitBtn.innerHTML = `작성하기`;
        submitBtn.style.opacity = '1';
        submitBtn.style.pointerEvents = 'auto';
        submitBtn.innerHTML = originalContent;
    }
}
// 방명록 로딩
function showLoading(isLoading) {
    const loader = document.getElementById('guestbook-loader'); // 별도의 로딩 레이어
    if (!loader) return;
    loader.style.display = isLoading ? 'flex' : 'none';
}



// 13. 카카오톡으로 공유하기, 청첩장 주소 복사하기
function shareKakao() {
    if (!Kakao.isInitialized()) {
        Kakao.init('669f1c6f440657e143d516895413ef21');
    }

    Kakao.Share.sendDefault({
        objectType: "feed",
        content: {
            title: '정연재 ❤️ 장선홍 결혼식에 초대합니다',
            description: '2026년 06월 27일 토요일 오후 6시\n더뉴컨벤션 웨딩홀 2층 더뉴홀',
            imageUrl: 'https://mangekyou93.github.io/yhwedding0627/files/images/pictures/thumbnail_image.jpg', // 대표 이미지 경로
            link: {
                mobileWebUrl: 'https://mangekyou93.github.io/yhwedding0627',
                webUrl: 'https://mangekyou93.github.io/yhwedding0627',
            },
        },
        buttons: [
            {
                title: '모바일 청첩장 보기',
                link: {
                    mobileWebUrl: 'https://mangekyou93.github.io/yhwedding0627',
                    webUrl: 'https://mangekyou93.github.io/yhwedding0627',
                },
            }
        ]
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
        document.execCommand('copy');
        document.body.removeChild(textArea);
        // alert("청첩장 주소가 복사되었습니다.");
    }
}