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