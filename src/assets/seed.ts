export let seed: string = "";

document.addEventListener("DOMContentLoaded", () => {
    seed = defineSeed();
});

export function genSeed() {
    const generated_seed = `${Math.floor(Math.random() * 1000000)}`;
    seed = generated_seed;
    return generated_seed;
}

export function setSeed(seed: string) {
    const newUrl = new URL(window.location.href);
    newUrl.searchParams.set("seed", `${seed}`);
    window.history.replaceState(null, "", newUrl.toString());
}

export function defineSeed() {
    const newUrl = new URL(window.location.href);
    const seedvalue = newUrl.searchParams.get("seed");
    if (seedvalue == "0" || seedvalue == null) {
        return `${genSeed()}`;
    } else {
        setSeed(seedvalue);
        return seedvalue;
    }
}
