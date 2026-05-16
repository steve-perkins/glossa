export interface PracticeItem {
  word: string;
  roman: string | null;
  translation: string;
  unit: string;
  sentence: string[];
  full: string;
}
export interface PracticePool { voice: string; items: PracticeItem[]; }

export const PRACTICE_POOL: Record<string, PracticePool> = {
  greek: {
    voice: 'el-GR',
    items: [
      { word: 'καλημέρα', roman: 'kaliméra', translation: 'good morning', unit: 'First Words', sentence: ['', '_', ', τι κάνεις σήμερα;'], full: 'Καλημέρα, τι κάνεις σήμερα;' },
      { word: 'καλησπέρα', roman: 'kalispéra', translation: 'good evening', unit: 'First Words', sentence: ['', '_', ' σε όλους!'], full: 'Καλησπέρα σε όλους!' },
      { word: 'ευχαριστώ', roman: 'efharistó', translation: 'thank you', unit: 'First Words', sentence: ['', '_', ' πάρα πολύ για τη βοήθεια.'], full: 'Ευχαριστώ πάρα πολύ για τη βοήθεια.' },
      { word: 'παρακαλώ', roman: 'parakaló', translation: 'please / you\'re welcome', unit: 'First Words', sentence: ['Έναν καφέ, ', '_', '.'], full: 'Έναν καφέ, παρακαλώ.' },
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
