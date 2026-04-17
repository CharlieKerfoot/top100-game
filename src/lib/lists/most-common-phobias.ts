// Source: Composite ranking from clinical prevalence data and psychology surveys
// Ranked by estimated prevalence in the general population
import type { GameList } from './types';
import { mostCommonPhobiasHints } from './hints/most-common-phobias';

export const mostCommonPhobias: GameList = {
  id: 'most-common-phobias',
  name: 'Most Common Phobias',
  description: 'The 50 most prevalent phobias, ranked by estimated prevalence',
  topics: ['misc'],
  difficulty: 3,
  hints: mostCommonPhobiasHints,
  valueLabel: 'Fear of',
  size: 50,
  newUntil: '2026-06-16',
  items: [
    "Arachnophobia",       // 1 - Spiders
    "Ophidiophobia",       // 2 - Snakes
    "Acrophobia",          // 3 - Heights
    "Aerophobia",          // 4 - Flying
    "Cynophobia",          // 5 - Dogs
    "Astraphobia",         // 6 - Thunder & Lightning
    "Trypanophobia",       // 7 - Needles & Injections
    "Agoraphobia",         // 8 - Open or Crowded Spaces
    "Claustrophobia",      // 9 - Confined Spaces
    "Glossophobia",        // 10 - Public Speaking
    "Mysophobia",          // 11 - Germs & Contamination
    "Hemophobia",          // 12 - Blood
    "Thanatophobia",       // 13 - Death & Dying
    "Nyctophobia",         // 14 - Darkness
    "Aquaphobia",          // 15 - Water
    "Entomophobia",        // 16 - Insects
    "Emetophobia",         // 17 - Vomiting
    "Dentophobia",         // 18 - Dentists
    "Trypophobia",         // 19 - Clusters of Holes
    "Pyrophobia",          // 20 - Fire
    "Coulrophobia",        // 21 - Clowns
    "Zoophobia",           // 22 - Animals (general)
    "Atychiphobia",        // 23 - Failure
    "Nosophobia",          // 24 - Getting a Disease
    "Xenophobia",          // 25 - Strangers or the Unknown
    "Necrophobia",         // 26 - Dead Things
    "Nosocomephobia",      // 27 - Hospitals
    "Monophobia",          // 28 - Being Alone
    "Ornithophobia",       // 29 - Birds
    "Ailurophobia",        // 30 - Cats
    "Thalassophobia",      // 31 - Deep Water or the Ocean
    "Tokophobia",          // 32 - Childbirth
    "Philophobia",         // 33 - Love or Emotional Attachment
    "Iatrophobia",         // 34 - Doctors
    "Haphephobia",         // 35 - Being Touched
    "Enochlophobia",       // 36 - Crowds
    "Somniphobia",         // 37 - Sleep
    "Gamophobia",          // 38 - Marriage
    "Autophobia",          // 39 - Being Ignored or Alone
    "Chronophobia",        // 40 - Time Passing
    "Decidophobia",        // 41 - Making Decisions
    "Pediophobia",         // 42 - Dolls
    "Ombrophobia",         // 43 - Rain
    "Telephonophobia",     // 44 - Phone Calls
    "Ergophobia",          // 45 - Work
    "Pogonophobia",        // 46 - Beards
    "Megalophobia",        // 47 - Large Objects
    "Omphalophobia",       // 48 - Belly Buttons
    "Nomophobia",          // 49 - Being Without a Phone
    "Hippopotomonstrosesquippedaliophobia", // 50 - Long Words
  ],
  values: [
    "Spiders",
    "Snakes",
    "Heights",
    "Flying",
    "Dogs",
    "Thunder & Lightning",
    "Needles & Injections",
    "Open or Crowded Spaces",
    "Confined Spaces",
    "Public Speaking",
    "Germs & Contamination",
    "Blood",
    "Death & Dying",
    "Darkness",
    "Water",
    "Insects",
    "Vomiting",
    "Dentists",
    "Clusters of Holes",
    "Fire",
    "Clowns",
    "Animals",
    "Failure",
    "Getting a Disease",
    "Strangers or the Unknown",
    "Dead Things",
    "Hospitals",
    "Being Alone",
    "Birds",
    "Cats",
    "Deep Water or the Ocean",
    "Childbirth",
    "Love or Emotional Attachment",
    "Doctors",
    "Being Touched",
    "Crowds",
    "Sleep",
    "Marriage",
    "Being Ignored or Alone",
    "Time Passing",
    "Making Decisions",
    "Dolls",
    "Rain",
    "Phone Calls",
    "Work",
    "Beards",
    "Large Objects",
    "Belly Buttons",
    "Being Without a Phone",
    "Long Words",
  ],
  aliases: {
    // -- "Fear of X" for every answer item --
    "Fear of Spiders": "Arachnophobia",
    "Fear of Snakes": "Ophidiophobia",
    "Fear of Heights": "Acrophobia",
    "Fear of Flying": "Aerophobia",
    "Fear of Dogs": "Cynophobia",
    "Fear of Thunder": "Astraphobia",
    "Fear of Lightning": "Astraphobia",
    "Fear of Thunder and Lightning": "Astraphobia",
    "Fear of Needles": "Trypanophobia",
    "Fear of Injections": "Trypanophobia",
    "Fear of Open Spaces": "Agoraphobia",
    "Fear of Crowded Spaces": "Agoraphobia",
    "Fear of Enclosed Spaces": "Claustrophobia",
    "Fear of Confined Spaces": "Claustrophobia",
    "Fear of Small Spaces": "Claustrophobia",
    "Fear of Public Speaking": "Glossophobia",
    "Fear of Germs": "Mysophobia",
    "Fear of Contamination": "Mysophobia",
    "Fear of Dirt": "Mysophobia",
    "Fear of Blood": "Hemophobia",
    "Fear of Death": "Thanatophobia",
    "Fear of Dying": "Thanatophobia",
    "Fear of the Dark": "Nyctophobia",
    "Fear of Darkness": "Nyctophobia",
    "Fear of Water": "Aquaphobia",
    "Fear of Insects": "Entomophobia",
    "Fear of Bugs": "Entomophobia",
    "Fear of Vomiting": "Emetophobia",
    "Fear of Throwing Up": "Emetophobia",
    "Fear of Dentists": "Dentophobia",
    "Fear of the Dentist": "Dentophobia",
    "Fear of Holes": "Trypophobia",
    "Fear of Clusters of Holes": "Trypophobia",
    "Fear of Fire": "Pyrophobia",
    "Fear of Flames": "Pyrophobia",
    "Fear of Clowns": "Coulrophobia",
    "Fear of Animals": "Zoophobia",
    "Fear of Failure": "Atychiphobia",
    "Fear of Failing": "Atychiphobia",
    "Fear of Disease": "Nosophobia",
    "Fear of Getting Sick": "Nosophobia",
    "Fear of Illness": "Nosophobia",
    "Fear of Strangers": "Xenophobia",
    "Fear of the Unknown": "Xenophobia",
    "Fear of Foreigners": "Xenophobia",
    "Fear of Dead Things": "Necrophobia",
    "Fear of Corpses": "Necrophobia",
    "Fear of Hospitals": "Nosocomephobia",
    "Fear of Being Alone": "Monophobia",
    "Fear of Loneliness": "Monophobia",
    "Fear of Solitude": "Monophobia",
    "Fear of Birds": "Ornithophobia",
    "Fear of Cats": "Ailurophobia",
    "Fear of the Ocean": "Thalassophobia",
    "Fear of Deep Water": "Thalassophobia",
    "Fear of the Sea": "Thalassophobia",
    "Fear of Childbirth": "Tokophobia",
    "Fear of Pregnancy": "Tokophobia",
    "Fear of Giving Birth": "Tokophobia",
    "Fear of Love": "Philophobia",
    "Fear of Falling in Love": "Philophobia",
    "Fear of Emotional Attachment": "Philophobia",
    "Fear of Doctors": "Iatrophobia",
    "Fear of Being Touched": "Haphephobia",
    "Fear of Touch": "Haphephobia",
    "Fear of Crowds": "Enochlophobia",
    "Fear of Sleep": "Somniphobia",
    "Fear of Sleeping": "Somniphobia",
    "Fear of Marriage": "Gamophobia",
    "Fear of Commitment": "Gamophobia",
    "Fear of Isolation": "Autophobia",
    "Fear of Yourself": "Autophobia",
    "Fear of Being Ignored": "Autophobia",
    "Fear of Time": "Chronophobia",
    "Fear of Time Passing": "Chronophobia",
    "Fear of Making Decisions": "Decidophobia",
    "Fear of Decisions": "Decidophobia",
    "Fear of Dolls": "Pediophobia",
    "Fear of Mannequins": "Pediophobia",
    "Fear of Rain": "Ombrophobia",
    "Fear of Storms": "Ombrophobia",
    "Fear of Phone Calls": "Telephonophobia",
    "Fear of Talking on the Phone": "Telephonophobia",
    "Fear of Work": "Ergophobia",
    "Fear of the Workplace": "Ergophobia",
    "Fear of Beards": "Pogonophobia",
    "Fear of Facial Hair": "Pogonophobia",
    "Fear of Large Objects": "Megalophobia",
    "Fear of Big Things": "Megalophobia",
    "Fear of Belly Buttons": "Omphalophobia",
    "Fear of Navels": "Omphalophobia",
    "Fear of No Phone": "Nomophobia",
    "Fear of Being Without a Phone": "Nomophobia",
    "Fear of Losing Your Phone": "Nomophobia",
    "Fear of Long Words": "Hippopotomonstrosesquippedaliophobia",
    // -- Plain noun aliases --
    "Spiders": "Arachnophobia",
    "Snakes": "Ophidiophobia",
    "Heights": "Acrophobia",
    "Flying": "Aerophobia",
    "Dogs": "Cynophobia",
    "Thunder": "Astraphobia",
    "Lightning": "Astraphobia",
    "Needles": "Trypanophobia",
    "Germs": "Mysophobia",
    "Blood": "Hemophobia",
    "Death": "Thanatophobia",
    "Darkness": "Nyctophobia",
    "Insects": "Entomophobia",
    "Vomiting": "Emetophobia",
    "Dentists": "Dentophobia",
    "Holes": "Trypophobia",
    "Clowns": "Coulrophobia",
    "Birds": "Ornithophobia",
    "Cats": "Ailurophobia",
    "Dolls": "Pediophobia",
    "Beards": "Pogonophobia",
    "Hospitals": "Nosocomephobia",
    "Crowds": "Enochlophobia",
    "Childbirth": "Tokophobia",
    // -- Alternate phobia names --
    "Germophobia": "Mysophobia",
    "Germaphobia": "Mysophobia",
    "Hematophobia": "Hemophobia",
    "Blood Phobia": "Hemophobia",
    "Spider Phobia": "Arachnophobia",
    "Snake Phobia": "Ophidiophobia",
    "Height Phobia": "Acrophobia",
    "Needle Phobia": "Trypanophobia",
    "Vertigo": "Acrophobia",
    "Hydrophobia": "Aquaphobia",
    "Stage Fright": "Glossophobia",
    "Odontophobia": "Dentophobia",
    "Scotophobia": "Nyctophobia",
    "Achluophobia": "Nyctophobia",
    "Brontophobia": "Astraphobia",
    "Tonitrophobia": "Astraphobia",
    "Keraunophobia": "Astraphobia",
    "Gatophobia": "Ailurophobia",
    "Felinophobia": "Ailurophobia",
    "Belonephobia": "Trypanophobia",
    "Demophobia": "Enochlophobia",
    "Ochlophobia": "Enochlophobia",
    "Aviophobia": "Aerophobia",
    "Pteromerhanophobia": "Aerophobia",
    "Bathophobia": "Thalassophobia",
    "Hypnophobia": "Somniphobia",
    "Noctiphobia": "Nyctophobia",
    "Pathophobia": "Nosophobia",
  },
};
