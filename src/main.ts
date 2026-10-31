import "./style.sass";
import {gsap} from "gsap";

const spread = document.querySelector<HTMLElement>(".bookspread")!;
const leaves = document.querySelectorAll<HTMLElement>(".leaf");
const cover = leaves[0]!;
let current = 0;
let locked = true;

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
        cover.classList.add("flipped"); current = 1; 
    }, [],"+=1")
    .to(spread, { 
        xPercent: 0, duration: 1,  
        ease: "power2.inOut" 
    }, "<");

const bgm = new Audio("../audio/super-trouper-cut.mp3");
bgm.preload = "auto";
bgm.loop = true;
bgm.volume = 0.4;

const introScreen = document.querySelector<HTMLElement>(".intro")!;
const enter = document.getElementById("enter")!;
const fontReady = document.fonts.load('1em "datbox"');

enter.addEventListener("click", async () => {
    bgm.play().catch((err) => console.error(err));
    await fontReady;
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