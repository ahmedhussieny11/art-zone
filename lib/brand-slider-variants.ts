import type { BrandSliderAnimation, BrandSliderParallax } from "@/lib/data";
import type { Transition, Variants } from "framer-motion";

const easeLux = [0.33, 0, 0.2, 1] as const;
const tweenLux: Transition = { duration: 1.05, ease: easeLux };
const tweenFast: Transition = { duration: 0.65, ease: easeLux };

export function parallaxFactors(parallax: BrandSliderParallax): { rx: number; ry: number } {
  switch (parallax) {
    case "off":
      return { rx: 0, ry: 0 };
    case "low":
      return { rx: 3, ry: 2 };
    case "medium":
      return { rx: 6, ry: 4 };
    case "high":
      return { rx: 11, ry: 7 };
    default:
      return { rx: 6, ry: 4 };
  }
}

export function slideVariantsFor(
  animation: BrandSliderAnimation,
  reduceMotion: boolean
): { variants: Variants; transition: Transition } {
  if (reduceMotion) {
    return {
      variants: {
        enter: { opacity: 0 },
        center: { opacity: 1 },
        exit: { opacity: 0 },
      },
      transition: { duration: 0.35 },
    };
  }

  switch (animation) {
    case "fade":
      return {
        variants: {
          enter: { opacity: 0, y: 28 },
          center: { opacity: 1, y: 0 },
          exit: { opacity: 0, y: -18 },
        },
        transition: tweenFast,
      };

    case "slide":
      return {
        variants: {
          enter: (d: number) => ({ opacity: 0, x: d >= 0 ? "18%" : "-18%", rotateY: 0 }),
          center: { opacity: 1, x: 0 },
          exit: (d: number) => ({ opacity: 0, x: d >= 0 ? "-14%" : "14%", rotateY: 0 }),
        },
        transition: tweenFast,
      };

    case "zoom":
      return {
        variants: {
          enter: { opacity: 0, scale: 0.88 },
          center: { opacity: 1, scale: 1 },
          exit: { opacity: 0, scale: 1.06 },
        },
        transition: { type: "spring", stiffness: 120, damping: 22 },
      };

    case "blur":
      return {
        variants: {
          enter: (d: number) => ({
            opacity: 0,
            x: d >= 0 ? "6%" : "-6%",
            filter: "blur(14px)",
            scale: 0.98,
          }),
          center: { opacity: 1, x: 0, filter: "blur(0px)", scale: 1 },
          exit: (d: number) => ({
            opacity: 0,
            x: d >= 0 ? "-5%" : "5%",
            filter: "blur(10px)",
            scale: 1.02,
          }),
        },
        transition: tweenFast,
      };

    case "soft3d":
    default:
      return {
        variants: {
          enter: (d: number) => ({
            opacity: 0,
            x: d >= 0 ? "4.5%" : "-4.5%",
            scale: 0.985,
            rotateY: d >= 0 ? 7 : -7,
            filter: "brightness(0.92)",
          }),
          center: { opacity: 1, x: 0, scale: 1, rotateY: 0, filter: "brightness(1)" },
          exit: (d: number) => ({
            opacity: 0,
            x: d >= 0 ? "-3.5%" : "3.5%",
            scale: 1.01,
            rotateY: d >= 0 ? -5 : 5,
            filter: "brightness(0.88)",
          }),
        },
        transition: tweenLux,
      };
  }
}
