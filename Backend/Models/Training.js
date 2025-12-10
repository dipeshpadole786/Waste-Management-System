const mongoose = require("mongoose");



const articleSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
        },

        category: {
            type: String,
            required: true,
            enum: [
                "segregation",
                "recycling",
                "hazardous",
                "government",
                "technology",
                "community",
            ],
        },

        level: {
            type: String,
            required: true,
            enum: ["beginner", "intermediate", "advanced", "all"],
        },

        readTime: {
            type: String,
            required: true,
        },

        posterColor: {
            type: String,
            default: "#000000",
        },

        icon: {
            type: String, // emoji
            required: true,
        },

        summary: {
            type: String,
            required: true,
            trim: true,
        },

        fullContent: {
            type: String, // markdown content
            required: true,
        },
    },
    { timestamps: true }
);

const articles = [
    {
        title: "Smart Waste Segregation Guide",
        category: "segregation",
        level: "beginner",
        readTime: "5 min read",
        posterColor: "#2E7D32",
        icon: "🗑️",
        summary:
            "Learn how to properly segregate dry, wet, and hazardous waste at source.",
        fullContent: `# Smart Waste Segregation Guide

## Why Segregate Waste?
Proper waste segregation at source is the first and most important step in effective waste management. It helps in:
- Reducing landfill waste by 60%
- Increasing recycling efficiency
- Preventing soil and water pollution
- Conserving natural resources

## Three-Bin System
1. **Green Bin (Wet Waste)**
   - Kitchen waste (vegetable peels, food leftovers)
   - Garden waste (leaves, grass clippings)
   - Coffee/tea grounds

2. **Blue Bin (Dry Waste)**
   - Paper, cardboard, newspapers
   - Plastic bottles, containers
   - Glass bottles, jars
   - Metal cans, foil

3. **Red Bin (Hazardous Waste)**
   - Batteries, electronic waste
   - Medicines, chemicals
   - Sanitary waste, diapers
   - Broken glass, sharp objects

## Best Practices
- Clean dry waste before disposal
- Compress plastic bottles to save space
- Keep hazardous waste separate
- Use compostable bags for wet waste`,
    },

    {
        title: "Composting at Home",
        category: "recycling",
        level: "intermediate",
        readTime: "7 min read",
        posterColor: "#FF8F00",
        icon: "🌱",
        summary:
            "Step-by-step guide to create nutrient-rich compost from kitchen waste.",
        fullContent: `# Composting at Home

## What is Composting?
Composting is nature's way of recycling organic waste into nutrient-rich soil.

## Materials Needed  
**Green Materials (Nitrogen-rich):**
- Fruit and vegetable scraps
- Coffee grounds and filters
- Grass clippings
- Plant trimmings

**Brown Materials (Carbon-rich):**
- Dry leaves
- Shredded newspaper
- Cardboard
- Wood chips
- Straw or hay

## Step-by-Step Process
1. **Choose a Location**
   - Shady spot with good drainage
   - Away from direct sunlight

2. **Build Your Pile**
   - Layer greens and browns (1:3 ratio)
   - Start with coarse browns for drainage
   - Add green materials
   - Cover with browns

3. **Maintenance**
   - Turn pile every 2-3 weeks
   - Keep moist like a wrung-out sponge
   - Monitor temperature (should feel warm)

4. **Harvesting**
   - Ready in 2-6 months
   - Dark, crumbly, earthy-smelling
   - Use in garden or potted plants`,
    },

    {
        title: "Plastic Waste Management",
        category: "recycling",
        level: "advanced",
        readTime: "8 min read",
        posterColor: "#0D47A1",
        icon: "♻️",
        summary:
            "Understanding plastic types and proper recycling methods.",
        fullContent: `# Plastic Waste Management

## Plastic Resin Codes
1. **PET/PETE (Polyethylene Terephthalate)**
   - Water bottles, food containers
   - Widely recyclable

2. **HDPE (High-Density Polyethylene)**
   - Milk jugs, shampoo bottles
   - Highly recyclable

3. **PVC (Polyvinyl Chloride)**
   - Pipes, vinyl products
   - Not commonly recycled

4. **LDPE (Low-Density Polyethylene)**
   - Plastic bags, shrink wrap
   - Check local facilities

5. **PP (Polypropylene)**
   - Yogurt containers, bottle caps
   - Increasingly recyclable

6. **PS (Polystyrene)**
   - Foam cups, packaging
   - Hard to recycle

7. **OTHER (Mixed plastics)**
   - Baby bottles, medical containers
   - Not recyclable in most places

## Recycling Process
1. Collection → 2. Sorting → 3. Cleaning → 4. Shredding → 5. Melting → 6. Pelletizing → 7. Manufacturing

## Reduce Plastic Use
- Carry reusable bags
- Use refillable water bottles
- Avoid single-use plastics
- Choose products with less packaging`,
    },

    {
        title: "E-Waste Disposal Guidelines",
        category: "hazardous",
        level: "intermediate",
        readTime: "6 min read",
        posterColor: "#C62828",
        icon: "💻",
        summary:
            "Safe disposal methods for electronic waste to prevent environmental harm.",
        fullContent: `# E-Waste Disposal Guidelines

## What is E-Waste?
Electronic waste includes:
- Computers and laptops
- Mobile phones and tablets
- Televisions and monitors
- Printers and scanners
- Batteries and chargers
- Small appliances

## Why E-Waste is Dangerous?
Contains hazardous materials:
- Lead (causes nerve damage)
- Mercury (toxic to brain)
- Cadmium (damages kidneys)
- Brominated flame retardants
- PVC plastics

## Proper Disposal Methods
1. **Authorized Collection Centers**
   - Certified e-waste recyclers
   - Registered with pollution board

2. **Manufacturer Take-back**
   - Many brands offer recycling
   - Drop-off at service centers

3. **E-Waste Collection Drives**
   - Organized by municipalities
   - Corporate collection events

4. **Retailer Exchange Programs**
   - Exchange old for new
   - Discount offers available

## Data Security
- Remove personal data before disposal
- Use professional data wiping
- Destroy storage devices if needed`,
    },

    {
        title: "Swachh Bharat Mission",
        category: "government",
        level: "all",
        readTime: "10 min read",
        posterColor: "#FF6F00",
        icon: "🇮🇳",
        summary:
            "Government initiatives for waste management and cleanliness.",
        fullContent: `# Swachh Bharat Mission

## Mission Objectives
1. Eliminate Open Defecation
2. Eradicate Manual Scavenging
3. Modern Municipal Solid Waste Management
4. Effect Behavioral Change
5. Generate Awareness

## Key Components
### Swachh Bharat Mission (Urban)
- Household toilet construction
- Community toilet construction
- Public toilet construction
- Solid waste management
- IEC and Public Awareness

### Swachh Bharat Mission (Gramin)
- Individual household latrines
- Community sanitary complexes
- Solid and liquid waste management

## Achievements (2014-2024)
- 110 million household toilets built
- 630,000 villages declared ODF
- 4,300+ cities ODF certified
- 85% waste processing capacity

## How Citizens Can Participate
1. Segregate waste at source
2. Use public toilets responsibly
3. Participate in cleanliness drives
4. Report garbage black spots
5. Practice rainwater harvesting
6. Plant trees and maintain gardens

## Digital Initiatives
- Swachhata App for complaints
- Swachh Survekshan rankings
- Digital monitoring systems
- Public grievance redressal`,
    },

    {
        title: "Biomedical Waste Handling",
        category: "hazardous",
        level: "advanced",
        readTime: "8 min read",
        posterColor: "#7B1FA2",
        icon: "🏥",
        summary:
            "Safe disposal procedures for medical waste from households.",
        fullContent: `# Biomedical Waste Handling at Home

## What is Biomedical Waste?
- Used syringes and needles
- Expired or unused medicines
- Blood-stained cotton and bandages
- Used masks and gloves
- Thermometers (mercury)
- Used test strips and lancets

## Color-Coded Bins
**Yellow Bin** (Infectious Waste)
- Used bandages, cotton
- Blood products
- Body fluids

**Red Bin** (Plastic Waste)
- Used syringes
- IV tubes, catheters
- Gloves, masks

**Blue Bin** (Glass Waste)
- Broken glass
- Medicine vials
- Thermometers

**White Bin** (Sharps)
- Needles, scalpels
- Broken ampules
- Lancets

## Safe Disposal Methods
1. **Never Mix with Regular Waste**
2. **Use Puncture-proof Containers** for sharps
3. **Disinfect Before Disposal**
4. **Return to Pharmacies**
5. **Use Authorized Collection Centers**

## COVID-19 Waste Management
- Double bag used masks and gloves
- Keep separate from regular waste
- Disinfect with 1% sodium hypochlorite
- Wait 72 hours before disposal
- Label as "COVID-19 Waste"`,
    },

    {
        title: "Waste to Energy Technologies",
        category: "technology",
        level: "advanced",
        readTime: "9 min read",
        posterColor: "#00695C",
        icon: "⚡",
        summary:
            "Modern technologies converting waste into electricity and fuel.",
        fullContent: `# Waste to Energy Technologies

## Why Waste to Energy?
- Reduces landfill burden
- Generates renewable energy
- Recovers valuable materials
- Reduces greenhouse gases

## Technologies
### 1. Incineration
- Direct burning of waste
- Heat used to generate electricity
- Modern plants have pollution control
- 90% volume reduction

### 2. Gasification
- Converts waste to syngas
- Syngas used for electricity or fuel
- Higher efficiency than incineration
- Less pollution

### 3. Anaerobic Digestion
- Biological breakdown of organic waste
- Produces biogas (methane)
- Digestate used as fertilizer
- Best for wet waste

### 4. Pyrolysis
- Thermal decomposition without oxygen
- Produces bio-oil, syngas, char
- Can process mixed waste
- Modular systems available

## Indian Initiatives
- 12 operational WtE plants
- 15 under construction
- 250 MW generation capacity
- Target: 5,000 MW by 2030

## Challenges
- High capital cost
- Technology selection
- Waste segregation quality
- Public acceptance
- Regulatory compliance`,
    },

    {
        title: "Community Cleanliness Drives",
        category: "community",
        level: "beginner",
        readTime: "4 min read",
        posterColor: "#388E3C",
        icon: "👥",
        summary:
            "Organizing and participating in neighborhood cleanliness initiatives.",
        fullContent: `# Community Cleanliness Drives

## Benefits
- Cleaner neighborhood
- Stronger community bonds
- Environmental awareness
- Healthier living conditions
- Sense of collective responsibility

## Planning a Cleanliness Drive
### Step 1: Preparation
1. Form a Core Team
2. Identify Area and Date
3. Get Required Permissions
4. Arrange Equipment and Materials

### Step 2: Resource Collection
- Gloves and masks for volunteers
- Garbage bags (different colors)
- Broomsticks and dustpans
- First aid kit
- Drinking water
- Transportation for waste

### Step 3: Volunteer Management
- Create WhatsApp/Facebook group
- Assign team leaders
- Divide area into zones
- Provide clear instructions
- Arrange refreshments

## Types of Drives
1. Beach Cleanup — Remove plastic from shores
2. Park Cleanup — Maintain public spaces
3. Drain Cleaning — Prevent waterlogging
4. Tree Plantation — Along with cleanup
5. Awareness Walk — With placards and banners

## Safety Guidelines
- Wear gloves and proper footwear
- Use tools, not bare hands
- Stay hydrated
- Watch for sharp objects
- Avoid hazardous materials
- Follow COVID-19 protocols

## Post-Drive Activities
1. Proper Waste Disposal
2. Thank Volunteers
3. Share Photos and Results
4. Plan Next Drive
5. Submit Report to Authorities

## Government Support
- Municipal corporation support
- Equipment provision
- Waste collection vehicles
- Certificates for volunteers
- Media coverage`,
    },
];



const Article = mongoose.model("Article", articleSchema);
module.exports = Article;
// const addData = async () => {
//     await Article.deleteMany({});
//     await Article.insertMany(articles);
//     console.log("✅ New Articles Inserted Successfully");
// }
// // addData();

