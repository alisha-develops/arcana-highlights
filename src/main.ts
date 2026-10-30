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
    xPercent: -25 
});

const intro = gsap.timeline({ onComplete: () => {locked = false;} });
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
  .call(() => { 
        cover.classList.add("flipped"); current = 1; 
    }, [],"+=1.5")
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