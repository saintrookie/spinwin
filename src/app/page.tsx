import Image from "next/image";
import { DrawProvider } from "@/context/draw-context";
import { PrizeBanner } from "@/components/draw/prize-banner";
import { DrawStage } from "@/components/draw/draw-stage";
import { DrawActionButton } from "@/components/draw/draw-action-button";
import { ControlsBar } from "@/components/draw/controls-bar";

export default function Home() {
  return (
    <DrawProvider>
      <div className="relative flex h-dvh flex-col overflow-hidden bg-gradient-to-b from-[#2e0f52] via-[#1a0838] to-[#0b041a]">
        {/* Background Image */}
        <div
          className="
            absolute inset-0
            bg-[url('/images/background.png')]
            bg-cover
            bg-center
            bg-no-repeat
            opacity-50
          "
        />

        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-black/30" />

        {/* Optional Dots */}
        {/* <div className="pointer-events-none absolute inset-0 retro-dots opacity-30" /> */}

        {/* Floating pembina image, centered on the right edge */}
        <Image
          src="/images/pembina.png"
          alt="Tim Pembina Samsat Bangka Belitung"
          width={1533}
          height={942}
          className="floating-card pointer-events-none absolute right-3 top-1/2 z-20 hidden w-48 -translate-y-1/2 drop-shadow-xl sm:block lg:w-64"
        />

        {/* Content */}
        <div className="relative z-10 flex h-full flex-col">
          <header className="flex flex-col items-center gap-2 px-4 pt-2">
            <div className="relative flex w-full flex-col items-center justify-center gap-1 lg:min-h-32 lg:flex-row lg:gap-0">
              <Image
                src="/images/logo.png"
                alt="Logo Lalu Lintas, Provinsi Kepulauan Bangka Belitung, Jasa Raharja"
                width={1384}
                height={490}
                priority
                className="static h-12 w-auto sm:h-14 lg:absolute lg:left-4 lg:top-1/2 lg:h-20 lg:-translate-y-1/2 xl:h-32"
              />

              <Image
                src="/images/title.png"
                alt="Apresiasi Emas"
                width={1536}
                height={248}
                priority
                className="h-auto w-[min(80vw,32rem)] lg:w-[min(60vw,32rem)]"
              />
            </div>

            <PrizeBanner />
          </header>

          <main className="flex min-h-0 flex-1 flex-col gap-2 p-4">
            <DrawStage />

            <div className="flex justify-center pb-1">
              <DrawActionButton />
            </div>
          </main>

          <ControlsBar />
        </div>
      </div>
    </DrawProvider>
  );
}
