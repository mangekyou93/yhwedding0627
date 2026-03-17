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

function openModal() {
    document.getElementById('modal-overlay').style.display = 'flex';
    // 모달 열릴 때 본문 스크롤 방지 (선택사항)
    document.body.style.overflow = 'hidden';
}
function closeModal() {
    document.getElementById('modal-overlay').style.display = 'none';
    // 스크롤 방지 해제
    document.body.style.overflow = 'auto';
}

function updateDDay() {
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

// 페이지 로드 시 실행
window.onload = function() {
    updateDDay();
    // 만약 오버레이(시작 화면) 함수가 있다면 여기서 같이 호출해 주세요.
};


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