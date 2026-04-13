# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

## [v0.4.0] — 2026-04-13

### Added
- Player character animation system with idle bob, movement lean, cast flash, and death fade
- Hit flash, death, and attack animations for all enemies
- Enhanced dungeon terrain visuals with richer textures and atmospheric effects
- Polished spell visual effects with glow, elemental impacts, and screen feedback
- Environmental and ambient visual effects for dungeon atmosphere
- XP level progress bar to the HUD
- Between-wave shop for purchasing upgrades with gold
- Enhanced turret and mega turret ability visuals for the Engineer class
- Rebalanced XP gain rates, level-up thresholds, and gold earn rates
- Rebalanced health drops, scaling, and damage for a smoother difficulty curve

### Fixed
- Ranger power scaling slowed down for more gradual progression
- Pointer lock now releases and cursor restores on game over and victory screens
- Engineer Deploy Turret zones render the turret graphic instead of a generic fire circle
- Projectiles now bounce off walls with proper reflection physics

## [v0.3.0] — 2026-04-13

### Added
- Cooldown countdown timers on skill icons
- Unique R abilities and wired-up ultimate upgrades for all classes
- Differentiated LMB, RMB, and Q abilities for all characters
- Stepped linear XP growth curve replacing the exponential system
- Per-upgrade stack caps to prevent infinite power stacking
- Time-based difficulty scaling for enemy HP and damage
- Hyperbolic stacking for percentage-based upgrades
- Logarithmic diminishing returns for flat stackable upgrades
- Fixed 20-wave run arc culminating in the Archlord boss finale
- 4 new enemy types with distinct combat mechanics
- 8 qualitative behavior-changing upgrades
- Upgrade evolution system with 10 evolved variants

### Fixed
- Chain lightning now properly bounces between enemies for Stormcaller RMB
- Storm Shield passive lightning aura implemented for Stormcaller
- Nerfed 5 overtuned ultimates for better balance

### Changed
- Buffed Pyromancer ultimate with more meteors and burn zones

### Infrastructure
- Research notes on roguelike progression systems

## [v0.2.0] — 2026-04-13

### Added
- Balance simulator tool for tuning game parameters
- 4 new playable classes and 4 new enemy types
- 16 new RMB, ultimate, and synergy upgrades
- 42 class-specific upgrades (3 per class)
- Distinct spell animations per element and type
- Overhauled entity rendering with depth, animation, and visual polish
- Roguelike core systems: XP gems, magnet pickup, enemy hordes, kill juice combos

### Fixed
- Button event wiring now uses addEventListener instead of onclick
- Prevented duplicate non-stackable upgrades from appearing

### Changed
- Migrated entire codebase to TypeScript with Vite build system
- Replaced string literals with GamePhase enum in wave system
- Switched to TypeScript-only Vite build for GitHub Pages deployment
- Unique visual identity for all 14 classes and summon sprites
- Visual overhaul with atmospheric arena and polished UI

### Infrastructure
- Added .gitignore to exclude worktree artifacts

## [v0.1.0] — 2026-04-12

### Added
- Initial co-op roguelike dungeon crawler with real-time combat
- 30+ weapon modifier upgrades
- Passives, ultimates, and 4 non-mage classes (Ranger, Knight, Engineer, Necromancer)
- Pointer lock controls, guest minimap, and dungeon sync
- Wave-based survival mode inspired by Brotato

### Fixed
- Full multiplayer state sync with guest rendering and start room
- Movement, camera centering, and input synchronization
- Independent upgrade selection for both players
- Non-mage class definitions moved inside CLASSES object

### Infrastructure
- GitHub Pages deployment workflow
