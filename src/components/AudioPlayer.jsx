import { useState, useEffect } from 'react';
import { FaPlay, FaPause } from 'react-icons/fa';

const AudioPlayer = () => {
  const [audio] = useState(new Audio('/audios/ROYALTY FREE Travel Video Background Music  Travel Pop Royalty Free Music by MUSIC4VIDEO.mp3'));
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    audio.loop = true;

    // Clean up audio on component unmount
    return () => {
      audio.pause();
    };
  }, [audio]);

  // Function to toggle play/pause
  const toggleAudio = () => {
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play().catch((error) => {
        console.log("Autoplay blocked, user interaction required:", error);
      });
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <button
      onClick={toggleAudio}
      style={{ bottom: '130px', right: '65px' }}
      className={`fixed z-50 border-transparent hover:border-white transition-all duration-300 px-4 py-3 rounded-full text-lg uppercase shrink-0 border ${
        isPlaying ? "bg-white/90 text-black" : "bg-black/30 text-white"
      }`}
    >
      {/* Use icons instead of text */}
      {isPlaying ? <FaPause size={24} /> : <FaPlay size={24} />}
    </button>
  );
};



export default AudioPlayer;
