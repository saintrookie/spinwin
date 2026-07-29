import fs from "node:fs";
import path from "node:path";
import Image from "next/image";
import { DrawProvider } from "@/context/draw-context";
import { PrizeBanner } from "@/components/draw/prize-banner";
import { DrawStage } from "@/components/draw/draw-stage";
import { DrawActionButton } from "@/components/draw/draw-action-button";
import { ControlsBar } from "@/components/draw/controls-bar";
import { cn } from "@/lib/utils";

const LOGO_EXTENSIONS = /\.(png|jpe?g|webp|svg)$/i;

function getLogoFiles() {
  const dir = path.join(process.cwd(), "public", "images", "logo");
  return fs
    .readdirSync(dir)
    .filter((file) => LOGO_EXTENSIONS.test(file))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
}

export default function Home() {
  const logoFiles = getLogoFiles();

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

        {/* Floating pembina image, anchored to the bottom-right corner */}
        <Image
          src="/images/pembina.png"
          alt="Tim Pembina Samsat Bangka Belitung"
          width={1533}
          height={1042}
          className="floating-card pointer-events-none absolute right-3 bottom-28 z-20 hidden w-[18.63rem] drop-shadow-xl sm:block lg:bottom-3 lg:w-[24.84rem]"
        />

        {/* Content */}
        <div className="relative z-10 flex h-full flex-col">
          <header className="flex flex-col items-center gap-2 px-4 pt-2">
            <div className="relative flex w-full flex-col items-center justify-center gap-1 lg:min-h-32 lg:flex-row lg:gap-0">
              <div className="static flex items-center justify-center gap-2 sm:gap-3 lg:absolute lg:left-4 lg:top-1/2 lg:-translate-y-1/2 lg:gap-4">
                {logoFiles.map((file) => (
                  <div
                    key={file}
                    className={cn(
                      "flex items-center justify-center",
                      file === "3.png"
                        ? "h-[4.59rem] w-[4.59rem] sm:h-[5.51rem] sm:w-[5.51rem] lg:h-[7.34rem] lg:w-[7.34rem] xl:h-[9.18rem] xl:w-[9.18rem]"
                        : "h-12 w-12 sm:h-[3.6rem] sm:w-[3.6rem] lg:h-[4.8rem] lg:w-[4.8rem] xl:h-24 xl:w-24"
                    )}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element -- dynamic folder listing, dimensions unknown ahead of time */}
                    <img
                      src={`/images/logo/${file}`}
                      alt="Logo mitra penyelenggara"
                      className="h-full w-full object-contain"
                    />
                  </div>
                ))}
              </div>

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
