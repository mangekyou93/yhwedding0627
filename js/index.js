function toggleAudio() {
    const audio = document.getElementById('bgm');
    if (audio.paused) {
        audio.play();
    } else {
        audio.pause();
    }
}