// ~650 medication names (generic + brand) for autocomplete hints
export const mostPopularMedicationsHints: string[] = [
  // ==================== TOP 100 ANSWERS ====================
  "Atorvastatin", "Metformin", "Levothyroxine", "Lisinopril", "Amlodipine",
  "Metoprolol", "Albuterol", "Losartan", "Gabapentin", "Omeprazole",
  "Sertraline", "Rosuvastatin", "Pantoprazole", "Escitalopram",
  "Amphetamine/Dextroamphetamine", "Hydrochlorothiazide", "Bupropion",
  "Fluoxetine", "Semaglutide", "Montelukast", "Trazodone", "Simvastatin",
  "Amoxicillin", "Tamsulosin", "Hydrocodone/Acetaminophen", "Fluticasone",
  "Meloxicam", "Apixaban", "Furosemide", "Insulin Glargine", "Duloxetine",
  "Ibuprofen", "Famotidine", "Empagliflozin", "Carvedilol", "Tramadol",
  "Alprazolam", "Prednisone", "Hydroxyzine", "Buspirone", "Clopidogrel",
  "Glipizide", "Citalopram", "Potassium Chloride", "Allopurinol", "Aspirin",
  "Cyclobenzaprine", "Ergocalciferol", "Oxycodone", "Methylphenidate",
  "Venlafaxine", "Spironolactone", "Ondansetron", "Zolpidem", "Cetirizine",
  "Estradiol", "Pravastatin", "Lisinopril/Hydrochlorothiazide", "Lamotrigine",
  "Quetiapine", "Fluticasone/Salmeterol", "Clonazepam", "Dulaglutide",
  "Azithromycin", "Losartan/Hydrochlorothiazide", "Amoxicillin/Clavulanate",
  "Latanoprost", "Cholecalciferol", "Propranolol", "Ezetimibe", "Topiramate",
  "Paroxetine", "Diclofenac", "Budesonide/Formoterol", "Atenolol",
  "Lisdexamfetamine", "Doxycycline", "Pregabalin", "Ethinyl Estradiol/Norethindrone",
  "Glimepiride", "Tizanidine", "Clonidine", "Fenofibrate", "Insulin Lispro",
  "Valsartan", "Cephalexin", "Baclofen", "Rivaroxaban", "Ferrous Sulfate",
  "Amitriptyline", "Finasteride", "Dapagliflozin", "Oxycodone/Acetaminophen",
  "Folic Acid", "Aripiprazole", "Olmesartan", "Ethinyl Estradiol/Norgestimate",
  "Valacyclovir", "Mirtazapine", "Lorazepam",

  // ==================== BRAND NAME ALIASES (also in autocomplete) ====================
  "Lipitor", "Glucophage", "Synthroid", "Levoxyl", "Zestril", "Prinivil",
  "Norvasc", "Lopressor", "Toprol", "ProAir", "Ventolin", "Cozaar",
  "Neurontin", "Prilosec", "Zoloft", "Crestor", "Protonix", "Lexapro",
  "Adderall", "Wellbutrin", "Prozac", "Ozempic", "Wegovy", "Rybelsus",
  "Singulair", "Desyrel", "Zocor", "Flomax", "Vicodin", "Norco",
  "Flonase", "Mobic", "Eliquis", "Lasix", "Lantus", "Basaglar",
  "Cymbalta", "Advil", "Motrin", "Pepcid", "Jardiance", "Coreg",
  "Ultram", "Xanax", "Deltasone", "Vistaril", "Atarax", "BuSpar",
  "Plavix", "Glucotrol", "Celexa", "Zyloprim", "Flexeril", "OxyContin",
  "Roxicodone", "Ritalin", "Concerta", "Effexor", "Aldactone", "Zofran",
  "Ambien", "Zyrtec", "Lamictal", "Seroquel", "Advair", "Klonopin",
  "Trulicity", "Zithromax", "Z-Pack", "Augmentin", "Xalatan", "Inderal",
  "Zetia", "Topamax", "Paxil", "Voltaren", "Symbicort", "Tenormin",
  "Vyvanse", "Lyrica", "Zanaflex", "Catapres", "Tricor", "Humalog",
  "Diovan", "Keflex", "Xarelto", "Elavil", "Propecia", "Proscar",
  "Farxiga", "Percocet", "Abilify", "Benicar", "Valtrex", "Remeron",
  "Ativan",

  // ==================== ADDITIONAL MEDICATIONS (non-answers) ====================

  // --- Blood pressure / Cardiovascular ---
  "Warfarin", "Diltiazem", "Nifedipine", "Ramipril", "Enalapril",
  "Benazepril", "Fosinopril", "Quinapril", "Trandolapril", "Irbesartan",
  "Candesartan", "Telmisartan", "Eprosartan", "Azilsartan",
  "Hydralazine", "Doxazosin", "Prazosin", "Terazosin", "Methyldopa",
  "Minoxidil", "Isosorbide Mononitrate", "Isosorbide Dinitrate",
  "Nitroglycerin", "Ranolazine", "Digoxin", "Amiodarone", "Dronedarone",
  "Flecainide", "Sotalol", "Dofetilide", "Mexiletine", "Propafenone",
  "Ticagrelor", "Prasugrel", "Dipyridamole", "Cilostazol", "Enoxaparin",
  "Heparin", "Fondaparinux", "Edoxaban", "Dabigatran",
  "Coumadin", "Cardizem", "Procardia", "Altace", "Vasotec",
  "Lotensin", "Monopril", "Accupril", "Avapro", "Atacand",
  "Micardis", "Teveten", "Edarbi", "Apresoline", "Cardura",
  "Minipress", "Hytrin", "Aldomet", "Ranexa", "Lanoxin",
  "Cordarone", "Multaq", "Tambocor", "Betapace", "Tikosyn",
  "Brilinta", "Effient", "Persantine", "Pletal", "Lovenox",
  "Arixtra", "Savaysa", "Pradaxa",

  // --- Diabetes ---
  "Linagliptin", "Sitagliptin", "Canagliflozin", "Pioglitazone",
  "Rosiglitazone", "Glyburide", "Nateglinide", "Repaglinide",
  "Acarbose", "Miglitol", "Insulin Aspart", "Insulin Detemir",
  "Insulin NPH", "Insulin Regular", "Exenatide", "Liraglutide",
  "Tirzepatide", "Saxagliptin", "Alogliptin", "Vildagliptin",
  "Tradjenta", "Januvia", "Invokana", "Actos", "Avandia",
  "DiaBeta", "Starlix", "Prandin", "Precose", "Glyset",
  "NovoLog", "Levemir", "Humulin", "Novolin", "Byetta",
  "Victoza", "Mounjaro", "Onglyza", "Nesina",

  // --- Antibiotics ---
  "Ciprofloxacin", "Levofloxacin", "Moxifloxacin", "Clindamycin",
  "Metronidazole", "Sulfamethoxazole", "Trimethoprim",
  "Nitrofurantoin", "Penicillin", "Ampicillin", "Dicloxacillin",
  "Nafcillin", "Piperacillin", "Cefdinir", "Cefuroxime",
  "Ceftriaxone", "Cefepime", "Cefazolin", "Cefpodoxime",
  "Cefixime", "Meropenem", "Ertapenem", "Imipenem",
  "Vancomycin", "Linezolid", "Daptomycin", "Tigecycline",
  "Rifampin", "Isoniazid", "Ethambutol", "Pyrazinamide",
  "Minocycline", "Tetracycline", "Gentamicin", "Tobramycin",
  "Amikacin", "Neomycin", "Erythromycin", "Clarithromycin",
  "Fosfomycin", "Colistin",
  "Cipro", "Levaquin", "Avelox", "Cleocin", "Flagyl",
  "Bactrim", "Macrobid", "Omnicef", "Ceftin", "Rocephin",
  "Maxipime", "Ancef", "Vancocin", "Zyvox", "Cubicin",
  "Tygacil", "Rifadin", "Biaxin",

  // --- Antidepressants / Mood ---
  "Nortriptyline", "Imipramine", "Desipramine", "Clomipramine",
  "Maprotiline", "Nefazodone", "Vilazodone", "Vortioxetine",
  "Desvenlafaxine", "Levomilnacipran", "Fluvoxamine",
  "Doxepin", "Phenelzine", "Tranylcypromine", "Selegiline",
  "Pamelor", "Tofranil", "Norpramin", "Anafranil",
  "Viibryd", "Trintellix", "Pristiq", "Fetzima", "Luvox",
  "Sinequan", "Nardil", "Parnate", "Emsam",

  // --- Antipsychotics ---
  "Olanzapine", "Risperidone", "Ziprasidone", "Paliperidone",
  "Lurasidone", "Cariprazine", "Brexpiprazole", "Clozapine",
  "Haloperidol", "Fluphenazine", "Chlorpromazine", "Thioridazine",
  "Perphenazine", "Pimozide", "Thiothixene",
  "Zyprexa", "Risperdal", "Geodon", "Invega", "Latuda",
  "Vraylar", "Rexulti", "Clozaril", "Haldol", "Prolixin",
  "Thorazine", "Mellaril", "Trilafon", "Orap", "Navane",

  // --- Anticonvulsants / Mood Stabilizers ---
  "Lithium", "Valproic Acid", "Carbamazepine", "Oxcarbazepine",
  "Levetiracetam", "Phenytoin", "Phenobarbital", "Primidone",
  "Ethosuximide", "Vigabatrin", "Lacosamide", "Brivaracetam",
  "Perampanel", "Clobazam", "Zonisamide", "Tiagabine", "Felbamate",
  "Lithobid", "Depakote", "Tegretol", "Trileptal", "Keppra",
  "Dilantin", "Luminal", "Mysoline", "Zarontin", "Sabril",
  "Vimpat", "Briviact", "Fycompa", "Onfi", "Zonegran",
  "Gabitril", "Felbatol",

  // --- Benzodiazepines / Sleep ---
  "Diazepam", "Midazolam", "Temazepam", "Triazolam",
  "Chlordiazepoxide", "Oxazepam", "Zaleplon", "Eszopiclone",
  "Suvorexant", "Lemborexant", "Ramelteon",
  "Valium", "Versed", "Restoril", "Halcion",
  "Librium", "Serax", "Sonata", "Lunesta",
  "Belsomra", "Dayvigo", "Rozerem",

  // --- Pain / Opioids ---
  "Naproxen", "Acetaminophen", "Celecoxib", "Nabumetone",
  "Piroxicam", "Indomethacin", "Ketorolac", "Etodolac",
  "Sulindac", "Oxaprozin", "Hydromorphone", "Morphine",
  "Fentanyl", "Buprenorphine", "Naloxone", "Naltrexone",
  "Methadone", "Codeine", "Tapentadol", "Meperidine",
  "Aleve", "Tylenol", "Celebrex", "Relafen",
  "Feldene", "Indocin", "Toradol", "Lodine",
  "Clinoril", "Daypro", "Dilaudid", "MS Contin",
  "Duragesic", "Subutex", "Suboxone", "Narcan",
  "Vivitrol", "Dolophine", "Nucynta", "Demerol",

  // --- Muscle Relaxants ---
  "Methocarbamol", "Carisoprodol", "Orphenadrine",
  "Chlorzoxazone", "Dantrolene",
  "Robaxin", "Soma", "Norflex", "Parafon Forte", "Dantrium",

  // --- Allergy / Respiratory ---
  "Loratadine", "Fexofenadine", "Diphenhydramine", "Chlorpheniramine",
  "Desloratadine", "Levocetirizine", "Meclizine", "Promethazine",
  "Benzonatate", "Guaifenesin", "Dextromethorphan",
  "Ipratropium", "Tiotropium", "Umeclidinium", "Glycopyrrolate",
  "Formoterol", "Salmeterol", "Vilanterol", "Olodaterol",
  "Budesonide", "Mometasone", "Beclomethasone", "Ciclesonide",
  "Cromolyn Sodium", "Theophylline", "Roflumilast",
  "Claritin", "Allegra", "Benadryl", "Chlor-Trimeton",
  "Clarinex", "Xyzal", "Antivert", "Phenergan",
  "Tessalon", "Mucinex", "Delsym", "Atrovent",
  "Spiriva", "Incruse Ellipta", "Lonhala", "Foradil",
  "Serevent", "Breo Ellipta", "Striverdi",
  "Pulmicort", "Nasonex", "QVAR", "Alvesco",
  "Intal", "Theo-Dur", "Daliresp",

  // --- GI / Antacids ---
  "Ranitidine", "Esomeprazole", "Lansoprazole", "Rabeprazole",
  "Dexlansoprazole", "Sucralfate", "Misoprostol",
  "Metoclopramide", "Prochlorperazine", "Loperamide",
  "Dicyclomine", "Hyoscyamine", "Lubiprostone",
  "Linaclotide", "Plecanatide", "Lactulose", "Polyethylene Glycol",
  "Bismuth Subsalicylate", "Alvimopan",
  "Zantac", "Nexium", "Prevacid", "Aciphex",
  "Dexilant", "Carafate", "Cytotec",
  "Reglan", "Compazine", "Imodium",
  "Bentyl", "Levsin", "Amitiza",
  "Linzess", "Trulance", "MiraLAX", "Pepto-Bismol",

  // --- Hormones / Reproductive ---
  "Levonorgestrel", "Medroxyprogesterone", "Norgestrel",
  "Drospirenone", "Desogestrel", "Etonogestrel",
  "Norethindrone", "Conjugated Estrogens", "Progesterone",
  "Testosterone", "Oxytocin", "Clomiphene",
  "Letrozole", "Anastrozole", "Tamoxifen",
  "Plan B", "Depo-Provera", "NuvaRing",
  "Premarin", "Prometrium", "AndroGel",
  "Pitocin", "Clomid", "Femara", "Arimidex", "Nolvadex",

  // --- Thyroid ---
  "Methimazole", "Propylthiouracil", "Liothyronine",
  "Armour Thyroid", "NP Thyroid", "Nature-Throid",
  "Tapazole", "Cytomel",

  // --- Bone / Osteoporosis ---
  "Alendronate", "Risedronate", "Ibandronate", "Zoledronic Acid",
  "Raloxifene", "Calcitonin", "Denosumab", "Teriparatide",
  "Fosamax", "Actonel", "Boniva", "Reclast",
  "Evista", "Miacalcin", "Prolia", "Forteo",

  // --- Gout ---
  "Colchicine", "Febuxostat", "Probenecid",
  "Colcrys", "Uloric", "Benemid",

  // --- Migraine ---
  "Sumatriptan", "Rizatriptan", "Zolmitriptan", "Eletriptan",
  "Frovatriptan", "Naratriptan", "Almotriptan",
  "Erenumab", "Fremanezumab", "Galcanezumab",
  "Ubrogepant", "Rimegepant", "Lasmiditan",
  "Imitrex", "Maxalt", "Zomig", "Relpax",
  "Frova", "Amerge", "Axert",
  "Aimovig", "Ajovy", "Emgality",
  "Ubrelvy", "Nurtec", "Reyvow",

  // --- Parkinson's / Neurological ---
  "Levodopa", "Carbidopa", "Entacapone", "Tolcapone",
  "Pramipexole", "Ropinirole", "Rotigotine", "Amantadine",
  "Benztropine", "Trihexyphenidyl", "Rasagiline", "Safinamide",
  "Sinemet", "Comtan", "Tasmar", "Mirapex",
  "Requip", "Neupro", "Symmetrel", "Cogentin",
  "Artane", "Azilect", "Xadago",

  // --- Dementia ---
  "Donepezil", "Rivastigmine", "Galantamine", "Memantine",
  "Aricept", "Exelon", "Razadyne", "Namenda",

  // --- Urology ---
  "Phenazopyridine", "Sildenafil", "Tadalafil", "Vardenafil",
  "Oxybutynin", "Tolterodine", "Solifenacin", "Mirabegron",
  "Dutasteride", "Alfuzosin",
  "Pyridium", "Viagra", "Cialis", "Levitra",
  "Ditropan", "Detrol", "Vesicare", "Myrbetriq",
  "Avodart", "Uroxatral",

  // --- Steroids / Anti-inflammatory ---
  "Dexamethasone", "Methylprednisolone", "Hydrocortisone",
  "Triamcinolone", "Betamethasone", "Prednisolone",
  "Decadron", "Medrol", "Solu-Cortef",
  "Kenalog", "Celestone", "Orapred",

  // --- Dermatology ---
  "Fluocinonide", "Clobetasol", "Tacrolimus", "Pimecrolimus",
  "Mupirocin", "Bacitracin", "Tretinoin", "Adapalene",
  "Benzoyl Peroxide", "Isotretinoin",
  "Lidex", "Temovate", "Protopic", "Elidel",
  "Bactroban", "Retin-A", "Differin", "Accutane",

  // --- Antifungals ---
  "Ketoconazole", "Fluconazole", "Itraconazole", "Terbinafine",
  "Nystatin", "Clotrimazole", "Miconazole", "Voriconazole",
  "Nizoral", "Diflucan", "Sporanox", "Lamisil",
  "Mycostatin", "Lotrimin", "Monistat", "Vfend",

  // --- Antivirals ---
  "Acyclovir", "Oseltamivir", "Baloxavir", "Remdesivir",
  "Nirmatrelvir", "Ritonavir", "Molnupiravir",
  "Zovirax", "Tamiflu", "Xofluza", "Veklury",
  "Paxlovid", "Lagevrio",

  // --- HIV ---
  "Tenofovir", "Emtricitabine", "Abacavir", "Lamivudine",
  "Dolutegravir", "Bictegravir", "Cabotegravir", "Rilpivirine",
  "Efavirenz", "Darunavir", "Atazanavir",
  "Viread", "Emtriva", "Ziagen", "Epivir",
  "Tivicay", "Biktarvy", "Apretude", "Edurant",
  "Sustiva", "Prezista", "Reyataz", "Truvada", "Descovy",

  // --- Immunosuppressants / Rheumatology ---
  "Methotrexate", "Cyclosporine", "Mycophenolate",
  "Azathioprine", "Leflunomide", "Hydroxychloroquine",
  "Sulfasalazine", "Mesalamine",
  "Infliximab", "Adalimumab", "Etanercept", "Ustekinumab",
  "Secukinumab", "Rituximab", "Tofacitinib", "Baricitinib",
  "Trexall", "Sandimmune", "CellCept", "Imuran",
  "Arava", "Plaquenil", "Azulfidine", "Asacol",
  "Remicade", "Humira", "Enbrel", "Stelara",
  "Cosentyx", "Rituxan", "Xeljanz", "Olumiant",

  // --- Oncology ---
  "Trastuzumab", "Pembrolizumab", "Nivolumab", "Imatinib",
  "Docetaxel", "Paclitaxel", "Carboplatin", "Cisplatin",
  "Doxorubicin", "Fluorouracil", "Capecitabine", "Gemcitabine",
  "Pemetrexed", "Erlotinib", "Sorafenib", "Lenalidomide",
  "Bortezomib", "Ibrutinib", "Venetoclax", "Osimertinib",
  "Everolimus", "Sunitinib", "Pazopanib", "Abiraterone",
  "Enzalutamide", "Olaparib", "Lapatinib", "Crizotinib",
  "Dabrafenib", "Trametinib", "Ruxolitinib", "Nilotinib",
  "Dasatinib", "Bosutinib", "Ponatinib", "Midostaurin",
  "Gilteritinib", "Ixazomib", "Carfilzomib", "Daratumumab",
  "Elotuzumab", "Obinutuzumab", "Acalabrutinib", "Zanubrutinib",
  "Pirtobrutinib",
  "Herceptin", "Keytruda", "Opdivo", "Gleevec",
  "Taxotere", "Taxol", "Paraplatin", "Platinol",
  "Adriamycin", "Adrucil", "Xeloda", "Gemzar",
  "Alimta", "Tarceva", "Nexavar", "Revlimid",
  "Velcade", "Imbruvica", "Venclexta", "Tagrisso",
  "Afinitor", "Sutent", "Votrient", "Zytiga",
  "Xtandi", "Lynparza", "Tykerb", "Xalkori",
  "Tafinlar", "Mekinist", "Jakafi", "Tasigna",
  "Sprycel", "Bosulif", "Iclusig", "Rydapt",
  "Xospata", "Ninlaro", "Kyprolis", "Darzalex",

  // --- ADHD (additional) ---
  "Atomoxetine", "Guanfacine", "Dexmethylphenidate",
  "Strattera", "Intuniv", "Focalin",

  // --- Anesthetics / Miscellaneous ---
  "Lidocaine", "Tetracaine", "Benzocaine",
  "Ropivacaine", "Bupivacaine",
];
