export type Language = 'en' | 'hi';

export const DICTIONARY = {
  en: {
    appTitle: 'EARTHSYNC',
    tagline: 'Sensing Today | Safer Tomorrow',
    subtitle: 'Multi-Hazard Environmental Intelligence & Early Warning Platform',
    
    // Safety Statuses
    safe: 'SAFE',
    safeSubtitle: 'No active critical hazard near your location.',
    beAlert: 'BE ALERT',
    beAlertSubtitle: 'Environmental conditions are changing in your area.',
    highRisk: 'HIGH RISK',
    highRiskSubtitle: 'Significant environmental risk detected nearby.',
    criticalRisk: 'CRITICAL WARNING',
    criticalRiskSubtitle: 'Immediate danger. Follow evacuation directives.',
    
    // Citizen Navigation
    navHome: 'Safety',
    navMap: 'Safe Map',
    navAlerts: 'Alerts',
    navGuides: 'Guides',
    navApk: 'Get APK',
    navProfile: 'Settings',

    // Role Switcher
    switchRole: 'Switch Experience',
    citizenMode: 'Citizen Safety App',
    authorityMode: 'Authority Command Center',
    adminMode: 'System Admin',

    // Am I Safe & Proximity
    amISafe: 'AM I SAFE?',
    yourArea: 'YOUR AREA',
    distanceAway: 'away from your location',
    nearbyHazard: 'Nearby Environmental Hazard',
    whatHappened: 'WHAT IS HAPPENING?',
    whyThisAlert: 'WHY THIS ALERT?',
    whatToDo: 'WHAT SHOULD YOU DO?',
    viewMap: 'VIEW SAFE MAP',
    safeMap: 'Safe Evacuation Map',
    alertsEvents: 'Alerts & Emergency Events',
    whyAlert: 'Why am I seeing this?',
    acknowledge: 'Acknowledge',
    iUnderstand: 'I UNDERSTAND & ACKNOWLEDGE',
    acknowledged: 'ACKNOWLEDGED',
    
    // Emergency Guides
    emergencyGuides: 'EMERGENCY SAFETY GUIDES',
    dos: 'WHAT TO DO (DOs)',
    donts: 'WHAT TO AVOID (DON\'Ts)',
    emergencyKit: 'EMERGENCY SURVIVAL KIT',
    emergencyHelpline: 'NATIONAL DISASTER HELPLINE: 1078 / 112',

    // Safe Shelters
    safeShelters: 'Nearby Shelters & Hospitals',
    callHelpline: 'Call Emergency',
    getDirections: 'Directions',
    capacity: 'Capacity',
    available: 'Available',

    // Offline Banner
    offlineMode: 'OFFLINE MODE',
    offlineNotice: 'Internet disconnected. Showing verified cached safety guides and last known sensor data.',
    onlineRestored: 'CONNECTIVITY RESTORED',
    syncComplete: 'All telemetry & alerts synchronized with EarthSync cloud.',

    // Status Badges
    liveSensor: 'LIVE SENSOR STREAM',
    demoMode: 'DEMO SIMULATION',
    staleData: 'STALE DATA',
    connected: 'CONNECTED',
    edgeActive: 'EDGE AUTONOMOUS MODE',

    // Auth
    enterPhone: 'Enter Mobile Number',
    sendOtp: 'Send Verification OTP',
    verifyOtp: 'Verify Code',
    devOtpNotice: 'DEVELOPER MODE: Enter any 6-digit OTP (e.g. 123456)',
    authenticatedAs: 'Verified Citizen ID',
    locationAccess: 'Allow Location Access',
    locationExplanation: 'Used strictly to calculate distance to nearby flood/fire hazards and safe evacuation shelters. Your exact location is never made public.',
  },
  hi: {
    appTitle: 'अर्थसिंक',
    tagline: 'आज की समझ | सुरक्षित कल',
    subtitle: 'बहु-आपदा पर्यावरणीय पूर्व चेतावनी एवं सुरक्षा प्रणाली',
    
    // Safety Statuses
    safe: 'सुरक्षित (SAFE)',
    safeSubtitle: 'आपके क्षेत्र में कोई भी गंभीर पर्यावरणीय खतरा नहीं है।',
    beAlert: 'सतर्क रहें (BE ALERT)',
    beAlertSubtitle: 'आपके आसपास मौसमी या पर्यावरणीय बदलाव दर्ज किए जा रहे हैं।',
    highRisk: 'उच्च जोखिम (HIGH RISK)',
    highRiskSubtitle: 'आपके नजदीकी क्षेत्र में खतरे की स्थिति बन रही है।',
    criticalRisk: 'गंभीर चेतावनी (CRITICAL)',
    criticalRiskSubtitle: 'आपातकालीन स्थिति। तुरंत सुरक्षित स्थान पर जाएं।',
    
    // Citizen Navigation
    navHome: 'सुरक्षा',
    navMap: 'सुरक्षित नक्शा',
    navAlerts: 'चेतावनी',
    navGuides: 'मार्गदर्शिका',
    navApk: 'APK ऐप',
    navProfile: 'सेटिंग्स',

    // Role Switcher
    switchRole: 'अनुभव बदलें',
    citizenMode: 'नागरिक सुरक्षा ऐप',
    authorityMode: 'आपदा नियंत्रण केंद्र (Authority)',
    adminMode: 'प्रशासक (Admin)',

    // Am I Safe & Proximity
    amISafe: 'क्या मैं सुरक्षित हूँ?',
    yourArea: 'आपका क्षेत्र',
    distanceAway: 'आपके स्थान से दूरी',
    nearbyHazard: 'नजदीकी पर्यावरणीय खतरा',
    whatHappened: 'क्या हो रहा है?',
    whyThisAlert: 'यह चेतावनी क्यों मिली?',
    whatToDo: 'आपको क्या करना चाहिए?',
    viewMap: 'सुरक्षित नक्शा देखें',
    safeMap: 'सुरक्षित आपदा नक्शा',
    alertsEvents: 'आपातकालीन अलर्ट एवं बुलेटिन',
    whyAlert: 'यह अलर्ट क्यों मिला?',
    acknowledge: 'पुष्टि करें',
    iUnderstand: 'मैं समझ गया (पुष्टि करें)',
    acknowledged: 'पुष्टीकृत',
    
    // Emergency Guides
    emergencyGuides: 'आपदा सुरक्षा मार्गदर्शिका',
    dos: 'क्या करें (DOs)',
    donts: 'क्या न करें (DON\'Ts)',
    emergencyKit: 'आपातकालीन सुरक्षा किट',
    emergencyHelpline: 'राष्ट्रीय आपदा हेल्पलाइन: 1078 / 112',

    // Safe Shelters
    safeShelters: 'नजदीकी राहत शिविर एवं अस्पताल',
    callHelpline: 'हेल्पलाइन कॉल करें',
    getDirections: 'रास्ता देखें',
    capacity: 'कुल क्षमता',
    available: 'उपलब्ध स्थान',

    // Offline Banner
    offlineMode: 'ऑफलाइन मोड',
    offlineNotice: 'इंटरनेट संपर्क नहीं है। सुरक्षित स्थानीय डेटा और निर्देश दिखाए जा रहे हैं।',
    onlineRestored: 'संपर्क बहाल हुआ',
    syncComplete: 'सभी चेतावनी एवं डेटा सिंक हो चुके हैं।',

    // Status Badges
    liveSensor: 'लाइव सेंसर डेटा',
    demoMode: 'डेमो सिमुलेशन',
    staleData: 'अद्यतन प्रतीक्षारत',
    connected: 'कनेक्टेड',
    edgeActive: 'एज स्वायत्त मोड',

    // Auth
    enterPhone: 'मोबाइल नंबर दर्ज करें',
    sendOtp: 'ओटीपी (OTP) भेजें',
    verifyOtp: 'ओटीपी सत्यापित करें',
    devOtpNotice: 'डेवलपर मोड: कोई भी 6 अंकों का कोड दर्ज करें (उदा. 123456)',
    authenticatedAs: 'सत्यापित नागरिक आईडी',
    locationAccess: 'स्थान (Location) अनुमति दें',
    locationExplanation: 'इसका उपयोग केवल नजदीकी बाढ़/आग के खतरे से दूरी मापने और सुरक्षित शिविर दिखाने के लिए किया जाता है।',
  }
};

export const EMERGENCY_GUIDES_DATA: Record<string, {
  en: { title: string; tagline: string; dos: string[]; donts: string[]; kit: string[] };
  hi: { title: string; tagline: string; dos: string[]; donts: string[]; kit: string[] };
}> = {
  flood: {
    en: {
      title: 'Flood & Water Inundation Safety',
      tagline: 'Turn around, don\'t drown. Water depth is deceptive.',
      dos: [
        'Move immediately to higher ground or an approved disaster shelter.',
        'Keep drinking water, essential medicines, and waterproof torch handy.',
        'Turn off main electricity switches and gas valves before evacuating.',
        'Follow designated evacuation routes provided by local authorities.'
      ],
      donts: [
        'Never walk, swim, or drive through moving floodwaters.',
        'Do not touch electrical poles, fallen wires, or submerged appliances.',
        'Do not eat food that has come into direct contact with floodwater.'
      ],
      kit: ['Purified water (3 days)', 'High-calorie dry food', 'Battery radio & power bank', 'First aid box', 'Photocopies of Aadhaar/Documents in ziplock']
    },
    hi: {
      title: 'बाढ़ एवं जलभराव से सुरक्षा',
      tagline: 'ऊंचे स्थानों पर जाएं। बहते पानी में कभी प्रवेश न करें।',
      dos: [
        'तुरंत ऊंचे स्थानों या नजदीकी राहत शिविर में पहुंचे।',
        'पीने का पानी, जरूरी दवाएं और टॉर्च अपने साथ रखें।',
        'घर छोड़ते समय बिजली का मुख्य स्विच और गैस सिलेंडर बंद करें।',
        'प्रशासन द्वारा बताए गए सुरक्षित निकासी मार्गों का ही उपयोग करें।'
      ],
      donts: [
        'बाढ़ के बहते पानी में कभी पैदल या वाहन से जाने की कोशिश न करें।',
        'बिजली के खंभों, गिरे तारों या पानी में डूबे उपकरणों को न छुएं।',
        'बाढ़ के पानी के संपर्क में आया भोजन या खुला पानी न पिएं।'
      ],
      kit: ['पीने का पानी (3 दिन का)', 'सूखा भोजन एवं बिस्कुट', 'टॉर्च एवं पावर बैंक', 'प्राथमिक चिकित्सा किट', 'पहचान पत्रों की वाटरप्रूफ प्रति']
    }
  },
  wildfire: {
    en: {
      title: 'Forest & Wildfire Protection',
      tagline: 'High ambient heat and heavy smoke require rapid breathing protection.',
      dos: [
        'Cover nose and mouth with a wet cloth or N95 mask against particulate smoke.',
        'Evacuate perpendicular or away from the wind direction of advancing fire.',
        'Keep battery-powered communication devices charged and listen to official alerts.',
        'Clear dry leaves, twigs, and combustible material around temporary shelters.'
      ],
      donts: [
        'Do not attempt to fight large forest canopy fires without professional equipment.',
        'Do not drive through dense smoke where visibility is under 5 meters.',
        'Do not discard lit matches, beedis, or cigarettes in forest terrain.'
      ],
      kit: ['N95 masks / wet bandanas', 'Saline eye drops', 'Goggles for eye protection', 'Oral rehydration salts (ORS)', 'Emergency radio']
    },
    hi: {
      title: 'जंगल की आग (दावानल) से सुरक्षा',
      tagline: 'धुएं और लपटों से सुरक्षित दूरी बनाएं, हवा की उल्टी दिशा में जाएं।',
      dos: [
        'धुएं से बचने के लिए नाक और मुंह पर गीला कपड़ा या N95 मास्क लगाएं।',
        'आग की लपटों और हवा की दिशा से विपरीत सुरक्षित दिशा में जाएं।',
        'आधिकारिक वन विभाग एवं आपदा नियंत्रण की चेतावनियों पर ध्यान दें।',
        'आश्रय स्थल के आसपास सूखी पत्तियां और ज्वलनशील कचरा साफ रखें।'
      ],
      donts: [
        'बिना सुरक्षा उपकरणों के बड़े पैमाने पर जंगल की आग बुझाने का प्रयास न करें।',
        'घने धुएं वाले रास्तों पर गाड़ी न चलाएं।',
        'जंगल के आसपास बीड़ी, माचिस या जलती हुई वस्तुएं न फेंकें।'
      ],
      kit: ['N95 मास्क / गीले कपड़े', 'आंखों के लिए आई ड्रॉप्स', 'ओआरएस (ORS) के पैकेट', 'पर्याप्त पीने का पानी', 'प्राथमिक उपचार दवाएं']
    }
  },
  landslide: {
    en: {
      title: 'Landslide & Slope Incline Safety',
      tagline: 'Stay vigilant during intense hillside rainfall and sudden slope drainage changes.',
      dos: [
        'Listen for unusual sounds like cracking trees, rolling boulders, or rumbling.',
        'Quickly move away from the direct path of the slide or debris flow.',
        'Relocate to stable escarpment crests or government relief centers.',
        'Check for injured or trapped persons without entering the slide path.'
      ],
      donts: [
        'Do not stay in low-lying riverbeds or ravine funnels during slope instability.',
        'Do not sleep on ground-floor hillside rooms during continuous torrential downpours.',
        'Never cross a road where fresh mud or boulders have recently blocked drainage.'
      ],
      kit: ['Emergency whistle', 'Heavy-duty flashlight', 'Emergency ropes', 'Warm blankets', 'Sturdy trekking footwear']
    },
    hi: {
      title: 'भूस्खलन (लैंडस्लाइड) से सुरक्षा',
      tagline: 'पहाड़ी क्षेत्रों में भारी बारिश के दौरान सतर्क रहें।',
      dos: [
        'पेड़ों के टूटने, पत्थरों के गिरने या गड़गड़ाहट की आवाज़ पर तुरंत सतर्क हों।',
        'भूस्खलन के मार्ग से तुरंत दूर, समतल व पक्के स्थानों पर जाएं।',
        'प्रशासन द्वारा निर्धारित पहाड़ी राहत शिविरों में शरण लें।',
        'पहाड़ी ढलानों पर पानी का अचानक रुकना या मटमैला होना खतरे का संकेत समझें।'
      ],
      donts: [
        'भूस्खलन के मलबे के पास या ढलान के ठीक नीचे खड़े न रहें।',
        'भारी बारिश के समय पहाड़ी नालों और खाइयों के पास घर में न रुकें।',
        'भूस्खलन से प्रभावित रास्तों पर यात्रा करने से बचें।'
      ],
      kit: ['सीटी (Whistle)', 'मजबूत टॉर्च', 'गर्म कपड़े व कंबल', 'प्राथमिक चिकित्सा किट', 'मजबूत जूते']
    }
  },
  heatwave: {
    en: {
      title: 'Extreme Heatwave & Sunstroke Safety',
      tagline: 'Hydrate continuously and avoid peak solar thermal exposure.',
      dos: [
        'Drink plenty of water, buttermilk, nimbu pani, and ORS solution frequently.',
        'Wear loose, light-colored, breathable cotton clothing and head coverings.',
        'Stay indoors during peak sunshine hours (12:00 PM to 4:00 PM).',
        'Ensure domestic livestock and pets have ample shaded resting areas and cool water.'
      ],
      donts: [
        'Do not leave children or vulnerable elderly unattended inside parked vehicles.',
        'Avoid strenuous outdoor physical labor during peak temperature afternoons.',
        'Avoid high-sugar, carbonated, or dehydrating caffeinated drinks.'
      ],
      kit: ['Electrolyte ORS sachets', 'Wide-brimmed umbrella / cap', 'Insulated water flask', 'Wet hand towels', 'Sunscreen / soothing lotion']
    },
    hi: {
      title: 'भीषण गर्मी एवं लू (Heatwave) से बचाव',
      tagline: 'भरपूर पानी पिएं और दोपहर की सीधी धूप से बचें।',
      dos: [
        'पर्याप्त पानी, छाछ, नींबू पानी और ओआरएस (ORS) का नियमित सेवन करें।',
        'हल्के रंग के, ढीले और सूती कपड़े पहनें व सिर को गमछे या टोपी से ढकें।',
        'दोपहर 12 बजे से शाम 4 बजे के बीच आवश्यक न हो तो धूप में बाहर न निकलें।',
        'पशुओं और पालतू जानवरों को छायादार स्थान और ठंडा पानी उपलब्ध कराएं।'
      ],
      donts: [
        'बच्चों या बुजुर्गों को बंद वाहन में कभी अकेला न छोड़ें।',
        'तेज धूप में भारी शारीरिक श्रम या कठिन व्यायाम करने से बचें।',
        'अधिक चाय, कॉफी या अत्यधिक मीठे पेय पदार्थों से बचें।'
      ],
      kit: ['ओआरएस (ORS) पैकेट', 'छाता / सूती गमछा', 'ठंडे पानी की बोतल', 'गीला तौलिया', 'ग्लूकोज पाउडर']
    }
  }
};
