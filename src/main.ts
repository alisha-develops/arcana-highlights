import "./style.sass";

const spread = document.querySelector<HTMLElement>(".bookspread")!;
const leaves = document.querySelectorAll<HTMLElement>(".leaf");
let current = 0;

spread.style.setProperty("--total", String(leaves.length));
leaves.forEach((leaf, i) => leaf.style.setProperty("--i", String(i + 1)));

document.getElementById("nextspread")!.addEventListener("click", () => {
    const leaf = leaves[current];
    if (!leaf) return;
    leaf.classList.add("flipped");
    current++;
});

document.getElementById("prevspread")!.addEventListener("click", () => {
    const leaf = leaves[current-1];
    if (!leaf) return;
    leaf.classList.remove("flipped");
    current--;
})