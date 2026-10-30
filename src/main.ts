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
        transformOrigin: "80% 25%",
        duration: 1.5, 
        ease: "power1.inOut"
    })
    .to (spread, {
        scale: 1,
        duration: 0.8, 
        ease: "power1.inOut"
    },"+=0.5")
    .to (spread, {
        scale: 2.2, 
        transformOrigin: "70% 65%",
        duration: 1, 
        ease: "power1.inOut"
    })
    .to (spread, {
        scale: 1,
        duration: 0.8, 
        ease: "power1.inOut"
    },"+=0.5")
    .call(() => { 
        cover.classList.add("flipped"); current = 1; 
    }, [],"+=1")
    .to(spread, { 
        xPercent: 0, duration: 1,  
        ease: "power2.inOut" 
    }, "<");

document.getElementById("nextspread")!.addEventListener("click", () => {
    if (locked) return;
    const leaf = leaves[current];
    if (!leaf) return;
    leaf.classList.add("flipped");
    current++;
});

document.getElementById("prevspread")!.addEventListener("click", () => {
    if (locked || current <= 1) return;
    const leaf = leaves[current - 1];
    if (!leaf) return;
    leaf.classList.remove("flipped");
    current--;
});