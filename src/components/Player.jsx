import { useRef, useState } from 'react';

import PlayControls from './controls/PlayControls';
import VolumeControls from './controls/VolumeControls';
import SpeedControls from './controls/SpeedControls';
import FullscreenToggle from './controls/FullscreenToggle';

const VIDEO_URL =
  'https://assets.mixkit.co/videos/preview/mixkit-a-couple-of-cats-in-the-snow-9949-large.mp4';

const SECONDS_PER_MINUTE = 60;
const PERCENT_MAX = 100;
const VOLUME_LEVELS = {
  ZERO: 0,
  LOW: 0.1,
  MIDDLE: 0.5,
  HIGH: 0.9,
  MAX: 1,
};

function Player() {
  const videoRef = useRef(null);
  const [lastVolume, setLastVolume] = useState(VOLUME_LEVELS.MIDDLE);
  const [fullscreen, setFullscreen] = useState(false);

  function toggleIcon(icon, action, title) {
    const playBtn = document.getElementById('play-btn');

    playBtn.classList.replace(`fa-${icon}`, `fa-${action}`);
    playBtn.setAttribute('title', title);
  }

  function displayTime(time) {
    const minutes = Math.floor(time / SECONDS_PER_MINUTE);
    const seconds = Math.floor(time % SECONDS_PER_MINUTE)
      .toString()
      .padStart(2, '0');

    return `${minutes}:${seconds}`;
  }

  function updateProgress() {
    const PERCENT_MAX = 100;

    const video = videoRef.current;
    const progress = (video.currentTime / video.duration) * PERCENT_MAX;

    const progressBar = document.querySelector('.progress-bar');
    progressBar.style.width = `${progress}%`;

    const currentTime = document.querySelector('.time-elapsed');
    currentTime.textContent = `${displayTime(video.currentTime)} / `;

    const duration = document.querySelector('.time-duration');
    duration.textContent = displayTime(video.duration);
  }

  function onPlayToggle() {
    const video = videoRef.current;

    if (video.paused) {
      video.play();
      toggleIcon('play', 'pause', 'Pause');
    } else {
      video.pause();
      toggleIcon('pause', 'play', 'Play');
    }
  }

  function onVideoEnd() {
    toggleIcon('pause', 'play', 'Replay');
  }

  function onProgressMouseDown(e) {
    const video = videoRef.current;
    const progressRange = e.currentTarget;
    const newTime = (e.nativeEvent.offsetX / progressRange.offsetWidth) * video.duration;

    video.currentTime = newTime;

    updateProgress();
  }

  function updateVolumeIcon(volume) {
    const volumeIcon = document.getElementById('volume-icon');
    volumeIcon.className = '';

    if (volume > VOLUME_LEVELS.MIDDLE) {
      volumeIcon.classList.add('fas', 'fa-volume-up');
      volumeIcon.setAttribute('title', 'Mute');
    } else if (volume < VOLUME_LEVELS.MIDDLE && volume > VOLUME_LEVELS.ZERO) {
      volumeIcon.classList.add('fas', 'fa-volume-down');
      volumeIcon.setAttribute('title', 'Mute');
    } else if (volume === VOLUME_LEVELS.ZERO) {
      volumeIcon.classList.add('fas', 'fa-volume-mute');
      volumeIcon.setAttribute('title', 'Unmute');
    }
  }

  function onVolumeMouseDown(e) {
    const video = videoRef.current;
    const volumeRange = e.currentTarget;
    let volume = e.nativeEvent.offsetX / volumeRange.offsetWidth;

    volume = Math.min(Math.max(volume, VOLUME_LEVELS.ZERO), VOLUME_LEVELS.MAX);

    video.volume = volume;
    const volumeBar = document.querySelector('.volume-bar');
    volumeBar.style.width = `${volume * PERCENT_MAX}%`;

    updateVolumeIcon(volume);
  }

  function onToggleMute() {
    const video = videoRef.current;
    const isMuted = video.volume === VOLUME_LEVELS.ZERO;

    if (isMuted) {
      video.volume = lastVolume;
      const volumeBar = document.querySelector('.volume-bar');
      volumeBar.style.width = `${lastVolume * PERCENT_MAX}%`;
    } else {
      setLastVolume(video.volume);
      video.volume = VOLUME_LEVELS.ZERO;
      const volumeBar = document.querySelector('.volume-bar');
      volumeBar.style.width = '0%';
    }

    updateVolumeIcon(video.volume);
  }

  function onSpeedChange() {
    const video = videoRef.current;
    const speed = document.querySelector('.player-speed');
    video.playbackRate = speed.value;
  }

  function openFullscreen(elem) {
    if (elem.requestFullscreen) {
      elem.requestFullscreen();
    } else if (elem.mozRequestFullscreen) {
      elem.mozRequestFullscreen();
    } else if (elem.webkitRequestFullscreen) {
      elem.webkitRequestFullscreen();
    } else if (elem.msRequestFullscreen) {
      elem.msRequestFullscreen();
    }

    const video = videoRef.current;
    video.classList.add('video-fullscreen');
  }

  function closeFullscreen() {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.mozCancelFullscreen) {
      document.mozCancelFullscreen();
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) {
      document.msExitFullscreen();
    }

    const video = videoRef.current;
    video.classList.remove('video-fullscreen');
  }

  function onFullscreenToggle() {
    setFullscreen(!fullscreen);

    const player = document.querySelector('.player');
    !fullscreen ? openFullscreen(player) : closeFullscreen();
  }

  return (
    <div className='player'>
      <video
        src={VIDEO_URL}
        className='video'
        playsInline
        ref={videoRef}
        onTimeUpdate={updateProgress}
        onCanPlay={updateProgress}
        onEnded={onVideoEnd}
      />
      <div className='show-controls'>
        <div className='controls-container'>
          <div className='progress-range' title='Seek' onClick={onProgressMouseDown}>
            <div className='progress-bar'></div>
          </div>
          <div className='control-group'>
            <div className='controls-left'>
              <PlayControls onPlayToggle={onPlayToggle} />
              <VolumeControls
                onToggleMute={onToggleMute}
                onVolumeMouseDown={onVolumeMouseDown}
              />
            </div>
            <div className='controls-right'>
              <SpeedControls onSpeedChange={onSpeedChange} />
              <div className='time'>
                <span className='time-elapsed'>00:00 / </span>
                <span className='time-duration'>2:38</span>
              </div>
              <FullscreenToggle onFullscreenToggle={onFullscreenToggle} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Player;