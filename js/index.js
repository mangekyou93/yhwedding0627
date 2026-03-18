// 페이지 로드 시 실행
window.onload = function() {
    updateDDay();
    initMap();
};

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

// 8. 연재♥선홍 의 결혼식 OO전
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

// 9. 
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

// 10. 결혼식장 장소(맵 API 활용)
function initMap() {
    // 카카오 맵 라이브러리가 로드될 때까지 기다린 후 실행
    kakao.maps.load(function() {
        var container = document.getElementById('map');
        var xpos = document.getElementById('wd_xpos').value; // 이전에 넣은 x 좌표
        var ypos = document.getElementById('wd_ypos').value; // 이전에 넣은 y 좌표
        
        var options = {
            center: new kakao.maps.LatLng(ypos, xpos), // 더뉴컨벤션 좌표 적용
            level: 3
        };

        var map = new kakao.maps.Map(container, options);
        
        // 마커 추가 (선택사항)
        var markerPosition = new kakao.maps.LatLng(ypos, xpos);
        var marker = new kakao.maps.Marker({
            position: markerPosition
        });
        marker.setMap(map);
    });
}

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