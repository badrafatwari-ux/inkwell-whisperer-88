export const PROMPT_CATEGORIES = [
  "Story Ideas",
  "Character Ideas",
  "Conflict Ideas",
  "Setting Ideas",
  "Plot Twists",
  "General Writing Prompts",
] as const;

export type PromptCategory = (typeof PROMPT_CATEGORIES)[number];

export const PROMPTS: Record<PromptCategory, string[]> = {
  "Story Ideas": [
    "A character discovers something they were never supposed to see.",
    "Someone inherits a house that keeps rearranging its rooms at night.",
    "A small town agrees to forget one day of its history — and one person remembers.",
    "A letter arrives twenty years late and changes a family forever.",
    "Two strangers keep waking up with each other's memories.",
    "A retired detective is hired to find someone who was never reported missing.",
    "The last bookstore in the city receives a manuscript that predicts the future.",
    "A child's imaginary friend files a complaint about being abandoned.",
    "Every photograph in an old album shows one extra person nobody recognises.",
    "A musician realises their new song is being hummed by people who never heard it.",
    "A ferry runs one route, but sometimes arrives at a harbour that doesn't exist.",
    "Someone wins a prize they never entered, and the rules are hidden in the fine print.",
  ],
  "Character Ideas": [
    "What does your character fear more than death?",
    "What promise did your character break, and who still remembers it?",
    "What object does your character carry everywhere without explaining why?",
    "What lie does your character tell so often they now believe it?",
    "Who does your character become when nobody is watching?",
    "What skill does your character have that embarrasses them?",
    "What would make your character abandon their moral line?",
    "Which person from their past could ruin them with a single sentence?",
    "What does your character want, and what do they actually need?",
    "How does your character behave when they are genuinely happy?",
    "What compliment would hurt your character the most?",
    "What does your character refuse to forgive themselves for?",
  ],
  "Conflict Ideas": [
    "What happens when two characters desperately want opposite outcomes?",
    "A promise made in private collides with a duty made in public.",
    "Two allies discover they have been working toward different endings.",
    "The only way to save one person is to expose another.",
    "A character must choose between the truth and their family's safety.",
    "Someone's plan succeeds perfectly — and ruins everything they love.",
    "The mentor turns out to be the obstacle.",
    "A community must choose between survival and its identity.",
    "The protagonist gets exactly what they asked for, too early.",
    "An old debt is called in at the worst possible moment.",
    "Two characters love the same thing and can only keep it by destroying it.",
    "A character is asked to enforce a rule they secretly broke.",
  ],
  "Setting Ideas": [
    "What makes this location impossible to simply leave?",
    "A town built around a factory that stopped running decades ago.",
    "An island where the tide reveals a road only twice a year.",
    "A hotel whose staff never change and never age.",
    "A library organised by emotion instead of subject.",
    "A rooftop garden that is the only green place left in the city.",
    "A border town where two languages share every street sign.",
    "A train that circles the country and never truly stops.",
    "A valley where the weather follows the mood of its people.",
    "A market that only opens after midnight.",
    "A school built on top of something the founders buried.",
    "A coastal village slowly being reclaimed by the sea.",
  ],
  "Plot Twists": [
    "What important fact has the protagonist misunderstood?",
    "The person helping them has been delaying them all along.",
    "The rescue mission was actually the trap.",
    "The villain's motive turns out to be the protagonist's own past act.",
    "The narrator has been leaving out the same detail every time.",
    "The prophecy was fulfilled in the first chapter, unnoticed.",
    "The dead character was never dead — they were hiding from someone else.",
    "The map was accurate, but the legend was deliberately mislabelled.",
    "The protagonist's greatest success was arranged by their rival.",
    "The message was meant for someone with the same name.",
    "The rules were never real; everyone simply kept obeying them.",
    "The thing they were protecting wanted to be found.",
  ],
  "General Writing Prompts": [
    "Write a scene that takes place entirely in one minute.",
    "Write a conversation where neither character says what they mean.",
    "Describe a room only through what is missing from it.",
    "Begin a chapter with a sound.",
    "Write a goodbye that neither person knows is final.",
    "Write about a character doing a boring task while their life falls apart.",
    "Describe your antagonist from the point of view of someone who loves them.",
    "Write the moment just before a decision, and stop there.",
    "Write a memory that the character has slightly wrong.",
    "Write a scene with no dialogue and no interior thought.",
    "Open with a line of dialogue that raises a question.",
    "Write a letter your character will never send.",
  ],
};

export function randomPrompt(category: PromptCategory, exclude?: string) {
  const list = PROMPTS[category];
  const pool = list.length > 1 && exclude ? list.filter((p) => p !== exclude) : list;
  return pool[Math.floor(Math.random() * pool.length)];
}

export function anyRandomPrompt() {
  const cats = PROMPT_CATEGORIES;
  const cat = cats[Math.floor(Math.random() * cats.length)];
  return { category: cat, text: randomPrompt(cat) };
}
