import "./style.sass";
import {gsap} from "gsap";

const spread = document.querySelector<HTMLElement>(".bookspread")!;
const leaves = document.querySelectorAll<HTMLElement>(".leaf");
const cover = leaves[0]!;
let current = 0;
let locked = true;

const readingTimes: Record<number, number> = {
    1: 800,
    2: 1000,
    3: 300,
    4: 500,
    5: 1000,
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
    preloadNextVideos();

    if (current === 2) {
    locked = true;

        gsap.timeline({
            onComplete: () => {
                locked = false;
                scheduleNextPage();
            }
        })
        .to(spread, {
            scale: 1.8,
            x: 370,
            y: 100,
            transformOrigin: "50% 50%",
            duration: 1.5,
            ease: "power2.inOut",
            onStart: lift,
            onComplete: drop
        })
        .to(spread, {
            y: -100,
            duration: 2,
            ease: "power2.inOut",
            onStart: lift,
            onComplete: drop
        }, "+=3")
        .to(spread, {
            x: -270,
            y: 100,
            duration: 2,
            ease: "power2.inOut",
            onStart: lift,
            onComplete: drop
        }, "+=3")
        .to(spread, {
            y: -100,
            duration: 2,
            ease: "power2.inOut",
            onStart: lift,
            onComplete: drop
        }, "+=3")
        .to(spread, {
            scale: 1,
            x: 0,
            y: 0,
            duration: 1.8,
            ease: "power2.inOut",
            onStart: lift,
            onComplete: drop
        }, "+=3");
    }
    if (current === 3) playNightSlideshow();
    else stopNight();
    if (current === 4) playSpreadFour();
    if (current === 5) playSpreadFive();
    if (current !== 5) gsap.set(polaroids, { autoAlpha: 0 });
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
import toVenueFile from "../audio/to-venue.mp3";
import day1 from "../audio/day1.mp3";

const dayOneVoice = new Audio(day1);
dayOneVoice.preload = "auto";
dayOneVoice.volume = 1;

const toVenueVoice = new Audio(toVenueFile);
toVenueVoice.preload = "auto";
toVenueVoice.volume = 1;

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
    toVenueVoice.pause();
    toVenueVoice.currentTime = 0;
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
dayOneVoice.addEventListener("play", () => duck(true));
dayOneVoice.addEventListener("pause", () => duck(false));
dayOneVoice.addEventListener("ended", () => duck(false));

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

    if (current === 4) {
        dayOneVoice.play().catch(console.error);
    } else {
        dayOneVoice.pause();
        dayOneVoice.currentTime = 0;
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

let spreadFourTl!: gsap.core.Timeline;

const pop = document.querySelector(".pop") as HTMLElement;
const popImg = pop.querySelector("img") as HTMLImageElement;

function popPhoto(photo: HTMLImageElement, seconds: number) {
    const tile = photo.closest("figure") as HTMLElement;
    const from = photo.getBoundingClientRect();
    const fit = Math.min(
        (innerWidth * 0.8) / photo.naturalWidth,
        (innerHeight * 0.8) / photo.naturalHeight
    );
    const width = photo.naturalWidth * fit;
    const height = photo.naturalHeight * fit;

    const small = {
        x: from.left + from.width / 2 - innerWidth / 2,
        y: from.top + from.height / 2 - innerHeight / 2,
        scale: from.width / width
    };

    popImg.src = photo.src;
    gsap.set(pop, { display: "grid" });
    gsap.set(popImg, { width: width, height: height });
    gsap.set(tile, { opacity: 0 }); 

    gsap.timeline({ defaults: { ease: "power2.inOut" } })
        .fromTo(popImg, small, { x: 0, y: 0, scale: 1, duration: 0.6 })
        .to(popImg, { ...small, duration: 0.6 }, seconds - 0.6)
        .set(tile, { opacity: 1 }, seconds)
        .set(pop, { display: "none" }, seconds);
}

function playSpreadFour() {
    locked = true;
    gsap.set(spread, { transformOrigin: "50% 50%" });

    const subsTl = gsap.timeline();
    addSubtitles(subsTl, fourLines, 44);

    const crew = document.querySelector(".friends-group-one img") as HTMLImageElement;
    const all = document.querySelector(".friends-group-two img") as HTMLImageElement;
    const me = document.querySelector(".moments-me img") as HTMLImageElement;
    const sandwich = document.querySelector(".moments-icecream-photo img") as HTMLImageElement;
    const lego = document.querySelector(".moments-lego-portrait img") as HTMLImageElement;

    spreadFourTl = gsap.timeline({
        defaults: { ease: "sine.inOut", onStart: lift, onComplete: drop },
        onComplete: () => {
            locked = false;
            scheduleNextPage();
        }
    });

        spreadFourTl
        .to(spread, { 
            scale: 1.8, 
            x: 370, 
            y: 100, 
            duration: 2 
        })
        .to(spread, { 
            y: 40, 
            duration: 3 
        })
        .call(popPhoto, [crew, 5])
        .to(spread, { 
            y: -40, 
            duration: 3 
        }, "+=5") 
        .call(popPhoto, [all, 6])
        .to(spread, { 
            y: -100, 
            duration: 3 
        }, "+=6") 
        .to(spread, { 
            x: -270, 
            y: 100, 
            duration: 3 
        }) 
        .to(spread, { 
            y: 50, 
            duration: 3 
        })
        .call(popPhoto, [me, 3])
        .to(spread, { 
            y: 0, 
            duration: 2 
        }, "+=3")
        .call(popPhoto, [sandwich, 4])
        .to(spread, { 
            y: -50, 
            duration: 2 
        }, "+=4")
        .call(popPhoto, [lego, 3])
        .to(spread, { 
            scale: 1, 
            x: 0, y: 0, 
            duration: 2 
        }, "+=3");
}

function preloadNextVideos() {
    document.querySelectorAll<HTMLVideoElement>("video").forEach((v) => {
        if (v.dataset.spread !== String(current + 1)) return;
        if (v.preload === "auto") return;
        v.preload = "auto";
        v.load();
    });
}

const spreadSubs = document.querySelector<HTMLElement>(".spread-subs")!;
const TYPE_SPEED = 35;

function addSubtitles(tl: gsap.core.Timeline, lines: string[], end: number) {
    lines.forEach((line, i) => {
        const start = Number(line.slice(0, line.indexOf(":")));
        const text = line.slice(line.indexOf(":") + 1).trim();

        let stop = end;
        const next = lines[i + 1];
        if (next !== undefined) {
            stop = Number(next.slice(0, next.indexOf(":")));
        }
        const typing = Math.max(Math.min(text.length / TYPE_SPEED, stop - start - 0.3), 0.2);
        const chars = { count: 0 };

        tl.set(spreadSubs, { autoAlpha: 1 }, start);
        tl.to(chars, {
            count: text.length,
            duration: typing,
            ease: "none",
            onUpdate: () => {
                spreadSubs.textContent = text.slice(0, Math.round(chars.count));
            }
        }, start);
        tl.set(spreadSubs, { autoAlpha: 0 }, stop);
    });
}

import nightText from "./subs.txt?raw";
const nightImages = gsap.utils.toArray<HTMLImageElement>(".night-frame img");
const nightCaption = document.querySelector<HTMLElement>(".night-photo figcaption")!;
const nightSubs = document.querySelector<HTMLElement>(".night-subs")!;

const allLines = nightText
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line !== "");

const dividerAt = allLines.indexOf("---");
const nightLines = allLines.slice(0, dividerAt);
const fourLines = allLines.slice(dividerAt + 1);
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
        x: -510,
        y: 200,
        duration: 1,
        ease: "power2.inOut",
        onStart: () => {
            lift();
            toVenueVoice.currentTime = 0;
            toVenueVoice.play().catch(console.error);
        },
        onComplete: drop
    });
    tl.to({}, { duration: 4 });
    tl.to(spread, {
        y: -200,
        duration: 1.5,
        ease: "power2.inOut",
        onStart: lift,
        onComplete: drop
    });
    tl.to({}, { duration: 2.5 });
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

let resumeList: HTMLAudioElement[] = [];

document.addEventListener("visibilitychange", () => {
    const sounds = [introSfx, voice, dayOneVoice, toVenueVoice, ...nightClips, bgm];

    if (document.hidden) {
        resumeList = sounds.filter((a) => !a.paused);
        resumeList.forEach((a) => a.pause());
        if (nightRunning) nightTl.pause();
    } else {
        if (nightRunning) nightTl.resume();
        resumeList.forEach((a) => a.play().catch(console.error));
        resumeList = [];
    }
});

const popSub = pop.querySelector(".pop-sub") as HTMLElement;
const polaroids = gsap.utils.toArray<HTMLElement>(".polaroid");
const photo_time = 6;
const spine_size = 0.7;
const shrink = 0.6;

function spinePhoto(polaroid: HTMLElement, seconds: number) {
    const photo = polaroid.querySelector("img") as HTMLImageElement;
    const from = photo.getBoundingClientRect();
    const spot = polaroid.getBoundingClientRect();
    const book = spread.getBoundingClientRect();
    const others = polaroids.filter((p) => p !== polaroid);

    let text = "";
    if (polaroid.dataset.sub !== undefined) text = polaroid.dataset.sub;

    const fit = Math.min(
        (book.width * spine_size) / photo.naturalWidth,
        (book.height * spine_size) / photo.naturalHeight
    );
    const width = photo.naturalWidth * fit;
    const height = photo.naturalHeight * fit;

    const spine = {
        x: book.left + book.width / 2 - innerWidth / 2,
        y: book.top + book.height / 2 - innerHeight / 2
    };
    const home = {
        x: from.left + from.width / 2 - innerWidth / 2,
        y: from.top + from.height / 2 - innerHeight / 2,
        scale: from.width / width
    };

    popImg.src = photo.src;
    gsap.set(pop, { 
        display: "grid" 
    });
    gsap.set(popImg, { 
        width: width, 
        height: height 
    });
    gsap.set(polaroid, { 
        opacity: 0 
    });

    popSub.style.rotate = getComputedStyle(polaroid).rotate;
    gsap.set(popSub, {
        left: spot.left,
        top: spot.top,
        width: spot.width * 0.8
    });
    popSub.textContent = "";

    const chars = {count: 0};
    const typing = Math.max(Math.min(text.length / TYPE_SPEED, seconds - 1.8), 0.2);

    const tl = gsap.timeline({ defaults: { ease: "power2.inOut" } });

    tl.fromTo(popImg, home, { 
        x: spine.x, 
        y: spine.y, 
        scale: 1, 
        duration: 0.6 
    })
    .to(others, { 
        scale: shrink, 
        duration: 0.6 
    }, 0);

    tl.set(popSub, { 
        autoAlpha: 1 
    }, 0.6);
    tl.to(chars, {
        count: text.length,
        duration: typing,
        ease: "none",
        onUpdate: () => {
            popSub.textContent = text.slice(0, Math.round(chars.count));
        }
    }, 0.6);

    tl.set(popSub, {
         autoAlpha: 0 
        }, seconds - 0.6);
    tl.to(popImg, { 
        ...home, 
        duration: 0.6 
    }, seconds - 0.6);
    tl.to(others, { 
        scale: 1, 
        duration: 0.6
    }, seconds - 0.6);
    tl.set(polaroid, { 
        opacity: 1 
    }, seconds);
    tl.set(pop, { 
        display: "none" 
    }, seconds);
}

function playSpreadFive() {
    locked = true;
    gsap.set(polaroids, { 
        autoAlpha: 0, 
        y: -30 
    });

    const tl = gsap.timeline({
        onComplete: () => {
            locked = false;
            scheduleNextPage();
        }
    });
    tl.to(polaroids, {
        autoAlpha: 1,
        y: 0,
        duration: 0.6,
        stagger: 0.4,
        ease: "back.out(1.4)"
    }, 0.5);

    let time = 3.5;
    polaroids.forEach((polaroid) => {
        tl.call(spinePhoto, [polaroid, photo_time], time);
        time += photo_time + 0.4;
    });

    tl.to({}, { 
        duration: 0.1 
    }, time);
}

if (location.hash === "#dev") {
    typingIntro.kill();
    introScreen.remove();
    gsap.set(spread, { visibility: "visible" });
    intro.progress(1, false);

    leaves[1]!.classList.add("flipped");
    leaves[2]!.classList.add("flipped");
    leaves[3]!.classList.add("flipped");
    leaves[4]!.classList.add("flipped");
    current = 5;
    updatePage();
}