"use client"

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

export default function Custom({ cname, secondtext, className = "" }: { cname: string, secondtext: string, className?: string }) {
  const [isHovering, setHovering] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const targetVolume = 0.1;
  const fadeDuration = 500;
  const fadeRefreshRate = 50;
  const fadeStep = targetVolume / (fadeDuration / fadeRefreshRate);

  const [typed, setTyped] = useState("");

  const fadeIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const clearFadeInterval = () => {
    if (fadeIntervalRef.current) {
      clearInterval(fadeIntervalRef.current);
      fadeIntervalRef.current = null;
    }
  }

  const fadeIn = () => {
    clearFadeInterval();
    audioRef.current!.volume = 0;
    audioRef.current!.play();

    fadeIntervalRef.current = setInterval(() => {
      const audio = audioRef.current;
      if (!audio) return;

      if (audio.volume < targetVolume && isHovering) {
        audio.volume = Math.min(audio.volume + fadeStep, targetVolume);

        const typedLen = Math.min(Math.floor(
          secondtext.length * audio.volume / targetVolume
        ), secondtext.length)
        setTyped(secondtext.substring(0, typedLen))
      } else {
        clearFadeInterval();
      }
    }, fadeRefreshRate);
  }

  const fadeOut = () => {
    clearFadeInterval();

    fadeIntervalRef.current = setInterval(() => {
      const audio = audioRef.current;
      if (!audio) return;

      if (audio.volume > 0 && !isHovering) {
        audio.volume = Math.max(audio.volume - fadeStep, 0);

        const typedLen = Math.min(Math.floor(
          secondtext.length * audio.volume / targetVolume
        ), secondtext.length)
        setTyped(secondtext.substring(0, typedLen))
      } else {
        clearFadeInterval();
        audio.pause();
      }
    }, fadeRefreshRate);
  }

  useEffect(() => {
    if (isHovering) {
      fadeIn();
    } else {
      fadeOut();
    }
  }, [isHovering])

  useEffect(() => {
    audioRef.current!.volume = 0;
  }, [])

  return (
    <main className={`flex w-full flex-col justify-around items-center grow relative`}>
      <div
        className={`text-on-background text-5xl items-center flex-col flex ${className} max-w-sm`}
        onMouseEnter={(_) => setHovering(true)}
        onMouseLeave={(_) => setHovering(false)}
      >
        <p className="text-center">
          {cname}
          <span>
            {" " + typed}
          </span>
        </p>
      </div>

      <Image
        className={`absolute bottom-[30px] right-[30px] transition-opacity duration-500 ${className}`}
        style={{ opacity: `${isHovering ? 100 : 0}%` }}
        src="/spongebob-dance.gif"
        alt="spunchbop"
        width="180"
        height="204"
      />

      <audio
        src="/lady-hear-me.mp3"
        ref={audioRef}
      />
    </main >
  )
}
