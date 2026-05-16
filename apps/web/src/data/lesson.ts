export interface GrammarSlide {
  type: 'grammar';
  title: string;
  body: string[];
  callout?: string;
  table?: { headers: string[]; rows: string[][] };
}
export interface VocabSlide {
  type: 'vocab';
  word: string;
  romanization: string;
  translation: string;
  example: { target: string; english: string };
  imageUrl?: string;
  photoLabel?: string;
}
export interface MCSlide {
  type: 'mc';
  prompt: string;
  english: string;
  sentence: string[];
  answers: string[];
  bank: string[];
}
export interface FillSlide {
  type: 'fill';
  prompt: string;
  english: string;
  sentence: string[];
  answer: string;
  hint?: string;
}
export interface DoneSlide {
  type: 'done';
  title: string;
  stats: { num: number | string; lbl: string }[];
}
export type Slide = GrammarSlide | VocabSlide | MCSlide | FillSlide | DoneSlide;

export interface LessonData {
  language: string;
  level: string;
  unit: string;
  title: string;
  slides: Slide[];
}

export const DEMO_LESSON: LessonData = {
  language: 'Greek', level: 'A1', unit: 'People & Family', title: 'This is my…',
  slides: [
    { type: 'grammar', title: 'Possessives come after the noun',
      body: [
        'In English we say my mother. In Greek, the order is reversed: η μητέρα μου — literally the mother of-me. The possessive word is short, unstressed, and always sits right after the noun it belongs to.',
        'These little words (μου, σου, του, της…) are called weak possessive pronouns. They never change form to match the gender of the noun, which makes them refreshingly easy to memorise.',
      ],
      callout: 'Quick rule: noun first, possessive second.',
    },
    { type: 'vocab', word: 'μου', romanization: 'mou', translation: 'my, of me',
      example: { target: 'η μητέρα μου', english: 'my mother' } },
    { type: 'vocab', word: 'σου', romanization: 'sou', translation: 'your (singular, informal)',
      example: { target: 'ο πατέρας σου', english: 'your father' } },
    { type: 'vocab', word: 'του · της', romanization: 'tou · tis', translation: 'his · her',
      example: { target: 'ο αδερφός της', english: 'her brother' } },
    { type: 'mc', prompt: 'Drop the right word into the gap.', english: 'This is my mother.',
      sentence: ['Αυτή είναι η μητέρα', '_', '.'], answers: ['μου'], bank: ['μου', 'σου', 'της', 'του'] },
    { type: 'mc', prompt: 'Two blanks this time. The first is an article, the second is a possessive.',
      english: 'Her brother is tall.', sentence: ['_', 'αδερφός', '_', 'είναι ψηλός.'],
      answers: ['Ο', 'της'], bank: ['Ο', 'Η', 'της', 'του', 'μου', 'σας'] },
    { type: 'fill', prompt: 'Type the missing word in Greek.', english: 'This is your father.',
      sentence: ['Αυτός είναι ο πατέρας', '_', '.'], answer: 'σου',
      hint: 'Informal singular — talking to a friend.' },
    { type: 'grammar', title: 'The full set, for reference',
      body: ["You don't need to memorise the whole table today — μου, σου, του and της will carry you a long way. Plural forms come up in the next unit."],
      table: { headers: ['Person', 'English', 'Greek'],
        rows: [['1st singular','my','μου'],['2nd singular','your','σου'],['3rd masc.','his','του'],
               ['3rd fem.','her','της'],['1st plural','our','μας'],['2nd plural','your (pl./formal)','σας'],['3rd plural','their','τους']] } },
    { type: 'done', title: 'Lesson complete',
      stats: [{ num: 7, lbl: 'slides reviewed' }, { num: 4, lbl: 'new words' }, { num: '100%', lbl: 'accuracy' }] },
  ],
};
