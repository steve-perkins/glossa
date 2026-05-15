// Stories data for Glossa
// Each story has parallel paragraphs: target language + English translation
// Levels: A1 (short, present tense) → B1+ (longer, more complex)

const STORIES = {
  greek: {
    A1: [
      {
        id: "g-a1-prwino",
        title: "My Morning",
        nativeTitle: "Το πρωινό μου",
        glyph: "Π",
        minutes: 3,
        words: 78,
        excerpt: "Nikos lives in Athens. Every morning he drinks coffee on the balcony.",
        read: true,
        paragraphs: [
          {
            t: "Καλημέρα! Είμαι ο Νίκος και ζω στην Αθήνα, σε ένα μικρό διαμέρισμα στην Πλάκα.",
            e: "Good morning! I am Nikos and I live in Athens, in a small apartment in Plaka.",
          },
          {
            t: "Κάθε πρωί ξυπνάω στις επτά. Πάω στην κουζίνα και φτιάχνω έναν ελληνικό καφέ.",
            e: "Every morning I wake up at seven. I go to the kitchen and make a Greek coffee.",
          },
          {
            t: "Μετά πηγαίνω στο μπαλκόνι μου. Από εκεί βλέπω την Ακρόπολη. Είναι πολύ όμορφη το πρωί.",
            e: "Then I go to my balcony. From there I see the Acropolis. It is very beautiful in the morning.",
          },
          {
            t: "Πίνω τον καφέ μου αργά και ακούω τα πουλιά. Είναι η αγαπημένη μου ώρα της ημέρας.",
            e: "I drink my coffee slowly and listen to the birds. It is my favourite time of the day.",
          },
          {
            t: "Στις οκτώ φεύγω για τη δουλειά. Η Αθήνα είναι ήδη ξύπνια και θορυβώδης.",
            e: "At eight I leave for work. Athens is already awake and noisy.",
          },
        ],
      },
      {
        id: "g-a1-kafe",
        title: "A Coffee in Exarcheia",
        nativeTitle: "Ένας καφές στα Εξάρχεια",
        glyph: "Κ",
        minutes: 2,
        words: 64,
        excerpt: "Maria meets a friend at a small café and orders a freddo.",
        read: true,
        paragraphs: [
          {
            t: "Η Μαρία περπατάει στα Εξάρχεια. Είναι ζέστη και διψάει.",
            e: "Maria walks in Exarcheia. It is hot and she is thirsty.",
          },
          {
            t: "Βλέπει ένα μικρό καφενείο στη γωνία και μπαίνει μέσα.",
            e: "She sees a small café on the corner and goes inside.",
          },
          {
            t: "«Καλησπέρα», λέει στον σερβιτόρο. «Έναν φρέντο εσπρέσο, παρακαλώ. Χωρίς ζάχαρη.»",
            e: "\"Good evening,\" she says to the waiter. \"One freddo espresso, please. Without sugar.\"",
          },
          {
            t: "Ο σερβιτόρος χαμογελάει. «Αμέσως. Θέλετε και νερό;»",
            e: "The waiter smiles. \"Right away. Would you also like water?\"",
          },
          {
            t: "«Ναι, ευχαριστώ.» Η Μαρία κάθεται και ανοίγει το βιβλίο της.",
            e: "\"Yes, thank you.\" Maria sits down and opens her book.",
          },
        ],
      },
      {
        id: "g-a1-gata",
        title: "The Cat on the Roof",
        nativeTitle: "Η γάτα στη στέγη",
        glyph: "Γ",
        minutes: 2,
        words: 58,
        excerpt: "A small cat has a problem and a kind neighbour helps.",
        read: false,
        paragraphs: [
          {
            t: "Μια μικρή γάτα είναι στη στέγη ενός σπιτιού. Δεν μπορεί να κατέβει.",
            e: "A small cat is on the roof of a house. It cannot come down.",
          },
          {
            t: "Μια γυναίκα την ακούει από κάτω. «Τι κάνεις εκεί πάνω, μικρή;»",
            e: "A woman hears it from below. \"What are you doing up there, little one?\"",
          },
          {
            t: "Πηγαίνει στον γείτονά της, τον κύριο Γιώργο. «Έχεις σκάλα;» τον ρωτάει.",
            e: "She goes to her neighbour, Mr Giorgos. \"Do you have a ladder?\" she asks him.",
          },
          {
            t: "Ο κύριος Γιώργος φέρνει μια μεγάλη σκάλα και βοηθάει τη γάτα να κατέβει.",
            e: "Mr Giorgos brings a big ladder and helps the cat come down.",
          },
        ],
      },
      {
        id: "g-a1-laiki",
        title: "Saturday at the Market",
        nativeTitle: "Σάββατο στη λαϊκή",
        glyph: "Λ",
        minutes: 3,
        words: 82,
        excerpt: "Yiannis shops for fresh tomatoes, oranges and a friendly chat.",
        read: false,
        paragraphs: [
          {
            t: "Κάθε Σάββατο ο Γιάννης πηγαίνει στη λαϊκή αγορά της γειτονιάς του.",
            e: "Every Saturday Yiannis goes to the open-air market in his neighbourhood.",
          },
          {
            t: "Αγοράζει φρέσκες ντομάτες, αγγούρια, πορτοκάλια και μια μεγάλη φέτα.",
            e: "He buys fresh tomatoes, cucumbers, oranges and a big piece of feta.",
          },
          {
            t: "Ο μανάβης τον ξέρει καλά. «Καλημέρα, Γιάννη! Σήμερα οι ντομάτες είναι πολύ γλυκές.»",
            e: "The greengrocer knows him well. \"Good morning, Yiannis! The tomatoes are very sweet today.\"",
          },
          {
            t: "«Δώσε μου δύο κιλά τότε. Και μισό κιλό ελιές από την Καλαμάτα.»",
            e: "\"Give me two kilos then. And half a kilo of olives from Kalamata.\"",
          },
          {
            t: "Πληρώνει, παίρνει τις σακούλες του και γυρίζει σπίτι. Το μεσημέρι θα φτιάξει χωριάτικη σαλάτα.",
            e: "He pays, takes his bags and goes home. At lunchtime he will make a Greek salad.",
          },
        ],
      },
    ],
    A2: [
      {
        id: "g-a2-nisi",
        title: "A Letter from the Island",
        nativeTitle: "Ένα γράμμα από το νησί",
        glyph: "Ν",
        minutes: 4,
        words: 124,
        excerpt: "Eleni writes to her sister about her first week on Sifnos.",
        read: true,
        paragraphs: [
          {
            t: "Αγαπημένη μου Δήμητρα, σου γράφω από τη Σίφνο. Έφτασα την περασμένη Δευτέρα με το πλοίο.",
            e: "My dear Dimitra, I am writing to you from Sifnos. I arrived last Monday by ferry.",
          },
          {
            t: "Το ταξίδι ήταν μακρύ αλλά πολύ ωραίο. Από το κατάστρωμα έβλεπα τα δελφίνια να ακολουθούν το πλοίο.",
            e: "The trip was long but very nice. From the deck I could see the dolphins following the ferry.",
          },
          {
            t: "Μένω σε ένα μικρό σπίτι κοντά στη θάλασσα. Κάθε πρωί κάνω μπάνιο πριν από το πρωινό μου.",
            e: "I am staying in a small house close to the sea. Every morning I swim before breakfast.",
          },
          {
            t: "Χθες πήγα στο Καστρομονάστηρο. Ο δρόμος ήταν δύσκολος, αλλά η θέα από πάνω ήταν μαγική.",
            e: "Yesterday I went to the monastery up on the rocks. The path was hard, but the view from the top was magical.",
          },
          {
            t: "Γνώρισα μια κυρία που έφτιαχνε ρεβιθάδα σε γάστρα. Μου εξήγησε πώς μαγειρεύεται για ώρες.",
            e: "I met a lady who was making chickpea stew in a clay pot. She explained to me how it cooks for hours.",
          },
          {
            t: "Σου στέλνω πολλά φιλιά. Έλα την επόμενη φορά μαζί μου — θα σου αρέσει πάρα πολύ. Ελένη.",
            e: "I send you many kisses. Come with me next time — you will love it very much. Eleni.",
          },
        ],
      },
      {
        id: "g-a2-treno",
        title: "The Last Train",
        nativeTitle: "Το τελευταίο τρένο",
        glyph: "Τ",
        minutes: 4,
        words: 138,
        excerpt: "Andreas almost misses the train back to Thessaloniki and meets an old friend.",
        read: false,
        paragraphs: [
          {
            t: "Ο Ανδρέας έτρεχε στον σταθμό. Είχε μόνο πέντε λεπτά πριν φύγει το τελευταίο τρένο για τη Θεσσαλονίκη.",
            e: "Andreas was running through the station. He had only five minutes before the last train to Thessaloniki left.",
          },
          {
            t: "Στην αποβάθρα ένας άντρας τού φώναξε: «Ανδρέα! Εσύ είσαι;»",
            e: "On the platform a man called out to him: \"Andreas! Is that you?\"",
          },
          {
            t: "Γύρισε και είδε τον Κώστα, έναν παλιό συμμαθητή από το σχολείο. Δεν τον είχε δει εδώ και δέκα χρόνια.",
            e: "He turned and saw Kostas, an old classmate from school. He had not seen him for ten years.",
          },
          {
            t: "«Δεν το πιστεύω! Πού πας;» ρώτησε ο Ανδρέας λαχανιασμένος.",
            e: "\"I can't believe it! Where are you going?\" Andreas asked, out of breath.",
          },
          {
            t: "«Στη Θεσσαλονίκη, επίσης. Πάμε να βρούμε θέσεις μαζί.»",
            e: "\"To Thessaloniki, too. Let's go and find seats together.\"",
          },
          {
            t: "Πέρασαν όλη τη νύχτα στο τρένο μιλώντας για τα παλιά. Όταν έφτασαν, ο ήλιος μόλις έβγαινε.",
            e: "They spent the whole night on the train talking about the old days. When they arrived, the sun was just rising.",
          },
        ],
      },
      {
        id: "g-a2-vivlio",
        title: "The Forgotten Book",
        nativeTitle: "Το ξεχασμένο βιβλίο",
        glyph: "Β",
        minutes: 3,
        words: 96,
        excerpt: "Sofia finds a book on a park bench with a curious note inside.",
        read: false,
        paragraphs: [
          {
            t: "Η Σοφία καθόταν σε ένα παγκάκι στο Πεδίον του Άρεως όταν παρατήρησε ένα βιβλίο δίπλα της.",
            e: "Sofia was sitting on a bench in Pedion tou Areos park when she noticed a book next to her.",
          },
          {
            t: "Κάποιος το είχε ξεχάσει. Το πήρε στα χέρια της: ήταν ένα παλιό μυθιστόρημα του Καζαντζάκη.",
            e: "Someone had forgotten it. She took it in her hands: it was an old novel by Kazantzakis.",
          },
          {
            t: "Άνοιξε την πρώτη σελίδα και βρήκε ένα σημείωμα: «Αν διαβάζεις αυτό, συνέχισε το ταξίδι του».",
            e: "She opened the first page and found a note: \"If you are reading this, continue its journey.\"",
          },
          {
            t: "Χαμογέλασε. Έβαλε το βιβλίο στην τσάντα της και αποφάσισε να το διαβάσει αυτή τη βδομάδα.",
            e: "She smiled. She put the book in her bag and decided to read it this week.",
          },
          {
            t: "Όταν τελείωνε, σκόπευε να το αφήσει σε ένα άλλο παγκάκι, κάπου αλλού στην πόλη.",
            e: "When she finished, she planned to leave it on another bench, somewhere else in the city.",
          },
        ],
      },
    ],
    B1: [
      {
        id: "g-b1-zaxaroplasteio",
        title: "The Pastry Shop on the Corner",
        nativeTitle: "Το ζαχαροπλαστείο της γωνίας",
        glyph: "Ζ",
        minutes: 6,
        words: 192,
        excerpt: "Three generations of a Thessaloniki family have run the same bougatsa shop.",
        read: false,
        paragraphs: [
          {
            t: "Στη γωνία μιας ήσυχης γειτονιάς της Θεσσαλονίκης, βρίσκεται ένα μικρό ζαχαροπλαστείο που λειτουργεί από το 1952.",
            e: "On the corner of a quiet Thessaloniki neighbourhood, there is a small pastry shop that has been operating since 1952.",
          },
          {
            t: "Ο παππούς Αλέκος, που το άνοιξε όταν γύρισε από την Κωνσταντινούπολη, έφερε μαζί του τις συνταγές της γιαγιάς του.",
            e: "Grandfather Alekos, who opened it when he returned from Constantinople, brought with him the recipes of his grandmother.",
          },
          {
            t: "Σήμερα το μαγαζί το κρατάει η εγγονή του, η Δέσποινα. Σηκώνεται κάθε πρωί στις τέσσερις για να ζυμώσει τη μπουγάτσα.",
            e: "Today his granddaughter, Despoina, runs the shop. She gets up every morning at four to knead the bougatsa dough.",
          },
          {
            t: "«Πολλοί μου λένε ότι θα ήταν πιο εύκολο να αγοράζω έτοιμο φύλλο», λέει χαμογελώντας. «Αλλά τότε δεν θα ήταν δικό μας».",
            e: "\"Many people tell me it would be easier to buy ready-made phyllo,\" she says, smiling. \"But then it wouldn't be ours.\"",
          },
          {
            t: "Οι πελάτες έρχονται από όλη την πόλη — άλλοι για τη μπουγάτσα με κρέμα, άλλοι για τη γνωστή της γαλατόπιτα.",
            e: "Customers come from all over the city — some for the bougatsa with cream, others for her well-known milk pie.",
          },
          {
            t: "Όταν τη ρωτάς αν θα κλείσει ποτέ, σου απαντάει σταθερά: «Όχι όσο μπορώ να σηκώνομαι στις τέσσερις».",
            e: "When you ask her if she will ever close it, she answers firmly: \"Not as long as I can still get up at four.\"",
          },
          {
            t: "Και πραγματικά, κάθε πρωί, η μυρωδιά από το φούρνο της γεμίζει τον δρόμο και ξυπνάει τη γειτονιά πιο γλυκά από κάθε ξυπνητήρι.",
            e: "And truly, every morning, the smell from her oven fills the street and wakes the neighbourhood more sweetly than any alarm clock.",
          },
        ],
      },
      {
        id: "g-b1-thalassa",
        title: "The Sea Remembers",
        nativeTitle: "Η θάλασσα θυμάται",
        glyph: "Θ",
        minutes: 5,
        words: 168,
        excerpt: "An old fisherman talks about how the sea has changed, and what stays the same.",
        read: false,
        paragraphs: [
          {
            t: "Ο κυρ-Στέφανος ψαρεύει στα ίδια νερά εδώ και πενήντα χρόνια. Λέει ότι η θάλασσα τον γνωρίζει καλύτερα από τη γυναίκα του.",
            e: "Mr Stefanos has been fishing in the same waters for fifty years. He says the sea knows him better than his wife does.",
          },
          {
            t: "«Παλιά», θυμάται, «βγαίναμε με δέκα βάρκες και γυρίζαμε με τα δίχτυα γεμάτα. Τώρα βγαίνουμε με δύο και τα φέρνουμε σχεδόν άδεια».",
            e: "\"In the old days,\" he remembers, \"we'd go out with ten boats and come back with the nets full. Now we go with two and bring them back almost empty.\"",
          },
          {
            t: "Παρόλα αυτά, δεν παραπονιέται. Λέει ότι η θάλασσα δεν φταίει για τίποτα — εμείς της ζητάμε πολλά και της δίνουμε λίγα.",
            e: "Even so, he doesn't complain. He says the sea is not to blame for anything — we ask too much of her and give too little back.",
          },
          {
            t: "Το βράδυ, όταν επιστρέφει στο λιμάνι, κάθεται με τους άλλους ψαράδες και πίνει ένα τσίπουρο.",
            e: "In the evening, when he returns to the harbour, he sits with the other fishermen and drinks a tsipouro.",
          },
          {
            t: "Μιλάνε για τον καιρό, για τα ψάρια που έπιασαν, για αυτά που τους ξέφυγαν, και κάποιες φορές δεν λένε τίποτα — απλά ακούνε τη θάλασσα.",
            e: "They talk about the weather, about the fish they caught, about those that got away, and sometimes they say nothing at all — they just listen to the sea.",
          },
          {
            t: "«Η θάλασσα θυμάται τα πάντα», λέει ο κυρ-Στέφανος. «Όλους εμάς, και όσους ήταν πριν από εμάς».",
            e: "\"The sea remembers everything,\" Mr Stefanos says. \"All of us, and all those who came before us.\"",
          },
        ],
      },
    ],
  },

  spanish: {
    A1: [
      {
        id: "s-a1-cafe",
        title: "Coffee with Grandma",
        nativeTitle: "Un café con la abuela",
        glyph: "C",
        minutes: 2,
        words: 72,
        excerpt: "Every Sunday Lucía visits her grandmother for coffee and stories.",
        read: true,
        paragraphs: [
          {
            t: "Todos los domingos, Lucía visita a su abuela. Vive en un pequeño piso en el centro de Sevilla.",
            e: "Every Sunday, Lucía visits her grandmother. She lives in a small flat in the centre of Seville.",
          },
          {
            t: "La abuela siempre prepara café y un trozo de bizcocho casero. «Siéntate, mi niña», dice con una sonrisa.",
            e: "Grandma always makes coffee and a piece of homemade sponge cake. \"Sit down, my child,\" she says with a smile.",
          },
          {
            t: "Hablan de la familia, del tiempo y de los vecinos. La abuela cuenta las mismas historias de cuando era joven.",
            e: "They talk about the family, the weather and the neighbours. Grandma tells the same stories from when she was young.",
          },
          {
            t: "A Lucía no le importa. Le gusta escucharla. Para ella, el domingo no empieza hasta ese café.",
            e: "Lucía does not mind. She likes listening to her. For her, Sunday does not begin until that coffee.",
          },
        ],
      },
      {
        id: "s-a1-perro",
        title: "The Dog and the Beach",
        nativeTitle: "El perro y la playa",
        glyph: "P",
        minutes: 2,
        words: 60,
        excerpt: "Pablo's dog Toby is afraid of the waves — until he isn't.",
        read: false,
        paragraphs: [
          {
            t: "Pablo va a la playa con su perro, Toby. Es la primera vez que Toby ve el mar.",
            e: "Pablo goes to the beach with his dog, Toby. It is the first time Toby has seen the sea.",
          },
          {
            t: "El perro mira las olas y tiene un poco de miedo. No quiere acercarse al agua.",
            e: "The dog looks at the waves and is a little afraid. He doesn't want to come near the water.",
          },
          {
            t: "Pablo le tira una pelota azul. Toby corre, se olvida del miedo y se mete en el mar.",
            e: "Pablo throws a blue ball for him. Toby runs, forgets his fear and goes into the sea.",
          },
          {
            t: "Ahora le encanta la playa. Cada sábado pregunta con los ojos: «¿Hoy también vamos?»",
            e: "Now he loves the beach. Every Saturday he asks with his eyes: \"Are we going today too?\"",
          },
        ],
      },
      {
        id: "s-a1-mercado",
        title: "At the Market",
        nativeTitle: "En el mercado",
        glyph: "M",
        minutes: 3,
        words: 88,
        excerpt: "Carmen buys tomatoes, asks for advice, and learns a new recipe.",
        read: false,
        paragraphs: [
          {
            t: "Carmen va al mercado los sábados por la mañana. Compra fruta, verdura y, a veces, pescado fresco.",
            e: "Carmen goes to the market on Saturday mornings. She buys fruit, vegetables and, sometimes, fresh fish.",
          },
          {
            t: "Hoy quiere hacer gazpacho. Necesita tomates muy maduros. «¿Cuáles son los mejores hoy?» pregunta.",
            e: "Today she wants to make gazpacho. She needs very ripe tomatoes. \"Which are the best today?\" she asks.",
          },
          {
            t: "La señora del puesto le enseña los tomates rojos del fondo. «Estos, guapa. Son de Almería.»",
            e: "The lady at the stall shows her the red tomatoes at the back. \"These ones, dear. They're from Almería.\"",
          },
          {
            t: "Carmen compra un kilo. La señora le dice un truco: «Añade un poquito de pan duro. Queda más cremoso.»",
            e: "Carmen buys a kilo. The lady tells her a tip: \"Add a little bit of stale bread. It comes out creamier.\"",
          },
          {
            t: "Carmen le da las gracias y vuelve a casa contenta, con una receta nueva en la cabeza.",
            e: "Carmen thanks her and goes home happy, with a new recipe in her head.",
          },
        ],
      },
      {
        id: "s-a1-lluvia",
        title: "A Rainy Afternoon",
        nativeTitle: "Una tarde de lluvia",
        glyph: "Ll",
        minutes: 2,
        words: 70,
        excerpt: "Two friends stay inside, drink chocolate and play cards.",
        read: false,
        paragraphs: [
          {
            t: "Es sábado por la tarde y está lloviendo. Marta y Elena no pueden salir.",
            e: "It's Saturday afternoon and it's raining. Marta and Elena cannot go out.",
          },
          {
            t: "«No importa», dice Marta. «Vamos a hacer chocolate caliente y a jugar a las cartas.»",
            e: "\"It doesn't matter,\" Marta says. \"Let's make hot chocolate and play cards.\"",
          },
          {
            t: "Elena prepara dos tazas grandes. Marta busca la baraja en un cajón viejo.",
            e: "Elena makes two big mugs. Marta looks for the deck of cards in an old drawer.",
          },
          {
            t: "Pasan toda la tarde jugando y riendo. Fuera, la lluvia no para, pero a ellas no les molesta.",
            e: "They spend the whole afternoon playing and laughing. Outside, the rain doesn't stop, but it doesn't bother them.",
          },
        ],
      },
    ],
    A2: [
      {
        id: "s-a2-tren",
        title: "The Night Train",
        nativeTitle: "El tren nocturno",
        glyph: "T",
        minutes: 4,
        words: 132,
        excerpt: "A long train ride from Madrid to Lisbon, and an unexpected conversation.",
        read: false,
        paragraphs: [
          {
            t: "El tren salió de Madrid a las once de la noche. Yo iba solo, con un libro y una mochila pequeña.",
            e: "The train left Madrid at eleven at night. I was travelling alone, with a book and a small backpack.",
          },
          {
            t: "En mi compartimento ya había una señora mayor. Llevaba un abrigo gris y un sombrero del mismo color.",
            e: "In my compartment there was already an elderly lady. She was wearing a grey coat and a hat of the same colour.",
          },
          {
            t: "«¿Va usted hasta Lisboa?» me preguntó con una sonrisa amable.",
            e: "\"Are you going all the way to Lisbon?\" she asked me with a kind smile.",
          },
          {
            t: "«Sí, señora. Voy a visitar a un viejo amigo que no veo desde hace muchos años.»",
            e: "\"Yes, madam. I'm going to visit an old friend whom I haven't seen for many years.\"",
          },
          {
            t: "Empezamos a hablar y, sin darme cuenta, pasaron tres horas. Me contó que había vivido en Lisboa de joven.",
            e: "We started talking and, without realising, three hours passed. She told me she had lived in Lisbon as a young woman.",
          },
          {
            t: "Cuando llegamos a la mañana siguiente, me dio un papel con la dirección de una pastelería. «Vaya allí», dijo. «Y pida los pasteles de nata. Dígales que va de mi parte.»",
            e: "When we arrived the next morning, she gave me a piece of paper with the address of a pastry shop. \"Go there,\" she said. \"And ask for the pastéis de nata. Tell them you come from me.\"",
          },
        ],
      },
      {
        id: "s-a2-vecino",
        title: "The New Neighbour",
        nativeTitle: "El nuevo vecino",
        glyph: "V",
        minutes: 3,
        words: 110,
        excerpt: "Someone moves into the empty flat upstairs, and the building starts to change.",
        read: false,
        paragraphs: [
          {
            t: "El piso de arriba estuvo vacío durante casi un año. Por fin, una mañana, llegó un camión de mudanzas.",
            e: "The flat upstairs was empty for almost a year. Finally, one morning, a moving truck arrived.",
          },
          {
            t: "El nuevo vecino se llama Andrés. Es músico y toca la guitarra. Tiene unos cuarenta años, creo.",
            e: "The new neighbour is called Andrés. He is a musician and plays the guitar. He's about forty, I think.",
          },
          {
            t: "Al principio, algunos vecinos no estaban contentos. «¿Y si toca por la noche?», decía la señora del tercero.",
            e: "At first, some neighbours were not happy. \"What if he plays at night?\" said the lady from the third floor.",
          },
          {
            t: "Pero Andrés solo toca por la tarde, y muy bajito. A veces, cuando subo las escaleras, me paro un momento a escuchar.",
            e: "But Andrés only plays in the afternoon, and very quietly. Sometimes, when I'm going up the stairs, I stop for a moment to listen.",
          },
          {
            t: "El edificio se ha vuelto un poco más alegre desde que él llegó. Y eso, en una ciudad como esta, no es poca cosa.",
            e: "The building has become a little more cheerful since he arrived. And that, in a city like this, is no small thing.",
          },
        ],
      },
    ],
    B1: [
      {
        id: "s-b1-libreria",
        title: "The Bookshop Without a Name",
        nativeTitle: "La librería sin nombre",
        glyph: "L",
        minutes: 5,
        words: 178,
        excerpt: "A bookshop in Granada with no sign, no name, and the right book for every visitor.",
        read: false,
        paragraphs: [
          {
            t: "En una callejuela del Albaicín, en Granada, existe una librería que no tiene letrero. La gente del barrio simplemente la llama «la librería».",
            e: "On a small lane in the Albaicín neighbourhood of Granada, there is a bookshop with no sign. The locals simply call it \"the bookshop\".",
          },
          {
            t: "El dueño, don Esteban, dice que un nombre sería demasiado pretencioso. «Los libros ya tienen nombres. ¿Para qué darle uno más a la tienda?»",
            e: "The owner, Don Esteban, says that a name would be too pretentious. \"Books already have names. Why give one more to the shop?\"",
          },
          {
            t: "Cuando entras por primera vez, no te recibe con un «¿qué busca?», sino con un café y una conversación.",
            e: "When you walk in for the first time, he doesn't greet you with \"what are you looking for?\", but with a coffee and a conversation.",
          },
          {
            t: "Te pregunta cosas extrañas: dónde naciste, qué soñaste anoche, cuál fue el último viaje que te hizo feliz.",
            e: "He asks you strange things: where you were born, what you dreamed last night, the last trip that made you happy.",
          },
          {
            t: "Después se levanta despacio, recorre las estanterías y te entrega un libro. Casi siempre acierta.",
            e: "Then he gets up slowly, walks along the shelves, and hands you a book. He almost always gets it right.",
          },
          {
            t: "«No vendo libros», suele decir. «Encuentro a sus lectores.»",
            e: "\"I don't sell books,\" he often says. \"I find their readers.\"",
          },
          {
            t: "Algunos turistas se ríen y piensan que es un truco. Pero los que vuelven al año siguiente, vuelven con otro libro bajo el brazo y la misma sonrisa.",
            e: "Some tourists laugh and think it's a trick. But those who come back a year later return with another book under their arm and the same smile.",
          },
        ],
      },
      {
        id: "s-b1-tortilla",
        title: "A Debate About Tortilla",
        nativeTitle: "Una discusión sobre la tortilla",
        glyph: "Ñ",
        minutes: 4,
        words: 156,
        excerpt: "Two friends will never agree on whether the perfect tortilla has onion.",
        read: false,
        paragraphs: [
          {
            t: "—¿Con cebolla o sin cebolla? —preguntó Javier, mirándome muy serio desde el otro lado de la mesa.",
            e: "\"With onion or without onion?\" Javier asked, looking at me very seriously from the other side of the table.",
          },
          {
            t: "Sabía que no era una pregunta inocente. En España, la tortilla es casi una cuestión religiosa.",
            e: "I knew it was not an innocent question. In Spain, the tortilla is almost a religious matter.",
          },
          {
            t: "—Con cebolla, por supuesto —contesté—. Sin cebolla está seca, no tiene gracia.",
            e: "\"With onion, of course,\" I replied. \"Without onion it's dry, it has no charm.\"",
          },
          {
            t: "Javier dejó el tenedor en el plato como si lo hubiera ofendido personalmente. —Eso que tú dices no es una tortilla. Es una empanada plana.",
            e: "Javier put his fork down on the plate as if I had personally offended him. \"What you're describing isn't a tortilla. It's a flat pie.\"",
          },
          {
            t: "Nos pasamos media hora discutiendo. Hablamos del huevo, de la patata, del tiempo de cocción, incluso del tipo de sartén.",
            e: "We spent half an hour arguing. We talked about the egg, the potato, the cooking time, even the type of pan.",
          },
          {
            t: "Al final, no llegamos a ninguna conclusión. Pedimos dos tortillas: una con cebolla, otra sin. Cada uno se comió la suya, en silencio, convencido de tener la razón.",
            e: "In the end, we reached no conclusion. We ordered two tortillas: one with onion, one without. Each of us ate ours, in silence, convinced that we were right.",
          },
        ],
      },
    ],
    B2: [
      {
        id: "s-b2-cine",
        title: "An Old Cinema",
        nativeTitle: "Un cine antiguo",
        glyph: "C",
        minutes: 6,
        words: 214,
        excerpt: "The reopening of a neighbourhood cinema, and what we lose when these places disappear.",
        read: false,
        paragraphs: [
          {
            t: "El Cine Doré, en pleno centro de la ciudad, cerró sus puertas hace tres años. Para los vecinos, fue mucho más que la desaparición de una sala más.",
            e: "The Cine Doré, right in the centre of the city, closed its doors three years ago. For the locals, it was much more than the disappearance of just another screen.",
          },
          {
            t: "Era el último cine de barrio que quedaba en la zona, un lugar de pantallas pequeñas, butacas de terciopelo gastado y proyeccionistas que conocían a la gente por su nombre.",
            e: "It was the last neighbourhood cinema left in the area, a place of small screens, worn velvet seats and projectionists who knew people by name.",
          },
          {
            t: "Cuando se anunció el cierre, hubo una protesta improvisada en la acera. No fueron grandes números, pero sí muchas caras conocidas y bastante indignación contenida.",
            e: "When the closure was announced, there was an improvised protest on the pavement. The numbers weren't huge, but there were many familiar faces and a good deal of restrained indignation.",
          },
          {
            t: "Después del cierre, el edificio estuvo abandonado mucho tiempo. Algunos pensaron que terminaría convertido en un supermercado o, peor aún, en un piso turístico más.",
            e: "After the closure, the building stood abandoned for a long time. Some thought it would end up turned into a supermarket or, worse still, just another tourist apartment.",
          },
          {
            t: "Sin embargo, el mes pasado se reabrió como cine, ahora gestionado por una cooperativa de vecinos y antiguos trabajadores.",
            e: "However, it reopened last month as a cinema, now run by a cooperative of neighbours and former staff.",
          },
          {
            t: "La programación es distinta a la de las grandes cadenas: cine de autor, ciclos en versión original, sesiones para escuelas y debates después de la función.",
            e: "The programming is different from the big chains: arthouse films, original-version cycles, school screenings, and discussions after the show.",
          },
          {
            t: "Hay quien dice que es un proyecto romántico y que no durará. Puede que tengan razón. Pero los que estamos volviendo cada miércoles no pensamos en eso.",
            e: "Some say it's a romantic project that won't last. They may be right. But those of us going back every Wednesday aren't thinking about that.",
          },
          {
            t: "Mientras dure, recordaremos que una ciudad también se mide por los lugares pequeños que decide salvar.",
            e: "As long as it lasts, we'll remember that a city is also measured by the small places it chooses to save.",
          },
        ],
      },
    ],
  },
};

window.GLOSSA_STORIES = STORIES;
