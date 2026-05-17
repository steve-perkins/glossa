/**
 * One-shot seed script: populates the glossa DB with the placeholder
 * Greek + Spanish content from the Phase 1 SPA's hardcoded data.
 *
 * This data is THROWAWAY SCAFFOLDING. It exists only to prove the
 * schema → API → SPA pipeline end-to-end. Phase 5's content skill
 * generates the real curriculum and replaces this seed.
 *
 * Usage: npx ts-node -P tsconfig.json src/scripts/seed-placeholder.ts
 */

import 'reflect-metadata';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { DataSource } from 'typeorm';

dotenv.config({ path: path.resolve(__dirname, '../../../../.env') });

import { LearningLanguageEntity } from '../content/entities/learning-language.entity';
import { LevelEntity } from '../content/entities/level.entity';
import { UnitEntity } from '../content/entities/unit.entity';
import { LessonEntity } from '../content/entities/lesson.entity';
import { LessonSlideEntity } from '../content/entities/lesson-slide.entity';
import { VocabItemEntity } from '../content/entities/vocab-item.entity';
import { StoryEntity } from '../content/entities/story.entity';
import { StoryParagraphEntity } from '../content/entities/story-paragraph.entity';
import { ConversationScenarioEntity } from '../content/entities/conversation-scenario.entity';
import { FreeChatModeEntity } from '../content/entities/free-chat-mode.entity';

// ─── helpers ─────────────────────────────────────────────────────────────────

function kebab(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

// ─── data ────────────────────────────────────────────────────────────────────

const LANGUAGE_DATA = [
  { id: 'greek',   name: 'Greek',   nativeName: 'Ελληνικά', flagCode: 'GR', ttsVoice: 'el-GR' },
  { id: 'spanish', name: 'Spanish', nativeName: 'Español',  flagCode: 'ES', ttsVoice: 'es-ES' },
];

const COURSES: Record<string, {
  levels: string[];
  units: Record<string, Array<{
    id: string;
    title: string;
    subtitle: string;
    lessons: Array<{ title: string; desc: string; status: string }>;
  }>>;
}> = {
  greek: {
    levels: ['A1', 'A2', 'B1'],
    units: {
      A1: [
        { id: 'greek-first-words', title: 'First Words', subtitle: 'Greetings, introductions, the alphabet', lessons: [
          { title: 'The Greek alphabet', desc: 'Learn the 24 letters and their sounds', status: 'done' },
          { title: 'Hello & goodbye', desc: 'Yia sou, kalimera, kalispera, kalinychta', status: 'done' },
          { title: "What's your name?", desc: 'Asking and answering simple personal questions', status: 'done' },
          { title: 'Where are you from?', desc: 'Countries, nationalities, and a first feminine ending', status: 'done' },
          { title: 'Unit review', desc: 'Putting your first conversation together', status: 'done' },
        ]},
        { id: 'greek-people-and-family', title: 'People & Family', subtitle: 'Pronouns, family members, possession', lessons: [
          { title: 'I, you, he, she', desc: 'Subject pronouns and the verb to be', status: 'done' },
          { title: 'My family', desc: 'Twelve essential family-member nouns', status: 'done' },
          { title: 'This is my…', desc: 'Possessive adjectives in their natural habitat', status: 'current' },
          { title: 'Describing people', desc: 'Tall, short, kind — adjective agreement', status: 'next' },
          { title: 'Listening: a phone call', desc: 'Maria introduces her family to a new friend', status: 'next' },
          { title: 'Unit review', desc: 'Talk about the people closest to you', status: 'next' },
        ]},
        { id: 'greek-numbers-days-time', title: 'Numbers, Days, Time', subtitle: 'Counting, telling time, scheduling', lessons: [
          { title: 'Numbers 1–20', desc: 'Count, ask how much, give your phone number', status: 'locked' },
          { title: 'Numbers up to 100', desc: 'Tens, hundreds, and stress patterns', status: 'locked' },
          { title: 'Days of the week', desc: 'Deftera through Kyriaki, plus today and tomorrow', status: 'locked' },
          { title: 'What time is it?', desc: 'The 12-hour clock and quarter-past phrases', status: 'locked' },
          { title: 'Making plans', desc: 'Suggesting times, accepting, declining politely', status: 'locked' },
          { title: 'Unit review', desc: 'Schedule a coffee with a friend, end to end', status: 'locked' },
        ]},
        { id: 'greek-at-the-taverna', title: 'At the Taverna', subtitle: 'Food, ordering, polite requests', lessons: [
          { title: 'Café & taverna words', desc: 'Drinks, mezedes, and how to read a menu', status: 'locked' },
          { title: 'I would like…', desc: "Polite requests and the conditional you'll use daily", status: 'locked' },
          { title: 'Ordering coffee', desc: 'Greek coffee, frappé, freddo — and how to specify sweetness', status: 'locked' },
          { title: 'Asking for the bill', desc: 'Splitting, tipping, and a few useful phrases', status: 'locked' },
          { title: 'Unit review', desc: 'Run a full meal in Greek, from hello to goodbye', status: 'locked' },
        ]},
        { id: 'greek-around-the-neighborhood', title: 'Around the Neighborhood', subtitle: 'Places, directions, prepositions', lessons: [
          { title: 'Places in town', desc: "Pharmacy, bakery, square — vocabulary you'll see on signs", status: 'locked' },
          { title: 'Left, right, straight', desc: 'Giving and following short walking directions', status: 'locked' },
          { title: 'Excuse me, where is…?', desc: 'Polite openers and asking strangers for help', status: 'locked' },
          { title: 'Reading a map', desc: 'Street names, landmarks, and rough distances', status: 'locked' },
          { title: 'Unit review', desc: 'Find your way to a specific café across town', status: 'locked' },
        ]},
        { id: 'greek-a-day-in-my-life', title: 'A Day in My Life', subtitle: 'Routines, present tense, frequency', lessons: [
          { title: 'Morning routine', desc: 'Wake up, get dressed, have breakfast — the verbs', status: 'locked' },
          { title: 'Present-tense verbs', desc: 'Conjugating regular -o verbs across all six persons', status: 'locked' },
          { title: 'Always, often, never', desc: 'Frequency adverbs and where they live in a sentence', status: 'locked' },
          { title: 'Talking about your day', desc: 'Stitch a 60-second monologue about your routine', status: 'locked' },
          { title: 'Level checkpoint', desc: 'A graded review of everything in A1', status: 'locked' },
        ]},
      ],
      A2: [
        { id: 'greek-past-adventures', title: 'Past Adventures', subtitle: 'Past tense, storytelling, time markers', lessons: [
          { title: 'Last weekend', desc: 'Time markers: yesterday, last week, two months ago', status: 'locked' },
          { title: 'Aorist tense intro', desc: 'The Greek simple past and how stems shift', status: 'locked' },
          { title: 'Telling a short story', desc: 'Sequencing events with then, after, finally', status: 'locked' },
          { title: 'Unit review', desc: 'Recount a real trip you took recently', status: 'locked' },
        ]},
        { id: 'greek-travel-and-transport', title: 'Travel & Transport', subtitle: 'Tickets, schedules, the ferry to the islands', lessons: [
          { title: 'At the bus station', desc: 'Reading departure boards and asking for help', status: 'locked' },
          { title: 'Buying a ticket', desc: 'One-way, return, with reservation — handled', status: 'locked' },
          { title: 'The ferry timetable', desc: 'Decoding the Aegean ferry network in Greek', status: 'locked' },
          { title: 'Unit review', desc: 'Plan a real trip from Athens to a chosen island', status: 'locked' },
        ]},
        { id: 'greek-health-and-body', title: 'Health & Body', subtitle: 'At the doctor, feelings, advice', lessons: [
          { title: 'Parts of the body', desc: 'Head to toe, with the most useful aches included', status: 'locked' },
          { title: "I don't feel well", desc: 'Describing symptoms accurately to a pharmacist', status: 'locked' },
          { title: 'You should…', desc: 'Giving and receiving advice with prepei na', status: 'locked' },
          { title: 'Unit review', desc: 'Handle a small medical issue on holiday', status: 'locked' },
        ]},
      ],
      B1: [
        { id: 'greek-opinions-and-debates', title: 'Opinions & Debates', subtitle: 'Expressing views, agreeing, disagreeing', lessons: [
          { title: 'I think that…', desc: 'Hedged opinions and softeners that sound natural', status: 'locked' },
          { title: 'Subjunctive mood', desc: 'When and how the subjunctive lurks behind na', status: 'locked' },
          { title: 'A radio debate', desc: 'Listen to two Athenians argue about coffee', status: 'locked' },
        ]},
      ],
    },
  },
  spanish: {
    levels: ['A1', 'A2', 'B1', 'B2'],
    units: {
      A1: [
        { id: 'spanish-greetings', title: 'Hola, mucho gusto', subtitle: 'Greetings, names, basic questions', lessons: [
          { title: 'Saying hello', desc: 'Hola, buenos días, qué tal — and when to use which', status: 'done' },
          { title: "What's your name?", desc: 'Asking, answering, and spelling it back', status: 'current' },
          { title: 'Numbers 1–10', desc: 'Counting and giving a phone number out loud', status: 'next' },
          { title: 'Unit review', desc: 'Your first thirty seconds of small talk', status: 'next' },
        ]},
        { id: 'spanish-mi-familia', title: 'Mi familia', subtitle: 'Family, possessives, ser vs. estar', lessons: [
          { title: 'Family vocabulary', desc: 'Twelve nouns and the gendered articles that go with them', status: 'locked' },
          { title: 'Mi, tu, su', desc: 'Possessive adjectives that match what they own', status: 'locked' },
          { title: 'Ser vs. estar', desc: 'Introducing the imperfect distinction every learner asks about', status: 'locked' },
          { title: 'Describing people', desc: 'Personality and looks with proper adjective agreement', status: 'locked' },
          { title: 'Unit review', desc: 'Introduce your family in a short audio clip', status: 'locked' },
        ]},
        { id: 'spanish-en-el-cafe', title: 'En el café', subtitle: 'Ordering food and drinks', lessons: [
          { title: 'Café menu', desc: 'Tapas, raciones, and how a Spanish menu is laid out', status: 'locked' },
          { title: 'Querer + infinitive', desc: "Polite requests with the verb you'll use most", status: 'locked' },
          { title: 'Ordering coffee', desc: 'Café solo, cortado, con leche — pick your poison', status: 'locked' },
          { title: 'Unit review', desc: 'Order, eat, and pay without falling back on English', status: 'locked' },
        ]},
        { id: 'spanish-la-ciudad', title: 'La ciudad', subtitle: 'Places, directions, prepositions', lessons: [
          { title: 'Places in town', desc: 'Plaza, ayuntamiento, farmacia and friends', status: 'locked' },
          { title: 'Hay vs. está', desc: 'Two ways to say there is — and when each one fits', status: 'locked' },
          { title: 'Asking the way', desc: 'Short, polite questions you can use anywhere', status: 'locked' },
          { title: 'Unit review', desc: 'Navigate a stranger from the metro to your hotel', status: 'locked' },
        ]},
        { id: 'spanish-mi-dia', title: 'Mi día', subtitle: 'Daily routine, present tense, time', lessons: [
          { title: 'What time is it?', desc: 'The 24-hour clock and the relaxed Spanish version', status: 'locked' },
          { title: 'Reflexive verbs', desc: 'Levantarse, ducharse, acostarse — and the pronouns they need', status: 'locked' },
          { title: 'My typical day', desc: 'Sequencing your morning, afternoon, and evening', status: 'locked' },
          { title: 'Level checkpoint', desc: 'A graded review of everything in A1', status: 'locked' },
        ]},
      ],
      A2: [
        { id: 'spanish-recuerdos', title: 'Recuerdos', subtitle: 'Imperfect tense, childhood memories', lessons: [
          { title: 'Cuando era pequeño…', desc: 'The imperfect tense for ongoing past habits', status: 'locked' },
          { title: 'Family stories', desc: 'Sequencing memories with antes, siempre, todos los días', status: 'locked' },
          { title: 'Unit review', desc: 'Tell a two-minute childhood story', status: 'locked' },
        ]},
        { id: 'spanish-de-viaje', title: 'De viaje', subtitle: 'Travel, hotels, asking for help', lessons: [
          { title: 'At the hotel', desc: 'Checking in, asking for the wifi, the works', status: 'locked' },
          { title: 'Travel verbs', desc: 'Coger, llegar, salir — and the prepositions they collect', status: 'locked' },
          { title: 'Unit review', desc: 'Survive a forty-eight hour weekend in Madrid', status: 'locked' },
        ]},
      ],
      B1: [
        { id: 'spanish-opiniones', title: 'Opiniones', subtitle: 'Subjunctive, expressing wishes', lessons: [
          { title: 'Espero que…', desc: 'Triggering the subjunctive with feelings and wishes', status: 'locked' },
          { title: 'A heated discussion', desc: 'Listen to friends debate the perfect tortilla', status: 'locked' },
        ]},
      ],
      B2: [
        { id: 'spanish-cine-y-literatura', title: 'Cine y literatura', subtitle: 'Cultural commentary, advanced narration', lessons: [
          { title: 'Reviewing a film', desc: 'Writing a short, opinionated review in Spanish', status: 'locked' },
        ]},
      ],
    },
  },
};

// The one lesson that has actual slide content — "This is my…" in Greek People & Family
const DEMO_LESSON_ID = 'greek-people-and-family-this-is-my';
const DEMO_SLIDES: Array<{ type: string; payload: Record<string, unknown> }> = [
  { type: 'grammar', payload: {
    title: 'Possessives come after the noun',
    body: [
      'In English we say my mother. In Greek, the order is reversed: η μητέρα μου — literally the mother of-me. The possessive word is short, unstressed, and always sits right after the noun it belongs to.',
      'These little words (μου, σου, του, της…) are called weak possessive pronouns. They never change form to match the gender of the noun, which makes them refreshingly easy to memorise.',
    ],
    callout: 'Quick rule: noun first, possessive second.',
  }},
  { type: 'vocab', payload: { word: 'μου', romanization: 'mou', translation: 'my, of me', example: { target: 'η μητέρα μου', english: 'my mother' } } },
  { type: 'vocab', payload: { word: 'σου', romanization: 'sou', translation: 'your (singular, informal)', example: { target: 'ο πατέρας σου', english: 'your father' } } },
  { type: 'vocab', payload: { word: 'του · της', romanization: 'tou · tis', translation: 'his · her', example: { target: 'ο αδερφός της', english: 'her brother' } } },
  { type: 'mc', payload: { prompt: 'Drop the right word into the gap.', english: 'This is my mother.', sentence: ['Αυτή είναι η μητέρα', '_', '.'], answers: ['μου'], bank: ['μου', 'σου', 'της', 'του'] } },
  { type: 'mc', payload: { prompt: 'Two blanks this time. The first is an article, the second is a possessive.', english: 'Her brother is tall.', sentence: ['_', 'αδερφός', '_', 'είναι ψηλός.'], answers: ['Ο', 'της'], bank: ['Ο', 'Η', 'της', 'του', 'μου', 'σας'] } },
  { type: 'fill', payload: { prompt: 'Type the missing word in Greek.', english: 'This is your father.', sentence: ['Αυτός είναι ο πατέρας', '_', '.'], answer: 'σου', hint: 'Informal singular — talking to a friend.' } },
  { type: 'grammar', payload: {
    title: 'The full set, for reference',
    body: ["You don't need to memorise the whole table today — μου, σου, του and της will carry you a long way. Plural forms come up in the next unit."],
    table: { headers: ['Person', 'English', 'Greek'], rows: [['1st singular','my','μου'],['2nd singular','your','σου'],['3rd masc.','his','του'],['3rd fem.','her','της'],['1st plural','our','μας'],['2nd plural','your (pl./formal)','σας'],['3rd plural','their','τους']] },
  }},
  { type: 'done', payload: { title: 'Lesson complete', stats: [{ num: 7, lbl: 'slides reviewed' }, { num: 4, lbl: 'new words' }, { num: '100%', lbl: 'accuracy' }] } },
];

const PRACTICE_POOL: Record<string, {
  voice: string;
  items: Array<{ word: string; roman: string | null; translation: string; unit: string; sentence: string[]; full: string }>;
}> = {
  greek: {
    voice: 'el-GR',
    items: [
      { word: 'καλημέρα', roman: 'kaliméra', translation: 'good morning', unit: 'First Words', sentence: ['', '_', ', τι κάνεις σήμερα;'], full: 'Καλημέρα, τι κάνεις σήμερα;' },
      { word: 'καλησπέρα', roman: 'kalispéra', translation: 'good evening', unit: 'First Words', sentence: ['', '_', ' σε όλους!'], full: 'Καλησπέρα σε όλους!' },
      { word: 'ευχαριστώ', roman: 'efharistó', translation: 'thank you', unit: 'First Words', sentence: ['', '_', ' πάρα πολύ για τη βοήθεια.'], full: 'Ευχαριστώ πάρα πολύ για τη βοήθεια.' },
      { word: 'παρακαλώ', roman: 'parakaló', translation: "please / you're welcome", unit: 'First Words', sentence: ['Έναν καφέ, ', '_', '.'], full: 'Έναν καφέ, παρακαλώ.' },
      { word: 'ναι', roman: 'ne', translation: 'yes', unit: 'First Words', sentence: ['', '_', ', μιλάω λίγα ελληνικά.'], full: 'Ναι, μιλάω λίγα ελληνικά.' },
      { word: 'όχι', roman: 'óhi', translation: 'no', unit: 'First Words', sentence: ['', '_', ', δεν ξέρω.'], full: 'Όχι, δεν ξέρω.' },
      { word: 'μητέρα', roman: 'mitéra', translation: 'mother', unit: 'People & Family', sentence: ['Η ', '_', ' μου είναι γιατρός.'], full: 'Η μητέρα μου είναι γιατρός.' },
      { word: 'πατέρας', roman: 'patéras', translation: 'father', unit: 'People & Family', sentence: ['Ο ', '_', ' μου δουλεύει στην Αθήνα.'], full: 'Ο πατέρας μου δουλεύει στην Αθήνα.' },
      { word: 'αδερφός', roman: 'aderfós', translation: 'brother', unit: 'People & Family', sentence: ['Ο ', '_', ' μου σπουδάζει στη Θεσσαλονίκη.'], full: 'Ο αδερφός μου σπουδάζει στη Θεσσαλονίκη.' },
      { word: 'αδερφή', roman: 'aderfí', translation: 'sister', unit: 'People & Family', sentence: ['Η ', '_', ' μου είναι δασκάλα.'], full: 'Η αδερφή μου είναι δασκάλα.' },
      { word: 'φίλος', roman: 'fílos', translation: 'friend (m.)', unit: 'People & Family', sentence: ['Ο ', '_', ' μου μένει εδώ κοντά.'], full: 'Ο φίλος μου μένει εδώ κοντά.' },
      { word: 'παιδί', roman: 'paidí', translation: 'child', unit: 'People & Family', sentence: ['Το ', '_', ' παίζει στην αυλή.'], full: 'Το παιδί παίζει στην αυλή.' },
      { word: 'μου', roman: 'mou', translation: 'my', unit: 'People & Family', sentence: ['Αυτή είναι η μητέρα ', '_', '.'], full: 'Αυτή είναι η μητέρα μου.' },
      { word: 'σου', roman: 'sou', translation: 'your (sg.)', unit: 'People & Family', sentence: ['Πού είναι ο αδερφός ', '_', ';'], full: 'Πού είναι ο αδερφός σου;' },
      { word: 'της', roman: 'tis', translation: 'her', unit: 'People & Family', sentence: ['Ο φίλος ', '_', ' είναι ψηλός.'], full: 'Ο φίλος της είναι ψηλός.' },
      { word: 'του', roman: 'tou', translation: 'his', unit: 'People & Family', sentence: ['Η αδερφή ', '_', ' μένει στην Κρήτη.'], full: 'Η αδερφή του μένει στην Κρήτη.' },
      { word: 'νερό', roman: 'neró', translation: 'water', unit: 'At the Taverna', sentence: ['Θέλω λίγο ', '_', ', παρακαλώ.'], full: 'Θέλω λίγο νερό, παρακαλώ.' },
      { word: 'καφές', roman: 'kafés', translation: 'coffee', unit: 'At the Taverna', sentence: ['Έναν ', '_', ' ελληνικό, παρακαλώ.'], full: 'Έναν καφέ ελληνικό, παρακαλώ.' },
      { word: 'ψωμί', roman: 'psomí', translation: 'bread', unit: 'At the Taverna', sentence: ['Αυτό το ', '_', ' είναι φρέσκο.'], full: 'Αυτό το ψωμί είναι φρέσκο.' },
      { word: 'σήμερα', roman: 'símera', translation: 'today', unit: 'Numbers, Days, Time', sentence: ['', '_', ' είναι Δευτέρα.'], full: 'Σήμερα είναι Δευτέρα.' },
      { word: 'αύριο', roman: 'ávrio', translation: 'tomorrow', unit: 'Numbers, Days, Time', sentence: ['Θα σε δω ', '_', ' το πρωί.'], full: 'Θα σε δω αύριο το πρωί.' },
      { word: 'χθες', roman: 'hthes', translation: 'yesterday', unit: 'Numbers, Days, Time', sentence: ['', '_', ' ήμουν στη δουλειά όλη μέρα.'], full: 'Χθες ήμουν στη δουλειά όλη μέρα.' },
      { word: 'εδώ', roman: 'edó', translation: 'here', unit: 'Around the Neighborhood', sentence: ['Μένω ', '_', ' τρία χρόνια.'], full: 'Μένω εδώ τρία χρόνια.' },
      { word: 'τώρα', roman: 'tóra', translation: 'now', unit: 'A Day in My Life', sentence: ['', '_', ' είμαι έτοιμος να φύγω.'], full: 'Τώρα είμαι έτοιμος να φύγω.' },
    ],
  },
  spanish: {
    voice: 'es-ES',
    items: [
      { word: 'hola', roman: null, translation: 'hello', unit: 'Hola, mucho gusto', sentence: ['', '_', ', ¿qué tal estás?'], full: 'Hola, ¿qué tal estás?' },
      { word: 'gracias', roman: null, translation: 'thank you', unit: 'Hola, mucho gusto', sentence: ['Muchas ', '_', ' por todo.'], full: 'Muchas gracias por todo.' },
      { word: 'sí', roman: null, translation: 'yes', unit: 'Hola, mucho gusto', sentence: ['', '_', ', claro que sí.'], full: 'Sí, claro que sí.' },
      { word: 'no', roman: null, translation: 'no', unit: 'Hola, mucho gusto', sentence: ['', '_', ', gracias, hoy no puedo.'], full: 'No, gracias, hoy no puedo.' },
      { word: 'madre', roman: null, translation: 'mother', unit: 'Mi familia', sentence: ['Mi ', '_', ' se llama Ana.'], full: 'Mi madre se llama Ana.' },
      { word: 'padre', roman: null, translation: 'father', unit: 'Mi familia', sentence: ['Mi ', '_', ' trabaja en Madrid.'], full: 'Mi padre trabaja en Madrid.' },
      { word: 'hermano', roman: null, translation: 'brother', unit: 'Mi familia', sentence: ['Mi ', '_', ' tiene veinte años.'], full: 'Mi hermano tiene veinte años.' },
      { word: 'hermana', roman: null, translation: 'sister', unit: 'Mi familia', sentence: ['Tu ', '_', ' es muy alta.'], full: 'Tu hermana es muy alta.' },
      { word: 'amigo', roman: null, translation: 'friend (m.)', unit: 'Mi familia', sentence: ['Mi ', '_', ' vive en Sevilla.'], full: 'Mi amigo vive en Sevilla.' },
      { word: 'casa', roman: null, translation: 'house', unit: 'La ciudad', sentence: ['La ', '_', ' está cerca del parque.'], full: 'La casa está cerca del parque.' },
      { word: 'agua', roman: null, translation: 'water', unit: 'En el café', sentence: ['Quiero un poco de ', '_', ', por favor.'], full: 'Quiero un poco de agua, por favor.' },
      { word: 'café', roman: null, translation: 'coffee', unit: 'En el café', sentence: ['Un ', '_', ' con leche, por favor.'], full: 'Un café con leche, por favor.' },
      { word: 'pan', roman: null, translation: 'bread', unit: 'En el café', sentence: ['Compré ', '_', ' esta mañana.'], full: 'Compré pan esta mañana.' },
      { word: 'ayer', roman: null, translation: 'yesterday', unit: 'Mi día', sentence: ['', '_', ' fui al cine con Lucía.'], full: 'Ayer fui al cine con Lucía.' },
      { word: 'hoy', roman: null, translation: 'today', unit: 'Mi día', sentence: ['', '_', ' es lunes y hace sol.'], full: 'Hoy es lunes y hace sol.' },
      { word: 'mañana', roman: null, translation: 'tomorrow', unit: 'Mi día', sentence: ['Te veo ', '_', ' a las nueve.'], full: 'Te veo mañana a las nueve.' },
      { word: 'grande', roman: null, translation: 'big', unit: 'La ciudad', sentence: ['Es una casa muy ', '_', '.'], full: 'Es una casa muy grande.' },
      { word: 'pequeño', roman: null, translation: 'small', unit: 'La ciudad', sentence: ['Tengo un perro ', '_', ' y blanco.'], full: 'Tengo un perro pequeño y blanco.' },
      { word: 'aquí', roman: null, translation: 'here', unit: 'La ciudad', sentence: ['Vivo ', '_', ' desde dos mil veinte.'], full: 'Vivo aquí desde dos mil veinte.' },
      { word: 'ahora', roman: null, translation: 'now', unit: 'Mi día', sentence: ['', '_', ' no puedo hablar contigo.'], full: 'Ahora no puedo hablar contigo.' },
    ],
  },
};

const STORIES_DATA: Record<string, Array<{
  id: string; level: string; title: string; nativeTitle: string; glyph: string;
  minutes: number; words: number; excerpt: string;
  paragraphs: Array<{ t: string; e: string }>;
}>> = {
  greek: [
    { id: 'greek-my-morning', level: 'A1', title: 'My Morning', nativeTitle: 'Το πρωινό μου', glyph: 'Π', minutes: 3, words: 78, excerpt: 'Nikos lives in Athens. Every morning he drinks coffee on the balcony.', paragraphs: [
      { t: 'Καλημέρα! Είμαι ο Νίκος και ζω στην Αθήνα, σε ένα μικρό διαμέρισμα στην Πλάκα.', e: 'Good morning! I am Nikos and I live in Athens, in a small apartment in Plaka.' },
      { t: 'Κάθε πρωί ξυπνάω στις επτά. Πάω στην κουζίνα και φτιάχνω έναν ελληνικό καφέ.', e: 'Every morning I wake up at seven. I go to the kitchen and make a Greek coffee.' },
      { t: 'Μετά πηγαίνω στο μπαλκόνι μου. Από εκεί βλέπω την Ακρόπολη. Είναι πολύ όμορφη το πρωί.', e: 'Then I go to my balcony. From there I see the Acropolis. It is very beautiful in the morning.' },
      { t: 'Πίνω τον καφέ μου αργά και ακούω τα πουλιά. Είναι η αγαπημένη μου ώρα της ημέρας.', e: 'I drink my coffee slowly and listen to the birds. It is my favourite time of the day.' },
      { t: 'Στις οκτώ φεύγω για τη δουλειά. Η Αθήνα είναι ήδη ξύπνια και θορυβώδης.', e: 'At eight I leave for work. Athens is already awake and noisy.' },
    ]},
    { id: 'greek-a-coffee-in-exarcheia', level: 'A1', title: 'A Coffee in Exarcheia', nativeTitle: 'Ένας καφές στα Εξάρχεια', glyph: 'Κ', minutes: 2, words: 64, excerpt: 'Maria meets a friend at a small café and orders a freddo.', paragraphs: [
      { t: 'Η Μαρία περπατάει στα Εξάρχεια. Είναι ζέστη και διψάει.', e: 'Maria walks in Exarcheia. It is hot and she is thirsty.' },
      { t: 'Βλέπει ένα μικρό καφενείο στη γωνία και μπαίνει μέσα.', e: 'She sees a small café on the corner and goes inside.' },
      { t: '«Καλησπέρα», λέει στον σερβιτόρο. «Έναν φρέντο εσπρέσο, παρακαλώ. Χωρίς ζάχαρη.»', e: '"Good evening," she says to the waiter. "One freddo espresso, please. Without sugar."' },
      { t: 'Ο σερβιτόρος χαμογελάει. «Αμέσως. Θέλετε και νερό;»', e: 'The waiter smiles. "Right away. Would you also like water?"' },
      { t: '«Ναι, ευχαριστώ.» Η Μαρία κάθεται και ανοίγει το βιβλίο της.', e: '"Yes, thank you." Maria sits down and opens her book.' },
    ]},
    { id: 'greek-the-cat-on-the-roof', level: 'A1', title: 'The Cat on the Roof', nativeTitle: 'Η γάτα στη στέγη', glyph: 'Γ', minutes: 2, words: 58, excerpt: 'A small cat has a problem and a kind neighbour helps.', paragraphs: [
      { t: 'Μια μικρή γάτα είναι στη στέγη ενός σπιτιού. Δεν μπορεί να κατέβει.', e: 'A small cat is on the roof of a house. It cannot come down.' },
      { t: 'Μια γυναίκα την ακούει από κάτω. «Τι κάνεις εκεί πάνω, μικρή;»', e: 'A woman hears it from below. "What are you doing up there, little one?"' },
      { t: 'Πηγαίνει στον γείτονά της, τον κύριο Γιώργο. «Έχεις σκάλα;» τον ρωτάει.', e: 'She goes to her neighbour, Mr Giorgos. "Do you have a ladder?" she asks him.' },
      { t: 'Ο κύριος Γιώργος φέρνει μια μεγάλη σκάλα και βοηθάει τη γάτα να κατέβει.', e: 'Mr Giorgos brings a big ladder and helps the cat come down.' },
    ]},
    { id: 'greek-saturday-at-the-market', level: 'A1', title: 'Saturday at the Market', nativeTitle: 'Σάββατο στη λαϊκή', glyph: 'Λ', minutes: 3, words: 82, excerpt: 'Yiannis shops for fresh tomatoes, oranges and a friendly chat.', paragraphs: [
      { t: 'Κάθε Σάββατο ο Γιάννης πηγαίνει στη λαϊκή αγορά της γειτονιάς του.', e: 'Every Saturday Yiannis goes to the open-air market in his neighbourhood.' },
      { t: 'Αγοράζει φρέσκες ντομάτες, αγγούρια, πορτοκάλια και μια μεγάλη φέτα.', e: 'He buys fresh tomatoes, cucumbers, oranges and a big piece of feta.' },
      { t: 'Ο μανάβης τον ξέρει καλά. «Καλημέρα, Γιάννη! Σήμερα οι ντομάτες είναι πολύ γλυκές.»', e: 'The greengrocer knows him well. "Good morning, Yiannis! The tomatoes are very sweet today."' },
      { t: '«Δώσε μου δύο κιλά τότε. Και μισό κιλό ελιές από την Καλαμάτα.»', e: '"Give me two kilos then. And half a kilo of olives from Kalamata."' },
      { t: 'Πληρώνει, παίρνει τις σακούλες του και γυρίζει σπίτι. Το μεσημέρι θα φτιάξει χωριάτικη σαλάτα.', e: 'He pays, takes his bags and goes home. At lunchtime he will make a Greek salad.' },
    ]},
    { id: 'greek-a-letter-from-the-island', level: 'A2', title: 'A Letter from the Island', nativeTitle: 'Ένα γράμμα από το νησί', glyph: 'Ν', minutes: 4, words: 124, excerpt: 'Eleni writes to her sister about her first week on Sifnos.', paragraphs: [
      { t: 'Αγαπημένη μου Δήμητρα, σου γράφω από τη Σίφνο. Έφτασα την περασμένη Δευτέρα με το πλοίο.', e: 'My dear Dimitra, I am writing to you from Sifnos. I arrived last Monday by ferry.' },
      { t: 'Το ταξίδι ήταν μακρύ αλλά πολύ ωραίο. Από το κατάστρωμα έβλεπα τα δελφίνια να ακολουθούν το πλοίο.', e: 'The trip was long but very nice. From the deck I could see the dolphins following the ferry.' },
      { t: 'Μένω σε ένα μικρό σπίτι κοντά στη θάλασσα. Κάθε πρωί κάνω μπάνιο πριν από το πρωινό μου.', e: 'I am staying in a small house close to the sea. Every morning I swim before breakfast.' },
      { t: 'Χθες πήγα στο Καστρομονάστηρο. Ο δρόμος ήταν δύσκολος, αλλά η θέα από πάνω ήταν μαγική.', e: 'Yesterday I went to the monastery up on the rocks. The path was hard, but the view from the top was magical.' },
      { t: 'Γνώρισα μια κυρία που έφτιαχνε ρεβιθάδα σε γάστρα. Μου εξήγησε πώς μαγειρεύεται για ώρες.', e: 'I met a lady who was making chickpea stew in a clay pot. She explained to me how it cooks for hours.' },
      { t: 'Σου στέλνω πολλά φιλιά. Έλα την επόμενη φορά μαζί μου — θα σου αρέσει πάρα πολύ. Ελένη.', e: 'I send you many kisses. Come with me next time — you will love it very much. Eleni.' },
    ]},
    { id: 'greek-the-last-train', level: 'A2', title: 'The Last Train', nativeTitle: 'Το τελευταίο τρένο', glyph: 'Τ', minutes: 4, words: 138, excerpt: 'Andreas almost misses the train back to Thessaloniki and meets an old friend.', paragraphs: [
      { t: 'Ο Ανδρέας έτρεχε στον σταθμό. Είχε μόνο πέντε λεπτά πριν φύγει το τελευταίο τρένο για τη Θεσσαλονίκη.', e: 'Andreas was running through the station. He had only five minutes before the last train to Thessaloniki left.' },
      { t: 'Στην αποβάθρα ένας άντρας τού φώναξε: «Ανδρέα! Εσύ είσαι;»', e: 'On the platform a man called out to him: "Andreas! Is that you?"' },
      { t: 'Γύρισε και είδε τον Κώστα, έναν παλιό συμμαθητή από το σχολείο. Δεν τον είχε δει εδώ και δέκα χρόνια.', e: 'He turned and saw Kostas, an old classmate from school. He had not seen him for ten years.' },
      { t: '«Δεν το πιστεύω! Πού πας;» ρώτησε ο Ανδρέας λαχανιασμένος.', e: '"I can\'t believe it! Where are you going?" Andreas asked, out of breath.' },
      { t: '«Στη Θεσσαλονίκη, επίσης. Πάμε να βρούμε θέσεις μαζί.»', e: '"To Thessaloniki, too. Let\'s go and find seats together."' },
      { t: 'Πέρασαν όλη τη νύχτα στο τρένο μιλώντας για τα παλιά. Όταν έφτασαν, ο ήλιος μόλις έβγαινε.', e: 'They spent the whole night on the train talking about the old days. When they arrived, the sun was just rising.' },
    ]},
    { id: 'greek-the-forgotten-book', level: 'A2', title: 'The Forgotten Book', nativeTitle: 'Το ξεχασμένο βιβλίο', glyph: 'Β', minutes: 3, words: 96, excerpt: 'Sofia finds a book on a park bench with a curious note inside.', paragraphs: [
      { t: 'Η Σοφία καθόταν σε ένα παγκάκι στο Πεδίον του Άρεως όταν παρατήρησε ένα βιβλίο δίπλα της.', e: 'Sofia was sitting on a bench in Pedion tou Areos park when she noticed a book next to her.' },
      { t: 'Κάποιος το είχε ξεχάσει. Το πήρε στα χέρια της: ήταν ένα παλιό μυθιστόρημα του Καζαντζάκη.', e: 'Someone had forgotten it. She took it in her hands: it was an old novel by Kazantzakis.' },
      { t: 'Άνοιξε την πρώτη σελίδα και βρήκε ένα σημείωμα: «Αν διαβάζεις αυτό, συνέχισε το ταξίδι του».', e: 'She opened the first page and found a note: "If you are reading this, continue its journey."' },
      { t: 'Χαμογέλασε. Έβαλε το βιβλίο στην τσάντα της και αποφάσισε να το διαβάσει αυτή τη βδομάδα.', e: 'She smiled. She put the book in her bag and decided to read it this week.' },
      { t: 'Όταν τελείωνε, σκόπευε να το αφήσει σε ένα άλλο παγκάκι, κάπου αλλού στην πόλη.', e: 'When she finished, she planned to leave it on another bench, somewhere else in the city.' },
    ]},
    { id: 'greek-the-pastry-shop-on-the-corner', level: 'B1', title: 'The Pastry Shop on the Corner', nativeTitle: 'Το ζαχαροπλαστείο της γωνίας', glyph: 'Ζ', minutes: 6, words: 192, excerpt: 'Three generations of a Thessaloniki family have run the same bougatsa shop.', paragraphs: [
      { t: 'Στη γωνία μιας ήσυχης γειτονιάς της Θεσσαλονίκης, βρίσκεται ένα μικρό ζαχαροπλαστείο που λειτουργεί από το 1952.', e: 'On the corner of a quiet Thessaloniki neighbourhood, there is a small pastry shop that has been operating since 1952.' },
      { t: 'Ο παππούς Αλέκος, που το άνοιξε όταν γύρισε από την Κωνσταντινούπολη, έφερε μαζί του τις συνταγές της γιαγιάς του.', e: 'Grandfather Alekos, who opened it when he returned from Constantinople, brought with him the recipes of his grandmother.' },
      { t: 'Σήμερα το μαγαζί το κρατάει η εγγονή του, η Δέσποινα. Σηκώνεται κάθε πρωί στις τέσσερις για να ζυμώσει τη μπουγάτσα.', e: 'Today his granddaughter, Despoina, runs the shop. She gets up every morning at four to knead the bougatsa dough.' },
      { t: '«Πολλοί μου λένε ότι θα ήταν πιο εύκολο να αγοράζω έτοιμο φύλλο», λέει χαμογελώντας. «Αλλά τότε δεν θα ήταν δικό μας».', e: '"Many people tell me it would be easier to buy ready-made phyllo," she says, smiling. "But then it wouldn\'t be ours."' },
      { t: 'Οι πελάτες έρχονται από όλη την πόλη — άλλοι για τη μπουγάτσα με κρέμα, άλλοι για τη γνωστή της γαλατόπιτα.', e: 'Customers come from all over the city — some for the bougatsa with cream, others for her well-known milk pie.' },
      { t: 'Όταν τη ρωτάς αν θα κλείσει ποτέ, σου απαντάει σταθερά: «Όχι όσο μπορώ να σηκώνομαι στις τέσσερις».', e: 'When you ask her if she will ever close it, she answers firmly: "Not as long as I can still get up at four."' },
      { t: 'Και πραγματικά, κάθε πρωί, η μυρωδιά από το φούρνο της γεμίζει τον δρόμο και ξυπνάει τη γειτονιά πιο γλυκά από κάθε ξυπνητήρι.', e: 'And truly, every morning, the smell from her oven fills the street and wakes the neighbourhood more sweetly than any alarm clock.' },
    ]},
    { id: 'greek-the-sea-remembers', level: 'B1', title: 'The Sea Remembers', nativeTitle: 'Η θάλασσα θυμάται', glyph: 'Θ', minutes: 5, words: 168, excerpt: 'An old fisherman talks about how the sea has changed, and what stays the same.', paragraphs: [
      { t: 'Ο κυρ-Στέφανος ψαρεύει στα ίδια νερά εδώ και πενήντα χρόνια. Λέει ότι η θάλασσα τον γνωρίζει καλύτερα από τη γυναίκα του.', e: 'Mr Stefanos has been fishing in the same waters for fifty years. He says the sea knows him better than his wife does.' },
      { t: '«Παλιά», θυμάται, «βγαίναμε με δέκα βάρκες και γυρίζαμε με τα δίχτυα γεμάτα. Τώρα βγαίνουμε με δύο και τα φέρνουμε σχεδόν άδεια».', e: '"In the old days," he remembers, "we\'d go out with ten boats and come back with the nets full. Now we go with two and bring them back almost empty."' },
      { t: 'Παρόλα αυτά, δεν παραπονιέται. Λέει ότι η θάλασσα δεν φταίει για τίποτα — εμείς της ζητάμε πολλά και της δίνουμε λίγα.', e: 'Even so, he doesn\'t complain. He says the sea is not to blame for anything — we ask too much of her and give too little back.' },
      { t: 'Το βράδυ, όταν επιστρέφει στο λιμάνι, κάθεται με τους άλλους ψαράδες και πίνει ένα τσίπουρο.', e: 'In the evening, when he returns to the harbour, he sits with the other fishermen and drinks a tsipouro.' },
      { t: 'Μιλάνε για τον καιρό, για τα ψάρια που έπιασαν, για αυτά που τους ξέφυγαν, και κάποιες φορές δεν λένε τίποτα — απλά ακούνε τη θάλασσα.', e: 'They talk about the weather, about the fish they caught, about those that got away, and sometimes they say nothing at all — they just listen to the sea.' },
      { t: '«Η θάλασσα θυμάται τα πάντα», λέει ο κυρ-Στέφανος. «Όλους εμάς, και όσους ήταν πριν από εμάς».', e: '"The sea remembers everything," Mr Stefanos says. "All of us, and all those who came before us."' },
    ]},
  ],
  spanish: [
    { id: 'spanish-coffee-with-grandma', level: 'A1', title: 'Coffee with Grandma', nativeTitle: 'Un café con la abuela', glyph: 'C', minutes: 2, words: 72, excerpt: 'Every Sunday Lucía visits her grandmother for coffee and stories.', paragraphs: [
      { t: 'Todos los domingos, Lucía visita a su abuela. Vive en un pequeño piso en el centro de Sevilla.', e: 'Every Sunday, Lucía visits her grandmother. She lives in a small flat in the centre of Seville.' },
      { t: 'La abuela siempre prepara café y un trozo de bizcocho casero. «Siéntate, mi niña», dice con una sonrisa.', e: 'Grandma always makes coffee and a piece of homemade sponge cake. "Sit down, my child," she says with a smile.' },
      { t: 'Hablan de la familia, del tiempo y de los vecinos. La abuela cuenta las mismas historias de cuando era joven.', e: 'They talk about the family, the weather and the neighbours. Grandma tells the same stories from when she was young.' },
      { t: 'A Lucía no le importa. Le gusta escucharla. Para ella, el domingo no empieza hasta ese café.', e: 'Lucía does not mind. She likes listening to her. For her, Sunday does not begin until that coffee.' },
    ]},
    { id: 'spanish-the-dog-and-the-beach', level: 'A1', title: 'The Dog and the Beach', nativeTitle: 'El perro y la playa', glyph: 'P', minutes: 2, words: 60, excerpt: "Pablo's dog Toby is afraid of the waves — until he isn't.", paragraphs: [
      { t: 'Pablo va a la playa con su perro, Toby. Es la primera vez que Toby ve el mar.', e: 'Pablo goes to the beach with his dog, Toby. It is the first time Toby has seen the sea.' },
      { t: 'El perro mira las olas y tiene un poco de miedo. No quiere acercarse al agua.', e: "The dog looks at the waves and is a little afraid. He doesn't want to come near the water." },
      { t: 'Pablo le tira una pelota azul. Toby corre, se olvida del miedo y se mete en el mar.', e: 'Pablo throws a blue ball for him. Toby runs, forgets his fear and goes into the sea.' },
      { t: 'Ahora le encanta la playa. Cada sábado pregunta con los ojos: «¿Hoy también vamos?»', e: 'Now he loves the beach. Every Saturday he asks with his eyes: "Are we going today too?"' },
    ]},
    { id: 'spanish-at-the-market', level: 'A1', title: 'At the Market', nativeTitle: 'En el mercado', glyph: 'M', minutes: 3, words: 88, excerpt: 'Carmen buys tomatoes, asks for advice, and learns a new recipe.', paragraphs: [
      { t: 'Carmen va al mercado los sábados por la mañana. Compra fruta, verdura y, a veces, pescado fresco.', e: 'Carmen goes to the market on Saturday mornings. She buys fruit, vegetables and, sometimes, fresh fish.' },
      { t: 'Hoy quiere hacer gazpacho. Necesita tomates muy maduros. «¿Cuáles son los mejores hoy?» pregunta.', e: 'Today she wants to make gazpacho. She needs very ripe tomatoes. "Which are the best today?" she asks.' },
      { t: 'La señora del puesto le enseña los tomates rojos del fondo. «Estos, guapa. Son de Almería.»', e: 'The lady at the stall shows her the red tomatoes at the back. "These ones, dear. They\'re from Almería."' },
      { t: 'Carmen compra un kilo. La señora le dice un truco: «Añade un poquito de pan duro. Queda más cremoso.»', e: 'Carmen buys a kilo. The lady tells her a tip: "Add a little bit of stale bread. It comes out creamier."' },
      { t: 'Carmen le da las gracias y vuelve a casa contenta, con una receta nueva en la cabeza.', e: 'Carmen thanks her and goes home happy, with a new recipe in her head.' },
    ]},
    { id: 'spanish-a-rainy-afternoon', level: 'A1', title: 'A Rainy Afternoon', nativeTitle: 'Una tarde de lluvia', glyph: 'Ll', minutes: 2, words: 70, excerpt: 'Two friends stay inside, drink chocolate and play cards.', paragraphs: [
      { t: 'Es sábado por la tarde y está lloviendo. Marta y Elena no pueden salir.', e: "It's Saturday afternoon and it's raining. Marta and Elena cannot go out." },
      { t: '«No importa», dice Marta. «Vamos a hacer chocolate caliente y a jugar a las cartas.»', e: '"It doesn\'t matter," Marta says. "Let\'s make hot chocolate and play cards."' },
      { t: 'Elena prepara dos tazas grandes. Marta busca la baraja en un cajón viejo.', e: 'Elena makes two big mugs. Marta looks for the deck of cards in an old drawer.' },
      { t: 'Pasan toda la tarde jugando y riendo. Fuera, la lluvia no para, pero a ellas no les molesta.', e: "They spend the whole afternoon playing and laughing. Outside, the rain doesn't stop, but it doesn't bother them." },
    ]},
    { id: 'spanish-the-night-train', level: 'A2', title: 'The Night Train', nativeTitle: 'El tren nocturno', glyph: 'T', minutes: 4, words: 132, excerpt: 'A long train ride from Madrid to Lisbon, and an unexpected conversation.', paragraphs: [
      { t: 'El tren salió de Madrid a las once de la noche. Yo iba solo, con un libro y una mochila pequeña.', e: 'The train left Madrid at eleven at night. I was travelling alone, with a book and a small backpack.' },
      { t: 'En mi compartimento ya había una señora mayor. Llevaba un abrigo gris y un sombrero del mismo color.', e: 'In my compartment there was already an elderly lady. She was wearing a grey coat and a hat of the same colour.' },
      { t: '«¿Va usted hasta Lisboa?» me preguntó con una sonrisa amable.', e: '"Are you going all the way to Lisbon?" she asked me with a kind smile.' },
      { t: '«Sí, señora. Voy a visitar a un viejo amigo que no veo desde hace muchos años.»', e: '"Yes, madam. I\'m going to visit an old friend whom I haven\'t seen for many years."' },
      { t: 'Empezamos a hablar y, sin darme cuenta, pasaron tres horas. Me contó que había vivido en Lisboa de joven.', e: 'We started talking and, without realising, three hours passed. She told me she had lived in Lisbon as a young woman.' },
      { t: 'Cuando llegamos a la mañana siguiente, me dio un papel con la dirección de una pastelería. «Vaya allí», dijo. «Y pida los pasteles de nata.»', e: 'When we arrived the next morning, she gave me a piece of paper with the address of a pastry shop. "Go there," she said. "And ask for the pastéis de nata."' },
    ]},
    { id: 'spanish-the-new-neighbour', level: 'A2', title: 'The New Neighbour', nativeTitle: 'El nuevo vecino', glyph: 'V', minutes: 3, words: 110, excerpt: 'Someone moves into the empty flat upstairs, and the building starts to change.', paragraphs: [
      { t: 'El piso de arriba estuvo vacío durante casi un año. Por fin, una mañana, llegó un camión de mudanzas.', e: 'The flat upstairs was empty for almost a year. Finally, one morning, a moving truck arrived.' },
      { t: 'El nuevo vecino se llama Andrés. Es músico y toca la guitarra. Tiene unos cuarenta años, creo.', e: 'The new neighbour is called Andrés. He is a musician and plays the guitar. He\'s about forty, I think.' },
      { t: 'Al principio, algunos vecinos no estaban contentos. «¿Y si toca por la noche?», decía la señora del tercero.', e: 'At first, some neighbours were not happy. "What if he plays at night?" said the lady from the third floor.' },
      { t: 'Pero Andrés solo toca por la tarde, y muy bajito. A veces, cuando subo las escaleras, me paro un momento a escuchar.', e: 'But Andrés only plays in the afternoon, and very quietly. Sometimes, when I\'m going up the stairs, I stop for a moment to listen.' },
      { t: 'El edificio se ha vuelto un poco más alegre desde que él llegó. Y eso, en una ciudad como esta, no es poca cosa.', e: 'The building has become a little more cheerful since he arrived. And that, in a city like this, is no small thing.' },
    ]},
    { id: 'spanish-the-bookshop-without-a-name', level: 'B1', title: 'The Bookshop Without a Name', nativeTitle: 'La librería sin nombre', glyph: 'L', minutes: 5, words: 178, excerpt: 'A bookshop in Granada with no sign, no name, and the right book for every visitor.', paragraphs: [
      { t: 'En una callejuela del Albaicín, en Granada, existe una librería que no tiene letrero. La gente del barrio simplemente la llama «la librería».', e: 'On a small lane in the Albaicín neighbourhood of Granada, there is a bookshop with no sign. The locals simply call it "the bookshop".' },
      { t: 'El dueño, don Esteban, dice que un nombre sería demasiado pretencioso. «Los libros ya tienen nombres. ¿Para qué darle uno más a la tienda?»', e: 'The owner, Don Esteban, says that a name would be too pretentious. "Books already have names. Why give one more to the shop?"' },
      { t: 'Cuando entras por primera vez, no te recibe con un «¿qué busca?», sino con un café y una conversación.', e: 'When you walk in for the first time, he doesn\'t greet you with "what are you looking for?", but with a coffee and a conversation.' },
      { t: 'Te pregunta cosas extrañas: dónde naciste, qué soñaste anoche, cuál fue el último viaje que te hizo feliz.', e: 'He asks you strange things: where you were born, what you dreamed last night, the last trip that made you happy.' },
      { t: 'Después se levanta despacio, recorre las estanterías y te entrega un libro. Casi siempre acierta.', e: 'Then he gets up slowly, walks along the shelves, and hands you a book. He almost always gets it right.' },
      { t: '«No vendo libros», suele decir. «Encuentro a sus lectores.»', e: '"I don\'t sell books," he often says. "I find their readers."' },
      { t: 'Algunos turistas se ríen y piensan que es un truco. Pero los que vuelven al año siguiente, vuelven con otro libro bajo el brazo y la misma sonrisa.', e: 'Some tourists laugh and think it\'s a trick. But those who come back a year later return with another book under their arm and the same smile.' },
    ]},
    { id: 'spanish-a-debate-about-tortilla', level: 'B1', title: 'A Debate About Tortilla', nativeTitle: 'Una discusión sobre la tortilla', glyph: 'Ñ', minutes: 4, words: 156, excerpt: 'Two friends will never agree on whether the perfect tortilla has onion.', paragraphs: [
      { t: '—¿Con cebolla o sin cebolla? —preguntó Javier, mirándome muy serio desde el otro lado de la mesa.', e: '"With onion or without onion?" Javier asked, looking at me very seriously from the other side of the table.' },
      { t: 'Sabía que no era una pregunta inocente. En España, la tortilla es casi una cuestión religiosa.', e: 'I knew it was not an innocent question. In Spain, the tortilla is almost a religious matter.' },
      { t: '—Con cebolla, por supuesto —contesté—. Sin cebolla está seca, no tiene gracia.', e: '"With onion, of course," I replied. "Without onion it\'s dry, it has no charm."' },
      { t: 'Javier dejó el tenedor en el plato como si lo hubiera ofendido personalmente. —Eso que tú dices no es una tortilla. Es una empanada plana.', e: 'Javier put his fork down on the plate as if I had personally offended him. "What you\'re describing isn\'t a tortilla. It\'s a flat pie."' },
      { t: 'Nos pasamos media hora discutiendo. Hablamos del huevo, de la patata, del tiempo de cocción, incluso del tipo de sartén.', e: 'We spent half an hour arguing. We talked about the egg, the potato, the cooking time, even the type of pan.' },
      { t: 'Al final, no llegamos a ninguna conclusión. Pedimos dos tortillas: una con cebolla, otra sin. Cada uno se comió la suya, en silencio, convencido de tener la razón.', e: 'In the end, we reached no conclusion. We ordered two tortillas: one with onion, one without. Each of us ate ours, in silence, convinced that we were right.' },
    ]},
    { id: 'spanish-an-old-cinema', level: 'B2', title: 'An Old Cinema', nativeTitle: 'Un cine antiguo', glyph: 'C', minutes: 6, words: 214, excerpt: 'The reopening of a neighbourhood cinema, and what we lose when these places disappear.', paragraphs: [
      { t: 'El Cine Doré, en pleno centro de la ciudad, cerró sus puertas hace tres años. Para los vecinos, fue mucho más que la desaparición de una sala más.', e: 'The Cine Doré, right in the centre of the city, closed its doors three years ago. For the locals, it was much more than the disappearance of just another screen.' },
      { t: 'Era el último cine de barrio que quedaba en la zona, un lugar de pantallas pequeñas, butacas de terciopelo gastado y proyeccionistas que conocían a la gente por su nombre.', e: 'It was the last neighbourhood cinema left in the area, a place of small screens, worn velvet seats and projectionists who knew people by name.' },
      { t: 'Cuando se anunció el cierre, hubo una protesta improvisada en la acera. No fueron grandes números, pero sí muchas caras conocidas y bastante indignación contenida.', e: 'When the closure was announced, there was an improvised protest on the pavement. The numbers weren\'t huge, but there were many familiar faces and a good deal of restrained indignation.' },
      { t: 'Sin embargo, el mes pasado se reabrió como cine, ahora gestionado por una cooperativa de vecinos y antiguos trabajadores.', e: 'However, it reopened last month as a cinema, now run by a cooperative of neighbours and former staff.' },
      { t: 'La programación es distinta a la de las grandes cadenas: cine de autor, ciclos en versión original, sesiones para escuelas y debates después de la función.', e: 'The programming is different from the big chains: arthouse films, original-version cycles, school screenings, and discussions after the show.' },
      { t: 'Hay quien dice que es un proyecto romántico y que no durará. Puede que tengan razón. Pero los que estamos volviendo cada miércoles no pensamos en eso.', e: 'Some say it\'s a romantic project that won\'t last. They may be right. But those of us going back every Wednesday aren\'t thinking about that.' },
      { t: 'Mientras dure, recordaremos que una ciudad también se mide por los lugares pequeños que decide salvar.', e: 'As long as it lasts, we\'ll remember that a city is also measured by the small places it chooses to save.' },
    ]},
  ],
};

const SCENARIOS_DATA: Record<string, Array<{
  id: string; level: string; title: string; nativeTitle: string; glyph: string;
  blurb: string; character: string; setting: string; goal: string; opener: string; starters: string[];
}>> = {
  greek: [
    { id: 'greek-ordering-a-coffee', level: 'A1', title: 'Ordering a coffee', nativeTitle: 'Παραγγέλνοντας καφέ', glyph: 'Κ', blurb: "You walk into a small café in Plaka. The waiter knows what they're doing.", character: 'Μάνος, a friendly waiter at a small kafeneio in Plaka', setting: 'A relaxed neighbourhood café in central Athens, mid-morning', goal: 'The learner successfully orders a drink and (optionally) something to eat, and gets the bill at the end.', opener: 'Καλημέρα! Καλώς ήρθατε. Τι θα πάρετε σήμερα;', starters: ['Καλημέρα!', 'Έναν φραπέ, παρακαλώ.', 'Έχετε γλυκά;'] },
    { id: 'greek-hotel-check-in', level: 'A1', title: 'Hotel check-in', nativeTitle: 'Check-in στο ξενοδοχείο', glyph: 'Ξ', blurb: 'You arrive at a small family-run hotel on Naxos with a reservation.', character: 'Ελένη, the owner of a small family hotel on Naxos', setting: 'Reception desk of a small island hotel, late afternoon', goal: 'The learner gives their name, confirms the reservation, gets a room number and a key, and asks one practical question (wifi, breakfast time, or pool).', opener: 'Καλησπέρα! Καλώς ήρθατε στο ξενοδοχείο μας. Έχετε κράτηση;', starters: ['Γεια σας!', 'Έχω μια κράτηση.', 'Στο όνομα...', 'Πότε είναι το πρωινό;'] },
    { id: 'greek-asking-for-directions', level: 'A1', title: 'Asking for directions', nativeTitle: 'Ζητώντας οδηγίες', glyph: 'Ο', blurb: "You're lost in Thessaloniki and trying to find the White Tower.", character: 'A friendly older woman walking her small dog near the seafront', setting: 'A street in central Thessaloniki, near the seafront', goal: 'The learner asks for directions to a specific place and confirms they understood.', opener: 'Παρακαλώ; Μπορώ να σας βοηθήσω;', starters: ['Συγγνώμη!', 'Πού είναι ο Λευκός Πύργος;', 'Είναι μακριά;', 'Ευχαριστώ πολύ.'] },
    { id: 'greek-at-the-fruit-stand', level: 'A1', title: 'At the fruit stand', nativeTitle: 'Στον μανάβη', glyph: 'Φ', blurb: 'Saturday morning market. You want tomatoes, oranges, maybe more.', character: 'Γιώργος, an old greengrocer at the Saturday street market', setting: 'An open-air street market on a Saturday morning', goal: 'The learner buys two or more items (specifying a quantity), asks how much it costs, and pays.', opener: 'Καλημέρα, νεαρέ! Τι θα πάρουμε σήμερα; Έχω φρέσκες ντομάτες.', starters: ['Καλημέρα!', 'Ένα κιλό ντομάτες, παρακαλώ.', 'Πόσο κάνει;', 'Τα ρέστα μου;'] },
    { id: 'greek-at-the-pharmacy', level: 'A2', title: 'At the pharmacy', nativeTitle: 'Στο φαρμακείο', glyph: 'Φ', blurb: "You've caught a small cold and need something for your throat.", character: 'Σοφία, a pharmacist in a neighbourhood farmakeio', setting: 'A small Athens pharmacy, late morning, no other customers', goal: 'The learner describes at least one symptom, accepts or asks about a recommendation, and pays.', opener: 'Καλημέρα, πώς μπορώ να σας βοηθήσω σήμερα;', starters: ['Καλημέρα!', 'Δεν αισθάνομαι καλά.', 'Πονάει ο λαιμός μου.', 'Τι μου προτείνετε;'] },
    { id: 'greek-buying-a-ferry-ticket', level: 'A2', title: 'Buying a ferry ticket', nativeTitle: 'Αγοράζοντας εισιτήριο πλοίου', glyph: 'Π', blurb: 'Piraeus port, summer. You want a ticket to Sifnos for tomorrow morning.', character: 'A practical ticket-seller at a small ferry kiosk in Piraeus', setting: 'A busy ticket booth at Piraeus port', goal: 'The learner buys a ferry ticket to a specific island for a specific day, confirms the time, and asks one practical question.', opener: 'Λέγετε. Για ποιο νησί;', starters: ['Καλησπέρα!', 'Ένα εισιτήριο για τη Σίφνο, παρακαλώ.', 'Τι ώρα φεύγει;', 'Πόσες ώρες κάνει;'] },
    { id: 'greek-renting-an-apartment', level: 'A2', title: 'Renting an apartment', nativeTitle: 'Νοικιάζοντας διαμέρισμα', glyph: 'Δ', blurb: "You're meeting a landlord to view a small flat in Exarcheia.", character: 'Δημήτρης, a no-nonsense landlord showing his Exarcheia flat', setting: 'Inside a small Athens apartment, on a viewing', goal: 'The learner asks at least two questions about the flat and gives a clear yes/no/maybe at the end.', opener: 'Καλώς ήρθατε. Λοιπόν, το διαμέρισμα είναι 55 τετραγωνικά, δύο δωμάτια. Τι θέλετε να ξέρετε;', starters: ['Πόσο κάνει το ενοίκιο;', 'Συμπεριλαμβάνονται τα κοινόχρηστα;', 'Επιτρέπονται κατοικίδια;'] },
    { id: 'greek-a-complaint-about-a-meal', level: 'B1', title: 'A complaint about a meal', nativeTitle: 'Παράπονο στο εστιατόριο', glyph: 'Ε', blurb: "The pasta is cold. You'd like it fixed without making a scene.", character: 'Νίκος, an attentive but slightly defensive head waiter', setting: 'A small taverna in Plaka during a busy dinner service', goal: 'The learner clearly states the problem, accepts a fair resolution, and the situation is resolved politely.', opener: 'Καλησπέρα σας, όλα καλά με το φαγητό;', starters: ['Συγγνώμη, μπορώ να σας πω κάτι;', 'Τα μακαρόνια είναι κρύα.', 'Θα προτιμούσα να...', 'Δεν πειράζει.'] },
    { id: 'greek-a-casual-job-interview', level: 'B1', title: 'A casual job interview', nativeTitle: 'Συνέντευξη για δουλειά', glyph: 'Β', blurb: "A small bookshop is hiring weekend help. You're interested.", character: 'Μαρίνα, the owner of a small independent bookshop', setting: 'Inside a small neighbourhood bookshop, on a quiet afternoon', goal: "The learner introduces themselves, explains why they want the job, asks one question about the work, and the interviewer either invites them for a trial shift or politely closes the conversation.", opener: 'Α, καλώς ήρθατε. Καθίστε. Πείτε μου λίγο για εσάς — γιατί σας ενδιαφέρει αυτή η δουλειά;', starters: ['Γεια σας, ήρθα για τη δουλειά.', 'Διαβάζω πολύ.', 'Πότε θα ξεκινούσα;', 'Πόσες ώρες την εβδομάδα;'] },
  ],
  spanish: [
    { id: 'spanish-ordering-a-coffee', level: 'A1', title: 'Ordering a coffee', nativeTitle: 'Pidiendo un café', glyph: 'C', blurb: 'A small bar in Madrid. You want a coffee and a tostada.', character: 'Carlos, a quick but warm barman at a Madrid bar', setting: 'A bar at breakfast time, a few regulars at the counter', goal: 'The learner orders a drink, optionally something to eat, and asks for the bill.', opener: '¡Buenos días! ¿Qué le pongo?', starters: ['¡Buenos días!', 'Un café con leche, por favor.', '¿Tienen tostadas?', 'La cuenta, por favor.'] },
    { id: 'spanish-hotel-check-in', level: 'A1', title: 'Hotel check-in', nativeTitle: 'Check-in en el hotel', glyph: 'H', blurb: 'A small boutique hotel in Granada, late afternoon.', character: 'Lucía, a friendly receptionist at a small Granada hotel', setting: 'Hotel reception in a converted old townhouse', goal: 'The learner gives their name, confirms the reservation, gets a room number and key, and asks one practical question.', opener: '¡Buenas tardes! Bienvenido. ¿Tiene una reserva?', starters: ['¡Hola!', 'Tengo una reserva.', 'A nombre de...', '¿A qué hora es el desayuno?'] },
    { id: 'spanish-meeting-your-host', level: 'A1', title: 'Meeting your host', nativeTitle: 'Conociendo a tu anfitriona', glyph: 'A', blurb: "First evening at a Spanish family's home. Get to know each other.", character: 'Pilar, the warm mother of the family hosting you', setting: "The kitchen of a Spanish family home, just before dinner", goal: "The learner says their name and where they're from, answers one personal question, and asks one question back.", opener: '¡Hola, hola! Pasa, pasa. ¿Qué tal el viaje? Cuéntame algo de ti.', starters: ['¡Hola, mucho gusto!', 'Me llamo...', 'Soy de...', '¿Y usted?'] },
    { id: 'spanish-at-the-market', level: 'A1', title: 'At the market', nativeTitle: 'En el mercado', glyph: 'M', blurb: 'Mercado de la Cebada. You want fruit for the week.', character: 'Ana, a sharp but friendly fruit-stall owner', setting: 'A covered Madrid market on a Saturday morning', goal: 'The learner buys at least two items (with quantities), asks the price, and pays.', opener: '¡Hola, guapa! ¿Qué te pongo hoy? Tengo unas fresas que están de muerte.', starters: ['¡Buenas!', 'Un kilo de naranjas.', '¿Cuánto es?', 'Una bolsa, por favor.'] },
    { id: 'spanish-at-the-doctor', level: 'A2', title: 'At the doctor', nativeTitle: 'En el médico', glyph: 'D', blurb: "You've had a headache for three days. Time to ask someone.", character: 'Doctor Ramírez, a calm general practitioner', setting: 'A health centre consulting room', goal: 'The learner describes at least one symptom, says how long it has lasted, and accepts a recommendation.', opener: 'Buenos días, siéntese. Dígame, ¿qué le ocurre?', starters: ['Buenos días, doctor.', 'Me duele la cabeza desde el lunes.', 'No duermo bien.', '¿Es grave?'] },
    { id: 'spanish-buying-a-train-ticket', level: 'A2', title: 'Buying a train ticket', nativeTitle: 'Comprando un billete de tren', glyph: 'T', blurb: 'Atocha station. You want to get to Sevilla next Friday.', character: 'A polite but efficient ticket-seller at Atocha', setting: 'The ticket counter at a busy Madrid train station', goal: 'The learner buys a train ticket to a specific city for a specific day and asks one question.', opener: 'Hola, ¿adónde viaja?', starters: ['Quería un billete a Sevilla.', 'Para el viernes que viene.', '¿A qué hora sale?', '¿Cuánto tarda?'] },
    { id: 'spanish-meeting-a-flatmate', level: 'A2', title: 'Meeting a flatmate', nativeTitle: 'Conociendo a un compañero de piso', glyph: 'P', blurb: "You're viewing a room. The current flatmate has questions.", character: 'Javi, the current flatmate, a relaxed Madrid graduate student', setting: 'The kitchen of a shared flat in Lavapiés', goal: 'The learner answers basic questions, asks at least one question about the flat, and the conversation ends with a clear next step.', opener: '¡Hey, qué tal! Pasa. Bueno, cuéntame un poco — ¿a qué te dedicas?', starters: ['¡Hola, soy...!', 'Trabajo desde casa.', 'No fumo.', '¿Cómo son los vecinos?'] },
    { id: 'spanish-returning-a-defective-item', level: 'B1', title: 'Returning a defective item', nativeTitle: 'Devolviendo un producto', glyph: 'T', blurb: 'The lamp you bought last week stopped working. You have the receipt.', character: 'An attentive but bureaucratic shop assistant at an electronics store', setting: 'The customer service desk of a small electronics shop', goal: 'The learner clearly explains the problem, shows or mentions the receipt, and reaches a resolution.', opener: 'Buenas tardes, ¿en qué puedo ayudarle?', starters: ['Buenas, traigo una lámpara que compré la semana pasada.', 'No funciona desde ayer.', 'Aquí tiene el tique.', 'Preferiría un reembolso.'] },
    { id: 'spanish-friendly-debate-over-dinner', level: 'B1', title: 'Friendly debate over dinner', nativeTitle: 'Discutiendo en la cena', glyph: 'Ñ', blurb: 'A heated conversation about whether tortilla should have onion.', character: 'Marta, a passionate friend at a long dinner, very pro-onion', setting: 'Around a Spanish dinner table, second bottle of wine', goal: 'The learner gives an opinion with at least one reason, considers a counter-argument, and either changes their mind or politely agrees to disagree.', opener: 'Vale, te lo voy a preguntar directamente: tortilla, ¿con cebolla o sin cebolla?', starters: ['A ver, yo creo que...', 'No estoy de acuerdo.', 'Pero ten en cuenta que...', 'Vale, te entiendo, pero...'] },
    { id: 'spanish-a-job-interview', level: 'B2', title: 'A job interview', nativeTitle: 'Una entrevista de trabajo', glyph: 'J', blurb: 'Second-round interview at a small design studio in Barcelona.', character: 'Ricardo, the creative director of a small Barcelona design studio', setting: "A bright meeting room with the studio's work pinned up on the walls", goal: "The learner answers questions about their experience, asks at least two thoughtful questions about the role or studio, and the interview closes with a clear next step.", opener: 'Bienvenido/a. Gracias por venir. Cuéntame, ¿qué te llamó la atención de nuestro estudio?', starters: ['Encantado/a de conocerte.', 'Llevo cinco años en el sector...', 'Lo que más me interesa es...', '¿Cómo es un día normal aquí?'] },
  ],
};

const FREE_CHAT_DATA: Array<{
  id: string; languageId: string; kind: string; nativeTitle: string; blurb: string;
  openers: string[]; starters: string[];
}> = [
  {
    id: 'greek-normal',
    languageId: 'greek',
    kind: 'normal',
    nativeTitle: 'Ελεύθερη συνομιλία',
    blurb: 'Have a relaxed chat in Greek. Topics drift naturally and the AI adjusts to your level. Talk about anything.',
    openers: ['Γεια σου! Πώς ήταν η μέρα σου;'],
    starters: ['Γεια σου!', 'Είμαι κουρασμένος σήμερα.', 'Τι κάνεις;'],
  },
  {
    id: 'greek-crosstalk',
    languageId: 'greek',
    kind: 'crosstalk',
    nativeTitle: 'Εναλλαγή γλωσσών',
    blurb: "Write in English and the model replies in Greek, with a literal translation. Easier on the brain when you're tired.",
    openers: ["Γεια σου, χαίρομαι που σε βλέπω. Πώς πάει;\n---\nHi, nice to see you. How's it going?"],
    starters: ['Hi! Tell me something I should know about Greece.', 'How was your weekend?', "I'm a beginner — go easy on me."],
  },
  {
    id: 'spanish-normal',
    languageId: 'spanish',
    kind: 'normal',
    nativeTitle: 'Charla libre',
    blurb: 'Have a relaxed chat in Spanish. Topics drift naturally and the AI adjusts to your level. Talk about anything.',
    openers: ['¡Hola! ¿Qué tal el día?'],
    starters: ['¡Hola!', 'Estoy un poco cansado.', '¿Qué has hecho hoy?'],
  },
  {
    id: 'spanish-crosstalk',
    languageId: 'spanish',
    kind: 'crosstalk',
    nativeTitle: 'Lengua cruzada',
    blurb: "Write in English and the model replies in Spanish, with a literal translation. Easier on the brain when you're tired.",
    openers: ["¡Hola! Me alegra verte. ¿Cómo te va todo?\n---\nHi! Nice to see you. How's everything going?"],
    starters: ['Hi! What did you do today?', 'Tell me something about Spain.', "I'm a beginner — please be patient with me."],
  },
];

// ─── seeding ──────────────────────────────────────────────────────────────────

async function seed() {
  const ds = new DataSource({
    type: 'postgres',
    url: process.env.DATABASE_URL,
    synchronize: false,
    logging: false,
    entities: [
      LearningLanguageEntity, LevelEntity, UnitEntity, LessonEntity, LessonSlideEntity,
      VocabItemEntity, StoryEntity, StoryParagraphEntity, ConversationScenarioEntity, FreeChatModeEntity,
    ],
  });
  await ds.initialize();

  const langRepo    = ds.getRepository(LearningLanguageEntity);
  const levelRepo   = ds.getRepository(LevelEntity);
  const unitRepo    = ds.getRepository(UnitEntity);
  const lessonRepo  = ds.getRepository(LessonEntity);
  const slideRepo   = ds.getRepository(LessonSlideEntity);
  const vocabRepo   = ds.getRepository(VocabItemEntity);
  const storyRepo   = ds.getRepository(StoryEntity);
  const paraRepo    = ds.getRepository(StoryParagraphEntity);
  const scenRepo    = ds.getRepository(ConversationScenarioEntity);
  const freeRepo    = ds.getRepository(FreeChatModeEntity);

  console.log('Seeding languages…');
  for (const ld of LANGUAGE_DATA) {
    const existing = await langRepo.findOneBy({ id: ld.id });
    if (!existing) await langRepo.save(langRepo.create(ld));
  }

  console.log('Seeding levels, units, lessons…');
  const levelEntities: Record<string, LevelEntity> = {};
  const unitEntities: Record<string, UnitEntity> = {};

  for (const [langCode, course] of Object.entries(COURSES)) {
    for (let li = 0; li < course.levels.length; li++) {
      const cefrCode = course.levels[li];
      const levelId = `${langCode}-${cefrCode.toLowerCase()}`;
      let level = await levelRepo.findOneBy({ id: levelId });
      if (!level) {
        level = levelRepo.create({ id: levelId, languageId: langCode, name: cefrCode, ordinal: li + 1 });
        await levelRepo.save(level);
      }
      levelEntities[`${langCode}-${cefrCode}`] = level;

      const unitsForLevel = course.units[cefrCode] ?? [];
      for (let ui = 0; ui < unitsForLevel.length; ui++) {
        const ud = unitsForLevel[ui];
        let unit = await unitRepo.findOneBy({ id: ud.id });
        if (!unit) {
          unit = unitRepo.create({ id: ud.id, levelId: level.id, ordinal: ui + 1, title: ud.title, subtitle: ud.subtitle });
          await unitRepo.save(unit);
        }
        unitEntities[ud.id] = unit;

        for (let lsi = 0; lsi < ud.lessons.length; lsi++) {
          const ld = ud.lessons[lsi];
          const lessonId = `${ud.id}-${kebab(ld.title)}`;
          let lesson = await lessonRepo.findOneBy({ id: lessonId });
          if (!lesson) {
            lesson = lessonRepo.create({ id: lessonId, unitId: unit.id, ordinal: lsi + 1, title: ld.title, description: ld.desc, status: ld.status });
            await lessonRepo.save(lesson);
          }
          if (lessonId === DEMO_LESSON_ID) {
            const existingSlides = await slideRepo.findBy({ lessonId });
            if (existingSlides.length === 0) {
              for (let si = 0; si < DEMO_SLIDES.length; si++) {
                const s = DEMO_SLIDES[si];
                await slideRepo.save(slideRepo.create({ lessonId, ordinal: si + 1, type: s.type, payload: s.payload }));
              }
            }
          }
        }
      }
    }
  }

  console.log('Seeding vocab items…');
  for (const [langCode, pool] of Object.entries(PRACTICE_POOL)) {
    for (const item of pool.items) {
      const existing = await vocabRepo.findOneBy({ languageId: langCode, word: item.word });
      if (existing) continue;
      const matchingUnit = Object.values(unitEntities).find(u => u.title === item.unit) ?? null;
      await vocabRepo.save(vocabRepo.create({
        languageId: langCode,
        unitId: matchingUnit?.id ?? null,
        word: item.word,
        romanization: item.roman,
        translation: item.translation,
        unitTitle: item.unit,
        sentence: item.sentence,
        sentenceFull: item.full,
        imageUrl: null,
      }));
    }
  }

  console.log('Seeding stories…');
  for (const [langCode, stories] of Object.entries(STORIES_DATA)) {
    for (const sd of stories) {
      const levelKey = `${langCode}-${sd.level}`;
      const level = levelEntities[levelKey];
      if (!level) { console.warn(`  Missing level ${levelKey}, skipping story ${sd.id}`); continue; }
      let story = await storyRepo.findOneBy({ id: sd.id });
      if (!story) {
        story = storyRepo.create({ id: sd.id, languageId: langCode, levelId: level.id, title: sd.title, nativeTitle: sd.nativeTitle, glyph: sd.glyph, minutes: sd.minutes, words: sd.words, excerpt: sd.excerpt });
        await storyRepo.save(story);
        for (let pi = 0; pi < sd.paragraphs.length; pi++) {
          const p = sd.paragraphs[pi];
          await paraRepo.save(paraRepo.create({ storyId: story.id, ordinal: pi + 1, targetText: p.t, englishText: p.e }));
        }
      }
    }
  }

  console.log('Seeding conversation scenarios…');
  for (const [langCode, scenarios] of Object.entries(SCENARIOS_DATA)) {
    for (const sc of scenarios) {
      const levelKey = `${langCode}-${sc.level}`;
      const level = levelEntities[levelKey];
      if (!level) { console.warn(`  Missing level ${levelKey}, skipping scenario ${sc.id}`); continue; }
      let scenario = await scenRepo.findOneBy({ id: sc.id });
      if (!scenario) {
        await scenRepo.save(scenRepo.create({ id: sc.id, languageId: langCode, levelId: level.id, title: sc.title, nativeTitle: sc.nativeTitle, glyph: sc.glyph, blurb: sc.blurb, character: sc.character, setting: sc.setting, goal: sc.goal, opener: sc.opener, starters: sc.starters }));
      }
    }
  }

  console.log('Seeding free chat modes…');
  for (const fm of FREE_CHAT_DATA) {
    const existing = await freeRepo.findOneBy({ id: fm.id });
    if (!existing) {
      await freeRepo.save(freeRepo.create(fm));
    }
  }

  await ds.destroy();
  console.log('Seed complete.');
}

seed().catch(err => { console.error(err); process.exit(1); });
