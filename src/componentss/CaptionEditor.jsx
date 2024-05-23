import React, { useState, useRef, useEffect } from 'react';
import YouTube from 'react-youtube';

const CustomVideoPlayer = () => {
  const [videoUrl, setVideoUrl] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [captions, setCaptions] = useState([]);
  const [captionText, setCaptionText] = useState('');
  const [captionTime, setCaptionTime] = useState('');
  const [error, setError] = useState('');
  const videoRef = useRef(null);
  const youTubePlayerRef = useRef(null);

  useEffect(() => {
    if (youTubePlayerRef.current) {
      const interval = setInterval(() => {
        const time = youTubePlayerRef.current.getCurrentTime();
        setCurrentTime(time);
      }, 100);
      return () => clearInterval(interval);
    }
  }, [youTubePlayerRef.current]);

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
        setIsPlaying(true);
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    } else if (youTubePlayerRef.current) {
      if (isPlaying) {
        youTubePlayerRef.current.pauseVideo();
      } else {
        youTubePlayerRef.current.playVideo();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleVolumeChange = (e) => {
    setVolume(e.target.value);
    if (videoRef.current) {
      videoRef.current.volume = e.target.value;
    } else if (youTubePlayerRef.current) {
      youTubePlayerRef.current.setVolume(e.target.value * 100);
    }
  };

  // const handleSeek = (e) => {
  //   const newTime = e.target.value;
  //   setCurrentTime(newTime);
  //   if (videoRef.current) {
  //     videoRef.current.currentTime = newTime;
  //   } else if (youTubePlayerRef.current) {
  //     youTubePlayerRef.current.seekTo(newTime);
  //   }
  // };

  const handleVideoUrlChange = (e) => {
    setVideoUrl(e.target.value);
    setError('');
    setIsPlaying(false);
    if (youTubePlayerRef.current) {
      youTubePlayerRef.current.stopVideo();
    }
  };

  const handleAddCaption = () => {
    if (captionText && captionTime) {
      setCaptions([...captions, { text: captionText, time: parseFloat(captionTime) }]);
      setCaptionText('');
      setCaptionTime('');
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const renderCaptions = () => {
    const currentCaption = captions.find(caption => Math.abs(caption.time - currentTime) < 1);
    return currentCaption ? <div className="caption">{currentCaption.text}</div> : null;
  };

  const getYouTubeVideoId = (url) => {
    const urlObj = new URL(url);
    if (urlObj.hostname === 'youtu.be') {
      return urlObj.pathname.slice(1);
    }
    return urlObj.searchParams.get('v');
  };

  const opts = {
    height: '390',
    width: '640',
    playerVars: {
      autoplay: 1,
    },
  };

  const onYouTubePlayerReady = (event) => {
    youTubePlayerRef.current = event.target;
    youTubePlayerRef.current.setVolume(volume * 100);
    setIsPlaying(true);
  };

  const renderVideo = () => {
    if (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be')) {
      const videoId = getYouTubeVideoId(videoUrl);
      if (videoId) {
        return (
          <YouTube
            videoId={videoId}
            opts={opts}
            onReady={onYouTubePlayerReady}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onError={(e) => setError('An error occurred while playing the YouTube video.')}
            onStateChange={(event) => {
              if (event.data === 1) {
                setIsPlaying(true);
              } else {
                setIsPlaying(false);
              }
            }}
          />
        );
      } else {
        setError('Invalid YouTube URL');
        return null;
      }
    } else {
      return (
        <video
          ref={videoRef}
          controls
          style={{ width: '100%' }}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onTimeUpdate={handleTimeUpdate}
        >
          <source src={videoUrl} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      );
    }
  };

  return (
    <div className="flex flex-col  justify-center items-center custom-video-player">
      <input
        type="text"
        className='m-5 w-2/5 border rounded-sm p-2 border-gray-600'
        placeholder="Paste video URL"
        value={videoUrl}
        onChange={handleVideoUrlChange}
      />
      <div className='flex'>
        <input
          type="text"
          className='m-5 border rounded-sm p-2 border-gray-600'
          placeholder="Enter caption text"
          value={captionText}
          onChange={(e) => setCaptionText(e.target.value)}
        />
        <input
          type="number"
          className='m-5  border rounded-sm p-2 border-gray-600'
          placeholder="Enter timestamp (seconds)"
          value={captionTime}
          onChange={(e) => setCaptionTime(e.target.value)}
        />
        <button className='bg-transparent hover:bg-gray-500 text-gray-700 font-semibold hover:text-white py-2 px-4 border border-gray-500 m-5 hover:border-transparent rounded' onClick={handleAddCaption}>Add Caption</button>
      </div>
      {error && <div className="error">{error}</div>}
      <div className="video-container" style={{ position: 'relative', width: '640px', height: '390px' }}>
        {renderVideo()}
        {renderCaptions()}
      </div>
      {/* <div>
        <button onClick={handlePlayPause}>{isPlaying ? 'Pause' : 'Play'}</button>
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={volume}
          onChange={handleVolumeChange}
        />
        <input
          type="range"
          min={0}
          max={videoRef.current?.duration || 0}
          step={1}
          value={currentTime}
          onChange={handleSeek}
        />
      </div> */}
      <style jsx>{`
        .caption {
          position: absolute;
          bottom: 10%;
          width: 100%;
          text-align: center;
          color: white;
          background-color: rgba(0, 0, 0, 0.5);
          padding: 5px;
          font-size: 18px;
          pointer-events: none; /* Ensure captions do not interfere with video controls */
        }
      `}</style>
    </div>
  );
};

export default CustomVideoPlayer;
