import "./style.sass";
import {gsap} from "gsap";

const spread = document.querySelector<HTMLElement>(".bookspread")!;
const leaves = document.querySelectorAll<HTMLElement>(".leaf");
const cover = leaves[0]!;
let current = 0;
let locked = true;

const readingTimes: Record<number, number> = {
    1: 3000,
    2: 21000,
    3: 8000,
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
        ease: "bounce.out" 
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
        ease: "power1.inOut"
    }, "+=1")
    .to (spread, {
        y: -300, 
        duration: 0.8, 
        ease: "power1.inOut"
    },"+=0.5")
    .to (spread, {
        scale: 1,
        y: 0,
        duration: 1, 
        ease: "power2.inOut"
    },"+=1.4")
    .call(() => { 
        cover.classList.add("turning", "flipped");
        current = 1;
        gsap.delayedCall(1, () => cover.classList.remove("turning"));
    }, [],"+=1")
    .to(spread, { 
        xPercent: 0, duration: 1,  
        ease: "power2.inOut" 
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

import bgmFile from "../audio/super-trouper-cut.mp3";
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
    if (current === 3) {
        playNightSlideshow();
    }
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

const voice = new Audio(voiceFile);
voice.preload = "auto";

const BGM_VOL = 0.4;
const DUCK_VOL = 0.06; 

function duck(on: boolean) {
    gsap.to(bgm, { volume: on ? DUCK_VOL : BGM_VOL, duration: 0.3, overwrite: "auto" });
}

voice.addEventListener("play", () => duck(true));
voice.addEventListener("pause", () => duck(false));
voice.addEventListener("ended", () => duck(false));
introSfx.addEventListener("play", () => duck(true));
introSfx.addEventListener("ended", () => duck(false));

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
        ease: "power2.inOut" 
    })
    .to(spread, { 
        x: -HALF * Z, 
        duration: 1.2, 
        ease: "power2.inOut" 
    }, "+=1.2") 
    .to(spread, { 
        scale: 1, 
        x: 0, 
        duration: 1, 
        ease: "power2.inOut" 
    }, "+=1.2")
}

const nightImages = gsap.utils.toArray<HTMLImageElement>(".night-frame img");
const nightCaptions = [
    "stuck at changi",
    "the elevator was scary",
    "MRT closed",
    "figuring out the top up card situation",
    "finally out of the airport",
    "the singapore sky",
    "grab to J8"
];
const nightCaption = document.querySelector<HTMLElement>(".night-photo figcaption")!;
const nightSubtitles = [
    "looking back, i probably should've just stayed at the airport and waited until morning. but obviously, i didn't know that yet. so i started making my way towards the MRT station, thinking i'd just figure everything out once i got there.",
    "it was really late, the elevator was empty, and everyone else already knew the MRT was closed. so there was just... nobody around so yeah even the elevator TERRIFIED ME",
    "i was so used to Karachi, where you can find rides running pretty much throughout the night, that it didn't even cross my mind that Singapore's MRT would actually close.",
    "then i saw this machine and thought, oh, is this where you tap your card to enter? nope. it was the top-up machine. THANKGOD i know how to read instructions",
    "after all that, i finally made it out of the airport as i wad coordinating with daamin and he said he's booking me a grab",
    "and omg look at the singapore skyyy",
    "AND GUESS WHAT?! MY PHONE AND POWERBANK DIED. i lowkey panicked but i booked a taxi on my own and boom.. there goes my 24 sgd out of the 100 i had brought with me..."
];
const nightSubs = document.querySelector<HTMLElement>(".night-subs")!;

function playNightSlideshow() {
    if (!nightImages.length) return;
    gsap.set(nightImages, { autoAlpha: 0 });

    const timeline = gsap.timeline();
    nightImages.forEach((img, index) => {
        const subtitle = nightSubtitles[index] ?? "";
        const chars = { count: 0 };
        timeline.call(() => {
            nightCaption.textContent = nightCaptions[index] ?? "";
            nightSubs.textContent = "";
        });
        timeline.to(img, {
            autoAlpha: 1,
            duration: 0.5,
            ease: "power1.inOut"
        });
        const previousImage = nightImages[index - 1];
        if (previousImage) {
            timeline.to(previousImage, {
                autoAlpha: 0,
                duration: 0.5,
                ease: "power1.inOut"
            }, "<");
        }
        timeline.to(chars, {
            count: subtitle.length,
            duration: subtitle.length * 0.035,
            ease: "none",
            onUpdate: () => {
                nightSubs.textContent = subtitle.slice(
                    0,
                    Math.round(chars.count)
                );
            }
        });
        timeline.to({}, { duration: 1.5 });
        timeline.to(nightSubs, {
            autoAlpha: 0,
            duration: 0.4
        });
        timeline.set(nightSubs, { 
            autoAlpha: 1 
        });
    });
    const hotelPhoto = document.querySelector<HTMLElement>(".night-hotel");
    const hotelNote = document.querySelector<HTMLElement>(".night-hotel-note");
    timeline.to([hotelPhoto, hotelNote], {
        autoAlpha: 1,
        duration: 0.8,
        ease: "power1.out"
    });
}

if (location.hash === "#dev") {
    typingIntro.kill();
    introScreen.remove();
    gsap.set(spread, { visibility: "visible" });
    intro.progress(1, false);

    leaves[1]!.classList.add("flipped");
    current = 2;
    updatePage();
}