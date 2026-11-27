import "./style.sass";
import {gsap} from "gsap";
import emailjs from "@emailjs/browser";

const spread = document.querySelector<HTMLElement>(".bookspread")!;
const leaves = document.querySelectorAll<HTMLElement>(".leaf");
const cover = leaves[0]!;
let current = 0;
let locked = true;

const readingTimes: Record<number, number> = {
    1: 500,
    2: 1000,
    3: 300,
    4: 500,
    5: 500,
    6: 800,
    7: 300,
    8: 300,
    9: 1500,
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
    if (voiceChainActive) {
        voiceWaiter = scheduleNextPage;
        return;
    }

    let readingTime = readingTimes[current];
    if (readingTime === undefined) {
        readingTime = 10000;
    }

    const delay = readingTime / 1000;

    autoTurn = gsap.delayedCall(delay, () => {
        if (current >= leaves.length) closebook();
        else nextPage();
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
import bgmTwoFile from "../audio/end-of-beginning.mp3";

const songs = [bgmFile, bgmTwoFile];
let songIndex = 0;

const bgm = new Audio(bgmFile);
bgm.preload = "auto";
bgm.loop = false;
bgm.volume = 0.4;

bgm.addEventListener("ended", () => {
    songIndex += 1;
    if (songIndex >= songs.length) songIndex = 0;
    bgm.src = songs[songIndex]!;
    bgm.play().catch(console.error);
});

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
    if (current === 6) playSpreadSix();
    if (current !== 6) gsap.set(envphotos, { autoAlpha: 0 });
    if (current === 7) playSpreadSeven();
    if (current !== 7) gsap.set([ppstamps, ppitems, ppcap], { autoAlpha: 0 });
    if (current === 8) playSpreadEight();
    if (current !== 8) gsap.set(eightItems, { autoAlpha: 0 });
    if (current === 9) playSpreadNine();
    if (current !== 9) gsap.set(lastStamp, { autoAlpha: 0 });
}

function nextPage() {
    if (locked) return;
    if (isAnimating) return;
    if (current >= leaves.length) {
        closebook();
        return;
    }

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

let bookclosed = false;

function closebook() {
    if (bookclosed) return;
    bookclosed = true;
    locked = true;
    
    if (hasSpreadNine) {
        spreadNineTl.kill();
        hasSpreadNine = false;
    }
    gsap.to(spread, { 
        scale: 1, 
        x: 0, 
        y: 0, 
        duration: 0.6, 
        ease: "power2.inOut" 
    });

    if (hasAutoTurn) {
        autoTurn.kill();
        hasAutoTurn = false;
    }

    gsap.set(spread, {
        transformOrigin: "50% 50%"
    });
    const tl = gsap.timeline();
    tl.call(() => {
        current = 0;
        updatePage();
    }, [], 0.3);

    let time = 0.5;
    for (let i = leaves.length - 1; i >= 0; i--) {
        const leaf = leaves[i]!;
        tl.call(() => {
            leaf.classList.add("turning");
            leaf.classList.remove("flipped");
        }, [], time);
        tl.call(() => {
            leaf.classList.remove("turning");
        }, [], time + 1);
        time += 0.25;
    }
    tl.to(spread, {
        xPercent: -25,
        duration: 1,
        ease: "power2.inOut",
        onStart: lift,
        onComplete: drop
    }, time - 0.25);
    tl.to(guestbook, {
        autoAlpha: 1,
        duration: 1
    }, time + 1);
    // tl.to(bgm, {
    //     volume: 0,
    //     duration: 3,
    //     onComplete: () => {
    //         bgm.pause();
    //     }
    // }, time);
}

// document.getElementById("nextspread")!.addEventListener("click", nextPage);
// document.getElementById("prevspread")!.addEventListener("click", previousPage);

function syncVideos() {
    document.querySelectorAll<HTMLVideoElement>("video").forEach((v) => {
        if (v.dataset.spread === String(current)) v.play().catch(() => {});
        else v.pause();
    });
}


import voiceFile from "../audio/layover-doha.mp3";
import nightVoiceFile from "../audio/spread3-1.mp3";
import toVenueFile from "../audio/spread3-2.mp3";
import day1 from "../audio/spread4-1.mp3";
import spread7Vo from "../audio/spread7-1.mp3";
import spread8Vo from "../audio/spread8-1.mp3";
import spread9Vo1 from "../audio/spread9-1.mp3";
import spread9Vo2 from "../audio/spread9-last.mp3";

const spreadVoices: Record<number, HTMLAudioElement[]> = {
    7: [new Audio(spread7Vo)],
    8: [new Audio(spread8Vo)],
    9: [new Audio(spread9Vo1), new Audio(spread9Vo2)],
};
const allSpreadVoices = Object.values(spreadVoices).flat();
allSpreadVoices.forEach((a) => (a.preload = "auto"));

const BOOK_CLOSE_AT = 40;
let voiceSpread = -1;
let voiceSubsTl!: gsap.core.Timeline;
let hasVoiceSubs = false;
let voiceChainActive = false;
let voiceWaiter = () => {};

function finishVoiceChain() {
    if (!voiceChainActive) return;
    voiceChainActive = false;
    duck(false);

    const waiter = voiceWaiter;
    voiceWaiter = () => {};
    waiter();
}

function stopSpreadVoices() {
    footerOn();
    if (hasVoiceSubs) {
        voiceSubsTl.kill();
        hasVoiceSubs = false;
    }
    voiceWaiter = () => {};
    allSpreadVoices.forEach((a) => {
        a.onended = null;
        a.ontimeupdate = null;
        a.pause();
        a.currentTime = 0;
    });
    finishVoiceChain();
}

function playSpreadVoices(n: number) {
    const clips = spreadVoices[n];
    if (!clips) return;

    voiceChainActive = true;
    duck(true);

    clips.forEach((clip, i) => {
        const next = clips[i + 1];
        if (next === undefined) {
            clip.onended = finishVoiceChain;
        } else {
            clip.onended = () => next.play().catch(finishVoiceChain);
        }
    });
    const sections = voiceLines[n];
    if (sections !== undefined) {
        footerOff();
        const subsTl = gsap.timeline();
        voiceSubsTl = subsTl;
        hasVoiceSubs = true;
        let offset = 0;
        clips.forEach((clip, i) => {
            const lines = sections[i];
            if (lines === undefined) return;
            const length = clipLength(clip, lines);
            if (n === 9) timedSubs(subsTl, lines, offset);
            else voiceSubs(subsTl, lines, length, offset);
            offset += length;
        });
        subsTl.set(spreadSubs, {
            autoAlpha: 0
        }, offset);
        subsTl.call(footerOn, [], offset);
    }
    clips[0]!.play().catch(finishVoiceChain);
    
    if (n === 9) {
        const last = clips[clips.length - 1]!;
        last.ontimeupdate = () => {
            if (last.currentTime >= BOOK_CLOSE_AT) {
                last.ontimeupdate = null;
                closebook();
            }
        };
    }
}

const dayOneVoice = new Audio(day1);
dayOneVoice.preload = "auto";
dayOneVoice.volume = 1;

const toVenueVoice = new Audio(toVenueFile);
toVenueVoice.preload = "auto";
toVenueVoice.volume = 1;

const NIGHT_VOICE_VOL = 1;
const nightClips = [nightVoiceFile].map((src) => {
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

    if (current !== voiceSpread && bookclosed === false) {
        stopSpreadVoices();
        voiceSpread = current;
        if (current !== 7) playSpreadVoices(current);
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

    let length = 35;
    if (Number.isFinite(dayOneVoice.duration)) length = dayOneVoice.duration;
    const k = length / 44;

    footerOff();
    const subsTl = gsap.timeline();
    voiceSubs(subsTl, fourLines, length);
    subsTl.set(spreadSubs, {
        autoAlpha: 0
    }, length);
    subsTl.call(footerOn, [], length);

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
        duration: 2 * k
    })
    .to(spread, {
        y: 40,
        duration: 3 * k
    })
    .call(popPhoto, [crew, 5 * k])
    .to(spread, {
        y: -40,
        duration: 3 * k
    }, "+=" + 5 * k)
    .call(popPhoto, [all, 6 * k])
    .to(spread, {
        y: -100,
        duration: 3 * k
    }, "+=" + 6 * k)
    .to(spread, {
        x: -270,
        y: 100,
        duration: 3 * k
    })
    .to(spread, {
        y: 50,
        duration: 3 * k
    })
    .call(popPhoto, [me, 3 * k])
    .to(spread, {
        y: 0,
        duration: 2 * k
    }, "+=" + 3 * k)
    .call(popPhoto, [sandwich, 4 * k])
    .to(spread, {
        y: -50,
        duration: 2 * k
    }, "+=" + 4 * k)
    .call(popPhoto, [lego, 3 * k])
    .to(spread, {
        scale: 1,
        x: 0,
        y: 0,
        duration: 2 * k
    }, "+=" + 3 * k);
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

function clipLength(clip: HTMLAudioElement, lines: string[]) {
    if (Number.isFinite(clip.duration)) return clip.duration;
    let chars = 0;
    lines.forEach((line) => {
        chars += line.length;
    });
    return chars / 15;
}

function footerOff() {
    document.body.classList.add("subs-on");
}

function footerOn() {
    document.body.classList.remove("subs-on");
}

function timedSubs(tl: gsap.core.Timeline, rows: string[], offset: number) {
    rows.forEach((row) => {
        const match = row.match(/^([\d.]+):\s*(.*)$/);
        if (match === null) return;

        const start = offset + Number(match[1]);
        const text = match[2]!;
        const chars = { count: 0 };

        tl.set(spreadSubs, {
            autoAlpha: 1
        }, start);
        tl.to(chars, {
            count: text.length,
            duration: 0.4,
            ease: "none",
            onUpdate: () => {
                spreadSubs.textContent = text.slice(0, Math.round(chars.count));
            }
        }, start);
    });
}

function voiceSubs(tl: gsap.core.Timeline, lines: string[], duration: number, offset = 0) {
    let total = 0;
    lines.forEach((line) => {
        total += line.length;
    });

    let start = offset;
    lines.forEach((line) => {
        const share = (line.length / total) * duration;
        const typing = Math.max(share * 0.85, 0.2);
        const chars = { count: 0 };

        tl.set(spreadSubs, {
            autoAlpha: 1
        }, start);
        tl.to(chars, {
            count: line.length,
            duration: typing,
            ease: "none",
            onUpdate: () => {
                spreadSubs.textContent = line.slice(0, Math.round(chars.count));
            }
        }, start);
        start += share;
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
const eightAt = allLines.indexOf("===");
const nineAt = allLines.indexOf("+++");
const nineLastAt = allLines.indexOf("***");

const nightLines = allLines.slice(0, dividerAt);
const fourLines = allLines
    .slice(dividerAt + 1, eightAt)
    .map((line) => line.replace(/^[\d.]+:\s*/, ""));
const eightLines = allLines.slice(eightAt + 1, nineAt);
const nineLines = allLines.slice(nineAt + 1, nineLastAt);
const nineLastLines = allLines.slice(nineLastAt + 1);

const voiceLines: Record<number, string[][]> = {
    8: [eightLines],
    9: [nineLines, nineLastLines],
};
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

const nightCues = [0.92, 6.93, 15.75, 21.66, 27.99, 33.15, 38.02];
const nightSpeechEnds = [6.54, 15.58, 21.07, 27.54, 32.87, 37.73, 48.58];
const NIGHT_END = 49;

let nightLengths: number[] = [];
let nightLeads: number[] = [];
let nightTalks: number[] = [];
function computeNightLengths() {
    nightLeads = [];
    nightLengths = [];
    nightTalks = [];

    const starts: number[] = [];
    for (let i = 0; i < nightCues.length; i++) {
        let lead = 0.2;
        const timing = nightTiming[i];
        if (timing !== undefined) lead = timing.lead;
        if (i === 0) lead = nightCues[0]!;

        nightLeads.push(lead);
        starts.push(nightCues[i]! - lead);
    }

    for (let i = 0; i < nightCues.length; i++) {
        let nextStart = NIGHT_END;
        if (i < nightCues.length - 1) nextStart = starts[i + 1]!;

        nightLengths.push(nextStart - starts[i]! - 0.3);
        nightTalks.push((nightSpeechEnds[i]! - nightCues[i]!) * 0.95);
    }
}

function playNightSlideshow() {
    if (nightRunning) return;
    if (!nightImages.length) return;

    locked = true;
    duck(true);
    computeNightLengths();

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

        let lead = 0.2;
        const savedLead = nightLeads[index];
        if (savedLead !== undefined) lead = savedLead;

        const clip = nightClips[index];
        let clipLength = 10;
        const known = nightLengths[index];

        if (known !== undefined) clipLength = known;

        const chars = { count: 0 };
        let talk = 1;
        const savedTalk = nightTalks[index];
        if (savedTalk !== undefined) talk = savedTalk;
        if (talk < 0.5) talk = 0.5;
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

    let venueDur = 12;
    if (Number.isFinite(toVenueVoice.duration)) venueDur = toVenueVoice.duration;
    tl.to({}, { duration: Math.max(venueDur - 6.5 - 0.5, 0.3) });
    tl.to(spread, {
        scale: 1,
        x: 0,
        y: 0,
        duration: 1.8,
        ease: "power2.inOut",
        transformOrigin: "50% 50%",
        onStart: lift,
        onComplete: drop
    });
}

let resumeList: HTMLAudioElement[] = [];

document.addEventListener("visibilitychange", () => {
    const sounds = [introSfx, voice, dayOneVoice, toVenueVoice, ...nightClips, ...allSpreadVoices, bgm];

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
    }, time - 0.4);
}

const envparts = gsap.utils.toArray<HTMLElement>(".env-back, .env-front");
const envphotos = gsap.utils.toArray<HTMLElement>(".env-photo");
const daysub = document.querySelector(".day-sub") as HTMLElement;
const day2title = document.querySelector(".day2-title") as HTMLElement;
const night2title = document.querySelector(".night2-title") as HTMLElement;
const night2bg = document.querySelector(".night2-bg") as HTMLElement;
const hold = 1.8;

function showSub(text: string) {
    daysub.textContent = text;
    gsap.fromTo(
        daysub,
        {
            autoAlpha: 0
        },
        {
            autoAlpha: 1,
            duration: 0.4
        }
    );
}

function playSpreadSix() {
    locked = true;

    gsap.set(envparts, {
        scale: 1,
        y: 0
    });
    gsap.set(envphotos, {
        autoAlpha: 0,
        y: 0,
        scale: 1,
        zIndex: 2,
        filter: "sepia(0.7) contrast(1.15) brightness(0.95)"
    });
    gsap.set(daysub, {
        autoAlpha: 0
    });
    gsap.set(day2title, {
        autoAlpha: 1
    });
    gsap.set(night2title, {
        autoAlpha: 0
    });
    gsap.set(night2bg, {
        autoAlpha: 0
    });

    const tl = gsap.timeline({
        onComplete: () => {
            locked = false;
            scheduleNextPage();
        }
    });

    let night2Started = false;
    let time = 1;
    envphotos.forEach((photo) => {
        let text = "";
        if (photo.dataset.sub !== undefined) text = photo.dataset.sub;
        if (photo.classList.contains("night") && night2Started === false) {
            night2Started = true;
            tl.to(day2title, {
                autoAlpha: 0,
                duration: 0.8
            }, time);
            tl.to(night2title, {
                autoAlpha: 1,
                duration: 0.8
            }, time + 0.4);
            tl.to(night2bg, {
                autoAlpha: 1,
                duration: 1.5
            }, time);
            time += 1.5;
        }

        tl.to(photo, {
            autoAlpha: 1,
            y: -75,
            duration: 0.7,
            ease: "power2.out"
        }, time);
        tl.set(photo, {
            zIndex: 5
        }, time + 0.7);
        tl.to(envparts, {
            scale: 0.6,
            y: 30,
            duration: 0.8,
            ease: "power2.inOut"
        }, time + 0.7);
        tl.to(photo, {
            y: -57,
            scale: 2.6,
            duration: 0.9,
            ease: "power2.inOut"
        }, time + 0.7);
        tl.call(showSub, [text], time + 1.6);
        const back = time + 1.6 + hold;
        tl.to(daysub, {
            autoAlpha: 0,
            duration: 0.3
        }, back - 0.3);
        tl.to(photo, {
            y: -75,
            scale: 1,
            duration: 0.5,
            ease: "power2.inOut"
        }, back);
        tl.to(envparts, {
            scale: 1,
            y: 0,
            duration: 0.5,
            ease: "power2.inOut"
        }, back);
        tl.set(photo, {
            zIndex: 2
        }, back + 0.5);
        tl.to(photo, {
            y: 0,
            duration: 0.4,
            ease: "power2.in"
        }, back + 0.5);
        tl.set(photo, {
            autoAlpha: 0
        }, back + 0.9);
        time = back + 0.9;
    });

    tl.to({}, {
        duration: 0.1
    }, time);
}

const emailjs_service = "service_c9dq3nz";
const emailjs_temp = "template_zqnemjh";
const emailjskey = "EWeH-zQcrukhf7SOd";
const gbForm = document.querySelector(".gb-form") as HTMLFormElement;
const gbStatus = document.querySelector(".gb-status") as HTMLElement;
const guestbook = document.querySelector(".guestbook") as HTMLElement;

gbForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const data = new FormData(gbForm);
    if (data.get("_gotcha") !== "") return;

    gbStatus.textContent = "sending...";

    try {
        await emailjs.send(
            emailjs_service,
            emailjs_temp,
            {
                name: String(data.get("name")),
                slack: String(data.get("slack")),
                message: String(data.get("message"))
            },
            { publicKey: emailjskey }
        );
        gbStatus.textContent = "sent! i'll pin it on the board soon";
        gbForm.reset();
    } catch (error) {
        gbStatus.textContent = "oops, that didn't work. try again?";
    }
});

const ppstamps = gsap.utils.toArray<HTMLElement>(".pp-stamp");
const ppitems = gsap.utils.toArray<HTMLElement>(".pp-item");
const ppcap = document.querySelector(".pp-cap") as HTMLElement;

function placeNote(item: HTMLElement) {
    const photo = item.getBoundingClientRect();
    const book = spread.getBoundingClientRect();
    const gap = 14;
    const photoX = photo.left + photo.width / 2;
    const photoY = photo.top + photo.height / 2;

    let text = "";
    if (item.dataset.note !== undefined) text = item.dataset.note;

    const wide = Math.min(innerWidth * 0.8, 560);
    const narrow = Math.min(innerWidth - photo.right - gap - 16, 300);
    const tall = Math.ceil(text.length * 10 / wide) * 22 + 40;

    let side = "top";
    let best = 99999;
    if (photo.top - gap > tall && photo.top - book.top < best) {
        side = "top";
        best = photo.top - book.top;
    }
    if (innerHeight - photo.bottom - gap > tall && book.bottom - photo.bottom < best) {
        side = "bottom";
        best = book.bottom - photo.bottom;
    }
    if (narrow > 220 && book.right - photo.right < best) {
        side = "right";
    }
    ppcap.dataset.side = side;

    let maxWidth = wide;
    if (side === "right") maxWidth = narrow;
    gsap.set(ppcap, {
        maxWidth: maxWidth,
        width: "auto"
    });
    ppcap.textContent = text;
    const width = ppcap.offsetWidth;
    ppcap.textContent = "";
    gsap.set(ppcap, {
        width: width
    });

    if (side === "right") {
        const noteLeft = photo.right + gap;
        let fit = width;
        if (noteLeft + fit > innerWidth - 16) fit = innerWidth - 16 - noteLeft;
        gsap.set(ppcap, {
            left: noteLeft,
            width: fit,
            top: photoY - 22,
            bottom: "auto",
            "--ty": "22px"
        });
        return;
    }

    const left = Math.max(16, Math.min(photoX - width / 2, innerWidth - width - 16));
    const tx = Math.max(24, Math.min(photoX - left, width - 24));
    gsap.set(ppcap, {
        left: left,
        "--tx": tx + "px"
    });
    if (side === "top") {
        gsap.set(ppcap, {
            top: "auto",
            bottom: innerHeight - (photo.top - gap)
        });
    } else {
        gsap.set(ppcap, {
            top: photo.bottom + gap,
            bottom: "auto"
        });
    }
}

function showCap(text: string) {
    ppcap.textContent = text;
}

const stamp_zoom= true;

function playSpreadSeven() {
    locked = true;

    gsap.set(spread, {
        transformOrigin: "50% 50%"
    });
    gsap.set(ppitems, {
        autoAlpha: 0,
        scale: 1,
        zIndex: 1
    });

    const tl = gsap.timeline({
        onComplete: () => {
            locked = false;
            scheduleNextPage();
        }
    });

    const stops = [
        {
            x: 360,
            y: 100,
            scale: 1.8,
            duration: 1.5
        },
        {
            x: 220,
            y: 100,
            scale: 1.8,
            duration: 1.5
        },
        {
            x: 390,
            y: -100,
            scale: 1.8,
            duration: 1.5
        },
        {
            x: 220,
            y: -100,
            scale: 1.8,
            duration: 1
        },
    ];

    const move7 = (vars: gsap.TweenVars, position: gsap.Position) => {
        tl.to(
            spread,
            {
                transformOrigin: "50% 50%",
                ease: "power2.inOut",
                onStart: lift,
                onComplete: drop,
                ...vars,
            },
            position
        );
    };

    tl.from(".pp-title", {
        y: -40,
        autoAlpha: 0,
        duration: 0.6,
        ease: "back.out(1.4)"
    }, 0.3);

    let time = 1.5;
    ppstamps.forEach((stamp, i) => {
        const s = stops[i];
        if (s === undefined) return;

        const stopItems = gsap.utils.toArray<HTMLElement>(`.pp-item[data-stop="${i + 1}"]`);
        let stampAt = time;
        if (stamp_zoom) {
            const zoomTime = s.duration * 0.7;
            move7({
                scale: s.scale,
                x: s.x,
                y: s.y,
                duration: zoomTime
            }, time);
            stampAt = time + zoomTime;
        }
        tl.fromTo(stamp, {
            scale: 2.5,
            autoAlpha: 0
        }, {
            scale: 1,
            autoAlpha: 1,
            duration: 0.35,
            ease: "power4.in"
        }, stampAt);

        const showAt = stampAt + 0.4;
        move7({
            scale: 1.1,
            x: 0,
            y: 0,
            duration: 0.8
        }, showAt);

        const dropAt = showAt + 0.3;
        tl.fromTo(stopItems, {
            y: -90,
            rotation: gsap.utils.wrap([10, -10, 8]),
            autoAlpha: 0
        }, {
            y: 0,
            rotation: 0,
            autoAlpha: 1,
            duration: 0.6,
            ease: "back.out(1.2)",
            stagger: 0.4
        }, dropAt);

        if (i === 1) {
            const dropTotal = 0.6 + 0.4 * (stopItems.length - 1);
            tl.call(() => playSpreadVoices(7), [], dropAt + dropTotal / 2);
        }

        stopItems.forEach((item) => {
            if (item instanceof HTMLVideoElement) {
                tl.call(() => {
                    item.currentTime = 0;
                    item.play().catch(() => {});
                }, [], dropAt);
            }
        });

        let noteAt = dropAt + 0.6 + 0.4 * (stopItems.length - 1) + 0.3;
        stopItems.forEach((item) => {
            let text = "";
            if (item.dataset.note !== undefined) text = item.dataset.note;

            const chars = { count: 0 };
            const typing = Math.max(text.length / TYPE_SPEED, 0.2);
            const length = typing + 1.5;

            tl.call(showCap, [""], noteAt);
            tl.call(placeNote, [item], noteAt);
            tl.set(ppcap, {
                autoAlpha: 1
            }, noteAt + 0.02);
            tl.to(chars, {
                count: text.length,
                duration: typing,
                ease: "none",
                onUpdate: () => {
                    ppcap.textContent = text.slice(0, Math.round(chars.count));
                }
            }, noteAt + 0.2);
            tl.to(ppcap, {
                autoAlpha: 0,
                duration: 0.2
            }, noteAt + length - 0.2);

            noteAt += length;
        });

        const end = noteAt + 0.2;
        if (i < ppstamps.length - 1) {
            tl.to(stopItems, {
                y: 60,
                autoAlpha: 0,
                duration: 0.5,
                ease: "power2.in"
            }, end);
        }

        time = end + 0.3;
    });

    move7({
        scale: 1,
        x: 0,
        y: 0,
        duration: 1
    }, time);
}

const eightItems = gsap.utils.toArray<HTMLElement>(".u-item");
const eight_gap = 3;
const eight_hold = 4;

function playSpreadEight() {
    locked = true;
    gsap.set(spread, {
        transformOrigin: "50% 50%"
    });
    gsap.set(eightItems, {
        autoAlpha: 0,
        y: 0
    });

    const tl = gsap.timeline({
        onComplete: () => {
            locked = false;
            scheduleNextPage();
        }
    });

    tl.from(".u-title", {
        y: -40,
        autoAlpha: 0,
        duration: 0.6,
        ease: "back.out(1.4)"
    }, 0.3);
    tl.to(spread, {
        scale: 1.4,
        x: -200,
        duration: 1.5,
        ease: "power2.inOut",
        onStart: lift,
        onComplete: drop
    }, 1);

    const stops = [1, 2, 3];
    let time = 2.5;

    const voiceDur = spreadVoices[8]![0]!.duration;
    let target = 65;
    if (Number.isFinite(voiceDur)) target = voiceDur;
    const fixed = 2.5 + 1.4 * (stops.length - 1) + 1.5;
    const flexible = (eight_gap * eightItems.length) + (eight_hold * stops.length);
    const stretch = Math.max(0.4, (target - fixed) / flexible);
    const gap = eight_gap * stretch;
    const holdTime = eight_hold * stretch;

    stops.forEach((stop, index) => {
        const group = gsap.utils.toArray<HTMLElement>(`.u-item[data-stop="${stop}"]`);

        group.forEach((item) => {
            tl.fromTo(item, {
                autoAlpha: 1,
                clipPath: "inset(0% 0% 100% 0%)",
                filter: "sepia(1) brightness(2.2) contrast(0.6)"
            }, {
                clipPath: "inset(0% 0% 0% 0%)",
                filter: "sepia(0.7) contrast(1.15) brightness(0.95)",
                duration: 1.2,
                ease: "none"
            }, time);
            time += gap;
        });

        const groupEnd = time + holdTime;

        if (index < stops.length - 1) {
            tl.to(group, {
                y: 30,
                autoAlpha: 0,
                duration: 0.6,
                ease: "power2.in"
            }, groupEnd);
            time = groupEnd + 1.4;
        } else {
            tl.to(spread, {
                scale: 1,
                x: 0,
                duration: 1.5,
                ease: "power2.inOut",
                onStart: lift,
                onComplete: drop
            }, groupEnd);
        }
    });

    if (tl.duration() > target + 0.5) {
        tl.timeScale(Math.min(tl.duration() / target, 1.5));
    }
}

const lastStamp = document.querySelector<HTMLElement>(".home-stamp")!;
const tkMain = document.querySelector<HTMLElement>(".home-ticket .ticket-main")!;
const tkStub = document.querySelector<HTMLElement>(".home-ticket .ticket-stub")!;
let spreadNineTl!: gsap.core.Timeline;
let hasSpreadNine = false;
const lastz = 1.6;
const look9 = 100;

function playSpreadNine() {
    locked = true;

    gsap.set(spread, { 
        transformOrigin: "50% 50%" 
    });
    gsap.set(lastStamp, { 
        autoAlpha: 0, 
        scale: 1 
    });
    gsap.set([tkMain, tkStub], { 
        x: 0, 
        y: 0, 
        rotation: 0 
    });

    const tl = gsap.timeline({
        onComplete: () => {
            locked = false;
            scheduleNextPage();
        }
    });
    spreadNineTl = tl;
    hasSpreadNine = true;

    let clipOne = 20.5;
    const firstDur = spreadVoices[9]![0]!.duration;
    if (Number.isFinite(firstDur)) clipOne = firstDur;

    const go = (vars: gsap.TweenVars, position: number) => {
        tl.to(spread, {
            ease: "power2.inOut",
            onStart: lift,
            onComplete: drop,
            ...vars
        }, position);
    };

    go({ 
        scale: lastz, 
        x: HALF * lastz, 
        y: look9, 
        duration: 2 
    }, 0.3);
    go({ 
        y: -look9, 
        duration: 10, 
        ease: "sine.inOut" 
    }, 3);
    go({ 
        x: -HALF * lastz, 
        y: look9, 
        duration: 2 
    }, 14);
    const cutAt = clipOne + 27;
    go({ 
        y: -look9, 
        duration: cutAt - 17.5, 
        ease: "sine.inOut" 
    }, 17);

    tl.to(tkStub, {
        rotation: 2,
        x: 2,
        duration: 0.07,
        repeat: 5,
        yoyo: true,
        ease: "none"
    }, cutAt);
    tl.to(tkStub, {
        x: 12,
        y: 30,
        rotation: 10,
        duration: 0.8,
        ease: "power2.in"
    }, cutAt + 0.5);
    tl.to(tkMain, {
        x: -5,
        rotation: -1.5,
        duration: 0.4,
        ease: "power2.out"
    }, cutAt + 0.5);
    tl.fromTo(lastStamp, {
        scale: 2.5,
        autoAlpha: 0
    }, {
        scale: 1,
        autoAlpha: 1,
        duration: 0.35,
        ease: "power4.in"
    }, clipOne + 33.6);
    go({ 
        scale: 1, 
        x: 0, 
        y: 0, 
        duration: 2.5 
    }, clipOne + 34.5);
    tl.to({}, { 
        duration: 0.1 
    }, clipOne + 38);
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
    leaves[5]!.classList.add("flipped");
    // leaves[6]!.classList.add("flipped");
    // leaves[7]!.classList.add("flipped");
    // leaves[8]!.classList.add("flipped");
    current = 6;
    updatePage();
}