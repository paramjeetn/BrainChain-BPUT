import { useState, useEffect } from 'react';

/**
 * Custom hook that animates text appearing character by character (typing effect).
 * 
 * @param {string} text - The complete text string to type out.
 * @param {number} speed - Delay in milliseconds per character (default 18ms).
 * @returns {string} The text typed out so far.
 */
export function useTypingEffect(text = '', speed = 18) {
  const [displayedText, setDisplayedText] = useState('');

  useEffect(() => {
    // If text is empty or not a string, reset immediately
    if (!text || typeof text !== 'string') {
      setDisplayedText('');
      return;
    }

    setDisplayedText('');
    let currentIndex = 0;

    const intervalId = setInterval(() => {
      currentIndex += 1;
      setDisplayedText(text.slice(0, currentIndex));

      if (currentIndex >= text.length) {
        clearInterval(intervalId);
      }
    }, speed);

    return () => clearInterval(intervalId);
  }, [text, speed]);

  return displayedText;
}

export default useTypingEffect;
