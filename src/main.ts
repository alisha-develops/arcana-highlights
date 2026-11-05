import "./style.sass";
import {gsap} from "gsap";

const spread = document.querySelector<HTMLElement>(".bookspread")!;
const leaves = document.querySelectorAll<HTMLElement>(".leaf");
const cover = leaves[0]!;
let current = 0;
let locked = true;

const readingTimes: Record<number, number> = {
    1: 800,
    2: 21000,
    4: 10000
};

let autoTurn!: gsap.core.Tween;
let hasAutoTurn = false;

spread.style.setProperty("--total", String(leaves.length));
leaves.forEach((leaf, i) => leaf.style.setProperty("--i", String(i + 1)));

gsap.set(spread, { 
    xPercent: -25 ,
    transformOrigin: "75% 50%"
});

document.body.style.overflow = "hidden";
const intro = gsap.timeline({
    paused: true,
    onComplete: () => {
        locked = false;
        document.body.style.overflow = "";
        updatePage();
        playSpreadOne();
    }
});

intro
    .from(spread, { 
        y: "-100vh", 
        duration: 1.2, 
        ease: "bounce.out",
        onStart: lift,
        onComplete: drop
    })
    .from(spread, { 
        rotation: -8,  
        duration: 0.9, 
        ease: "power2.out" 
    }, "<")
    .to (spread, {
        scale: 1.8, 
        transformOrigin: "75% 0%",
        duration: 1.2, 
        ease: "power1.inOut",
        onStart: lift,
        onComplete: drop
    }, "+=1")
    .to (spread, {
        y: -300, 
        duration: 0.8, 
        ease: "power1.inOut",
        onStart: lift,
        onComplete: drop
    },"+=0.5")
    .to (spread, {
        scale: 1,
        y: 0,
        duration: 1, 
        ease: "power2.inOut",
        onStart: lift,
        onComplete: drop
    },"+=1.4")
    .call(() => { 
        cover.classList.add("turning", "flipped");
        current = 1;
        gsap.delayedCall(1, () => cover.classList.remove("turning"));
    }, [],"+=1")
    .to(spread, { 
        xPercent: 0, 
        duration: 1,  
        ease: "power2.inOut",
        onStart: lift,
        onComplete: drop
    }, "<");

function scheduleNextPage() {
    if (hasAutoTurn) {
        autoTurn.kill();
        hasAutoTurn = false;
    }

    if (locked) return;
    if (location.hash === "#dev") return;
    if (current >= leaves.length) return;

    let readingTime = readingTimes[current];
    if (readingTime === undefined) {
        readingTime = 10000;
    }

    const delay = readingTime / 1000;

    autoTurn = gsap.delayedCall(delay, () => {
        nextPage();
    });
    hasAutoTurn = true;
}

import introFile from "../audio/intro.mp3";

const introSfx = new Audio(introFile);
introSfx.preload = "auto";
introSfx.volume = 1;

intro.call(() => {
    if (location.hash === "#dev") return;
    introSfx.currentTime = 0;
    introSfx.play().catch(console.error);
}, [], 0);

const introScreen = document.querySelector<HTMLElement>(".intro")!;
const enter = document.getElementById("enter") as HTMLButtonElement;
const paragraphs = gsap.utils.toArray<HTMLParagraphElement>(".intro p");
const typingIntro = gsap.timeline({
    onComplete: () => {
        enter.disabled = false;
    }
});

gsap.set([...paragraphs, enter], { autoAlpha: 0 });
paragraphs.forEach((p, i) => {
    const text = p.textContent!.trim();
    const chars = { count: 0 };

    p.textContent = "";

    typingIntro
        .set(p, { autoAlpha: 1 })
        .to(chars, {
            count: text.length,
            duration: text.length * 0.03,
            ease: "none",
            onUpdate: () => {
                p.textContent = text.slice(0, Math.round(chars.count));
            }
        })
        .to({}, { duration: 1.5 });
    if (i !== paragraphs.length - 1) {
        typingIntro.to(p, {
            autoAlpha: 0,
            duration: 0.6
        });
    }
});

typingIntro.to(enter, {
    autoAlpha: 1,
    duration: 0.8
});

import bgmFile from "../audio/super-trouper-full.mp3";
const bgm = new Audio(bgmFile);
bgm.preload = "auto";
bgm.loop = true;
bgm.volume = 0.4;

enter.addEventListener("click", async () => {
    bgm.play().catch((err) => console.error(err));

    await document.fonts.ready;

    gsap.to(introScreen, {
        opacity: 0,
        duration: 0.8,
        onComplete: () => {
            introScreen.remove();

            gsap.set(spread, { visibility: "visible" });
            intro.restart();
        }
    });
}, { once: true });

const stage = document.querySelector<HTMLElement>(".bookstage")!;
const PAGE_WIDTH = 360;
const PAGE_HEIGHT = 400;

function resizeBook() {
    const availableWidth = document.documentElement.clientWidth*0.92;
    const availableHeight = document.documentElement.clientHeight*0.85;
    const scaleX = availableWidth / (PAGE_WIDTH*2);
    const scaleY = availableHeight/ PAGE_HEIGHT;
    const scale = Math.min(scaleX, scaleY, 1);
    stage.style.setProperty("--book-scale", String(scale));
}
resizeBook();
window.addEventListener("resize", resizeBook);

let isAnimating = false;

function updatePage() {
    syncVideos();
    syncVoice();
    if (current === 3) playNightSlideshow();
    else stopNight();
}

function nextPage() {
    if (locked) return;
    if (isAnimating) return;
    if (current >= leaves.length) return;

    if (hasAutoTurn) {
        autoTurn.kill();
        hasAutoTurn = false;
    }

    isAnimating = true;

    const leaf = leaves[current]!;
    leaf.classList.add("turning", "flipped");
    current++;

    gsap.delayedCall(1, () => {
        leaf.classList.remove("turning");
        isAnimating = false;
        updatePage();
        scheduleNextPage();
    });
}

function previousPage() {
    if (locked) return;
    if (isAnimating) return;
    if (current <= 1) return;

    if (hasAutoTurn) {
        autoTurn.kill();
        hasAutoTurn = false;
    }

    isAnimating = true;

    current--;
    const leaf = leaves[current]!;
    leaf.classList.add("turning");
    leaf.classList.remove("flipped");

    gsap.delayedCall(1, () => {
        leaf.classList.remove("turning");
        isAnimating = false;
        updatePage();
        scheduleNextPage();
    });
}
document.addEventListener("keydown", function(event) {
    if (event.key === "ArrowRight") {
        nextPage();
    }

    if (event.key === "ArrowLeft") {
        previousPage();
    }
});

// document.getElementById("nextspread")!.addEventListener("click", nextPage);
// document.getElementById("prevspread")!.addEventListener("click", previousPage);

function syncVideos() {
    document.querySelectorAll<HTMLVideoElement>("video").forEach((v) => {
        if (v.dataset.spread === String(current)) v.play().catch(() => {});
        else v.pause();
    });
}

import voiceFile from "../audio/layover-doha.mp3";
import changiairport1 from "../audio/changiairport1.mp3";
import elevator2 from "../audio/elevator2.mp3";
import yapkhi from "../audio/yapboutkhi.mp3";
import topup from "../audio/topupmachine.mp3";
import outside from "../audio/outoftheairport.mp3";
import sky from "../audio/sky.mp3";
import ingrab2 from "../audio/ingrab1.mp3";

const NIGHT_VOICE_VOL = 1;
const nightClips = [changiairport1, elevator2, yapkhi, topup, outside, sky, ingrab2].map((src) => {
    const a = new Audio(src);
    a.preload = "auto";
    a.volume = NIGHT_VOICE_VOL;
    return a;
});

let nightTl!: gsap.core.Timeline;
let nightRunning = false

function stopNight() {
    if (!nightRunning) return;
    nightTl.kill();
    nightRunning = false;
    nightClips.forEach((a) => { a.pause(); a.currentTime = 0; });
    duck(false);
    locked = false;
    drop();
}

const voice = new Audio(voiceFile);
voice.preload = "auto";

const BGM_VOL = 0.6;
const DUCK_VOL = 0.12; 

function duck(on: boolean) {
    gsap.to(bgm, { volume: on ? DUCK_VOL : BGM_VOL, duration: 0.3, overwrite: "auto" });
}

voice.addEventListener("play", () => duck(true));
voice.addEventListener("pause", () => {
    if (!nightRunning) duck(false);
});
voice.addEventListener("ended", () => {
    if (!nightRunning) duck(false);
});
introSfx.addEventListener("play", () => duck(true));
introSfx.addEventListener("ended", () => {
    if (!nightRunning) duck(false);
});
function lift() {
    spread.style.willChange = "transform";
}
function drop() {
    spread.style.willChange = "auto";
}

function syncVoice() {
    if (current === 2) {
        voice.play().catch(console.error);
    } else {
        voice.pause();
        voice.currentTime = 0;
    }
}

const HALF = PAGE_WIDTH/2

function playSpreadOne() {
    if (location.hash === "#dev") {
        locked = false;
        updatePage();
        return;
    }

    locked = true;
    const Z = 1.5;
    gsap.set(spread, { 
        transformOrigin: "50% 50%" 
    });

    gsap.timeline({
        onComplete: () => { 
            locked = false; 
            updatePage(); 
            scheduleNextPage();
        }
    })
    .to(spread, { 
        scale: Z, 
        x: HALF * Z,
        duration: 1.1, 
        ease: "power2.inOut",
        onStart: lift,
        onComplete: drop
    })
    .to(spread, { 
        x: -HALF * Z, 
        duration: 1.2, 
        ease: "power2.inOut",
        onStart: lift,
        onComplete: drop
    }, "+=1.2") 
    .to(spread, { 
        scale: 1, 
        x: 0, 
        duration: 1, 
        ease: "power2.inOut",
        onStart: lift,
        onComplete: drop
    }, "+=1.2")
}

import nightText from "./subs.txt?raw";
const nightImages = gsap.utils.toArray<HTMLImageElement>(".night-frame img");
const nightCaption = document.querySelector<HTMLElement>(".night-photo figcaption")!;
const nightSubs = document.querySelector<HTMLElement>(".night-subs")!;

const nightLines = nightText
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line !== "");

const nightCaptions: string[] = [];
const nightSubtitles: string[] = [];

for (let i = 0; i < nightLines.length; i += 2) {
    const caption = nightLines[i];
    const subtitle = nightLines[i + 1];
    if (caption !== undefined) nightCaptions.push(caption);
    if (subtitle !== undefined) nightSubtitles.push(subtitle);
}
const nightTiming = [
    { lead: 0.3, tail: 0.4 }, 
    { lead: 0.2, tail: 0.3 }, 
    { lead: 0.2, tail: 0.3 },
    { lead: 0.2, tail: 0.3 },
    { lead: 0.2, tail: 0.3 },
    { lead: 0.2, tail: 0.3 }, 
    { lead: 0.2, tail: 0.5 },
];
const nightLengths = [14, 13, 11, 10, 8, 4, 12];


function playNightSlideshow() {
    if (nightRunning) return;
    if (!nightImages.length) return;

    locked = true;
    duck(true);

    gsap.set(nightImages, { autoAlpha: 0 });
    gsap.set(nightSubs, { autoAlpha: 1 });
    gsap.set([".night-hotel", ".night-hotel-note"], {
        autoAlpha: 0
    });

    gsap.set(spread, {
        scale: 1,
        x: 0,
        y: 0,
        transformOrigin: "50% 50%"
    });

    const tl = gsap.timeline({
        onComplete: () => {
            nightRunning = false;
            duck(false);
            locked = false;
            scheduleNextPage();
        }
    });

    nightTl = tl;
    nightRunning = true;

    nightImages.forEach((img, index) => {
        let subtitle = "";
        const sub = nightSubtitles[index];
        if (sub !== undefined) subtitle = sub;

        let caption = "";
        const cap = nightCaptions[index];
        if (cap !== undefined) caption = cap;

        let lead = 0;
        let tail = 0.1;
        const timing = nightTiming[index];

        if (timing !== undefined) {
            lead = timing.lead;
            tail = timing.tail;
        }

        const clip = nightClips[index];
        let clipLength = 10;
        const known = nightLengths[index];

        if (known !== undefined) clipLength = known;

        const chars = { count: 0 };
        const talk = Math.max((clipLength - lead - tail) * 0.85, 0.5);
        const rest = Math.max(clipLength - lead - talk - 0.2, 0) + 0.3;

        tl.call(() => {
            nightCaption.textContent = caption;
            nightSubs.textContent = "";

            if (clip !== undefined) {
                clip.play().catch(console.error);
            }
        });

        tl.to(img, {
            autoAlpha: 1,
            duration: 0.5,
            ease: "power1.inOut"
        });

        const previousImage = nightImages[index - 1];

        if (previousImage !== undefined) {
            tl.to(previousImage, {
                autoAlpha: 0,
                duration: 0.5,
                ease: "power1.inOut"
            }, "<");
        }

        tl.to(chars, {
            count: subtitle.length,
            duration: talk,
            ease: "none",
            onUpdate: () => {
                nightSubs.textContent = subtitle.slice(
                    0,
                    Math.round(chars.count)
                );
            }
        }, `<+=${lead}`);

        tl.to({}, { duration: rest });

        tl.to(nightSubs, {
            autoAlpha: 0,
            duration: 0.2
        });

        tl.set(nightSubs, { autoAlpha: 1 });
    });
    const ZOOM_START = 1;
    tl.to(spread, {
        scale: 2.5,
        x: 390,
        duration: 1.5,
        ease: "power2.inOut",
        transformOrigin: "50% 50%",
        onStart: lift,
        onComplete: drop
    }, ZOOM_START);
    tl.to([".night-hotel", ".night-hotel-note"], {
        autoAlpha: 1,
        duration: 0.2,
        ease: "power1.out"
    });
    tl.to(spread, {
        y: -200,
        duration: 1,
        ease: "power2.inOut",
        onStart: lift,
        onComplete: drop
    });
    tl.to({}, { duration: 0.5 });
    tl.to(spread, {
        scale: 1,
        x: 0,
        y: 0,
        duration: 3,
        ease: "power2.inOut",
        transformOrigin: "50% 50%",
        onStart: lift,
        onComplete: drop
    });
}

document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
        if (nightRunning) {
            nightTl.pause();
            nightClips.forEach((a) => a.pause());
        }
        voice.pause();
    } else {
        if (nightRunning) {
            nightTl.resume();
            nightClips.forEach((a) => {
                if (a.currentTime > 0 && !a.ended) a.play().catch(console.error);
            });
        }
        if (current === 2 && voice.currentTime > 0 && !voice.ended) {
            voice.play().catch(console.error);
        }
    }
});

if (location.hash === "#dev") {
    typingIntro.kill();
    introScreen.remove();
    gsap.set(spread, { visibility: "visible" });
    intro.progress(1, false);

    leaves[1]!.classList.add("flipped");
    leaves[2]!.classList.add("flipped");
    current = 3;
    updatePage();
}