import "./style.sass";

const spread = document.querySelector<HTMLElement>(".bookspread")!;
const leaves = document.querySelectorAll<HTMLElement>(".leaf");
let current = 0;

spread.style.setProperty("--total", String(leaves.length));
leaves.forEach((leaf, i) => leaf.style.setProperty("--i", String(i + 1)));

document.getElementById("nextspread")!.addEventListener("click", () => {
    if (current>=leaves.length) return;
    leaves[current].classList.add("flipped");
    current++;
})