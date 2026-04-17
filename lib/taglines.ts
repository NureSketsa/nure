// FILE LOCATION: lib/taglines.ts
export const taglines = [
    "Navigate your own universe",
    "Never stop, never settle",
    "Nothing is unreachable",
    "Now is the only moment",
    "No darkness lasts forever",
    "Nightfall always ends",
    "Nebulae are born from chaos",
    "Not all who drift are lost",
    "New stars are forged under pressure",
    "Nothing in space stands still",
    "Nourish what matters",
    "Note the small victories",
    "Noble effort, every day",
    "Now, begin",
    "Nure — light in the void",
    "Never let the stars go dark",
    "No gravity can hold ambition",
    "Night is just a canvas",
    "Novelty is the fuel of growth",
    "Name your purpose, chase it",
    "No orbit is accidental",
    "Nurture the fire within",
    "Not yet done. Keep going.",
    "Nowhere to go but forward",
    "Notice beauty in the ordinary",
    "Never mistake stillness for surrender",
    "New day, new trajectory",
    "Nothing great was built in comfort",
    "Now is when it starts",
    "Nure burns brightest in the dark",
]

export function getDailyTagline(): string {
    const dayOfYear = Math.floor(
        (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000
    )
    return taglines[dayOfYear % taglines.length]
}