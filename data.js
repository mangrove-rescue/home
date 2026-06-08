
/* ===================== DATA ===================== */
const sites = {
  borneo: {
    name: 'Borneo Mangroves',
    location: 'Sabah and Sarawak (Malaysia),  Kalimantan (Indonesia) and Brunei',
    threat: 'Palm oil plantation expansion and coastal deforestation. ',
    mission: 'Critical tropical mangrove habitat supporting diverse wildlife in Southeast Asia, such as Proboscis monkeys.',
    fact: 'The Kinabatangan River in Sabah is a premier international mangrove and riverine tourism destination.'
  },
  sundarbans: {
    name: 'Sundarbans Mangroves',
    location: 'Sundarbans, Ganges delta between India and Bangladesh',
    threat: ' Industrial development, deforestation and climate change.',
    mission: 'World\'s largest mangrove forest; supports single largest tiger population adapted to amphibious life.',
    fact: 'Spanning  10,000 km², the Surdarbans is a UNESCO World Heritage Site formed by confluence of Ganges, Brahmaputra, and Meghna rivers.'
  },
  mekong: {
    name: 'Mekong Delta Mangroves',
    location: 'Mekong Delta, Vietnam',
    threat: 'Sea-level rise and conversion into commercial shrimp farming.',
    mission: 'Protects coasts from soil erosion and strong waves; supplies seafood and accumulates blue carbon.',
    fact: 'Eco-certified, mangrove-friendly shrimp farming initiatives are actively restoring forests to safeguard coastal communities.'
  },
  amazon: {
    name: 'Amazon Mangroves',
    location: 'Amazon River mouth, North coast of Brazil, Brazil',
    threat: 'Climate change and coastal development.',
    mission: 'Form the world\'s longest continuous coastal belt of mangroves; vital breeding grounds for marine life, including the endangered Atlantic Goliath Grouper. ',
    fact: 'Spanning ~7,800 km², Brazil holds nearly 10% of the world\'s mangroves, making them crucial "blue guardians" for carbon storage.'
  },
  everglades: {
    name: 'Everglades Mangroves',
    location: 'Everglades National Park, Southern Florida, USA',
    threat: 'Climate change causing sea-level rise and saltwater intrusion.',
    mission: 'Largest mangrove ecosystem in the Western Hemisphere; major breeding ground for wading birds in North America.',
    fact: 'Contiguous mangrove forests stretch from freshwater marshes seaward to Florida Bay and Gulf of Mexico.'
  }
};

const incidents = [
  {
    id: 1, x: 76, y: 63, marker: 'PLASTIC', title: 'Plastic Waste Accumulation',
    situation: 'A nearby coastal village lacks proper waste disposal facilities. Over several months, plastic waste has accumulated within the mangrove forest. Marine animals may ingest plastic fragments, while trapped waste blocks water circulation around mangrove roots.',
    question: 'What should be done?',
    options: [
      { title: 'Open Burning', cost: 5000, 
      expectedOutcome: 'Quickly removes visible waste.', 
      effects: { pollution: 15, biodiversity: -5, health: -10 }, 
      visualFeedback: 'Trash disappears, smoke appears, water becomes darker.', 
      learningPopup: 'Burning removes waste visually, but creates toxic pollution.' },

      { title: 'Community Cleanup & Recycling Program', cost: 12000, 
      expectedOutcome: 'Waste is removed and recyclable materials are separated.', 
      effects: { pollution: -20, biodiversity: 5, health: 10 }, 
      visualFeedback: 'Trash removed, water becomes clearer, small fish appear.', 
      learningPopup: 'Community cleanup reduces pollution and supports long-term recovery.' },

      { title: 'Basic Cleanup', cost: 8000, 
      expectedOutcome: 'Most visible waste is removed.', 
      effects: { pollution: -10, biodiversity: 2, health: 5 }, 
      visualFeedback: 'Most trash disappears, but small waste remains.', 
      learningPopup: 'Basic cleanup helps, but future waste prevention is still needed.' },
    ]
  },
  {
    id: 2, x: 43, y: 55, marker: 'GHOST NET', title: 'Ghost Fishing Nets',
    situation: 'Abandoned fishing nets are tangled around mangrove roots and continue trapping fish, crabs, and birds even after being discarded.',
    question: 'How should your team respond?',
    options: [
      { title: 'Specialist Removal Team', cost: 16000, 
      expectedOutcome: 'Nets are safely removed without damaging roots.', 
      effects: { pollution: -5, biodiversity: 12, health: 10 }, 
      visualFeedback: 'Nets disappear, crabs and fish return.', 
      learningPopup: 'Careful removal protects wildlife and mangrove roots.' },

      { title: 'Cut Visible Sections Only', cost: 7000, 
      expectedOutcome: 'Quickly cut the exposed sections from the shoreline.', 
      effects: { pollution: -2, biodiversity: 5, health: 5 }, 
      visualFeedback: 'Some nets disappear, but a few remain.', 
      learningPopup: 'Partial removal helps, but complex nets need expert support.' },

      { title: 'Ignore the Nets', cost: 0, expectedOutcome: 'Delay action and wait for a more convenient tide window.', 
      effects: { pollution: 0, biodiversity: -15, health: -10 }, 
      visualFeedback: 'Fish disappear and the net remains tangled.', 
      learningPopup: 'Ghost nets continue harming wildlife when ignored.' },
    ]
  },
  {
    id: 3, x: 18, y: 58, marker: 'OIL SPILL', title: 'Oil Spill Contamination',
    situation: 'A fuel transport accident has released oil near the mangrove shoreline. Oil coats mangrove roots and blocks oxygen exchange.',
    question: 'How should the spill be handled?',
    options: [
      { title: 'Wait for Natural Recovery', cost: 0, 
      expectedOutcome: 'The tide may wash some oil away.', 
      effects: { pollution: 20, biodiversity: -10, health: -15 }, 
      visualFeedback: 'Oil spreads across the water and roots darken.', 
      learningPopup: 'Oil trapped in mangrove roots can cause long-term damage.' },

      { title: 'Professional Containment', cost: 20000, 
      expectedOutcome: 'Oil is contained and removed properly.', 
      effects: { pollution: -20, biodiversity: 5, health: 15 }, 
      visualFeedback: 'Oil barrier appears, oil patch shrinks, water improves.', 
      learningPopup: 'Fast containment limits damage to roots and wildlife.' },

      { title: 'Manual Shoreline Cleanup', cost: 10000, 
      expectedOutcome: 'Visible oil is reduced near the shore.', 
      effects: { pollution: -10, biodiversity: 2, health: 5 }, 
      visualFeedback: 'Some oil disappears, but a smaller stain remains.', 
      learningPopup: 'Manual cleanup helps, but oil spills often need specialists.' }
    ]
  },
  {
    id: 4, x: 54, y: 48, marker: 'DISCHARGE', title: 'Illegal Industrial Discharge',
    situation: 'Discolored water is flowing from a nearby drainage outlet into the mangrove area. The source may be untreated industrial wastewater.',
    question: 'What action should be taken?',
    options: [
      { title: 'Ignore the Discharge', cost: 0, 
      expectedOutcome: 'No immediate spending.', 
      effects: { pollution: 20, biodiversity: -8, health: -15 }, 
      visualFeedback: 'Water becomes darker and wildlife decreases.', 
      learningPopup: 'Untreated discharge can spread quickly through wetlands.' },

      { title: 'Water Testing & Legal Enforcement', cost: 18000, 
      expectedOutcome: 'Samples are tested and the source is reported.', 
      effects: { pollution: -15, biodiversity: 5, health: 15 }, 
      visualFeedback: 'Toxic color fades and monitoring markers appear.', 
      learningPopup: 'Testing and enforcement help stop pollution at the source.' },

      { title: 'Temporary Filter Barrier', cost: 11000, 
      expectedOutcome: 'Some pollutants are slowed before spreading.', 
      effects: { pollution: -7, biodiversity: 2, health: 5 }, 
      visualFeedback: 'Barrier appears near drainage outlet.', 
      learningPopup: 'Barriers reduce spread, but the source still matters.' }
    ]
  },
  {
    id: 5, x: 82, y: 47, marker: 'HABITAT LOSS', title: 'Mangrove Habitat Loss',
    situation: 'Illegal clearing has removed part of the mangrove forest. Exposed soil is now vulnerable to erosion, and nursery habitat for young marine life has been reduced.',
    question: 'How should the damaged area be restored?',
    options: [
      { title: 'Leave the Area Untouched', cost: 0, 
      expectedOutcome: 'No immediate spending.', 
      effects: { pollution: 0, biodiversity: -10, health: -15 }, 
      visualFeedback: 'More dead trees appear and shoreline soil erodes.', 
      learningPopup: 'Unrestored mangrove loss can worsen erosion and habitat decline.' },

      { title: 'Native Reforestation Program', cost: 17000, 
      expectedOutcome: 'Native seedlings are planted and protected.', 
      effects: { pollution: -3, biodiversity: 15, health: 15 }, visualFeedback: 'Seedlings appear and trees become greener.', 
      learningPopup: 'Native replanting restores habitat and shoreline protection.' },

      { title: 'Temporary Erosion Control', cost: 9000, 
      expectedOutcome: 'Soil movement is reduced temporarily.', 
      effects: { pollution: 0, biodiversity: 2, health: 5 }, 
      visualFeedback: 'Soil barriers appear near exposed shoreline.', 
      learningPopup: 'Erosion control helps, but replanting is needed for recovery.' }
    ]
  },
  {
    id: 6, x: 64, y: 72, marker: 'SEDIMENT', title: 'Excessive Sedimentation',
    situation: 'Land clearing upstream has increased sediment flow. Thick mud is covering young mangrove roots and reducing seedling survival.',
    question: 'What should your team do?',
    options: [
      { title: 'Dig Drainage Channels', cost: 5000, 
      expectedOutcome: 'Water appears to move faster.', 
      effects: { pollution: 5, biodiversity: -5, health: -5 }, 
      visualFeedback: 'Roots look damaged and water channels cut through the mud.', 
      learningPopup: 'Poorly planned digging can damage roots and tidal flow.' },

      { title: 'Hydrological Restoration', cost: 15000, 
      expectedOutcome: 'Natural water flow is restored.', 
      effects: { pollution: -5, biodiversity: 5, health: 15 }, 
      visualFeedback: 'Mud reduces, roots become visible, water flow improves.', 
      learningPopup: 'Balanced tidal flow supports healthy mangrove recovery.' },

      { title: 'Delay Action', cost: 0, expectedOutcome: 'No immediate spending, but sediment stays over young roots.', 
      effects: { pollution: 4, biodiversity: -6, health: -8 }, visualFeedback: 'Mud remains and seedlings weaken.', 
      learningPopup: 'Delayed sediment control can reduce seedling survival.' }
    ]
  },
  {
    id: 7, x: 28, y: 70, marker: 'INVASIVE', title: 'Invasive Species Outbreak',
    situation: 'A fast-growing invasive plant species is spreading along the mangrove edge and competing with native seedlings.',
    question: 'How should the invasion be managed?',
    options: [
      { title: 'Heavy Herbicide Application', cost: 6000, 
      expectedOutcome: 'Invasive plants are killed quickly.', 
      effects: { pollution: 10, biodiversity: -5, health: -5 }, 
      visualFeedback: 'Invasive plants disappear, but water becomes slightly toxic.', 
      learningPopup: 'Uncontrolled chemical use can harm native plants and water quality.' },

      { title: 'Targeted Removal Program', cost: 14000, 
      expectedOutcome: 'Invasive plants are removed carefully and monitored.', 
      effects: { pollution: -2, biodiversity: 10, health: 10 }, 
      visualFeedback: 'Invasive plants disappear and native seedlings return.', 
      learningPopup: 'Targeted removal protects native species and prevents regrowth.' },

      { title: 'One-Time Manual Removal', cost: 7000, expectedOutcome: 'Some invasive plants are removed.', 
      effects: { pollution: 0, biodiversity: 5, health: 2 }, visualFeedback: 'Some invasive plants disappear, but patches remain.', 
      learningPopup: 'One-time removal helps, but monitoring is needed.' },

    ]
  },
  {
    id: 8, x: 38, y: 44, marker: 'DEVELOPMENT', title: 'Coastal Development Pressure',
    situation: 'A resort developer wants to build close to the mangrove boundary. Construction may disturb wildlife, compact soil, and fragment habitat.',
    question: 'How should the conservation team respond?',
    options: [
      { title: 'Approve Development Without Review', cost: 0, 
      expectedOutcome: 'Avoids conflict and saves budget.', 
      effects: { pollution: 5, biodiversity: -20, health: -20 }, 
      visualFeedback: 'Construction expands, trees disappear, wildlife leaves.', 
      learningPopup: 'Uncontrolled development can permanently fragment mangrove habitat.' },

      { title: 'Environmental Impact Assessment & Buffer Zone', cost: 20000, 
      expectedOutcome: 'Development is reviewed and a protected buffer is created.', 
      effects: { pollution: -5, biodiversity: 15, health: 15 }, 
      visualFeedback: 'Protected zone signs appear and wildlife increases.', 
      learningPopup: 'Buffer zones help balance development and conservation.' },

      { title: 'Temporary Protection Barriers', cost: 8000, 
      expectedOutcome: 'Construction activity is slowed near sensitive areas.', 
      effects: { pollution: 0, biodiversity: 2, health: 5 }, visualFeedback: 'Warning barriers appear near construction area.', 
      learningPopup: 'Temporary barriers help, but long-term planning is stronger.' }
    ]
  }
];

/* default options */
const state = {
  
  budget: 80000,
  pollution: 20,
  biodiversity: 20,
  health: 20,
  resolved: new Set(),
  history: [],
  activeIncidentId: null,
  selectedOptionIndex: null
};
