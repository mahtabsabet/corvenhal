# Corvenhal – Future Features

## 1. Mobile Optimization

### Potions Class UI
- Redesign potions interface for mobile-first layout
- Larger tap targets
- Simplified ingredient selection flow
- Reduce multi-step interactions where possible
- Ensure responsive layout for small screens


## 2. Major System

### Declaring a Major
- Player declares a major after completing one semester
- Available majors:
  - Battle
  - Potions
  - Transfiguration
  - (Expandable for future majors)

### Effects of Major
- Determines advanced classes available
- Determines advanced spells learned
- May influence income opportunities
- May influence story progression


## 3. School Economy System

### Earning Money
Player can earn currency through:

- Battling (duels, arena-style encounters)
- Gardening (growing magical plants)
- Potion crafting (selling completed potions)
- Transfiguration requests (NPC commissions)
- Future expandable systems

### Spending Money
- School shop
- Market (expanded inventory, rare items)


## 4. World Areas

### Greenhouse
- Grow magical ingredients
- Source for potion materials

### Caves
- Contains monsters
- Source for rare raw materials
- Risk vs reward gameplay

### Market
- Larger and more dynamic inventory than school shop
- Rare ingredients
- Advanced spell components
- Equipment upgrades


## 5. Social Interactions

### NPCs
- Teachers and students are interactive NPCs with persistent relationship states
- Conversations can be initiated at appropriate times (between classes, free periods, etc.)

### Relationship Types
- **Friendships** – built over time through repeated positive interactions
- **Romantic Relationships** – available with students; develop from friendship through meaningful choices
- **Teacher Rapport** – affects class experience, hints, and optional guidance; does not extend to romantic relationships

### Study Groups
- Player can form or join study groups with other students
- Studying together increases learning speed or grants bonus XP for relevant subjects
- Group chemistry matters: compatible relationships improve group effectiveness

### Relationship Progression
- Relationships progress through distinct stages (acquaintance → friend → close friend, etc.)
- Choices in conversations influence relationship direction
- Neglecting relationships causes them to decay over time
- Some story events or advanced content may require specific relationship levels


## 6. Food & Rest System

### Mana Regeneration Baseline
- Mana regenerates passively over time at a standard rate

### Hunger
- Player has a hunger meter that depletes over time
- Being hungry slows mana regeneration significantly
- Eating food restores hunger and returns regeneration to normal rate
- Food can be purchased from the school shop or market, or crafted/grown

### Tiredness
- Player has an energy meter that depletes through activity
- Being tired slows mana regeneration significantly
- Rest (sleeping, resting in dormitory) restores energy
- Stacking hunger and tiredness compounds the regeneration penalty

### Design Notes
- Hunger and tiredness are meant to add light resource management, not be punishing
- Regeneration penalty should be noticeable but not game-blocking
- Thresholds and penalty values should be tunable via config


## 7. Spell Mastery System

### Spell Practice
- Player must practice spells to increase level
- Each spell has its own level

### Failure System
- Low-level spells have a higher failure chance
- Each level reduces failure probability

### Mastery
- Mastery achieved at Level 10 (configurable)
- At mastery:
  - Spell never fails
  - May unlock bonus effects (optional future expansion)
