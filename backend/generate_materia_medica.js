const fs = require('fs');
const path = require('path');

// 1. Define Major Polychrests (Detailed) - ~50-60 items
const majorRemedies = {
    "Aconite Napellus": {
        "Common Name": "Monkshood",
        "Keynotes": "Suddenness, Fear of Death, Restlessness, Dry Heat",
        "Mind": "Great fear and anxiety. Fears death, predicts the day. Restless.",
        "Generals": "Sudden onset of complaints. Exposure to dry, cold wind.",
        "Relationship": "Comp: Sulphur."
    },
    "Allium Cepa": {
        "Common Name": "Red Onion",
        "Keynotes": "Acrid Nasal Discharge, Bland Tears",
        "Nose": "Profuse watery acrid discharge. Sneezing.",
        "Eyes": "Burning, smarting, bland lachrymation.",
        "Relationship": "Comp: Phos, Thuja."
    },
    "Antimonium Tartaricum": { "Keynotes": "Rattling Mucus, Drowsiness, Thirstless", "Resp": "Great rattling of mucus but cannot expectorate." },
    "Apis Mellifica": { "Keynotes": "Stinging Pains, Thirstless, Edema", "General": "Bag-like swelling under eyes. Intolerance of heat." },
    "Argentum Nitricum": { "Keynotes": "Anticipatory Anxiety, Craves Sweets, Splinter Pains", "Mind": "Hurried. Fear of heights/bridges." },
    "Arnica Montana": { "Keynotes": "Trauma, Sore/Bruised Feeling, Says 'I am well'", "Trauma": "First remedy for injury/shock." },
    "Arsenicum Album": { "Keynotes": "Restlessness, Anxiety, Burning > Heat, < Midnight", "Mind": "Fastidious. Fear of death/disease." },
    "Aurum Metallicum": { "Keynotes": "Depression, Suicidal, Bone Pains", "Mind": "Loathing of life. Relief when thinking of death." },
    "Baryta Carbonica": { "Keynotes": "Delayed Development, Swollen Glands, Bashful", "Mind": "Childish. Memory loss." },
    "Belladonna": { "Keynotes": "Sudden Violent Inflammation, Heat, Redness, Throbbing", "Head": "Throbbing headache. Dilated pupils." },
    "Bryonia Alba": { "Keynotes": "< Motion, > Pressure/Rest, Dryness", "General": "Stitching pains. Thirst for large amounts." },
    "Calcarea Carbonica": { "Keynotes": "Cold/Clammy, Craves Eggs/Chalk, Obese/Flabby", "General": "Sweat on head. Delayed fontanelles." },
    "Calcarea Phosphorica": { "Keynotes": "Growing Pains, Dissatisfied, Bone Issues", "General": "School headaches. Non-union of fractures." },
    "Calendula Officinalis": { "Keynotes": "Wound Healing, Prevents Pus", "Skin": "Promotes granulation. Lacerated wounds." },
    "Cantharis": { "Keynotes": "Burning Violent Pains, UTI", "Urine": "Intolerable urging. Burning/cutting pain." },
    "Carbo Vegetabilis": { "Keynotes": "Air Hunger, Collapse, Indigestion", "General": "Wants to be fanned. Cold but wants air." },
    "Causticum": { "Keynotes": "Paralysis, Burns, Sympathetic", "General": "Burn scars. Warts. Urine retention." },
    "Chamomilla": { "Keynotes": "Irritable, Oversensitive, Capricious", "Mind": "Child wants to be carried. Angry snapping." },
    "China Officinalis": { "Keynotes": "Fluid Loss, Periodicity, Gas", "General": "Debility from loss of fluids. Ringing in ears." },
    "Cina": { "Keynotes": "Worms, Picking Nose, Irritable", "General": "Grinding teeth. White ring around mouth." },
    "Cocculus Indicus": { "Keynotes": "Motion Sickness, Care-taking Fatigue", "General": "Nausea from riding in cars/boats." },
    "Coffea Cruda": { "Keynotes": "Mental Excitability, Insomnia", "Mind": "Joyous tone. Senses acute." },
    "Colocynthis": { "Keynotes": "Cramping Colic > Bending Double", "Abdomen": "Agonizing pain > hard pressure." },
    "Conium Maculatum": { "Keynotes": "Glandular Induration, Ascending Paralysis", "General": "Vertigo turning in bed." },
    "Drosera": { "Keynotes": "Barking Cough, Whooping Cough", "Resp": "Cough < lying down at night." },
    "Dulcamara": { "Keynotes": "Damp Cold Aggravates", "General": "Skin eruptions. Joint pains in wet weather." },
    "Eupatorium Perfoliatum": { "Keynotes": "Bone Breaking Pains", "Fever": "Influenza with deep bone aches." },
    "Euphrasia": { "Keynotes": "Acrid Tears, Bland Nasal Discharge", "Eyes": "Conjunctivitis. Watering eyes." },
    "Ferrum Metallicum": { "Keynotes": "False Plethora, Flushing", "General": "Weakness but > walking slowly." },
    "Gelsemium": { "Keynotes": "Dull, Dizzy, Drowsy, Trembling", "Mind": "Anticipatory anxiety (stage fright)." },
    "Glonoinum": { "Keynotes": "Sunstroke, Bursting Headache", "Head": "Great throbbing. Cannot bear heat on head." },
    "Graphites": { "Keynotes": "Sticky Honey Discharge, Obesity", "Skin": "Cracks behind ears. Keloids." },
    "Hamamelis": { "Keynotes": "Venous Congestion, Bruised Soreness", "General": "Varicose veins. Hemorrhoids." },
    "Hepar Sulphuris": { "Keynotes": "Oversensitive, Splinter Pains, Pus", "General": "Chilly. Angriest remedy." },
    "Hypericum": { "Keynotes": "Nerve Injury, Crushed Fingers", "General": "Injury to nerve rich areas (fingers/toes)." },
    "Ignatia Amara": { "Keynotes": "Grief, Hysteria, Sighing", "Mind": "Changeable mood. Lump in throat." },
    "Ipecacuanha": { "Keynotes": "Clean Tongue, Constant Nausea", "Stomach": "Vomiting does not relieve." },
    "Kali Bichromicum": { "Keynotes": "Stringy Discharge, Wandering Pains", "General": "Round punched out ulcers." },
    "Kali Carbonicum": { "Keynotes": "Backache, Swollen Eyelids, < 3 AM", "Resp": "Asthma > leaning forward." },
    "Kali Phosphoricum": { "Keynotes": "Brain Fag, Nervous Exhaustion", "Mind": "Mental fatigue. Foul breath." },
    "Lachesis": { "Keynotes": "Left Sided, Loquacity, Jealousy", "General": "Cannot bear tight clothes. < after sleep." },
    "Ledum Palustre": { "Keynotes": "Puncture Wounds, Coldness > Cold", "General": "Bites, stings. Rheumatism ascends." },
    "Lycopodium": { "Keynotes": "Right Sided, Gas, Lack of Confidence", "Stomach": "Full after few bites. Craves sweets." },
    "Magnesia Phosphorica": { "Keynotes": "Cramps > Heat/Pressure", "General": "Neuralgia. Menstrual cramps." },
    "Medorrhinum": { "Keynotes": "Hurry, > Seaside, Sycosis", "Mind": "Weeps when telling symptoms." },
    "Mercurius Solubilis": { "Keynotes": "Syphilitic, Salivation, < Night", "Mouth": "Imprinted tongue. Metallic taste." },
    "Natrum Muriaticum": { "Keynotes": "Grief, Craves Salt, Dryness", "Mind": "Worse consolation. Hammering headache." },
    "Natrum Sulphuricum": { "Keynotes": "Head Injury, Dampness, Diarrhea", "Mind": "Suicidal but restrains. < Morning." },
    "Nitricum Acidum": { "Keynotes": "Splinter Pains, Cracks, Offensive Urine", "General": "Warts. Fissures." },
    "Nux Vomica": { "Keynotes": "Irritable, Chilly, Stimulants", "Stomach": "Wants to vomit but can't. < Morning." },
    "Phosphorus": { "Keynotes": "Burning, Bleeding, Fearful", "General": "Craves cold drinks. Tall/slender." },
    "Phytolacca": { "Keynotes": "Glands, Hardness, Dark Red Throat", "General": "Mastitis. Pain shoots to ear." },
    "Platina": { "Keynotes": "Haughty, Numbness, Sexual", "Mind": "Others look small. Vaginismus." },
    "Podophyllum": { "Keynotes": "Profuse Morning Diarrhea", "General": "Gurgling abdomen. Liver issues." },
    "Psorinum": { "Keynotes": "Filthy Smell, Despair, Cold", "General": "Wearms cap. < Cold." },
    "Pulsatilla": { "Keynotes": "Mild, Weepy, Thirstless, > Open Air", "General": "Changing symptoms. Fat food disagrees." },
    "Pyrogenium": { "Keynotes": "Septic States, Disparity Pulse/Temp", "General": "Bed feels too hard. Offensive." },
    "Rhus Toxicodendron": { "Keynotes": "Restless, > Continued Motion", "General": "Joint stiffness. < Damp cold." },
    "Rumex Crispus": { "Keynotes": "Tickling Cough from Cold Air", "Resp": "Covers mouth to keep air warm." },
    "Ruta Graveolens": { "Keynotes": "Bruised Bones, Eye Strain", "General": "Periosteum injury. Wrist cysts." },
    "Sepia": { "Keynotes": "Indifference, Stasis, Bearing Down", "Female": "Prolapse sensation. > Violent motion." },
    "Silicea": { "Keynotes": "Lack of Grit, Suppuration, Chill", "General": "Sweaty feet. Keloids. Splinters." },
    "Spongia Tosta": { "Keynotes": "Dry Barking Cough (Seal)", "Resp": "Croup. Sawing respiration." },
    "Staphysagria": { "Keynotes": "Suppressed Anger, Surgical Cuts", "General": "Honeymoon cystitis. Sensitive." },
    "Stramonium": { "Keynotes": "Violent Mania, Fear of Dark/Water", "Mind": "Praying/cursing. Night terrors." },
    "Sulphur": { "Keynotes": "Heat, Burning, Itching, messy", "General": "Red orifices. < Bathing. 11am hunger." },
    "Symphytum": { "Keynotes": "Bone Knitting, Eye Injury", "General": "Fractures. Blunt trauma to eye." },
    "Syphilinum": { "Keynotes": "< Night, Ulceration, Bone Pain", "General": "Alcohol craving. Washing mania." },
    "Thuja Occidentalis": { "Keynotes": "Warts, Vaccinosis, Fixed Ideas", "General": "Fleshy growths. Left sided." },
    "Tuberculinum": { "Keynotes": "Wasting, Travel Desire, Fear Dogs", "Resp": "Family history of TB." },
    "Urtica Urens": { "Keynotes": "Hives, Burns, Gout", "Skin": "Stinging, burning, itching." },
    "Veratrum Album": { "Keynotes": "Collapse, Cold Sweat, Vomiting", "General": "Religious mania. Craves ice." },
    "Zincum Metallicum": { "Keynotes": "Restless Legs, Fag", "General": "Fidgety feet. Brain exhastion." }
};

// 2. Helper lists to generate minor remedies
const minorRemediesList = [
    "Abies Canadensis", "Abies Nigra", "Abrotanum", "Absinthium", "Acalypha Indica", "Aceticum Acidum", "Actaea Spicata", "Adonis Vernalis", "Adrenalinum", "Aesculus Glabra",
    "Aethusa Cynapium", "Agaricus Muscarius", "Agnus Castus", "Agraphis Nutans", "Ailanthus Glandulosa", "Aletris Farinosa", "Alfalfa", "Alumen", "Alumina", "Ambra Grisea",
    "Ambrosia", "Ammoniacum", "Ammonium Benzoicum", "Ammonium Bromatum", "Ammonium Carb", "Ammonium Causticum", "Ammonium Iodatum", "Ammonium Mur", "Ammonium Phos", "Ammonium Valer",
    "Amyl Nitrosum", "Anacardium Orientale", "Anagallis", "Anatherum", "Angustura", "Anthracinum", "Antimonium Arsenicogram", "Antimonium Crudum", "Antimonium Iodatum", "Antimonium Sulph",
    "Apocynum Cannabinum", "Aralia Racemosa", "Aranea Diadema", "Argentum Metallicum", "Aristolochia", "Arsenicum Bromatum", "Arsenicum Hydrogenisatum", "Arsenicum Iodatum", "Arsenicum Sulph", "Artemisia Vulgaris",
    "Arum Triphyllum", "Arundo", "Asafoetida", "Asarum Europaeum", "Asclepias Tuberosa", "Asparagus", "Asterias Rubens", "Atropine", "Aurum Arsenicogram", "Aurum Iodatum", "Aurum Muriaticum",
    "Avena Sativa", "Bacillinum", "Badiaga", "Baptisia Tinctoria", "Baryta Acetica", "Baryta Iodata", "Baryta Muriatica", "Bellis Perennis", "Benzinum", "Benzoic Acid", "Berberis Aquifolium",
    "Berberis Vulgaris", "Bismuthum", "Blatta Orientalis", "Borax", "Bothrops", "Bovista", "Bromium", "Bufo Rana", "Cactus Grandiflorus", "Cadmium Sulphuratum", "Caladium Seguinum",
    "Calcarea Acetica", "Calcarea Arsenicosa", "Calcarea Fluorica", "Calcarea Iodata", "Calcarea Silicata", "Calcarea Sulphurica", "Calendula", "Camphora", "Cannabis Indica", "Cannabis Sativa",
    "Capsicum", "Carbo Animalis", "Carbolic Acid", "Carduus Marianus", "Castor Equi", "Caulophyllum", "Ceanothus", "Cedron", "Cenchris", "Cereus Bonplandii", "Chelidonium Majus",
    "Chenopodium", "Chimaphila Umbellata", "Chininum Arsenicosum", "Chininum Sulphuricum", "Chionanthus", "Chloralum", "Chloroformum", "Cholesterinum", "Chromium", "Cicuta Virosa",
    "Cimicifuga", "Cinnabaris", "Cistus Canadensis", "Citrus Vulgaris", "Clematis Erecta", "Cobaltum", "Coca", "Coccus Cacti", "Coffea Tosta", "Colchicum", "Collinsonia",
    "Comocladia", "Condurango", "Convallaria", "Copaiva", "Corallium Rubrum", "Cornus Circinata", "Crataegus", "Crocus Sativus", "Crotalus Cascadella", "Crotalus Horridus",
    "Croton Tiglium", "Cubeba", "Cundurango", "Cuprum Acetate", "Cuprum Arsenicosum", "Cuprum Metallicum", "Cyclamen", "Cypripedium", "Daphne Indica", "Digitalis",
    "Dioscorea", "Diphtherinum", "Dolichos", "Doryphora", "Duboisia", "Elaps Corallinus", "Elaterium", "Equisetum", "Erigeron", "Eryngium", "Eucalyptus", "Eugenia Jambos",
    "Euonymus", "Eupatorium Purpureum", "Euphorbia", "Euphorbium", "Fagopyrum", "Fel Tauri", "Ferrum Arsenicosum", "Ferrum Iodatum", "Ferrum Muriaticum", "Ferrum Phosphoricum",
    "Ferrum Picricum", "Filix Mas", "Fluoric Acid", "Formic Acid", "Formica Rufa", "Fraxinus Americana", "Fucus Vesiculosus", "Gambogia", "Gaultheria", "Gentiana",
    "Geranium", "Ginseng", "Gnaphalium", "Gossypium", "Granatum", "Graphites", "Gratiola", "Grindelia", "Guaiacum", "Guarana", "Guarea", "Gymnocladus",
    "Haematoxylon", "Hekla Lava", "Helleborus", "Helonias", "Hydrastis", "Hydrocotyle", "Hydrocyanic Acid", "Hydrophobinum", "Hyoscyamus", "Iberis", "Ichthyolum",
    "Ignatia", "Illicium", "Indigo", "Indium", "Inula", "Iodum", "Ipecac", "Iris Tenax", "Iris Versicolor", "Jaborandi", "Jacaranda", "Jalapa",
    "Jatropha", "Juglans Cinerea", "Juglans Regia", "Justicia Adhatoda", "Kali Arsenicosum", "Kali Bromatum", "Kali Chloricum", "Kali Cyanatum", "Kali Iodatum", "Kali Muriaticum",
    "Kali Nitricum", "Kali Pemanganicum", "Kali Silicatum", "Kali Sulphuricum", "Kalmia Latifolia", "Kaolin", "Kobaltum", "Kola", "Kousso", "Kreosotum", "Lac Caninum",
    "Lac Defloratum", "Lac Felinum", "Lac Vaccinum", "Lachnanthes", "Lactic Acid", "Lactuca Virosa", "Lapis Albus", "Lathyrus", "Latrodectus Mactans", "Laurocerasus",
    "Lecithin", "Lemna Minor", "Leonurus", "Lepidium", "Leptandra", "Liatris", "Lilium Tigrinum", "Limulus", "Linaria", "Linum", "Lithium Carbonicum",
    "Lobelia Inflata", "Lolium Temulentum", "Lonicera", "Lupulus", "Lycopus", "Lyssin", "Magnesia Carbonica", "Magnesia Muriatica", "Magnesia Sulphurica", "Magnolia",
    "Malandrinum", "Mancinella", "Manganum", "Medusa", "Melilotus", "Menyanthes", "Mephitis", "Mercurius Corrosivus", "Mercurius Cyanatus", "Mercurius Dulcis",
    "Mercurius Iodatus Flavus", "Mercurius Iodatus Ruber", "Mercurius Sulphuricus", "Mezereum", "Millefolium", "Mitchella", "Morphinum", "Moschus", "Murex", "Muriatic Acid",
    "Mygale", "Myrica", "Myristica", "Naja Tripudians", "Naphthalinum", "Narcissus", "Natrum Arsenicosum", "Natrum Carbonicum", "Natrum Phosphoricum", "Natrum Salicylicum",
    "Niccolum", "Nuphar Luteum", "Nux Moschata", "Ocimum Canum", "Oenanthe Crocata", "Oleander", "Oleum Animale", "Oleum Jecoris", "Onosmodium", "Opium",
    "Origanum", "Ornithogalum", "Osmium", "Ostrya", "Ova Tosta", "Oxalic Acid", "Oxytropis", "Paeonia", "Palladium", "Pareira Brava",
    "Paris Quadrifolia", "Passiflora", "Paullinia", "_Petroleum", "Petroselinum", "Phellandrium", "Phosphoric Acid", "Physostigma", "Picric Acid", "Pilocarpus", "Pinus Sylvestris",
    "Piper Methysticum", "Pix Liquida", "Plantago", "Plumbum Metallicum", "Polygonum", "Populus Candicans", "Populus Tremuloides", "Pothos", "Prunus Spinosa", "Pielea",
    "Pulex", "Pulsatilla Nuttalliana", "Radium Bromatum", "Ranunculus Bulbosus", "Ranunculus Sceleratus", "Raphanus", "Ratanhia", "Rheum", "Rhododendron", "Rhus Aromatica",
    "Rhus Glabra", "Rhus Venenata", "Ricinus", "Robinia", "Rosa Damascena", "Rumex", "Ruta", "Sabadilla", "Sabal Serrulata", "Sabina", "Saccharum",
    "Salicylic Acid", "Sambucus Nigra", "Sanguinaria Canadensis", "Sanguinarina Nitrica", "Sanicula", "Santoninum", "Sarracenia", "Sarsaparilla", "Scutellaria", "Secale Cornutum",
    "Selenium", "Sempervivum", "Senecio Aureus", "Senega", "Senna", "Sepia", "Serum Anguillae", "Silica Marina", "Silphium", "Sinapis Alba",
    "Sinapis Nigra", "Skatol", "Solanum Nigrum", "Solidago", "Spigelia", "Spiraea", "Spiranthes", "Squilla", "Stannum Metallicum", "Sticta Pulmonaria",
    "Stillingia", "Stramonium", "Strontium Carbonicum", "Strophanthus", "Strychninum", "Succinum", "Sulphur Iodatum", "Sulphuric Acid", "Sumbul", "Symphoricarpus",
    "Tabacum", "Tanacetum", "Tarentula Cubensis", "Tarentula Hispanica", "Taraxacum", "Tellurium", "Terebinthina", "Teucrium Marum", "Thallium", "Thea",
    "Theridion", "Thlaspi Bursa", "Thuja", "Thymol", "Thyroidinum", "Tilia Europaea", "Titanium", "Tongo", "Trillium Pendulum", "Triosteum",
    "Trombidium", "Tuberculinum Aviaire", "Turnera", "Upas Tiente", "Uranium Nitricum", "Urea", "Urtica", "Usnea", "Ustilago", "Uva Ursi",
    "Vaccininum", "Valeriana", "Vanadium", "Variolinum", "Veratrum Viride", "Verbascum", "Verbena", "Vespa", "Viburnum Opulus", "Viburnum Prunifolium",
    "Vinca Minor", "Viola Odorata", "Viola Tricolor", "Vipera", "Viscum Album", "Wyethia", "X-Ray", "Xanthoxylum", "Xerophyllum", "Yohimbinum",
    "Yucca", "Zincum Phosphoricum", "Zincum Valerianum", "Zingiber", "Zizia",

    // Bach Flower Remedies
    "Agrimony", "Aspen", "Beech", "Centaury", "Cerato", "Cherry Plum", "Chestnut Bud", "Chicory", "Clematis",
    "Crab Apple", "Elm", "Gentian", "Gorse", "Heather", "Holly", "Honeysuckle", "Hornbeam", "Impatiens",
    "Larch", "Mimulus", "Mustard", "Oak", "Olive", "Pine", "Red Chestnut", "Rock Rose", "Rock Water",
    "Scleranthus", "Star of Bethlehem", "Sweet Chestnut", "Vervain", "Vine", "Walnut", "Water Violet",
    "White Chestnut", "Wild Oat", "Wild Rose", "Willow", "Rescue Remedy",

    // Indian Homeopathic Drugs
    "Abroma Augusta", "Abroma Radix", "Acalypha Indica", "Achyranthes Aspera", "Aegle Marmelos",
    "Andrographis Paniculata", "Atista Indica", "Azadirachta Indica", "Boerhaavia Diffusa", "Carica Papaya",
    "Cassia Sophera", "Cephalandra Indica", "Clerodendron Infortunatum", "Cynodon Dactylon",
    "Desmodium Gangeticum", "Embelia Ribes", "Ficus Religiosa", "Gymneama Sylvestre",
    "Holarrhena Antidysenterica", "Hydrocotyle Asiatica", "Janosia Ashoka", "Justicia Adhatoda",
    "Momordica Charantia", "Ocimum Sanctum", "Syzygium Jambolanum", "Terminalia Arjuna",
    "Tinospora Cordifolia", "Blumea Odorata", "Brahmi (Bacopa Monnieri)", "Calotropis Gigantea",

    // Bowel Nosodes & Rare
    "Morgan Pure", "Morgan Gaertner", "Proteus", "Sycotic Co", "Dysentery Co", "Gaertner",
    "Bacillus No. 7", "Mutabile", "Faecalis", "Oscillococcinum", "Carcinosin",

    // --- EXPANDED LIST (500+ New Remedies) ---
    // A
    "Abies Canadensis", "Abies Nigra", "Abrotanum", "Absinthium", "Acalypha Indica", "Aceticum Acidum", "Aconitum Cammarum", "Aconitum Ferox", "Aconitum Lycoctonum", "Actaea Spicata", "Adonis Vernalis", "Adrenalinum", "Aesculus Glabra", "Aesculus Hippocastanum", "Aethusa Cynapium", "Agaricus Muscarius", "Agaricus Phalloides", "Agave Americana", "Agnus Castus", "Agraphis Nutans", "Agrimonia Eupatoria", "Ailanthus Glandulosa", "Aletris Farinosa", "Alfalfa", "Alliums Sativum", "Alnus Rubra", "Aloe Socotrina", "Alstonia Constricta", "Alumen", "Alumina", "Alumina Silicata", "Ambra Grisea", "Ambrosia Artemisiifolia", "Ammoniacum Gummi", "Ammonium Aceticum", "Ammonium Benzoicum", "Ammonium Bromatum", "Ammonium Carbonicum", "Ammonium Causticum", "Ammonium Iodatum", "Ammonium Muriaticum", "Ammonium Phosphoricum", "Ammonium Valerianicum", "Ampelopsis Quinquefolia", "Amygdalus Persica", "Amyl Nitrosum", "Anacardium Occidentale", "Anacardium Orientale", "Anagallis Arvensis", "Anantherum Muricatum", "Angustura Vera", "Anhalonium Lewinii", "Anthemis Nobilis", "Anthracinum", "Anthrakokali", "Antimonium Arsenicicum", "Antimonium Crudum", "Antimonium Iodatum", "Antimonium Sulphuratum Auratum", "Antimonium Tartaricum", "Antipyrine", "Aphis Chenopodii Glauci", "Apis Mellifica", "Apium Graveolens", "Apocynum Androsaemifolium", "Apocynum Cannabinum", "Apomorphinum", "Aralia Racemosa", "Aranea Diadema", "Aranea Scinencia", "Arbutus Andrachne", "Areca Catechu", "Argemone Mexicana", "Argentum Cyanatum", "Argentum Iodatum", "Argentum Metallicum", "Argentum Muriaticum", "Argentum Nitricum", "Argentum Oxydatum", "Argentum Phosphoricum", "Aristolochia Clematitis", "Aristolochia Milhomens", "Aristolochia Serpentaria", "Arnica Montana", "Arsenicum Album", "Arsenicum Bromatum", "Arsenicum Hydrogenisatum", "Arsenicum Iodatum", "Arsenicum Metallicum", "Arsenicum Sulphuratum Flavum", "Arsenicum Sulphuratum Rubrum", "Artemisia Vulgaris", "Arum Dracontium", "Arum Italicum", "Arum Maculatum", "Arum Triphyllum", "Arundo Mauritanica", "Asafoetida", "Asarum Europaeum", "Asclepias Cornuti", "Asclepias Incarnata", "Asclepias Syriaca", "Asclepias Tuberosa", "Asimina Triloba", "Asparagus Officinalis", "Astacus Fluviatilis", "Asterias Rubens", "Astragalus Mollissimus", "Athamanta Oreoselinum", "Atropinum", "Atropinum Sulphuricum", "Aurum Arsenicicum", "Aurum Bromatum", "Aurum Iodatum", "Aurum Metallicum", "Aurum Muriaticum", "Aurum Muriaticum Kalinatum", "Aurum Muriaticum Natronatum", "Aurum Sulphuratum", "Avena Sativa", "Azadirachta Indica",
    // B
    "Bacillinum Burnett", "Badiaga", "Balsamum Peruvianum", "Baptisia Tinctoria", "Barosma Crenata", "Baryta Acetica", "Baryta Carbonica", "Baryta Iodata", "Baryta Muriatica", "Baryta Sulphurica", "Belladonna", "Bellis Perennis", "Benzinum", "Benzoic Acid", "Berberis Aquifolium", "Berberis Vulgaris", "Beryllium Metallicum", "Beta Vulgaris", "Betonica Aquatica", "Bismuthum Oxidum", "Bismuthum Subnitricum", "Blatta Americana", "Blatta Orientalis", "Boldo", "Boletus Laricis", "Boletus Satana", "Bombyx Processionea", "Borax Veneta", "Bothrops Lanceolatus", "Botulinum", "Bovista Lycoperdon", "Brachyglottis Repens", "Bromium", "Brucea Antidysenterica", "Bryonia Alba", "Bufo Rana", "Butyric Acid",
    // C
    "Cactus Grandiflorus", "Cadmium Iodatum", "Cadmium Metallicum", "Cadmium Sulphuratum", "Cainca", "Cajuputum", "Caladium Seguinum", "Calcarea Acetica", "Calcarea Arsenicosa", "Calcarea Carbonica", "Calcarea Caustica", "Calcarea Fluorica", "Calcarea Iodata", "Calcarea Muriatica", "Calcarea Ovi Testae", "Calcarea Phosphorica", "Calcarea Picrata", "Calcarea Silicata", "Calcarea Sulphurica", "Calendula Officinalis", "Calotropis Gigantea", "Caltha Palustris", "Camphora", "Camphora Monobromata", "Canchalagua", "Cannabis Indica", "Cannabis Sativa", "Cantharis Vesicatoria", "Capsicum Annuum", "Carbo Animalis", "Carbo Vegetabilis", "Carbolic Acid", "Carboneum Hydrogenisatum", "Carboneum Oxygenisatum", "Carboneum Sulphuratum", "Carcinosinum", "Carduus Benedictus", "Carduus Marianus", "Carlsbad Aqua", "Cascara Sagrada", "Cascarilla", "Castanea Vesca", "Castor Equi", "Castoreum", "Caulophyllum Thalictroides", "Causticum", "Ceanothus Americanus", "Cedron", "Cenchris Contortrix", "Centaurea Tagana", "Cereus Bonplandii", "Cereus Serpentinus", "Cerium Oxalicum", "Chamomilla", "Cheiranthus Cheiri", "Chelidonium Majus", "Chelone Glabra", "Chenopodium Anthelminticum", "Chenopodium Vulvaria", "Chimaphila Maculata", "Chimaphila Umbellata", "China Boliviana", "China Officinalis", "Chininum Arsenicicum", "Chininum Muriaticum", "Chininum Sulphuricum", "Chionanthus Virginicus", "Chloralum Hydratum", "Chloroformum", "Chlorum", "Cholesterinum", "Chromium Acidum", "Chromium Oxidatum", "Chrysarobinum", "Cicuta Virosa", "Cimex Lectularius", "Cimicifuga Racemosa", "Cina Maritima", "Cinchona Officinalis", "Cineraria Maritima", "Cinnabaris", "Cinnamomum", "Cistus Canadensis", "Citric Acid", "Citrus Limonum", "Citrus Vulgaris", "Clematis Erecta", "Clematis Vitalba", "Cobaltum Metallicum", "Cobaltum Nitricum", "Coca", "Cocains", "Coccinella Septempunctata", "Cocculus Indicus", "Coccus Cacti", "Cochlearia Armoracia", "Codeinum", "Coffea Cruda", "Coffea Tosta", "Colchicum Autumnale", "Collinsonia Canadensis", "Colocynthis", "Colostrum", "Comocladia Dentata", "Conchiolinum", "Condurango", "Conium Maculatum", "Convallaria Majalis", "Convolvulus Arvensis", "Copaiva Officinalis", "Corallium Rubrum", "Cornus Circinata", "Cornus Florida", "Corydalis Formosa", "Cotyledon Umbilicus", "Crataegus Oxyacantha", "Crocus Sativus", "Crotalus Cascadella", "Crotalus Horridus", "Croton Tiglium", "Cubeba Officinalis", "Cucurbita Pepo", "Culex Musca", "Cunduarango", "Cuphea Viscosissima", "Cuprum Aceticum", "Cuprum Arsenicosum", "Cuprum Carbonicum", "Cuprum Metallicum", "Cuprum Muriaticum", "Cuprum Sulphuricum", "Curare", "Cyclamen Europaeum", "Cydonia Vulgaris", "Cynoglossum Officinale", "Cypripedium Pubescens", "Cytisus Laburnum",
    // D
    "Damiana", "Daphne Indica", "Datura Arborea", "Datura Metel", "Daucus Carota", "Dictamnus Albus", "Digitalis Purpurea", "Digitoxinum", "Dioscorea Villosa", "Diphtherinum", "Dipodium Punctatum", "Dirca Palustris", "Dolichos Pruriens", "Doryphora Decemlineata", "Drosera Rotundifolia", "Duboisia Myoporoides", "Dulcamara",
    // E
    "Echinacea Angustifolia", "Echinacea Purpurea", "Elaeis Guineensis", "Elaps Corallinus", "Elaterium", "Electricitas", "Emetinum", "Equisetum Hyemale", "Erechthites Hieracifolia", "Ergotinum", "Erigeron Canadensis", "Eryngium Aquaticum", "Eryngium Maritimum", "Eschscholtzia Californica", "Eucalyptus Globulus", "Eugenia Jambos", "Euonymus Atropurpureus", "Euonymus Europaeus", "Eupatorium Aromaticum", "Eupatorium Perfoliatum", "Eupatorium Purpureum", "Euphorbia Amygdaloides", "Euphorbia Corollata", "Euphorbia Cyparissias", "Euphorbia Heterodoxa", "Euphorbia Hypericifolia", "Euphorbia Ipecacuanha", "Euphorbia Lathyris", "Euphorbia Officinarum", "Euphorbia Pilulifera", "Euphorbia Polycarpa", "Euphorbium Officinarum", "Euphrasia Officinalis", "Eupion",
    // F
    "Fabiana Imbricata", "Fagopyrum Esculentum", "Fagus Sylvatica", "Fel Tauri", "Ferrum Aceticum", "Ferrum Arsenicicum", "Ferrum Bromatum", "Ferrum Carbonicum", "Ferrum Citricum", "Ferrum Cyanatum", "Ferrum Iodatum", "Ferrum Magneticum", "Ferrum Metallicum", "Ferrum Muriaticum", "Ferrum Phosphoricum", "Ferrum Picricum", "Ferrum Sulphuricum", "Ferrum Tartaricum", "Ferula Glauca", "Ficus Religiosa", "Filix Mas", "Flavus", "Fluoricum Acidum", "Formalinum", "Formica Rufa", "Fragaria Vesca", "Franciscea Uniflora", "Fraxinus Americana", "Fucus Vesiculosus", "Fuligo Ligni",
    // G
    "Gadus Morhua", "Gaertner", "Galanthus Nivalis", "Galium Aparine", "Gallicum Acidum", "Gambogia", "Gastell", "Gaultheria Procumbens", "Gelsemium Sempervirens", "Genista Tinctoria", "Gentiana Cruciata", "Gentiana Lutea", "Geranium Maculatum", "Get", "Geum Rivale", "Ginkgo Biloba", "Ginseng", "Glonoinum", "Glycerinum", "Gnaphalium Polycephalum", "Gossypium Herbaceum", "Granatum", "Graphites", "Gratiola Officinalis", "Grindelia Robusta", "Guaco", "Guaiacum Officinale", "Guarana", "Guarea Trichilioides", "Gummi Gutti", "Gymnocladus Canadensis",
    // H
    "Haematoxylon Campechianum", "Hamamelis Virginiana", "Hecla Lava", "Hedeoma Pulegioides", "Hedera Helix", "Helianthus Annuus", "Heliotropium Peruvianum", "Helix Tosta", "Helleborus Niger", "Helleborus Viridis", "Heloderma", "Helonias Dioica", "Hepar Sulphuris Calcareum", "Hepatica Triloba", "Heracleum Sphondylium", "Hippomanes", "Hippozaeninum", "Homarus", "Hura Brasiliensis", "Hydrangea Arborescens", "Hydrastis Canadensis", "Hydrocotyle Asiatica", "Hydrocyanicum Acidum", "Hydrophobinum", "Hydrophyllum Virginianum", "Hyoscyaminum", "Hyoscyamus Niger", "Hypericum Perforatum",
    // I, J, K
    "Iberis Amara", "Ichthyolum", "Ignatia Amara", "Ilex Aquifolium", "Illicium Anisatum", "Impatiens", "Imperatoria Ostruthium", "Indigo", "Indium Metallicum", "Inula Helenium", "Iodium", "Iodoformum", "Ipecacuanha", "Iridium Metallicum", "Iris Florentina", "Iris Foetidissima", "Iris Germanica", "Iris Tenax", "Iris Versicolor", "Jaborandi", "Jacaranda Caroba", "Jacaranda Gualandai", "Jalapa", "Jasminum Officinale", "Jatropha Curcas", "Juglans Cinerea", "Juglans Regia", "Juncus Effusus", "Juniperus Communis", "Juniperus Virginiana", "Justicia Adhatoda", "Kali Aceticum", "Kali Arsenicosum", "Kali Bichromicum", "Kali Bromatum", "Kali Carbonicum", "Kali Chloricum", "Kali Citricum", "Kali Cyanatum", "Kali Ferrocyanatum", "Kali Iodatum", "Kali Muriaticum", "Kali Nitricum", "Kali Oxalicum", "Kali Permanganicum", "Kali Phosphoricum", "Kali Picricum", "Kali Silicatum", "Kali Sulphuricum", "Kali Tartaricum", "Kali Telluricum", "Kalmia Latifolia", "Kamala", "Kaolin", "Karaka", "Karwinskia Humboldtiana", "Kino", "Kousso", "Krameria Mapato", "Kreosotum",
    // L
    "Lac Caninum", "Lac Defloratum", "Lac Felinum", "Lac Humanum", "Lac Vaccinum", "Lac Vaccinum Defloratum", "Lachnanthes Tinctoria", "Lacticum Acidum", "Lactuca Virosa", "Lamium Album", "Lapathum", "Lapis Albus", "Lappa Arctium", "Lathyrus Sativus", "Latrodectus Katipo", "Latrodectus Mactans", "Laurocerasus", "Lecithin", "Ledum Palustre", "Lemna Minor", "Leonurus Cardiaca", "Lepidium Bonariense", "Leptandra Virginica", "Levico", "Liatris Spicata", "Lilium Tigrinum", "Limulus Cyclops", "Linaria Vulgaris", "Linum Usitatissimum", "Lippia Mexicana", "Lithium Benzoicum", "Lithium Bromatum", "Lithium Carbonicum", "Lithium Lacticum", "Lithium Muriaticum", "Lobelia Cardinalis", "Lobelia Erinus", "Lobelia Inflata", "Lobelia Purpurascens", "Lobelia Syphilitica", "Lolium Temulentum", "Lonicera Periclymenum", "Lonicera Xylosteum", "Lupulus", "Lycopodium Clavatum", "Lycopus Virginicus", "Lyssin",
    // M
    "Macrotinum", "Magnesia Carbonica", "Magnesia Muriatica", "Magnesia Phosphorica", "Magnesia Sulphurica", "Magnolia Grandiflora", "Malandrinum", "Mancinella", "Mandragora Officinarum", "Manganum Aceticum", "Manganum Carbonicum", "Manganum Metallicum", "Manganum Muriaticum", "Manganum Oxydatum Nativum", "Manganum Sulphuricum", "Mangifera Indica", "Marrubium Vulgare", "Matico", "Medorrhinum", "Medusa", "Mel Cum Sale", "Melilotus Alba", "Melilotus Officinalis", "Melissa Officinalis", "Menispermum Canadense", "Mentha Piperita", "Mentha Pulegium", "Menyanthes Trifoliata", "Mephitis Putorius", "Mercurialis Perennis", "Mercurius Aceticus", "Mercurius Auratus", "Mercurius Biniodatus", "Mercurius Bromatus", "Mercurius Corrosivus", "Mercurius Cyanatus", "Mercurius Dulcis", "Mercurius Iodatus Flavus", "Mercurius Iodatus Ruber", "Mercurius Methylenus", "Mercurius Nitricus", "Mercurius Phosphoricus", "Mercurius Praecipitatus Albus", "Mercurius Praecipitatus Ruber", "Mercurius Solubilis", "Mercurius Sulphuricus", "Mercurius Vivus", "Methylene Blue", "Mezereum", "Micromeria", "Mikania Guaco", "Millefolium", "Mimosa Pudica", "Mitchella Repens", "Momordica Balsamina", "Monotropa Uniflora", "Morphinum", "Moschus", "Murex Purpurea", "Muriaticum Acidum", "Musa Sapientum", "Mygale Lasiodora", "Myosotis Symphytifolia", "Myrica Cerifera", "Myristica Sebifera", "Myrtus Communis",
    // N
    "Nabalus Serpentarius", "Naja Tripudians", "Naphthalinum", "Narceinum", "Narcissus Pseudo-Narcissus", "Natrum Arsenicosum", "Natrum Bicarbonicum", "Natrum Bromatum", "Natrum Carbonicum", "Natrum Chloratum", "Natrum Fluoratum", "Natrum Hypochlorosum", "Natrum Iodatum", "Natrum Lacticum", "Natrum Muriaticum", "Natrum Nitricum", "Natrum Nitrosum", "Natrum Phosphoricum", "Natrum Salicylicum", "Natrum Selenicum", "Natrum Silicatum", "Natrum Sulphuricum", "Natrum Sulphurosum", "Niccolum Carbonicum", "Niccolum Metallicum", "Niccolum Sulphuricum", "Nicotinum", "Nitri Spiritus Dulcis", "Nitricum Acidum", "Nitromuriaticum Acidum", "Nuphar Luteum", "Nux Moschata", "Nux Vomica", "Nyctanthes Arbor-tristis", "Nymphaea Odorata",
    // O
    "Ocimum Basilicum", "Ocimum Canum", "Ocimum Sanctum", "Oenanthe Crocata", "Oenothera Biennis", "Oleander", "Oleum Animale", "Oleum Jecoris Aselli", "Oleum Santali", "Oniscus Asellus", "Ononis Spinosa", "Onosmodium Virginianum", "Operculina Turpethum", "Opium", "Opuntia Vulgaris", "Oreodaphne", "Origanum Majorana", "Ornithogalum Umbellatum", "Orobanche Virginiana", "Osmium", "Ostrya Virginica", "Ova Tosta", "Ovi Gallinae Pellicula", "Oxalicum Acidum", "Oxalis Acetosella", "Oxydendron Arboreum", "Oxytropis Lamberti", "Ozone",
    // P
    "Paeonia Officinalis", "Palladium", "Paraffinum", "Pareira Brava", "Parietaria Officinalis", "Paris Quadrifolia", "Paronichia Illecebrum", "Parthenium Hysterophorus", "Passiflora Incarnata", "Pastinaca Sativa", "Paullinia Pinnata", "Paullinia Sorbilis", "Pecten Jacobaeus", "Pediculus Capitis", "Pelargonium Reniforme", "Penthorum Sedoides", "Pepsinum", "Persea Gratissima", "Pertussin", "Petroleum", "Petroselinum Sativum", "Phaseolus Nanus", "Phellandrium Aquaticum", "Phleum Pratense", "Phosphoricum Acidum", "Phosphorus", "Physalis Alkekengi", "Physostigma Venenosum", "Phytolacca Decandra", "Picricum Acidum", "Picrotoxinum", "Pilocarpinum", "Pilocarpus Microphyllus", "Pimenta Officinalis", "Pimpinella Saxifraga", "Pinus Lambertiana", "Pinus Sylvestris", "Piper Methysticum", "Piper Nigrum", "Piscidia Erythrina", "Pix Liquida", "Placenta Humana", "Plantago Major", "Platanus Occidentalis", "Platina", "Platinum Muriaticum", "Plectranthus Fruticosus", "Plumbago Littoralis", "Plumbum Aceticum", "Plumbum Carbonicum", "Plumbum Chromicum", "Plumbum Iodatum", "Plumbum Metallicum", "Plumbum Phosphoricum", "Podophyllum Peltatum", "Polygonum Hydropiper", "Polygonum Punctatum", "Polygonum Sagittatum", "Polymnia Uvedalia", "Polyporus Officinalis", "Polyporus Pinicola", "Populus Candicans", "Populus Tremuloides", "Pothos Foetidus", "Primula Obconica", "Primula Veris", "Primula Vulgaris", "Prinos Verticillatus", "Propylaminum", "Prunus Padus", "Prunus Spinosa", "Prunus Virginiana", "Psoralea Corylifolia", "Psorinum", "Ptelea Trifoliata", "Pulex Irritans", "Pulsatilla Nigricans", "Pulsatilla Nuttalliana", "Pyrogenium", "Pyrus Americana",
    // Q, R
    "Quassia Amara", "Quebracho", "Quercus E Glandibus", "Quillaja Saponaria", "Radium Bromatum", "Ranunculus Acris", "Ranunculus Bulbosus", "Ranunculus Ficaria", "Ranunculus Glacialis", "Ranunculus Repens", "Ranunculus Sceleratus", "Raphanus Sativus", "Ratanhia", "Rauwolfia Serpentina", "Rheum", "Rhododendron Chrysanthum", "Rhus Aromatica", "Rhus Diversiloba", "Rhus Glabra", "Rhus Radicans", "Rhus Toxicodendron", "Rhus Venenata", "Ricinus Communis", "Robinia Pseudacacia", "Rosa Canina", "Rosa Damascena", "Rosmarinus Officinalis", "Rumex Acetosa", "Rumex Crispus", "Russula Foetens", "Ruta Graveolens",
    // S
    "Sabal Serrulata", "Sabadilla", "Sabina", "Saccharum Album", "Saccharum Lactis", "Saccharum Officinale", "Salicylicum Acidum", "Salix Nigra", "Salix Purpurea", "Salol", "Salvia Officinalis", "Sambucus Canadensis", "Sambucus Nigra", "Sanguinaria Canadensis", "Sanguinarinum Nitricum", "Sanguinarinum Tartaricum", "Sanicula Aqua", "Santalum Album", "Santoninum", "Saponaria Officinalis", "Saponinum", "Sarcolacticum Acidum", "Sarothamnus Scoparius", "Sarracenia Purpurea", "Sarsaparilla", "Sassafras Officinale", "Scammoninum", "Scarlatinum", "Schinus Molle", "Scilla Maritima", "Scolopendra", "Scorphularia Nodosa", "Scutellaria Lateriflora", "Secale Cornutum", "Sedum Acre", "Selenium Metallicum", "Sempervivum Tectorum", "Senecio Aureus", "Senecio Jacobaea", "Senega", "Senna", "Sepia Succus", "Septicaeminum", "Serum Anguillae", "Silicea", "Silphium Laciniatum", "Sinapis Alba", "Sinapis Nigra", "Sium Latifolium", "Skatolum", "Skookum Chuck", "Solanum Arrebenta", "Solanum Carolinense", "Solanum Mammosum", "Solanum Nigrum", "Solanum Oleraceum", "Solanum Tuberosum", "Solanum Tuberosum Aegrotans", "Solidago Virgaurea", "Spartium Scoparium", "Sphingurus Martini", "Spigelia Anthelmia", "Spiraea Ulmaria", "Spiranthes Autumnalis", "Spongia Tosta", "Squilla Maritima", "Stachys Betonica", "Stannum Iodatum", "Stannum Metallicum", "Staphysagria", "Stellaria Media", "Sterculia Acuminata", "Stibium Arsenicosum", "Sticta Pulmonaria", "Stigmata Maydis", "Stillingia Sylvatica", "Stramonium", "Streptococcinum", "Strontium Bromatum", "Strontium Carbonicum", "Strontium Nitricum", "Strophanthus Hispidus", "Strychninum", "Strychninum Arsenicicum", "Strychninum Nitricum", "Strychninum Phosphoricum", "Strychninum Sulphuricum", "Strychninum Valerianicum", "Succinum", "Sulphur", "Sulphur Iodatum", "Sulphur Terebinthinatum", "Sulphuricum Acidum", "Sumbul", "Symphoricarpus Racemosus", "Symphytum Officinale", "Syphilinum", "Syzygium Jambolanum",
    // T
    "Tabacum", "Tamus Communis", "Tanacetum Vulgare", "Tanghinia Venenifera", "Tannicum Acidum", "Taraxacum Officinale", "Tarentula Cubensis", "Tarentula Hispanica", "Tartaricum Acidum", "Taxus Baccata", "Tela Araneae", "Tellurium Metallicum", "Terebinthina", "Teucrium Marum", "Teucrium Scorodonia", "Thallium", "Thea Chinensis", "Theridion Curassavicum", "Thevetia Nerifolia", "Thiosinaminum", "Thlaspi Bursa Pastoris", "Thuja Occidentalis", "Thymol", "Thymus Serpyllum", "Thyroidinum", "Tilia Europaea", "Titanium Metallicum", "Tongo", "Torula Cerevisiae", "Toxicophis Pugnax", "Trachinus Draco", "Tradescantia Diuretica", "Tribulus Terrestris", "Trifolium Pratense", "Trifolium Repens", "Trillium Pendulum", "Triosteum Perfoliatum", "Triticum Repens", "Trombidium Muscae Domesticae", "Tropaeolum Majus", "Tuberculinum", "Tuberculinum Aviaire", "Turnera Aphrodisiaca", "Tussilago Farfara", "Tussilago Fragrans", "Tussilago Petasites", "Typha Latifolia",
    // U, V, W, X, Y, Z
    "Ulmus Fulva", "Upas Tiente", "Uranium Nitricum", "Urea", "Urtica Urens", "Usnea Barbata", "Ustilago Maydis", "Uva Ursi", "Vaccininum", "Vaccinium Myrtillus", "Valeriana Officinalis", "Vanadium Metallicum", "Vanilla Aromatica", "Variolinum", "Veratrum Album", "Veratrum Nigrum", "Veratrum Viride", "Verbascum Thapsus", "Verbena Hastata", "Vespa Crabro", "Viburnum Opulus", "Viburnum Prunifolium", "Vinca Minor", "Viola Odorata", "Viola Tricolor", "Vipera Berus", "Vipera Torva", "Viscum Album", "Wyethia Helenioides", "X-ray", "Xanthoxylum Fraxineum", "Xerophyllum Asphodeloides", "Yohimbinum", "Yucca Filamentosa", "Zincum Aceticum", "Zincum Arsenicicum", "Zincum Bromatum", "Zincum Carbonicum", "Zincum Cyanatum", "Zincum Gluconicum", "Zincum Iodatum", "Zincum Metallicum", "Zincum Muriaticum", "Zincum Oxydatum", "Zincum Phosphoratum", "Zincum Picricum", "Zincum Sulphuricum", "Zincum Valerianicum", "Zingiber Officinale", "Zizia Aurea"
];

// 3. Load detailed remedy expansions
const detailedRemedies = require('./detailed_remedies');

const materiaMedica = { ...majorRemedies };

// Merge detailed remedies (overwrite generic entries with proper clinical data)
Object.assign(materiaMedica, detailedRemedies);
console.log(`Merged ${Object.keys(detailedRemedies).length} detailed remedy expansions.`);

// Generate entries for minor remedies with generic but helpful structure 
minorRemediesList.forEach(name => {
    if (!materiaMedica[name]) {
        materiaMedica[name] = {
            "Common Name": name,
            "Generalities": `A remedy often indicated in specific pathological states or organ affinities typical of ${name}. Consult comprehensive repertory for precise modalities.`,
            "Keynotes": "Refer to clinical indications. Often used in specific organ support or rare symptom pictures.",
            "Relationship": "Compare: Similar botanical or mineral families."
        };
    }
});

const outputPath = path.join(__dirname, 'data/materia_medica.json');

// Ensure directory exists
const dir = path.dirname(outputPath);
if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
}

fs.writeFileSync(outputPath, JSON.stringify(materiaMedica, null, 2));

console.log(`Materia Medica database generated with ${Object.keys(materiaMedica).length} entries at ${outputPath}`);
