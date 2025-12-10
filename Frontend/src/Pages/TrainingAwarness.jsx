// TrainingAwareness.jsx
import React, { useState } from 'react';
import './TrainingAwareness.css';

const TrainingAwareness = () => {
    const [selectedArticle, setSelectedArticle] = useState(null);
    const [categoryFilter, setCategoryFilter] = useState('all');

    // Training articles data
    const articles = [
        {
            id: 1,
            title: 'Smart Waste Segregation Guide',
            category: 'segregation',
            level: 'beginner',
            readTime: '5 min read',
            posterColor: '#2E7D32',
            icon: '🗑️',
            summary: 'Learn how to properly segregate dry, wet, and hazardous waste at source.',
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
- Use compostable bags for wet waste`
        },
        {
            id: 2,
            title: 'Composting at Home',
            category: 'recycling',
            level: 'intermediate',
            readTime: '7 min read',
            posterColor: '#FF8F00',
            icon: '🌱',
            summary: 'Step-by-step guide to create nutrient-rich compost from kitchen waste.',
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
   - Use in garden or potted plants`
        },
        {
            id: 3,
            title: 'Plastic Waste Management',
            category: 'recycling',
            level: 'advanced',
            readTime: '8 min read',
            posterColor: '#0D47A1',
            icon: '♻️',
            summary: 'Understanding plastic types and proper recycling methods.',
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
1. **Collection** → 2. **Sorting** → 3. **Cleaning** → 4. **Shredding** → 5. **Melting** → 6. **Pelletizing** → 7. **Manufacturing**

## Reduce Plastic Use
- Carry reusable bags
- Use refillable water bottles
- Avoid single-use plastics
- Choose products with less packaging`
        },
        {
            id: 4,
            title: 'E-Waste Disposal Guidelines',
            category: 'hazardous',
            level: 'intermediate',
            readTime: '6 min read',
            posterColor: '#C62828',
            icon: '💻',
            summary: 'Safe disposal methods for electronic waste to prevent environmental harm.',
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
- Destroy storage devices if needed`
        },
        {
            id: 5,
            title: 'Swachh Bharat Mission',
            category: 'government',
            level: 'all',
            readTime: '10 min read',
            posterColor: '#FF6F00',
            icon: '🇮🇳',
            summary: 'Government initiatives for waste management and cleanliness.',
            fullContent: `# Swachh Bharat Mission

## Mission Objectives
1. **Eliminate Open Defecation**
2. **Eradicate Manual Scavenging**
3. **Modern Municipal Solid Waste Management**
4. **Effect Behavioral Change**
5. **Generate Awareness**

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
1. **Segregate waste at source**
2. **Use public toilets responsibly**
3. **Participate in cleanliness drives**
4. **Report garbage black spots**
5. **Practice rainwater harvesting**
6. **Plant trees and maintain gardens**

## Digital Initiatives
- Swachhata App for complaints
- Swachh Survekshan rankings
- Digital monitoring systems
- Public grievance redressal`
        },
        {
            id: 6,
            title: 'Biomedical Waste Handling',
            category: 'hazardous',
            level: 'advanced',
            readTime: '8 min read',
            posterColor: '#7B1FA2',
            icon: '🏥',
            summary: 'Safe disposal procedures for medical waste from households.',
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
3. **Disinfect Before Disposal** (when possible)
4. **Return to Pharmacies** for medicine disposal
5. **Use Authorized Collection Centers**

## COVID-19 Waste Management
- Double bag used masks and gloves
- Keep separate from regular waste
- Disinfect with 1% sodium hypochlorite
- Wait 72 hours before disposal
- Label as "COVID-19 Waste"`
        },
        {
            id: 7,
            title: 'Waste to Energy Technologies',
            category: 'technology',
            level: 'advanced',
            readTime: '9 min read',
            posterColor: '#00695C',
            icon: '⚡',
            summary: 'Modern technologies converting waste into electricity and fuel.',
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
- Regulatory compliance`
        },
        {
            id: 8,
            title: 'Community Cleanliness Drives',
            category: 'community',
            level: 'beginner',
            readTime: '4 min read',
            posterColor: '#388E3C',
            icon: '👥',
            summary: 'Organizing and participating in neighborhood cleanliness initiatives.',
            fullContent: `# Community Cleanliness Drives

## Benefits
- Cleaner neighborhood
- Stronger community bonds
- Environmental awareness
- Healthier living conditions
- Sense of collective responsibility

## Planning a Cleanliness Drive

### Step 1: Preparation
1. **Form a Core Team**
2. **Identify Area and Date**
3. **Get Required Permissions**
4. **Arrange Equipment and Materials**

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
1. **Beach Cleanup** - Remove plastic from shores
2. **Park Cleanup** - Maintain public spaces
3. **Drain Cleaning** - Prevent waterlogging
4. **Tree Plantation** - Along with cleanup
5. **Awareness Walk** - With placards and banners

## Safety Guidelines
- Wear gloves and proper footwear
- Use tools, not bare hands
- Stay hydrated
- Watch for sharp objects
- Avoid hazardous materials
- Follow COVID-19 protocols

## Post-Drive Activities
1. **Proper Waste Disposal**
2. **Thank Volunteers**
3. **Share Photos and Results**
4. **Plan Next Drive**
5. **Submit Report to Authorities**

## Government Support
- Municipal corporation support
- Equipment provision
- Waste collection vehicles
- Certificates for volunteers
- Media coverage`
        }
    ];

    const categories = [
        { id: 'all', name: 'All Topics', icon: '📚' },
        { id: 'segregation', name: 'Waste Segregation', icon: '🗑️' },
        { id: 'recycling', name: 'Recycling', icon: '♻️' },
        { id: 'hazardous', name: 'Hazardous Waste', icon: '⚠️' },
        { id: 'government', name: 'Government Schemes', icon: '🏛️' },
        { id: 'technology', name: 'Technology', icon: '⚡' },
        { id: 'community', name: 'Community', icon: '👥' }
    ];

    const difficultyLevels = {
        'beginner': { label: 'Beginner', color: '#4CAF50' },
        'intermediate': { label: 'Intermediate', color: '#FF9800' },
        'advanced': { label: 'Advanced', color: '#F44336' },
        'all': { label: 'All Levels', color: '#2196F3' }
    };

    const filteredArticles = categoryFilter === 'all'
        ? articles
        : articles.filter(article => article.category === categoryFilter);

    const handleReadArticle = (article) => {
        setSelectedArticle(article);
    };

    const handleCloseArticle = () => {
        setSelectedArticle(null);
    };

    const handleCategoryFilter = (categoryId) => {
        setCategoryFilter(categoryId);
    };

    return (
        <div className="training-awareness-page">
            {/* Header Section */}
            {/* <div className="training-header">
                <div className="container">
                    <div className="header-content">
                        <h1>
                            <span className="header-icon">🎓</span>
                            Waste Management Training
                            <span className="sub-header">Learn • Practice • Transform</span>
                        </h1>
                        <div className="header-stats">
                            <div className="stat-item">
                                <span className="stat-number">{articles.length}</span>
                                <span className="stat-label">Training Modules</span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-number">4</span>
                                <span className="stat-label">Skill Levels</span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-number">7</span>
                                <span className="stat-label">Categories</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div> */}
            <br />
            <br />

            <div className="container">
                {/* Category Filters */}
                <div className="category-filters">
                    <h3><span className="filter-icon">📂</span> Browse by Category</h3>
                    <div className="filter-buttons">
                        {categories.map(category => (
                            <button
                                key={category.id}
                                className={`filter-button ${categoryFilter === category.id ? 'active' : ''}`}
                                onClick={() => handleCategoryFilter(category.id)}
                            >
                                <span className="button-icon">{category.icon}</span>
                                {category.name}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Main Content */}
                <div className="training-main-content">
                    {/* Articles Grid */}
                    <div className="articles-grid">
                        {filteredArticles.map(article => (
                            <div
                                key={article.id}
                                className="article-card"
                                onClick={() => handleReadArticle(article)}
                            >
                                <div
                                    className="article-poster"
                                    style={{ backgroundColor: article.posterColor }}
                                >
                                    <div className="poster-icon">{article.icon}</div>
                                    <div className="poster-title">{article.title}</div>
                                    <div className="poster-gradient"></div>
                                </div>
                                <div className="article-info">
                                    <div className="article-header">
                                        <h4>{article.title}</h4>
                                        <div
                                            className="difficulty-badge"
                                            style={{
                                                backgroundColor: difficultyLevels[article.level].color,
                                                color: 'white'
                                            }}
                                        >
                                            {difficultyLevels[article.level].label}
                                        </div>
                                    </div>
                                    <p className="article-summary">{article.summary}</p>
                                    <div className="article-footer">
                                        <span className="read-time">{article.readTime}</span>
                                        <span className="read-button">
                                            Read Article →
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Sidebar - Quick Tips */}
                    <div className="training-sidebar">
                        <div className="sidebar-card quick-tips">
                            <h4><span className="sidebar-icon">💡</span> Quick Tips</h4>
                            <ul className="tips-list">
                                <li>Segregate waste at source daily</li>
                                <li>Clean dry waste before disposal</li>
                                <li>Compost kitchen waste at home</li>
                                <li>Avoid single-use plastics</li>
                                <li>Dispose e-waste properly</li>
                                <li>Participate in community drives</li>
                            </ul>
                        </div>

                        <div className="sidebar-card progress-tracker">
                            <h4><span className="sidebar-icon">📊</span> Your Progress</h4>
                            <div className="progress-stats">
                                <div className="progress-item">
                                    <span className="progress-label">Articles Read</span>
                                    <span className="progress-value">0/{articles.length}</span>
                                </div>
                                <div className="progress-bar">
                                    <div className="progress-fill" style={{ width: '0%' }}></div>
                                </div>
                            </div>
                            <div className="encouragement">
                                <span className="encourage-icon">🏆</span>
                                Start reading to track progress!
                            </div>
                        </div>

                        <div className="sidebar-card resources">
                            <h4><span className="sidebar-icon">📚</span> Resources</h4>
                            <div className="resource-links">
                                <a href="#download" className="resource-link">
                                    <span className="link-icon">📥</span>
                                    Download Guides
                                </a>
                                <a href="#videos" className="resource-link">
                                    <span className="link-icon">🎬</span>
                                    Training Videos
                                </a>
                                <a href="#quiz" className="resource-link">
                                    <span className="link-icon">🧠</span>
                                    Take Quiz
                                </a>
                                <a href="#certificate" className="resource-link">
                                    <span className="link-icon">🏅</span>
                                    Get Certificate
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Article Reader Modal */}
            {selectedArticle && (
                <div className="article-reader-modal">
                    <div className="modal-content">
                        <div className="modal-header">
                            <button className="close-button" onClick={handleCloseArticle}>
                                ✕
                            </button>
                            <div className="modal-title-section">
                                <div
                                    className="modal-icon"
                                    style={{ backgroundColor: selectedArticle.posterColor }}
                                >
                                    {selectedArticle.icon}
                                </div>
                                <div className="modal-title">
                                    <h2>{selectedArticle.title}</h2>
                                    <div className="modal-meta">
                                        <span className="meta-item">
                                            <span className="meta-icon">⏱️</span>
                                            {selectedArticle.readTime}
                                        </span>
                                        <span
                                            className="meta-item difficulty"
                                            style={{ color: difficultyLevels[selectedArticle.level].color }}
                                        >
                                            <span className="meta-icon">📊</span>
                                            {difficultyLevels[selectedArticle.level].label}
                                        </span>
                                        <span className="meta-item">
                                            <span className="meta-icon">📁</span>
                                            {categories.find(c => c.id === selectedArticle.category)?.name}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="modal-body">
                            <div className="article-content">
                                <div className="content-section">
                                    <h3>Summary</h3>
                                    <p className="article-summary-full">{selectedArticle.summary}</p>
                                </div>

                                <div className="content-section">
                                    <h3>Full Article</h3>
                                    <div
                                        className="article-full-content"
                                        dangerouslySetInnerHTML={{ __html: selectedArticle.fullContent.replace(/\n/g, '<br/>').replace(/#/g, '<br/><strong>').replace(/\n-/g, '<br/>• ') }}
                                    />
                                </div>

                                <div className="content-section key-points">
                                    <h3>Key Takeaways</h3>
                                    <ul>
                                        <li>Practice waste segregation daily</li>
                                        <li>Follow proper disposal methods</li>
                                        <li>Participate in recycling programs</li>
                                        <li>Educate others in community</li>
                                        <li>Stay updated with new guidelines</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        <div className="modal-footer">
                            <div className="action-buttons">
                                <button className="action-btn bookmark-btn">
                                    <span className="btn-icon">🔖</span>
                                    Bookmark
                                </button>
                                <button className="action-btn share-btn">
                                    <span className="btn-icon">📤</span>
                                    Share
                                </button>
                                <button className="action-btn download-btn">
                                    <span className="btn-icon">📥</span>
                                    Download PDF
                                </button>
                                <button className="action-btn complete-btn" onClick={handleCloseArticle}>
                                    <span className="btn-icon">✅</span>
                                    Mark as Read
                                </button>
                            </div>

                            <div className="navigation-buttons">
                                <button className="nav-btn prev-btn">
                                    ← Previous Article
                                </button>
                                <button className="nav-btn next-btn">
                                    Next Article →
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="modal-overlay" onClick={handleCloseArticle}></div>
                </div>
            )}
        </div>
    );
};

export default TrainingAwareness;