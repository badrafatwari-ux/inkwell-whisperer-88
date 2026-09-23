export const NAME_LISTS = {
  "First names": [
    "Amelia","Rowan","Iris","Theodore","Nadia","Caleb","Freya","Mateo","Sienna","Jonas",
    "Delphine","Arthur","Noor","Elias","Wren","Tobias","Marisol","Hugo","Cleo","Ansel",
    "Priya","Oskar","Leona","Idris","Juniper","Rafael","Halle","Emeric",
  ],
  "Last names": [
    "Vance","Holloway","Okafor","Bramble","Castellan","Nakamura","Ferreira","Ashcroft","Lindqvist","Duarte",
    "Marchetti","Bell","Osei","Kovac","Whitlock","Sarkar","Delacroix","Grimsby","Navarro","Petrov",
    "Kingsley","Amari","Thornbury","Ruiz",
  ],
  "Fantasy names": [
    "Aelric","Thessaly","Morwen","Kaelith","Bryndis","Vaelor","Ysolde","Draven","Ellowyn","Tharek",
    "Nimriel","Corvane","Sylvara","Grimhold","Aureth","Marokai","Fenwyn","Ozrik",
  ],
  "Sci-fi names": [
    "Vex-9","Orin Kade","Lyra Sol","Dr. Anix","Kessler-7","Nova Rhen","Tal Ossian","Cyra Voss","Jarek Lum","Echo Rey",
    "Sabien Ark","Mirren Tal","Hux Vanterra","Zola Prime","Ivo Serrano","Quill Anser",
  ],
  "Place names": [
    "Greyhaven","Port Aldys","Silverbrook","Mount Tessen","Ashfall","Lowmere","Carrowgate","Dunhollow",
    "New Solace","Vermillion Bay","Thornfield","Oldwater","Kestrel Point","Havenreach","Emberdown","Northlight",
  ],
} as const;

export type NameListKey = keyof typeof NAME_LISTS;
export const NAME_LIST_KEYS = Object.keys(NAME_LISTS) as [NameListKey, ...NameListKey[]];

export function randomName(key: NameListKey, count = 5): string[] {
  const list: string[] = [...NAME_LISTS[key]];
  const out: string[] = [];
  for (let i = 0; i < count && list.length; i++) {
    const [picked] = list.splice(Math.floor(Math.random() * list.length), 1);
    if (picked) out.push(picked);
  }
  return out;
}
