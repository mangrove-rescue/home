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
    id: 1, x: 18, y: 58, marker: 'PLASTIC', title: 'Plastic Waste',
    situation: 'Plastic waste is trapped along the shoreline, threatening wildlife and blocking mangrove growth.',
    question: 'How should the team manage plastic waste?',
    options: [
      {
        title: 'Community Recycling Program',
        cost: 20000,
        expectedOutcome: 'Slower start, but builds local cleanup habits.',
        effects: { pollution: -18, biodiversity: 10, health: 10, fish: 8, shrimp: 4, community: 14 },
        visualFeedback: 'Turn 1: plastic is reduced and volunteers appear. Turn 2: trees and fish recover.',
        learningPopup: 'Community programs prevent macroplastics from becoming harmful microplastics and build long-term local care.'
      },
      {
        title: 'Hire Cleanup Contractors',
        cost: 12000,
        expectedOutcome: 'Fast cleanup with limited community involvement.',
        effects: { pollution: -20, biodiversity: 8, health: 8, fish: 10, shrimp: 3, community: 2 },
        visualFeedback: 'Plastic disappears immediately and fish visibility improves.',
        learningPopup: 'Contractors provide instant habitat relief, but do not build community habits that prevent future waste.'
      },
      {
        title: 'Install River Waste Traps',
        cost: 8000,
        expectedOutcome: 'Prevents new plastic from entering, but existing waste remains.',
        effects: { pollution: -8, biodiversity: 3, health: 4, fish: 3, shrimp: 2, community: 3 },
        visualFeedback: 'Waste traps appear upstream, but shoreline debris remains.',
        learningPopup: 'Intercepting upstream pollution protects future growth, but legacy plastic still needs removal.'
      }
    ]
  },
  {
    id: 4, x: 76, y: 63, marker: 'SEDIMENT', title: 'Sedimentation',
    situation: 'Excess sediment is blocking tidal channels and reducing water circulation.',
    question: 'How should blocked tidal flow be restored?',
    options: [
      {
        title: 'Restore Tidal Channels',
        cost: 18000,
        expectedOutcome: 'Full restoration of natural water flow.',
        effects: { pollution: -10, biodiversity: 12, health: 14, fish: 10, shrimp: 8, community: 4 },
        visualFeedback: 'Water becomes clear, fish return, and a new tree set grows.',
        learningPopup: 'Natural tidal flushing delivers oxygen to pneumatophores, the mangrove breathing roots.'
      },
      {
        title: 'Remove Sediment in Priority Areas',
        cost: 10000,
        expectedOutcome: 'Improves the most important waterways first.',
        effects: { pollution: -6, biodiversity: 6, health: 7, fish: 6, shrimp: 4, community: 2 },
        visualFeedback: 'Water clarity improves and fish visibility increases.',
        learningPopup: 'Clearing primary channels gives quick relief, but unmanaged areas may still face oxygen depletion.'
      },
      {
        title: 'Install Sediment Barriers',
        cost: 5000,
        expectedOutcome: 'Slows future sediment runoff at low cost.',
        effects: { pollution: -3, biodiversity: 2, health: 3, fish: 2, shrimp: 2, community: 1 },
        visualFeedback: 'Sediment barriers appear and water improves slightly.',
        learningPopup: 'Silt barriers reduce future runoff, but existing blockages still need clearing.'
      }
    ]
  },
  {
    id: 3, x: 43, y: 55, marker: 'OIL SPILL', title: 'Oil Spill',
    situation: 'An oil spill has spread into the mangrove area and coated exposed roots.',
    question: 'How should the oil spill be managed?',
    options: [
      {
        title: 'Community Bioremediation Program',
        cost: 20000,
        expectedOutcome: 'Community-based cleanup with safer oil treatment.',
        effects: { pollution: -18, biodiversity: 8, health: 12, fish: 6, shrimp: 5, community: 10 },
        visualFeedback: 'Turn 1: community cleanup begins. Turn 2: oil disappears and trees recover.',
        learningPopup: 'Bioremediation uses microbes to break down oil while protecting fragile mangrove mud.'
      },
      {
        title: 'Emergency Response Contractors',
        cost: 25000,
        expectedOutcome: 'Very fast professional spill response.',
        effects: { pollution: -22, biodiversity: 10, health: 12, fish: 10, shrimp: 6, community: 2 },
        visualFeedback: 'Oil disappears immediately and fish visibility improves.',
        learningPopup: 'Emergency teams quickly reduce surface damage, but they require high funding.'
      },
      {
        title: 'Deploy Containment Booms',
        cost: 10000,
        expectedOutcome: 'Stops the spill from spreading further.',
        effects: { pollution: -8, biodiversity: 3, health: 4, fish: 3, shrimp: 2, community: 1 },
        visualFeedback: 'Oil spread stops, but some oil remains visible.',
        learningPopup: 'Containment limits damage, but oil already trapped in mud still needs treatment.'
      }
    ]
  },
  {
    id: 2, x: 28, y: 70, marker: 'DISCHARGE', title: 'Industrial Discharge',
    situation: 'Untreated discharge from upstream activities is reducing water quality.',
    question: 'What should be done about the discharge?',
    options: [
      {
        title: 'Enforce Wastewater Treatment',
        cost: 24000,
        expectedOutcome: 'Stops pollution at the source.',
        effects: { pollution: -22, biodiversity: 12, health: 14, fish: 10, shrimp: 8, community: 4 },
        visualFeedback: 'Water becomes clear, fish recover, and a new tree set grows.',
        learningPopup: 'Treating wastewater prevents harmful pollutants and oxygen depletion in mangrove waters.'
      },
      {
        title: 'Install Temporary Filter Barriers',
        cost: 12000,
        expectedOutcome: 'Fast filtration near the polluted channel.',
        effects: { pollution: -10, biodiversity: 5, health: 6, fish: 4, shrimp: 3, community: 2 },
        visualFeedback: 'Water clarity improves immediately near the channel.',
        learningPopup: 'Filters reduce visible pollutants quickly, but dissolved chemicals may still pass through.'
      },
      {
        title: 'Community Water Monitoring Program',
        cost: 5000,
        expectedOutcome: 'Residents help report pollution trends.',
        effects: { pollution: -2, biodiversity: 1, health: 2, fish: 1, community: 8 },
        visualFeedback: 'A community monitoring group appears, but water changes little.',
        learningPopup: 'Monitoring improves awareness and evidence, but it does not directly clean the water.'
      }
    ]
  },
  {
    id: 5, x: 82, y: 47, marker: 'EROSION', title: 'Erosion',
  situation: 'Strong waves and tidal action are eroding the shoreline. Mangrove roots are being exposed, and sections of the coastline are beginning to collapse.',
  question: 'How should this be managed?',
  options: [
    {
      title: 'Mangrove Restoration Program',
      cost: 20000,
      expectedOutcome: 'Native mangroves were planted along vulnerable sections of the shoreline.',
      effects: { pollution: 0, biodiversity: 15, health: 12, fish: 8, shrimp: 6, community: 5 },
      visualFeedback: 'Mangrove seedlings were planted and shoreline erosion began to slow as roots stabilized the soil.',
      learningPopup: 'Mangrove roots help stabilize soil, reduce erosion, and protect coastlines from wave damage.'
    },
    {
      title: 'Install Eco-Friendly Wave Barriers',
      cost: 12000,
      expectedOutcome: 'Wave barriers reduced erosion in high-risk areas.',
      effects: { pollution: 0, biodiversity: 8, health: 7, fish: 4, shrimp: 3, community: 2 },
      visualFeedback: 'Eco-friendly barriers reduced shoreline damage and protected exposed mangrove roots.',
      learningPopup: 'Nature-based infrastructure can help reduce erosion while supporting ecosystem recovery.'
    },
    {
      title: 'Monitor Shoreline Changes',
      cost: 5000,
      expectedOutcome: 'Monitoring programs collected information about erosion trends.',
      effects: { pollution: 0, biodiversity: 2, health: 2, fish: 1, shrimp: 1, community: 0 },
      visualFeedback: 'Monitoring stations were installed, but erosion continued to affect the coastline.',
      learningPopup: 'Monitoring helps identify risks, but active restoration is needed to prevent further erosion.'
    }
    ]
  },
  {
    id: 6, x: 64, y: 72, marker: 'GHOST NET', title: 'Ghost Nets',
    situation: 'Abandoned fishing nets are trapping fish, crabs, and other marine life.',
    question: 'What is the safest response to ghost nets?',
    options: [
      {
        title: 'Community Net Removal Program',
        cost: 14000,
        expectedOutcome: 'Local fishers remove nets and improve future net care.',
        effects: { pollution: -8, biodiversity: 13, health: 10, fish: 12, shrimp: 4, community: 12 },
        visualFeedback: 'Turn 1: nets reduce and a fishing co-op appears. Turn 2: fish and crabs return.',
        learningPopup: 'Community action reduces ghost fishing and supports sustainable fishing habits.'
      },
      {
        title: 'Hire Professional Divers',
        cost: 20000,
        expectedOutcome: 'Specialists remove deep and heavy nets quickly.',
        effects: { pollution: -10, biodiversity: 12, health: 8, fish: 12, shrimp: 3, community: 2 },
        visualFeedback: 'Nets disappear immediately and fish visibility improves.',
        learningPopup: 'Professional divers can remove deep entanglements safely, but the service is expensive.'
      },
      {
        title: 'Remove Surface Nets Only',
        cost: 6000,
        expectedOutcome: 'Removes only the nets that are easy to reach.',
        effects: { pollution: -3, biodiversity: 3, health: 2, fish: 3, shrimp: 1, community: 1 },
        visualFeedback: 'Nets shrink but remain visible underwater.',
        learningPopup: 'Surface cleanup helps, but submerged nets can still trap marine life out of sight.'
      }
    ]
  },
  {
    id: 7, x: 28, y: 70, marker: 'HUMAN ACTIVITY', title: 'Illegal human activities',
    situation: 'Authorities have reported illegal activities occurring within remote sections of the mangrove forest. Temporary camps and vegetation clearing are causing environmental damage.',
    question: 'How should this be managed?',
    options: [
      {
        title: 'Joint Enforcement and Habitat Restoration',
        cost: 25000,
        expectedOutcome: 'Illegal camps were cleared and damaged mangrove areas were restored.',
        effects: { pollution: 0, biodiversity: 15, health: 12, fish: 7, shrimp: 5, community: 5 },
        visualFeedback: 'Authorities cleared illegal camps and restoration teams replanted damaged mangrove areas.',
        learningPopup: 'Protecting mangrove ecosystems requires both habitat restoration and responsible management of human activities.'
      },
      {
        title: 'Improve Waste Management and Monitoring',
        cost: 12000,
        expectedOutcome: 'Controls the most important zones first.',
        effects: { pollution: 0, biodiversity: 7, health: 6, fish: 3, shrimp: 2, community: 2 },
        visualFeedback: 'Waste collection and monitoring reduced pollution entering the mangrove ecosystem.',
        learningPopup: 'Proper waste management can reduce environmental impacts even when human activities remain nearby.'
      },
      {
        title: 'Awareness and Community Outreach',
        cost: 5000,
        expectedOutcome: 'Residents identify invasive species hotspots.',
        effects: { pollution: 0, biodiversity: 2, health: 2, fish: 1, community: 0 },
        visualFeedback: 'Education programs encouraged more responsible use of mangrove resources.',
        learningPopup: 'Awareness campaigns help build environmental responsibility, but ecosystem recovery takes time.'
      }
    ]
  },
  {
    id: 8, x: 38, y: 44, marker: 'DEVELOPMENT', title: 'Coastal Development',
    situation: 'A proposed development project may affect nearby mangrove forests.',
    question: 'Which development decision best balances conservation and community needs?',
    options: [
      {
        title: 'Approve Eco-Tourism Development',
        cost: -10000,
        expectedOutcome: 'Generates income with low-impact infrastructure.',
        effects: { pollution: -2, biodiversity: 4, health: 4, fish: 2, shrimp: 2, community: 14 },
        visualFeedback: 'Village level increases, budget rises, and fishing activity grows.',
        learningPopup: 'Eco-tourism can generate local income while protecting ecosystem services such as storm buffering.'
      },
      {
        title: 'Protect the Mangrove Area',
        cost: 10000,
        expectedOutcome: 'Creates a protected conservation zone.',
        effects: { pollution: -4, biodiversity: 14, health: 12, fish: 10, shrimp: 6, community: 2 },
        visualFeedback: 'A tree set grows and fish visibility improves.',
        learningPopup: 'Strict protection secures biodiversity and resilience, but gives no immediate cash revenue.'
      },
      {
        title: 'Approve Large-Scale Development',
        cost: -25000,
        expectedOutcome: 'Generates high income but damages the mangrove area.',
        effects: { pollution: 12, biodiversity: -20, health: -18, fish: -14, shrimp: -12, community: 6 },
        visualFeedback: 'Budget rises, but trees, fish, shrimp, and crabs fade.',
        learningPopup: 'Large infrastructure destroys Blue Carbon reservoirs and weakens natural coastal protection.'
      }
    ]
  }
];


/* default options */
const state = {
  
  budget: 80000,
  pollution: 20,
  biodiversity: 20,
  health: 20,
  fish: 45,
  shrimp: 35,
  community: 45,
  incomeEvents: 0,
  fishingCooldown: 0,
  greatChoices: 0,
  villageUnlocked: false,
  finalReportReady: false,
  finalReportTimer: null,
  treeStage: 0,
  carbonMilestone: 0,
  educationalUnlocks: {},
  resolved: new Set(),
  history: [],
  activeIncidentId: null,
  selectedOptionIndex: null
};

const incomeActivities = {
  fishing: {
    title: 'F Fisheries Recovery',
    intro: 'Healthy mangroves support local fisheries.',
    options: [
{
    title: 'Local Market Partnership',
    reward: 2000,
    effects: { biodiversity: 0, health: 0, community: 5 },
    desc: 'Healthy fisheries support local food supply and community income.'
},
{
    title: 'Sustainable Seafood Program',
    reward: 4000,
    effects: { biodiversity: 0, health: 0, community: 3 },
    desc: 'Certified seafood sales generate higher revenue from restored fisheries.'
}
    ]
  },
  shrimp: {
    title: 'Shrimp Cooperative',
    intro: 'Healthy mangroves provide nursery habitats for shrimp.',
    options: [
{
    title: 'Local Restaurant Partnership',
    reward: 2500,
    effects: { biodiversity: 0, health: 0, community: 5 },
    desc: 'Local restaurants benefit from sustainable shrimp production.'
},
{
    title: 'Seafood Distributor Program',
    reward: 5000,
    effects: { biodiversity: 0, health: 0, community: 3 },
    desc: 'Regional distribution creates greater economic returns from healthy mangrove nurseries.'
}
    ]
  },
  crab: {
    title: 'Crab Cooperative',
    intro: 'Mangrove crabs support local livelihoods.',
    options: [
{
    title: 'Local Market Partnership',
    reward: 2500,
    effects: { biodiversity: 0, health: 0, community: 5 },
    desc: 'Healthy crab populations contribute to local livelihoods and food security.'
},
{
    title: 'Community Seafood Program',
    reward: 5000,
    effects: { biodiversity: 0, health: 0, community: 3 },
    desc: 'Restored mangroves support valuable crab resources for coastal communities.'
}
    ]
  }
};
