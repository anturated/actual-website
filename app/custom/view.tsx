"use client"

import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export default function Custom({ cname, secondtext }: { cname: string, secondtext: string }) {
  const [isHovering, setHovering] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const targetVolume = 0.1;
  const fadeDuration = 500;
  const fadeRefreshRate = 50;
  const fadeStep = targetVolume / (fadeDuration / fadeRefreshRate);

  const fadeIn = () => {
    audioRef.current!.volume = 0;
    audioRef.current!.play();

    const fadeInterval = setInterval(() => {
      if (audioRef.current!.volume < targetVolume && isHovering) {
        if (audioRef.current!.volume + fadeStep >= targetVolume) {
          audioRef.current!.volume = targetVolume;
        } else {
          audioRef.current!.volume += fadeStep;
        }
      } else {
        clearInterval(fadeInterval);
      }
    }, fadeRefreshRate);
  }

  const fadeOut = () => {
    const fadeInterval = setInterval(() => {
      if (audioRef.current!.volume > 0 && !isHovering) {
        if (audioRef.current!.volume - fadeStep <= 0) {
          audioRef.current!.volume = 0;
        } else {
          audioRef.current!.volume -= fadeStep;
        }
      } else {
        clearInterval(fadeInterval);
        audioRef.current!.pause();
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

  const searchParams = useSearchParams();
  // const cname = searchParams.get("a") ?? "Привет";
  // const secondtext = searchParams.get("b") ?? " иди нахуй";

  return (
    <main className="flex w-screen flex-col justify-around items-center h-screen relative">
      <div
        className="text-on-background text-5xl items-center flex-col flex"
        onMouseOver={(_) => setHovering(true)}
        onMouseOut={(_) => setHovering(false)}
      >
        <p>{cname}</p>
        {
          isHovering &&
          <p>{secondtext}</p>

        }
      </div>

      <Image
        className="absolute bottom-[30px] right-[30px] transition-opacity duration-500"
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
