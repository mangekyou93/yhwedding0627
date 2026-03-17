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