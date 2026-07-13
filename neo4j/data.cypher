// VaidyaVoice Neo4j Data — 20 Rural India Conditions
// Run AFTER schema.cypher

// ───────────────────────────────────────────────────────────
// SYMPTOMS (with Hindi, Tamil, Bengali names)
// ───────────────────────────────────────────────────────────

CREATE (fever:Symptom {name: "fever", name_hi: "बुखार", name_ta: "காய்ச்சல்", name_bn: "জ্বর", category: "general"})
CREATE (headache:Symptom {name: "headache", name_hi: "सिरदर्द", name_ta: "தலைவலி", name_bn: "মাথাব্যথা", category: "general"})
CREATE (cough:Symptom {name: "cough", name_hi: "खांसी", name_ta: "இருமல்", name_bn: "কাশি", category: "respiratory"})
CREATE (breathing_difficulty:Symptom {name: "breathing_difficulty", name_hi: "सांस लेने में तकलीफ", name_ta: "மூச்சுத்திணறல்", name_bn: "শ্বাসকষ্ট", category: "respiratory"})
CREATE (chest_pain:Symptom {name: "chest_pain", name_hi: "छाती में दर्द", name_ta: "நெஞ்சுவலி", name_bn: "বুকে ব্যথা", category: "cardiac"})
CREATE (diarrhea:Symptom {name: "diarrhea", name_hi: "दस्त", name_ta: "வயிற்றுப்போக்கு", name_bn: "পায়খানা", category: "gastro"})
CREATE (vomiting:Symptom {name: "vomiting", name_hi: "उल्टी", name_ta: "குமட்டல்", name_bn: "বমি", category: "gastro"})
CREATE (dehydration:Symptom {name: "dehydration", name_hi: "पानी की कमी", name_ta: "நீரிழப்பு", name_bn: "পানিশূন্যতা", category: "gastro"})
CREATE (body_ache:Symptom {name: "body_ache", name_hi: "शरीर में दर्द", name_ta: "உடல்வலி", name_bn: "শরীর ব্যথা", category: "general"})
CREATE (rash:Symptom {name: "rash", name_hi: "चकत्ते", name_ta: "தோல் தடிப்பு", name_bn: "ফোসকা", category: "skin"})
CREATE (joint_pain:Symptom {name: "joint_pain", name_hi: "जोड़ों में दर्द", name_ta: "மூட்டுவலி", name_bn: "বাত ব্যথা", category: "musculoskeletal"})
CREATE (sore_throat:Symptom {name: "sore_throat", name_hi: "गले में खराश", name_ta: "தொண்டைவலி", name_bn: "গলা ব্যথা", category: "respiratory"})
CREATE (chills:Symptom {name: "chills", name_hi: "ठंड लगना", name_ta: "நடுக்கம்", name_bn: "ঠান্ডা লাগা", category: "general"})
CREATE (fatigue:Symptom {name: "fatigue", name_hi: "थकान", name_ta: "சோர்வு", name_bn: "ক্লান্তি", category: "general"})
CREATE (abdominal_pain:Symptom {name: "abdominal_pain", name_hi: "पेट में दर्द", name_ta: "வயிற்றுவலி", name_bn: "পেট ব্যথা", category: "gastro"})
CREATE (burning_urination:Symptom {name: "burning_urination", name_hi: "पेशाब में जलन", name_ta: "சிறுநீரில் எரிச்சல்", name_bn: "প্রস্রাবে জ্বলুনি", category: "urinary"})
CREATE (frequent_urination:Symptom {name: "frequent_urination", name_hi: "बार-बार पेशाब आना", name_ta: "அடிக்கடி சிறுநீர்", name_bn: "ঘনঘন প্রস্রাব", category: "urinary"})
CREATE (blood_in_stool:Symptom {name: "blood_in_stool", name_hi: "मल में खून", name_ta: "மலத்தில் இரத்தம்", name_bn: "পায়খানায় রক্ত", category: "gastro"})
CREATE (swelling:Symptom {name: "swelling", name_hi: "सूजन", name_ta: "வீக்கம்", name_bn: "ফোলা", category: "general"})
CREATE (dizziness:Symptom {name: "dizziness", name_hi: "चक्कर आना", name_ta: "தலைசுற்றல்", name_bn: "ঘোর", category: "neurological"})
CREATE (blurred_vision:Symptom {name: "blurred_vision", name_hi: "धुंधला दिखना", name_ta: "மங்கலான பார்வை", name_bn: "ঘোলা দেখা", category: "eye"})
CREATE (skin_infection:Symptom {name: "skin_infection", name_hi: "त्वचा संक्रमण", name_ta: "தோல் தொற்று", name_bn: "ত্বকের সংক্রমণ", category: "skin"})
CREATE (itching:Symptom {name: "itching", name_hi: "खुजली", name_ta: "அரிப்பு", name_bn: "চুলকানি", category: "skin"})
CREATE (bleeding:Symptom {name: "bleeding", name_hi: "खून बहना", name_ta: "இரத்தப்போக்கு", name_bn: "রক্তপাত", category: "general"})
CREATE (loss_of_appetite:Symptom {name: "loss_of_appetite", name_hi: "भूख न लगना", name_ta: "பசியின்மை", name_bn: "ক্ষুধামন্দা", category: "gastro"})
CREATE (nausea:Symptom {name: "nausea", name_hi: "मिचली", name_ta: "உணவேற்றம்", name_bn: "বমি বমি ভাব", category: "gastro"})
CREATE (constipation:Symptom {name: "constipation", name_hi: "कब्ज", name_ta: "மலச்சிக்கல்", name_bn: "কোষ্ঠকাঠিন্য", category: "gastro"})
CREATE (excessive_thirst:Symptom {name: "excessive_thirst", name_hi: "बहुत ज्यादा प्यास", name_ta: "அதிக தாகம்", name_bn: "অতিরিক্ত তৃষ্ণা", category: "endocrine"})
CREATE (weight_loss:Symptom {name: "weight_loss", name_hi: "वजन कम होना", name_ta: "எடை குறைவு", name_bn: "ওজন কমা", category: "general"})
CREATE (yellow_eyes:Symptom {name: "yellow_eyes", name_hi: "पीली आंखें", name_ta: "மஞ்சள் கண்கள்", name_bn: "হলুদ চোখ", category: "liver"})
CREATE (seizure:Symptom {name: "seizure", name_hi: "दौरा पड़ना", name_ta: "வலிப்பு", name_bn: "খিপি", category: "neurological"})
CREATE (unconsciousness:Symptom {name: "unconsciousness", name_hi: "बेहोशी", name_ta: "சுயநினைவற்ற நிலை", name_bn: "অজ্ঞান", category: "neurological"})

// ───────────────────────────────────────────────────────────
// CONDITIONS
// ───────────────────────────────────────────────────────────

CREATE (viral_flu:Condition {name: "Viral_Flu", name_hi: "वायरल फ्लू", name_ta: "வைரல் காய்ச்சல்", name_bn: "ভাইরাল ফ্লু", severity_score: 0.3, is_emergency: false, typical_duration: "3-5 days"})
CREATE (dengue:Condition {name: "Dengue", name_hi: "डेंगू", name_ta: "டெங்கு", name_bn: "ডেঙ্গু", severity_score: 0.7, is_emergency: false, typical_duration: "7-10 days"})
CREATE (typhoid:Condition {name: "Typhoid", name_hi: "टाइफाइड", name_ta: "டைபாய்டு", name_bn: "টাইফয়েড", severity_score: 0.6, is_emergency: false, typical_duration: "2-3 weeks"})
CREATE (malaria:Condition {name: "Malaria", name_hi: "मलेरिया", name_ta: "மலேரியா", name_bn: "ম্যালেরিয়া", severity_score: 0.7, is_emergency: false, typical_duration: "1-2 weeks"})
CREATE (acute_diarrhea:Condition {name: "Acute_Diarrhea", name_hi: "तीव्र दस्त", name_ta: "கடுமையான வயிற்றுப்போக்கு", name_bn: "তীব্র পায়খানা", severity_score: 0.5, is_emergency: false, typical_duration: "2-3 days"})
CREATE (cholera:Condition {name: "Cholera_Signs", name_hi: "हैजा के लक्षण", name_ta: "காலரா அறிகுறிகள்", name_bn: "কলেরার লক্ষণ", severity_score: 0.9, is_emergency: true, typical_duration: "3-6 days"})
CREATE (pneumonia:Condition {name: "Pneumonia", name_hi: "निमोनिया", name_ta: "நிமோனியா", name_bn: "নিউমোনিয়া", severity_score: 0.8, is_emergency: false, typical_duration: "1-3 weeks"})
CREATE (tb:Condition {name: "Tuberculosis", name_hi: " tuberculosis (टीबी)", name_ta: "காசநோய்", name_bn: "ক্ষয়রোগ", severity_score: 0.8, is_emergency: false, typical_duration: "6+ months"})
CREATE (hypertension_crisis:Condition {name: "Hypertension_Crisis", name_hi: "उच्च रक्तचाप संकट", name_ta: "உயர் இரத்த அழுத்த நெருக்கடி", name_bn: "উচ্চ রক্তচাপ সংকট", severity_score: 0.9, is_emergency: true, typical_duration: "immediate"})
CREATE (diabetic_emergency:Condition {name: "Diabetic_Emergency", name_hi: "मधुमेह आपातकाल", name_ta: "சர்க்கரை நோய் அவசரம்", name_bn: "ডায়াবেটিক জরুরি", severity_score: 0.9, is_emergency: true, typical_duration: "immediate"})
CREATE (anemia:Condition {name: "Anemia", name_hi: "रक्ताल्पता", name_ta: "இரத்தச்சோகை", name_bn: "রক্তাল্পতা", severity_score: 0.4, is_emergency: false, typical_duration: "ongoing"})
CREATE (uti:Condition {name: "UTI", name_hi: "मूत्र पथ संक्रमण", name_ta: "சிறுநீரகப் பாதை தொற்று", name_bn: "প্রস্রাবের পথে সংক্রমণ", severity_score: 0.5, is_emergency: false, typical_duration: "3-7 days"})
CREATE (scabies:Condition {name: "Skin_Infection_Scabies", name_hi: "त्वचा संक्रमण / खाज", name_ta: "தோல் தொற்று / பேன்", name_bn: "চর্মরোগ / খাজ", severity_score: 0.3, is_emergency: false, typical_duration: "2-4 weeks"})
CREATE (snake_bite:Condition {name: "Snake_Bite", name_hi: "सांप का काटना", name_ta: "பாம்பு கடி", name_bn: "সাপের কামড়", severity_score: 1.0, is_emergency: true, typical_duration: "immediate"})
CREATE (heat_stroke:Condition {name: "Heat_Stroke", name_hi: "लू लगना", name_ta: "வெப்பத் தாக்கம்", name_bn: "হিট স্ট্রোক", severity_score: 1.0, is_emergency: true, typical_duration: "immediate"})
CREATE (pregnancy_danger:Condition {name: "Pregnancy_Danger_Signs", name_hi: "गर्भावस्था के खतरनाक लक्षण", name_ta: "கர்ப்பிணி அபாய அறிகுறிகள்", name_bn: "গর্ভাবস্থার বিপদজনক লক্ষণ", severity_score: 1.0, is_emergency: true, typical_duration: "immediate"})
CREATE (malnutrition:Condition {name: "Malnutrition_Child", name_hi: "कुपोषण (बच्चा)", name_ta: "போஷாக்கின்மை (குழந்தை)", name_bn: "অপুষ্টি (শিশু)", severity_score: 0.6, is_emergency: false, typical_duration: "ongoing"})
CREATE (eye_infection:Condition {name: "Eye_Infection", name_hi: "आंख का संक्रमण", name_ta: "கண் தொற்று", name_bn: "চোখের সংক্রমণ", severity_score: 0.4, is_emergency: false, typical_duration: "1-2 weeks"})
CREATE (ear_infection:Condition {name: "Ear_Infection", name_hi: "कान का संक्रमण", name_ta: "காது தொற்று", name_bn: "কানের সংক্রমণ", severity_score: 0.4, is_emergency: false, typical_duration: "1-2 weeks"})
CREATE (allergic_reaction:Condition {name: "Allergic_Reaction", name_hi: "एलर्जी की प्रतिक्रिया", name_ta: "ஒவ்வாமை எதிர்வினை", name_bn: "এলার্জির প্রতিক্রিয়া", severity_score: 0.8, is_emergency: false, typical_duration: "hours to days"})
CREATE (anaphylaxis:Condition {name: "Anaphylaxis", name_hi: "एनाफिलैक्सिस", name_ta: "கடுமையான ஒவ்வாமை", name_bn: "এনাফিল্যাক্সিস", severity_score: 1.0, is_emergency: true, typical_duration: "immediate"})
CREATE (dysentery:Condition {name: "Dysentery", name_hi: "पेचिश", name_ta: "கழிச்சல்", name_bn: "আমাশয়", severity_score: 0.7, is_emergency: false, typical_duration: "3-7 days"})
CREATE (jaundice:Condition {name: "Jaundice", name_hi: "पीलिया", name_ta: "மஞ்சள் காமாலை", name_bn: "জন্ডিস", severity_score: 0.6, is_emergency: false, typical_duration: "2-4 weeks"})


// ───────────────────────────────────────────────────────────
// MEDICINES
// ───────────────────────────────────────────────────────────

CREATE (paracetamol:Medicine {name: "Paracetamol", otc: true, category: "analgesic"})
CREATE (ors:Medicine {name: "ORS", otc: true, category: "rehydration"})
CREATE (ciprofloxacin:Medicine {name: "Ciprofloxacin", otc: false, category: "antibiotic"})
CREATE (azithromycin:Medicine {name: "Azithromycin", otc: false, category: "antibiotic"})
CREATE (amoxicillin:Medicine {name: "Amoxicillin", otc: false, category: "antibiotic"})
CREATE (metronidazole:Medicine {name: "Metronidazole", otc: false, category: "antiprotozoal"})
CREATE (warfarin:Medicine {name: "Warfarin", otc: false, category: "anticoagulant"})
CREATE (aspirin:Medicine {name: "Aspirin", otc: true, category: "analgesic"})
CREATE (ibuprofen:Medicine {name: "Ibuprofen", otc: true, category: "NSAID"})
CREATE (insulin:Medicine {name: "Insulin", otc: false, category: "antidiabetic"})
CREATE (metformin:Medicine {name: "Metformin", otc: false, category: "antidiabetic"})
CREATE (chlorpheniramine:Medicine {name: "Chlorpheniramine", otc: true, category: "antihistamine"})
CREATE (albendazole:Medicine {name: "Albendazole", otc: true, category: "antiparasitic"})
CREATE (tetracycline_eye:Medicine {name: "Tetracycline_Eye_Ointment", otc: true, category: "ophthalmic"})
CREATE (antivenom:Medicine {name: "Polyvalent_Antivenom", otc: false, category: "antivenom"})
CREATE (hydrocortisone:Medicine {name: "Hydrocortisone", otc: true, category: "corticosteroid"})
CREATE (epinephrine:Medicine {name: "Epinephrine", otc: false, category: "emergency"})
CREATE (iron_supplement:Medicine {name: "Iron_Supplement", otc: true, category: "supplement"})
CREATE (vitamin_a:Medicine {name: "Vitamin_A_Supplement", otc: true, category: "supplement"})

// ───────────────────────────────────────────────────────────
// RISK FACTORS
// ───────────────────────────────────────────────────────────

CREATE (pregnant:RiskFactor {name: "pregnant", name_hi: "गर्भवती", name_ta: "கர்ப்பிணி", name_bn: "গর্ভবতী"})
CREATE (child_under_5:RiskFactor {name: "child_under_5", name_hi: "5 साल से कम उम्र का बच्चा", name_ta: "5 வயதிற்குட்பட்ட குழந்தை", name_bn: "৫ বছরের কম বয়সী শিশু"})
CREATE (elderly:RiskFactor {name: "elderly", name_hi: "बुजुर्ग", name_ta: "முதியவர்", name_bn: "বৃদ্ধ"})
CREATE (diabetic:RiskFactor {name: "diabetic", name_hi: "मधुमेह रोगी", name_ta: "சர்க்கரை நோயாளி", name_bn: "ডায়াবেটিক"})
CREATE (hypertensive:RiskFactor {name: "hypertensive", name_hi: "उच्च रक्तचाप", name_ta: "உயர் இரத்த அழுத்தம்", name_bn: "উচ্চ রক্তচাপ"})
CREATE (malnourished:RiskFactor {name: "malnourished", name_hi: "कुपोषित", name_ta: "போஷாக்கற்றவர்", name_bn: "অপুষ্ট"})

// ───────────────────────────────────────────────────────────
// SYMPTOM → CONDITION (INDICATES) with weights
// ───────────────────────────────────────────────────────────

CREATE (fever)-[:INDICATES {weight: 0.9}]->(viral_flu)
CREATE (fever)-[:INDICATES {weight: 0.9}]->(dengue)
CREATE (fever)-[:INDICATES {weight: 0.8}]->(typhoid)
CREATE (fever)-[:INDICATES {weight: 0.95}]->(malaria)
CREATE (fever)-[:INDICATES {weight: 0.7}]->(pneumonia)
CREATE (fever)-[:INDICATES {weight: 0.6}]->(uti)
CREATE (fever)-[:INDICATES {weight: 0.5}]->(tb)
CREATE (fever)-[:INDICATES {weight: 0.4}]->(anemia)

CREATE (headache)-[:INDICATES {weight: 0.8}]->(viral_flu)
CREATE (headache)-[:INDICATES {weight: 0.7}]->(dengue)
CREATE (headache)-[:INDICATES {weight: 0.6}]->(typhoid)
CREATE (headache)-[:INDICATES {weight: 0.8}]->(malaria)
CREATE (headache)-[:INDICATES {weight: 0.9}]->(hypertension_crisis)
CREATE (headache)-[:INDICATES {weight: 0.7}]->(heat_stroke)

CREATE (cough)-[:INDICATES {weight: 0.9}]->(pneumonia)
CREATE (cough)-[:INDICATES {weight: 0.8}]->(tb)
CREATE (cough)-[:INDICATES {weight: 0.6}]->(viral_flu)
CREATE (cough)-[:INDICATES {weight: 0.5}]->(allergic_reaction)

CREATE (breathing_difficulty)-[:INDICATES {weight: 1.0}]->(pneumonia)
CREATE (breathing_difficulty)-[:INDICATES {weight: 0.9}]->(anaphylaxis)
CREATE (breathing_difficulty)-[:INDICATES {weight: 0.8}]->(allergic_reaction)
CREATE (breathing_difficulty)-[:INDICATES {weight: 0.7}]->(hypertension_crisis)

CREATE (chest_pain)-[:INDICATES {weight: 1.0}]->(hypertension_crisis)
CREATE (chest_pain)-[:INDICATES {weight: 0.8}]->(pneumonia)
CREATE (chest_pain)-[:INDICATES {weight: 0.7}]->(anaphylaxis)

CREATE (diarrhea)-[:INDICATES {weight: 0.9}]->(acute_diarrhea)
CREATE (diarrhea)-[:INDICATES {weight: 0.8}]->(cholera)
CREATE (diarrhea)-[:INDICATES {weight: 0.5}]->(typhoid)
CREATE (diarrhea)-[:INDICATES {weight: 0.4}]->(dengue)

CREATE (vomiting)-[:INDICATES {weight: 0.8}]->(acute_diarrhea)
CREATE (vomiting)-[:INDICATES {weight: 0.7}]->(cholera)
CREATE (vomiting)-[:INDICATES {weight: 0.6}]->(malaria)
CREATE (vomiting)-[:INDICATES {weight: 0.7}]->(pregnancy_danger)
CREATE (vomiting)-[:INDICATES {weight: 0.8}]->(heat_stroke)

CREATE (dehydration)-[:INDICATES {weight: 0.9}]->(acute_diarrhea)
CREATE (dehydration)-[:INDICATES {weight: 0.95}]->(cholera)
CREATE (dehydration)-[:INDICATES {weight: 0.8}]->(heat_stroke)
CREATE (dehydration)-[:INDICATES {weight: 0.7}]->(dengue)

CREATE (body_ache)-[:INDICATES {weight: 0.8}]->(viral_flu)
CREATE (body_ache)-[:INDICATES {weight: 0.9}]->(dengue)
CREATE (body_ache)-[:INDICATES {weight: 0.7}]->(typhoid)
CREATE (body_ache)-[:INDICATES {weight: 0.8}]->(malaria)
CREATE (body_ache)-[:INDICATES {weight: 0.6}]->(heat_stroke)

CREATE (rash)-[:INDICATES {weight: 0.8}]->(dengue)
CREATE (rash)-[:INDICATES {weight: 0.7}]->(scabies)
CREATE (rash)-[:INDICATES {weight: 0.6}]->(allergic_reaction)
CREATE (rash)-[:INDICATES {weight: 0.5}]->(typhoid)

CREATE (joint_pain)-[:INDICATES {weight: 0.8}]->(dengue)
CREATE (joint_pain)-[:INDICATES {weight: 0.7}]->(malaria)
CREATE (joint_pain)-[:INDICATES {weight: 0.6}]->(viral_flu)

CREATE (sore_throat)-[:INDICATES {weight: 0.8}]->(viral_flu)
CREATE (sore_throat)-[:INDICATES {weight: 0.5}]->(pneumonia)
CREATE (sore_throat)-[:INDICATES {weight: 0.4}]->(allergic_reaction)

CREATE (chills)-[:INDICATES {weight: 0.9}]->(malaria)
CREATE (chills)-[:INDICATES {weight: 0.8}]->(typhoid)
CREATE (chills)-[:INDICATES {weight: 0.7}]->(viral_flu)
CREATE (chills)-[:INDICATES {weight: 0.6}]->(dengue)
CREATE (chills)-[:INDICATES {weight: 0.5}]->(pneumonia)

CREATE (fatigue)-[:INDICATES {weight: 0.7}]->(anemia)
CREATE (fatigue)-[:INDICATES {weight: 0.6}]->(viral_flu)
CREATE (fatigue)-[:INDICATES {weight: 0.5}]->(tb)
CREATE (fatigue)-[:INDICATES {weight: 0.6}]->(malaria)
CREATE (fatigue)-[:INDICATES {weight: 0.7}]->(diabetic_emergency)

CREATE (abdominal_pain)-[:INDICATES {weight: 0.7}]->(acute_diarrhea)
CREATE (abdominal_pain)-[:INDICATES {weight: 0.6}]->(typhoid)
CREATE (abdominal_pain)-[:INDICATES {weight: 0.8}]->(pregnancy_danger)
CREATE (abdominal_pain)-[:INDICATES {weight: 0.5}]->(cholera)

CREATE (burning_urination)-[:INDICATES {weight: 0.9}]->(uti)
CREATE (frequent_urination)-[:INDICATES {weight: 0.8}]->(uti)
CREATE (frequent_urination)-[:INDICATES {weight: 0.7}]->(diabetic_emergency)

CREATE (blood_in_stool)-[:INDICATES {weight: 0.9}]->(cholera)
CREATE (blood_in_stool)-[:INDICATES {weight: 0.7}]->(dysentery)

CREATE (swelling)-[:INDICATES {weight: 0.9}]->(pregnancy_danger)
CREATE (swelling)-[:INDICATES {weight: 0.7}]->(hypertension_crisis)
CREATE (swelling)-[:INDICATES {weight: 0.6}]->(malnutrition)
CREATE (swelling)-[:INDICATES {weight: 0.8}]->(anaphylaxis)

CREATE (dizziness)-[:INDICATES {weight: 0.8}]->(hypertension_crisis)
CREATE (dizziness)-[:INDICATES {weight: 0.7}]->(anemia)
CREATE (dizziness)-[:INDICATES {weight: 0.6}]->(heat_stroke)
CREATE (dizziness)-[:INDICATES {weight: 0.8}]->(diabetic_emergency)

CREATE (blurred_vision)-[:INDICATES {weight: 0.8}]->(hypertension_crisis)
CREATE (blurred_vision)-[:INDICATES {weight: 0.7}]->(diabetic_emergency)
CREATE (blurred_vision)-[:INDICATES {weight: 0.6}]->(eye_infection)

CREATE (skin_infection)-[:INDICATES {weight: 0.9}]->(scabies)
CREATE (itching)-[:INDICATES {weight: 0.8}]->(scabies)
CREATE (itching)-[:INDICATES {weight: 0.6}]->(allergic_reaction)

CREATE (bleeding)-[:INDICATES {weight: 1.0}]->(pregnancy_danger)
CREATE (bleeding)-[:INDICATES {weight: 0.8}]->(snake_bite)
CREATE (bleeding)-[:INDICATES {weight: 0.7}]->(cholera)

CREATE (loss_of_appetite)-[:INDICATES {weight: 0.7}]->(typhoid)
CREATE (loss_of_appetite)-[:INDICATES {weight: 0.6}]->(tb)
CREATE (loss_of_appetite)-[:INDICATES {weight: 0.7}]->(malnutrition)
CREATE (nausea)-[:INDICATES {weight: 0.6}]->(acute_diarrhea)
CREATE (nausea)-[:INDICATES {weight: 0.5}]->(heat_stroke)

CREATE (excessive_thirst)-[:INDICATES {weight: 0.9}]->(diabetic_emergency)
CREATE (excessive_thirst)-[:INDICATES {weight: 0.7}]->(heat_stroke)
CREATE (excessive_thirst)-[:INDICATES {weight: 0.6}]->(cholera)

CREATE (weight_loss)-[:INDICATES {weight: 0.8}]->(tb)
CREATE (weight_loss)-[:INDICATES {weight: 0.7}]->(malnutrition)
CREATE (weight_loss)-[:INDICATES {weight: 0.6}]->(diabetic_emergency)

CREATE (yellow_eyes)-[:INDICATES {weight: 0.9}]->(jaundice)

CREATE (seizure)-[:INDICATES {weight: 1.0}]->(anaphylaxis)
CREATE (unconsciousness)-[:INDICATES {weight: 1.0}]->(heat_stroke)
CREATE (unconsciousness)-[:INDICATES {weight: 0.9}]->(snake_bite)
CREATE (unconsciousness)-[:INDICATES {weight: 0.8}]->(diabetic_emergency)
CREATE (unconsciousness)-[:INDICATES {weight: 0.9}]->(hypertension_crisis)

// Fix missing nodes moved to top

// ───────────────────────────────────────────────────────────
// CONDITION → MEDICINE (TREATED_WITH)
// ───────────────────────────────────────────────────────────

CREATE (viral_flu)-[:TREATED_WITH {first_line: true}]->(paracetamol)
CREATE (dengue)-[:TREATED_WITH {first_line: true}]->(paracetamol)
CREATE (dengue)-[:TREATED_WITH {first_line: false}]->(ors)
CREATE (typhoid)-[:TREATED_WITH {first_line: true}]->(azithromycin)
CREATE (malaria)-[:TREATED_WITH {first_line: true}]->(metronidazole)
CREATE (acute_diarrhea)-[:TREATED_WITH {first_line: true}]->(ors)
CREATE (cholera)-[:TREATED_WITH {first_line: true}]->(ors)
CREATE (cholera)-[:TREATED_WITH {first_line: false}]->(azithromycin)
CREATE (pneumonia)-[:TREATED_WITH {first_line: true}]->(amoxicillin)
CREATE (tb)-[:TREATED_WITH {first_line: true}]->(amoxicillin)
CREATE (hypertension_crisis)-[:TREATED_WITH {first_line: false}]->(aspirin)
CREATE (diabetic_emergency)-[:TREATED_WITH {first_line: true}]->(insulin)
CREATE (diabetic_emergency)-[:TREATED_WITH {first_line: false}]->(metformin)
CREATE (anemia)-[:TREATED_WITH {first_line: true}]->(iron_supplement)
CREATE (uti)-[:TREATED_WITH {first_line: true}]->(ciprofloxacin)
CREATE (scabies)-[:TREATED_WITH {first_line: true}]->(hydrocortisone)
CREATE (snake_bite)-[:TREATED_WITH {first_line: true}]->(antivenom)
CREATE (heat_stroke)-[:TREATED_WITH {first_line: true}]->(ors)
CREATE (pregnancy_danger)-[:TREATED_WITH {first_line: false}]->(paracetamol)
CREATE (malnutrition)-[:TREATED_WITH {first_line: true}]->(vitamin_a)
CREATE (eye_infection)-[:TREATED_WITH {first_line: true}]->(tetracycline_eye)
CREATE (ear_infection)-[:TREATED_WITH {first_line: true}]->(amoxicillin)
CREATE (allergic_reaction)-[:TREATED_WITH {first_line: true}]->(chlorpheniramine)
CREATE (anaphylaxis)-[:TREATED_WITH {first_line: true}]->(epinephrine)
CREATE (dysentery)-[:TREATED_WITH {first_line: true}]->(metronidazole)
CREATE (jaundice)-[:TREATED_WITH {first_line: false}]->(paracetamol)

// ───────────────────────────────────────────────────────────
// MEDICINE → MEDICINE (INTERACTS_WITH)
// ───────────────────────────────────────────────────────────

CREATE (warfarin)-[:INTERACTS_WITH {severity: "high", mechanism: "bleeding_risk"}]->(aspirin)
CREATE (warfarin)-[:INTERACTS_WITH {severity: "high", mechanism: "bleeding_risk"}]->(ibuprofen)
CREATE (metformin)-[:INTERACTS_WITH {severity: "medium", mechanism: "lactic_acidosis"}]->(ciprofloxacin)
CREATE (aspirin)-[:INTERACTS_WITH {severity: "medium", mechanism: "GI_bleeding"}]->(ibuprofen)
CREATE (ciprofloxacin)-[:INTERACTS_WITH {severity: "medium", mechanism: "tendon_rupture"}]->(ibuprofen)
CREATE (amoxicillin)-[:INTERACTS_WITH {severity: "low", mechanism: "reduced_absorption"}]->(paracetamol)
CREATE (insulin)-[:INTERACTS_WITH {severity: "high", mechanism: "hypoglycemia"}]->(aspirin)
CREATE (epinephrine)-[:INTERACTS_WITH {severity: "high", mechanism: "hypertension"}]->(warfarin)
CREATE (azithromycin)-[:INTERACTS_WITH {severity: "medium", mechanism: "QT_prolongation"}]->(ciprofloxacin)

// ───────────────────────────────────────────────────────────
// CONDITION → RISK FACTOR
// ───────────────────────────────────────────────────────────

CREATE (pregnancy_danger)-[:RISK_ELEVATED_BY]->(pregnant)
CREATE (malnutrition)-[:RISK_ELEVATED_BY]->(child_under_5)
CREATE (malnutrition)-[:RISK_ELEVATED_BY]->(malnourished)
CREATE (hypertension_crisis)-[:RISK_ELEVATED_BY]->(hypertensive)
CREATE (hypertension_crisis)-[:RISK_ELEVATED_BY]->(pregnant)
CREATE (diabetic_emergency)-[:RISK_ELEVATED_BY]->(diabetic)
CREATE (anemia)-[:RISK_ELEVATED_BY]->(pregnant)
CREATE (anemia)-[:RISK_ELEVATED_BY]->(malnourished)
CREATE (tb)-[:RISK_ELEVATED_BY]->(malnourished)
CREATE (tb)-[:RISK_ELEVATED_BY]->(elderly)
CREATE (pneumonia)-[:RISK_ELEVATED_BY]->(elderly)
CREATE (pneumonia)-[:RISK_ELEVATED_BY]->(child_under_5)
CREATE (heat_stroke)-[:RISK_ELEVATED_BY]->(elderly)
CREATE (heat_stroke)-[:RISK_ELEVATED_BY]->(pregnant)
CREATE (snake_bite)-[:RISK_ELEVATED_BY]->(child_under_5)
CREATE (snake_bite)-[:RISK_ELEVATED_BY]->(elderly)
CREATE (allergic_reaction)-[:RISK_ELEVATED_BY]->(pregnant)
CREATE (anaphylaxis)-[:RISK_ELEVATED_BY]->(pregnant)

// ───────────────────────────────────────────────────────────
// SYMPTOM CO-OCCURRENCE (for pattern learning)
// ───────────────────────────────────────────────────────────

CREATE (fever)-[:CO_OCCURS_WITH {frequency: 0.85, context: "rural_india"}]->(body_ache)
CREATE (fever)-[:CO_OCCURS_WITH {frequency: 0.75, context: "rural_india"}]->(headache)
CREATE (fever)-[:CO_OCCURS_WITH {frequency: 0.7, context: "rural_india"}]->(chills)
CREATE (diarrhea)-[:CO_OCCURS_WITH {frequency: 0.8, context: "rural_india"}]->(vomiting)
CREATE (diarrhea)-[:CO_OCCURS_WITH {frequency: 0.75, context: "rural_india"}]->(dehydration)
CREATE (cough)-[:CO_OCCURS_WITH {frequency: 0.6, context: "rural_india"}]->(sore_throat)
CREATE (cough)-[:CO_OCCURS_WITH {frequency: 0.5, context: "rural_india"}]->(fever)
CREATE (burning_urination)-[:CO_OCCURS_WITH {frequency: 0.8, context: "rural_india"}]->(frequent_urination)
CREATE (rash)-[:CO_OCCURS_WITH {frequency: 0.7, context: "rural_india"}]->(itching)
CREATE (swelling)-[:CO_OCCURS_WITH {frequency: 0.6, context: "rural_india"}]->(dizziness)
CREATE (excessive_thirst)-[:CO_OCCURS_WITH {frequency: 0.8, context: "rural_india"}]->(frequent_urination)
CREATE (excessive_thirst)-[:CO_OCCURS_WITH {frequency: 0.6, context: "rural_india"}]->(fatigue)
CREATE (chest_pain)-[:CO_OCCURS_WITH {frequency: 0.7, context: "rural_india"}]->(dizziness)
CREATE (chest_pain)-[:CO_OCCURS_WITH {frequency: 0.6, context: "rural_india"}]->(breathing_difficulty)
CREATE (bleeding)-[:CO_OCCURS_WITH {frequency: 0.8, context: "rural_india"}]->(abdominal_pain)
CREATE (seizure)-[:CO_OCCURS_WITH {frequency: 0.7, context: "rural_india"}]->(unconsciousness)
