// Course data for Glossa demo
// Two languages, three levels each, ~6 units each, 5-7 lessons per unit

const COURSES = {
  greek: {
    name: "Greek",
    native: "Ελληνικά",
    flag: "GR",
    levels: ["A1", "A2", "B1"],
    units: {
      A1: [
        {
          id: "g-a1-1",
          title: "First Words",
          subtitle: "Greetings, introductions, the alphabet",
          lessons: [
            { title: "The Greek alphabet", desc: "Learn the 24 letters and their sounds", status: "done" },
            { title: "Hello & goodbye", desc: "Yia sou, kalimera, kalispera, kalinychta", status: "done" },
            { title: "What's your name?", desc: "Asking and answering simple personal questions", status: "done" },
            { title: "Where are you from?", desc: "Countries, nationalities, and a first feminine ending", status: "done" },
            { title: "Unit review", desc: "Putting your first conversation together", status: "done" },
          ],
        },
        {
          id: "g-a1-2",
          title: "People & Family",
          subtitle: "Pronouns, family members, possession",
          lessons: [
            { title: "I, you, he, she", desc: "Subject pronouns and the verb to be", status: "done" },
            { title: "My family", desc: "Twelve essential family-member nouns", status: "done" },
            { title: "This is my…", desc: "Possessive adjectives in their natural habitat", status: "current" },
            { title: "Describing people", desc: "Tall, short, kind — adjective agreement", status: "next" },
            { title: "Listening: a phone call", desc: "Maria introduces her family to a new friend", status: "next" },
            { title: "Unit review", desc: "Talk about the people closest to you", status: "next" },
          ],
        },
        {
          id: "g-a1-3",
          title: "Numbers, Days, Time",
          subtitle: "Counting, telling time, scheduling",
          lessons: [
            { title: "Numbers 1–20", desc: "Count, ask how much, give your phone number", status: "locked" },
            { title: "Numbers up to 100", desc: "Tens, hundreds, and stress patterns", status: "locked" },
            { title: "Days of the week", desc: "Deftera through Kyriaki, plus today and tomorrow", status: "locked" },
            { title: "What time is it?", desc: "The 12-hour clock and quarter-past phrases", status: "locked" },
            { title: "Making plans", desc: "Suggesting times, accepting, declining politely", status: "locked" },
            { title: "Unit review", desc: "Schedule a coffee with a friend, end to end", status: "locked" },
          ],
        },
        {
          id: "g-a1-4",
          title: "At the Taverna",
          subtitle: "Food, ordering, polite requests",
          lessons: [
            { title: "Café & taverna words", desc: "Drinks, mezedes, and how to read a menu", status: "locked" },
            { title: "I would like…", desc: "Polite requests and the conditional you'll use daily", status: "locked" },
            { title: "Ordering coffee", desc: "Greek coffee, frappé, freddo — and how to specify sweetness", status: "locked" },
            { title: "Asking for the bill", desc: "Splitting, tipping, and a few useful phrases", status: "locked" },
            { title: "Unit review", desc: "Run a full meal in Greek, from hello to goodbye", status: "locked" },
          ],
        },
        {
          id: "g-a1-5",
          title: "Around the Neighborhood",
          subtitle: "Places, directions, prepositions",
          lessons: [
            { title: "Places in town", desc: "Pharmacy, bakery, square — vocabulary you'll see on signs", status: "locked" },
            { title: "Left, right, straight", desc: "Giving and following short walking directions", status: "locked" },
            { title: "Excuse me, where is…?", desc: "Polite openers and asking strangers for help", status: "locked" },
            { title: "Reading a map", desc: "Street names, landmarks, and rough distances", status: "locked" },
            { title: "Unit review", desc: "Find your way to a specific café across town", status: "locked" },
          ],
        },
        {
          id: "g-a1-6",
          title: "A Day in My Life",
          subtitle: "Routines, present tense, frequency",
          lessons: [
            { title: "Morning routine", desc: "Wake up, get dressed, have breakfast — the verbs", status: "locked" },
            { title: "Present-tense verbs", desc: "Conjugating regular -o verbs across all six persons", status: "locked" },
            { title: "Always, often, never", desc: "Frequency adverbs and where they live in a sentence", status: "locked" },
            { title: "Talking about your day", desc: "Stitch a 60-second monologue about your routine", status: "locked" },
            { title: "Level checkpoint", desc: "A graded review of everything in A1", status: "locked" },
          ],
        },
      ],
      A2: [
        {
          id: "g-a2-1",
          title: "Past Adventures",
          subtitle: "Past tense, storytelling, time markers",
          lessons: [
            { title: "Last weekend", desc: "Time markers: yesterday, last week, two months ago", status: "locked" },
            { title: "Aorist tense intro", desc: "The Greek simple past and how stems shift", status: "locked" },
            { title: "Telling a short story", desc: "Sequencing events with then, after, finally", status: "locked" },
            { title: "Unit review", desc: "Recount a real trip you took recently", status: "locked" },
          ],
        },
        {
          id: "g-a2-2",
          title: "Travel & Transport",
          subtitle: "Tickets, schedules, the ferry to the islands",
          lessons: [
            { title: "At the bus station", desc: "Reading departure boards and asking for help", status: "locked" },
            { title: "Buying a ticket", desc: "One-way, return, with reservation — handled", status: "locked" },
            { title: "The ferry timetable", desc: "Decoding the Aegean ferry network in Greek", status: "locked" },
            { title: "Unit review", desc: "Plan a real trip from Athens to a chosen island", status: "locked" },
          ],
        },
        {
          id: "g-a2-3",
          title: "Health & Body",
          subtitle: "At the doctor, feelings, advice",
          lessons: [
            { title: "Parts of the body", desc: "Head to toe, with the most useful aches included", status: "locked" },
            { title: "I don't feel well", desc: "Describing symptoms accurately to a pharmacist", status: "locked" },
            { title: "You should…", desc: "Giving and receiving advice with prepei na", status: "locked" },
            { title: "Unit review", desc: "Handle a small medical issue on holiday", status: "locked" },
          ],
        },
      ],
      B1: [
        {
          id: "g-b1-1",
          title: "Opinions & Debates",
          subtitle: "Expressing views, agreeing, disagreeing",
          lessons: [
            { title: "I think that…", desc: "Hedged opinions and softeners that sound natural", status: "locked" },
            { title: "Subjunctive mood", desc: "When and how the subjunctive lurks behind na", status: "locked" },
            { title: "A radio debate", desc: "Listen to two Athenians argue about coffee", status: "locked" },
          ],
        },
      ],
    },
  },
  spanish: {
    name: "Spanish",
    native: "Español",
    flag: "ES",
    levels: ["A1", "A2", "B1", "B2"],
    units: {
      A1: [
        {
          id: "s-a1-1",
          title: "Hola, mucho gusto",
          subtitle: "Greetings, names, basic questions",
          lessons: [
            { title: "Saying hello", desc: "Hola, buenos días, qué tal — and when to use which", status: "done" },
            { title: "What's your name?", desc: "Asking, answering, and spelling it back", status: "current" },
            { title: "Numbers 1–10", desc: "Counting and giving a phone number out loud", status: "next" },
            { title: "Unit review", desc: "Your first thirty seconds of small talk", status: "next" },
          ],
        },
        {
          id: "s-a1-2",
          title: "Mi familia",
          subtitle: "Family, possessives, ser vs. estar",
          lessons: [
            { title: "Family vocabulary", desc: "Twelve nouns and the gendered articles that go with them", status: "locked" },
            { title: "Mi, tu, su", desc: "Possessive adjectives that match what they own", status: "locked" },
            { title: "Ser vs. estar", desc: "Introducing the imperfect distinction every learner asks about", status: "locked" },
            { title: "Describing people", desc: "Personality and looks with proper adjective agreement", status: "locked" },
            { title: "Unit review", desc: "Introduce your family in a short audio clip", status: "locked" },
          ],
        },
        {
          id: "s-a1-3",
          title: "En el café",
          subtitle: "Ordering food and drinks",
          lessons: [
            { title: "Café menu", desc: "Tapas, raciones, and how a Spanish menu is laid out", status: "locked" },
            { title: "Querer + infinitive", desc: "Polite requests with the verb you'll use most", status: "locked" },
            { title: "Ordering coffee", desc: "Café solo, cortado, con leche — pick your poison", status: "locked" },
            { title: "Unit review", desc: "Order, eat, and pay without falling back on English", status: "locked" },
          ],
        },
        {
          id: "s-a1-4",
          title: "La ciudad",
          subtitle: "Places, directions, prepositions",
          lessons: [
            { title: "Places in town", desc: "Plaza, ayuntamiento, farmacia and friends", status: "locked" },
            { title: "Hay vs. está", desc: "Two ways to say there is — and when each one fits", status: "locked" },
            { title: "Asking the way", desc: "Short, polite questions you can use anywhere", status: "locked" },
            { title: "Unit review", desc: "Navigate a stranger from the metro to your hotel", status: "locked" },
          ],
        },
        {
          id: "s-a1-5",
          title: "Mi día",
          subtitle: "Daily routine, present tense, time",
          lessons: [
            { title: "What time is it?", desc: "The 24-hour clock and the relaxed Spanish version", status: "locked" },
            { title: "Reflexive verbs", desc: "Levantarse, ducharse, acostarse — and the pronouns they need", status: "locked" },
            { title: "My typical day", desc: "Sequencing your morning, afternoon, and evening", status: "locked" },
            { title: "Level checkpoint", desc: "A graded review of everything in A1", status: "locked" },
          ],
        },
      ],
      A2: [
        {
          id: "s-a2-1",
          title: "Recuerdos",
          subtitle: "Imperfect tense, childhood memories",
          lessons: [
            { title: "Cuando era pequeño…", desc: "The imperfect tense for ongoing past habits", status: "locked" },
            { title: "Family stories", desc: "Sequencing memories with antes, siempre, todos los días", status: "locked" },
            { title: "Unit review", desc: "Tell a two-minute childhood story", status: "locked" },
          ],
        },
        {
          id: "s-a2-2",
          title: "De viaje",
          subtitle: "Travel, hotels, asking for help",
          lessons: [
            { title: "At the hotel", desc: "Checking in, asking for the wifi, the works", status: "locked" },
            { title: "Travel verbs", desc: "Coger, llegar, salir — and the prepositions they collect", status: "locked" },
            { title: "Unit review", desc: "Survive a forty-eight hour weekend in Madrid", status: "locked" },
          ],
        },
      ],
      B1: [
        {
          id: "s-b1-1",
          title: "Opiniones",
          subtitle: "Subjunctive, expressing wishes",
          lessons: [
            { title: "Espero que…", desc: "Triggering the subjunctive with feelings and wishes", status: "locked" },
            { title: "A heated discussion", desc: "Listen to friends debate the perfect tortilla", status: "locked" },
          ],
        },
      ],
      B2: [
        {
          id: "s-b2-1",
          title: "Cine y literatura",
          subtitle: "Cultural commentary, advanced narration",
          lessons: [
            { title: "Reviewing a film", desc: "Writing a short, opinionated review in Spanish", status: "locked" },
          ],
        },
      ],
    },
  },
};

window.GLOSSA_COURSES = COURSES;
