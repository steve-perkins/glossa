export type CefrLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

export interface Scenario {
  id: string; title: string; nativeTitle: string; glyph: string;
  blurb: string; character: string; setting: string; goal: string;
  starters: string[]; opener: string;
}
export interface FreeMode {
  id: string; title: string; nativeTitle: string; glyph: string; blurb: string;
  opener: Record<string, string>; starters: Record<string, string[]>;
}

export const CEFR_GUIDE: Partial<Record<CefrLevel, string>> = {
  A1: 'Use only A1 level: present tense, very short simple sentences (5-8 words), the most common everyday vocabulary, one idea per sentence. If the learner makes a mistake, do not correct them mid-sentence — keep the conversation flowing.',
  A2: 'Use only A2 level: present and simple past, short sentences (8-12 words), everyday vocabulary, occasional connectors (and, but, because, then).',
  B1: 'Use B1 level: a mix of tenses, sentences up to ~15 words, some idiomatic phrases, ask follow-up questions to keep the conversation going.',
  B2: 'Use B2 level: natural sentence length and rhythm, varied vocabulary, full range of tenses, light idiomatic language. Stay clear, but stop simplifying.',
};

export const CORE_RULES = [
  'DO NOT repeat or paraphrase what the learner just said back to them. They already know what they wrote. Respond like a real conversation partner with your OWN thoughts: react, ask a question, share an opinion, introduce something new.',
  'Keep replies short — 1 to 2 sentences total. End most replies with a single follow-up question so the conversation continues.',
  'Never explain grammar or break the fourth wall unless the learner explicitly asks. Stay in conversation.',
];

export function buildScenarioSystem(scenario: Scenario, langName: string, level: string): string {
  return [
    `You are roleplaying as ${scenario.character}.`,
    `Setting: ${scenario.setting}`,
    `The learner is practicing ${langName} at CEFR level ${level}.`,
    CEFR_GUIDE[level as CefrLevel] || CEFR_GUIDE.A2,
    '',
    '=== HARD RULES ===',
    `1. Reply ONLY in ${langName}. Never write in English unless the learner is clearly stuck and asks for help.`,
    '2. Stay in character at all times. You ARE this person; you are not an assistant pretending.',
    ...CORE_RULES.map((r, i) => `${i + 3}. ${r}`),
    '',
    '=== GOAL OF THIS SCENE ===',
    scenario.goal,
    '',
    '=== ENDING THE SCENE ===',
    'After the goal above has clearly been met (e.g. the order is placed, the room is assigned, the directions are understood), give ONE final in-character line that wraps things up, then on a brand-new line write exactly:',
    '[END]',
    'Do NOT write [END] in any other situation. Never write [END] inside a sentence. Never write it before the goal is met.',
  ].join('\n');
}

export function buildFreeSystem(mode: string, langName: string, level: string): string {
  const cefr = CEFR_GUIDE[level as CefrLevel] || CEFR_GUIDE.A2;
  if (mode === 'crosstalk') {
    return [
      `You are a friendly conversation partner helping someone practice ${langName} at CEFR level ${level}.`,
      `The learner writes to you in English. You reply in ${langName}, then give a literal English translation of YOUR ${langName} reply.`,
      cefr, '',
      '=== HARD RULES ===',
      ...CORE_RULES.map((r, i) => `${i + 1}. ${r}`),
      `${CORE_RULES.length + 1}. The translation you give is of YOUR OWN ${langName} reply — NOT a translation of the learner's English message.`,
      '',
      '=== REPLY FORMAT (exact) ===',
      'Every reply MUST follow this exact two-block format:',
      '',
      `<your ${langName} reply, 1–2 sentences>`,
      '---',
      `<literal English translation of your ${langName} reply above>`,
    ].join('\n');
  }
  return [
    `You are a friendly conversation partner helping someone practice ${langName} at CEFR level ${level}.`,
    `Both you and the learner write only in ${langName}.`,
    cefr, '',
    '=== HARD RULES ===',
    ...CORE_RULES.map((r, i) => `${i + 1}. ${r}`),
    `${CORE_RULES.length + 1}. If the learner clearly struggles, simplify your ${langName}. Never switch into English unless they explicitly ask for help.`,
    '',
    `Now begin the conversation. Respond ONLY in ${langName}.`,
  ].join('\n');
}

export const SCENARIOS: Record<string, Partial<Record<CefrLevel, Scenario[]>>> = {
  greek: {
    A1: [
      { id: 'g-a1-cafe', title: 'Ordering a coffee', nativeTitle: 'Παραγγέλνοντας καφέ', glyph: 'Κ',
        blurb: 'You walk into a small café in Plaka. The waiter knows what they\'re doing.',
        character: 'Μάνος, a friendly waiter at a small kafeneio in Plaka',
        setting: 'A relaxed neighbourhood café in central Athens, mid-morning',
        goal: 'The learner successfully orders a drink and (optionally) something to eat, and gets the bill at the end.',
        starters: ['Καλημέρα!', 'Έναν φραπέ, παρακαλώ.', 'Έχετε γλυκά;'],
        opener: 'Καλημέρα! Καλώς ήρθατε. Τι θα πάρετε σήμερα;' },
      { id: 'g-a1-hotel', title: 'Hotel check-in', nativeTitle: 'Check-in στο ξενοδοχείο', glyph: 'Ξ',
        blurb: 'You arrive at a small family-run hotel on Naxos with a reservation.',
        character: 'Ελένη, the owner of a small family hotel on Naxos',
        setting: 'Reception desk of a small island hotel, late afternoon',
        goal: 'The learner gives their name, confirms the reservation, gets a room number and a key, and asks one practical question (wifi, breakfast time, or pool).',
        starters: ['Γεια σας!', 'Έχω μια κράτηση.', 'Στο όνομα...', 'Πότε είναι το πρωινό;'],
        opener: 'Καλησπέρα! Καλώς ήρθατε στο ξενοδοχείο μας. Έχετε κράτηση;' },
      { id: 'g-a1-directions', title: 'Asking for directions', nativeTitle: 'Ζητώντας οδηγίες', glyph: 'Ο',
        blurb: 'You\'re lost in Thessaloniki and trying to find the White Tower.',
        character: 'A friendly older woman walking her small dog near the seafront',
        setting: 'A street in central Thessaloniki, near the seafront',
        goal: 'The learner asks for directions to a specific place and confirms they understood.',
        starters: ['Συγγνώμη!', 'Πού είναι ο Λευκός Πύργος;', 'Είναι μακριά;', 'Ευχαριστώ πολύ.'],
        opener: 'Παρακαλώ; Μπορώ να σας βοηθήσω;' },
      { id: 'g-a1-market', title: 'At the fruit stand', nativeTitle: 'Στον μανάβη', glyph: 'Φ',
        blurb: 'Saturday morning market. You want tomatoes, oranges, maybe more.',
        character: 'Γιώργος, an old greengrocer at the Saturday street market',
        setting: 'An open-air street market on a Saturday morning',
        goal: 'The learner buys two or more items (specifying a quantity), asks how much it costs, and pays.',
        starters: ['Καλημέρα!', 'Ένα κιλό ντομάτες, παρακαλώ.', 'Πόσο κάνει;', 'Τα ρέστα μου;'],
        opener: 'Καλημέρα, νεαρέ! Τι θα πάρουμε σήμερα; Έχω φρέσκες ντομάτες.' },
    ],
    A2: [
      { id: 'g-a2-pharmacy', title: 'At the pharmacy', nativeTitle: 'Στο φαρμακείο', glyph: 'Φ',
        blurb: "You've caught a small cold and need something for your throat.",
        character: 'Σοφία, a pharmacist in a neighbourhood farmakeio',
        setting: 'A small Athens pharmacy, late morning, no other customers',
        goal: 'The learner describes at least one symptom, accepts or asks about a recommendation, and pays.',
        starters: ['Καλημέρα!', 'Δεν αισθάνομαι καλά.', 'Πονάει ο λαιμός μου.', 'Τι μου προτείνετε;'],
        opener: 'Καλημέρα, πώς μπορώ να σας βοηθήσω σήμερα;' },
      { id: 'g-a2-ferry', title: 'Buying a ferry ticket', nativeTitle: 'Αγοράζοντας εισιτήριο πλοίου', glyph: 'Π',
        blurb: 'Piraeus port, summer. You want a ticket to Sifnos for tomorrow morning.',
        character: 'A practical ticket-seller at a small ferry kiosk in Piraeus',
        setting: 'A busy ticket booth at Piraeus port',
        goal: 'The learner buys a ferry ticket to a specific island for a specific day, confirms the time, and asks one practical question.',
        starters: ['Καλησπέρα!', 'Ένα εισιτήριο για τη Σίφνο, παρακαλώ.', 'Τι ώρα φεύγει;', 'Πόσες ώρες κάνει;'],
        opener: 'Λέγετε. Για ποιο νησί;' },
      { id: 'g-a2-apartment', title: 'Renting an apartment', nativeTitle: 'Νοικιάζοντας διαμέρισμα', glyph: 'Δ',
        blurb: "You're meeting a landlord to view a small flat in Exarcheia.",
        character: 'Δημήτρης, a no-nonsense landlord showing his Exarcheia flat',
        setting: 'Inside a small Athens apartment, on a viewing',
        goal: 'The learner asks at least two questions about the flat and gives a clear yes/no/maybe at the end.',
        starters: ['Πόσο κάνει το ενοίκιο;', 'Συμπεριλαμβάνονται τα κοινόχρηστα;', 'Επιτρέπονται κατοικίδια;'],
        opener: 'Καλώς ήρθατε. Λοιπόν, το διαμέρισμα είναι 55 τετραγωνικά, δύο δωμάτια. Τι θέλετε να ξέρετε;' },
    ],
    B1: [
      { id: 'g-b1-complaint', title: 'A complaint about a meal', nativeTitle: 'Παράπονο στο εστιατόριο', glyph: 'Ε',
        blurb: "The pasta is cold. You'd like it fixed without making a scene.",
        character: 'Νίκος, an attentive but slightly defensive head waiter',
        setting: 'A small taverna in Plaka during a busy dinner service',
        goal: 'The learner clearly states the problem, accepts a fair resolution, and the situation is resolved politely.',
        starters: ['Συγγνώμη, μπορώ να σας πω κάτι;', 'Τα μακαρόνια είναι κρύα.', 'Θα προτιμούσα να...', 'Δεν πειράζει.'],
        opener: 'Καλησπέρα σας, όλα καλά με το φαγητό;' },
      { id: 'g-b1-interview', title: 'A casual job interview', nativeTitle: 'Συνέντευξη για δουλειά', glyph: 'Β',
        blurb: "A small bookshop is hiring weekend help. You're interested.",
        character: 'Μαρίνα, the owner of a small independent bookshop',
        setting: 'Inside a small neighbourhood bookshop, on a quiet afternoon',
        goal: "The learner introduces themselves, explains why they want the job, asks one question about the work, and the interviewer either invites them for a trial shift or politely closes the conversation.",
        starters: ['Γεια σας, ήρθα για τη δουλειά.', 'Διαβάζω πολύ.', 'Πότε θα ξεκινούσα;', 'Πόσες ώρες την εβδομάδα;'],
        opener: 'Α, καλώς ήρθατε. Καθίστε. Πείτε μου λίγο για εσάς — γιατί σας ενδιαφέρει αυτή η δουλειά;' },
    ],
  },
  spanish: {
    A1: [
      { id: 's-a1-cafe', title: 'Ordering a coffee', nativeTitle: 'Pidiendo un café', glyph: 'C',
        blurb: 'A small bar in Madrid. You want a coffee and a tostada.',
        character: 'Carlos, a quick but warm barman at a Madrid bar',
        setting: 'A bar at breakfast time, a few regulars at the counter',
        goal: 'The learner orders a drink, optionally something to eat, and asks for the bill.',
        starters: ['¡Buenos días!', 'Un café con leche, por favor.', '¿Tienen tostadas?', 'La cuenta, por favor.'],
        opener: '¡Buenos días! ¿Qué le pongo?' },
      { id: 's-a1-hotel', title: 'Hotel check-in', nativeTitle: 'Check-in en el hotel', glyph: 'H',
        blurb: 'A small boutique hotel in Granada, late afternoon.',
        character: 'Lucía, a friendly receptionist at a small Granada hotel',
        setting: 'Hotel reception in a converted old townhouse',
        goal: 'The learner gives their name, confirms the reservation, gets a room number and key, and asks one practical question.',
        starters: ['¡Hola!', 'Tengo una reserva.', 'A nombre de...', '¿A qué hora es el desayuno?'],
        opener: '¡Buenas tardes! Bienvenido. ¿Tiene una reserva?' },
      { id: 's-a1-introductions', title: 'Meeting your host', nativeTitle: 'Conociendo a tu anfitriona', glyph: 'A',
        blurb: "First evening at a Spanish family's home. Get to know each other.",
        character: 'Pilar, the warm mother of the family hosting you',
        setting: "The kitchen of a Spanish family home, just before dinner",
        goal: 'The learner says their name and where they\'re from, answers one personal question, and asks one question back.',
        starters: ['¡Hola, mucho gusto!', 'Me llamo...', 'Soy de...', '¿Y usted?'],
        opener: '¡Hola, hola! Pasa, pasa. ¿Qué tal el viaje? Cuéntame algo de ti.' },
      { id: 's-a1-market', title: 'At the market', nativeTitle: 'En el mercado', glyph: 'M',
        blurb: 'Mercado de la Cebada. You want fruit for the week.',
        character: 'Ana, a sharp but friendly fruit-stall owner',
        setting: 'A covered Madrid market on a Saturday morning',
        goal: 'The learner buys at least two items (with quantities), asks the price, and pays.',
        starters: ['¡Buenas!', 'Un kilo de naranjas.', '¿Cuánto es?', 'Una bolsa, por favor.'],
        opener: '¡Hola, guapa! ¿Qué te pongo hoy? Tengo unas fresas que están de muerte.' },
    ],
    A2: [
      { id: 's-a2-doctor', title: 'At the doctor', nativeTitle: 'En el médico', glyph: 'D',
        blurb: "You've had a headache for three days. Time to ask someone.",
        character: 'Doctor Ramírez, a calm general practitioner',
        setting: 'A health centre consulting room',
        goal: 'The learner describes at least one symptom, says how long it has lasted, and accepts a recommendation.',
        starters: ['Buenos días, doctor.', 'Me duele la cabeza desde el lunes.', 'No duermo bien.', '¿Es grave?'],
        opener: 'Buenos días, siéntese. Dígame, ¿qué le ocurre?' },
      { id: 's-a2-train', title: 'Buying a train ticket', nativeTitle: 'Comprando un billete de tren', glyph: 'T',
        blurb: 'Atocha station. You want to get to Sevilla next Friday.',
        character: 'A polite but efficient ticket-seller at Atocha',
        setting: 'The ticket counter at a busy Madrid train station',
        goal: 'The learner buys a train ticket to a specific city for a specific day and asks one question.',
        starters: ['Quería un billete a Sevilla.', 'Para el viernes que viene.', '¿A qué hora sale?', '¿Cuánto tarda?'],
        opener: 'Hola, ¿adónde viaja?' },
      { id: 's-a2-roommate', title: 'Meeting a flatmate', nativeTitle: 'Conociendo a un compañero de piso', glyph: 'P',
        blurb: "You're viewing a room. The current flatmate has questions.",
        character: 'Javi, the current flatmate, a relaxed Madrid graduate student',
        setting: 'The kitchen of a shared flat in Lavapiés',
        goal: 'The learner answers basic questions, asks at least one question about the flat, and the conversation ends with a clear next step.',
        starters: ['¡Hola, soy...!', 'Trabajo desde casa.', 'No fumo.', '¿Cómo son los vecinos?'],
        opener: '¡Hey, qué tal! Pasa. Bueno, cuéntame un poco — ¿a qué te dedicas?' },
    ],
    B1: [
      { id: 's-b1-complaint', title: 'Returning a defective item', nativeTitle: 'Devolviendo un producto', glyph: 'T',
        blurb: 'The lamp you bought last week stopped working. You have the receipt.',
        character: 'An attentive but bureaucratic shop assistant at an electronics store',
        setting: 'The customer service desk of a small electronics shop',
        goal: 'The learner clearly explains the problem, shows or mentions the receipt, and reaches a resolution.',
        starters: ['Buenas, traigo una lámpara que compré la semana pasada.', 'No funciona desde ayer.', 'Aquí tiene el tique.', 'Preferiría un reembolso.'],
        opener: 'Buenas tardes, ¿en qué puedo ayudarle?' },
      { id: 's-b1-debate', title: 'Friendly debate over dinner', nativeTitle: 'Discutiendo en la cena', glyph: 'Ñ',
        blurb: 'A heated conversation about whether tortilla should have onion.',
        character: 'Marta, a passionate friend at a long dinner, very pro-onion',
        setting: 'Around a Spanish dinner table, second bottle of wine',
        goal: 'The learner gives an opinion with at least one reason, considers a counter-argument, and either changes their mind or politely agrees to disagree.',
        starters: ['A ver, yo creo que...', 'No estoy de acuerdo.', 'Pero ten en cuenta que...', 'Vale, te entiendo, pero...'],
        opener: 'Vale, te lo voy a preguntar directamente: tortilla, ¿con cebolla o sin cebolla?' },
    ],
    B2: [
      { id: 's-b2-job', title: 'A job interview', nativeTitle: 'Una entrevista de trabajo', glyph: 'J',
        blurb: 'Second-round interview at a small design studio in Barcelona.',
        character: 'Ricardo, the creative director of a small Barcelona design studio',
        setting: "A bright meeting room with the studio's work pinned up on the walls",
        goal: "The learner answers questions about their experience, asks at least two thoughtful questions about the role or studio, and the interview closes with a clear next step.",
        starters: ['Encantado/a de conocerte.', 'Llevo cinco años en el sector...', 'Lo que más me interesa es...', '¿Cómo es un día normal aquí?'],
        opener: 'Bienvenido/a. Gracias por venir. Cuéntame, ¿qué te llamó la atención de nuestro estudio?' },
    ],
  },
};

export const FREE_MODES: FreeMode[] = [
  {
    id: 'normal', title: 'Free chat', nativeTitle: 'Charla libre', glyph: '✶',
    blurb: 'Both of you write in the target language. The model adjusts to your level. Talk about anything.',
    opener: { greek: 'Γεια σου! Πώς ήταν η μέρα σου;', spanish: '¡Hola! ¿Qué tal el día?' },
    starters: {
      greek: ['Γεια σου!', 'Είμαι κουρασμένος σήμερα.', 'Τι κάνεις;'],
      spanish: ['¡Hola!', 'Estoy un poco cansado.', '¿Qué has hecho hoy?'],
    },
  },
  {
    id: 'crosstalk', title: 'Cross-talk', nativeTitle: 'Idioma cruzado', glyph: '⇄',
    blurb: 'You write in English. The model replies in the target language and adds a literal English gloss. Easier on the brain when you\'re tired.',
    opener: {
      greek: 'Γεια σου, χαίρομαι που σε βλέπω. Πώς πάει;\n---\nHi, nice to see you. How\'s it going?',
      spanish: '¡Hola! Me alegra verte. ¿Cómo te va todo?\n---\nHi! Nice to see you. How\'s everything going?',
    },
    starters: {
      greek: ['Hi! Tell me something I should know about Greece.', 'How was your weekend?', "I'm a beginner — go easy on me."],
      spanish: ['Hi! What did you do today?', 'Tell me something about Spain.', "I'm a beginner — please be patient with me."],
    },
  },
];
