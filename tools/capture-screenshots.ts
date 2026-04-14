import { chromium } from 'playwright';
import { createServer } from 'vite';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { mkdirSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, '..');
const outDir = join(projectRoot, 'screenshots');

async function main() {
  mkdirSync(outDir, { recursive: true });

  // Start Vite dev server
  const server = await createServer({
    root: projectRoot,
    server: { port: 5199 },
  });
  await server.listen();
  console.log('Vite server running on http://localhost:5199');

  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });

  await page.goto('http://localhost:5199/?screenshots');
  await page.waitForFunction(() => (window as any).__ss !== undefined, { timeout: 15000 });
  console.log('Screenshot mode ready');

  // Hide all DOM UI
  await page.evaluate(() => {
    document.querySelectorAll('#lobby, #select-screen, #game-over-screen, #upgrade-screen, #shop-screen, #hud, .version-tag').forEach(el => {
      (el as HTMLElement).style.display = 'none';
    });
  });

  // Scene 1: Intense combat with spells
  await captureScene(page, 'combat-spells', async () => {
    await page.evaluate(() => {
      const ss = (window as any).__ss;
      const state = ss.state;
      state.gamePhase = ss.GamePhase.Playing;
      state.mode = ss.NetworkMode.None;
      state.wave = 5;
      state.waveActive = true;

      // Clear existing
      state.players.length = 0;
      state.enemies.clear();
      state.pillars.length = 0;

      // Create pyromancer player
      const p1 = ss.createPlayer(0, 'pyromancer');
      p1.x = 500; p1.y = 380; p1.angle = -0.5;
      p1.hp = 85; p1.alive = true;
      p1.iframes = 0;
      state.players.push(p1);
      state.localIdx = 0;

      // Generate arena (pillars)
      ss.generateArena(state);

      // Spawn enemies at specific positions
      for (let i = 0; i < 8; i++) {
        ss.spawnEnemy(state, ['slime', 'wraith', 'skeleton', 'bat', 'spider'][i % 5], 3, 1, 1);
      }
      // Manually position enemies in a spread around the player
      const positions = [
        [350, 250], [650, 280], [300, 450], [700, 400],
        [450, 180], [550, 500], [200, 350], [800, 320]
      ];
      let idx = 0;
      for (const e of state.enemies) {
        if (idx < positions.length) {
          e.x = positions[idx][0];
          e.y = positions[idx][1];
          // Some with hit flash for action feel
          if (idx % 3 === 0) e._hitFlash = 0.3;
          idx++;
        }
      }

      // Add some spells (fire projectiles from pyromancer)
      const spellAngles = [-0.8, -0.3, 0.2, 0.7, -1.2];
      for (const angle of spellAngles) {
        const speed = 400;
        state.spells.push({
          type: 'fireball',
          x: p1.x + Math.cos(angle) * 60,
          y: p1.y + Math.sin(angle) * 60,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          radius: 8,
          dmg: 25,
          owner: 0,
          pierceLeft: 0,
          life: 2,
          age: 0,
          trail: '#ff6633',
          color: '#ff4400',
          homing: 0,
          speed: speed,
          zap: 0,
          zapRate: 0,
          zapTimer: 0,
          slow: 0,
          drain: 0,
          explode: 0,
          burn: 0,
          stun: 0,
          clsKey: 'pyromancer',
          _reversed: false,
          _bounces: 0,
          _slot: 0,
        });
      }

      // Add some particles for visual flair
      for (let i = 0; i < 30; i++) {
        const pt = state.particles.acquire();
        if (!pt) break;
        pt.x = p1.x + (Math.random() - 0.5) * 200;
        pt.y = p1.y + (Math.random() - 0.5) * 200;
        pt.vx = (Math.random() - 0.5) * 50;
        pt.vy = (Math.random() - 0.5) * 50;
        pt.life = 0.8;
        pt.r = 2 + Math.random() * 3;
        pt.color = ['#ff6633', '#ff4400', '#ffaa33', '#ff8800'][Math.floor(Math.random() * 4)];
      }

      // Add trails
      for (let i = 0; i < 50; i++) {
        const tr = state.trails.acquire();
        if (!tr) break;
        tr.x = p1.x + (Math.random() - 0.5) * 300;
        tr.y = p1.y + (Math.random() - 0.5) * 300;
        tr.life = 0.5 + Math.random() * 0.5;
        tr.r = 2 + Math.random() * 4;
        tr.color = '#ff6633';
      }

      state.time = 10; // Ensure animations are past initial state
      ss.renderFrame();
    });
  });

  // Scene 2: Co-op play with two wizards — reload for clean state
  await page.goto('http://localhost:5199/?screenshots');
  await page.waitForFunction(() => (window as any).__ss !== undefined, { timeout: 15000 });
  await page.evaluate(() => {
    document.querySelectorAll('#lobby, #select-screen, #game-over-screen, #upgrade-screen, #shop-screen, #hud, .version-tag').forEach(el => {
      (el as HTMLElement).style.display = 'none';
    });
  });

  await captureScene(page, 'coop-action', async () => {
    await page.evaluate(() => {
      const ss = (window as any).__ss;
      const state = ss.state;
      state.gamePhase = ss.GamePhase.Playing;
      state.mode = ss.NetworkMode.None;
      state.wave = 8;
      state.waveActive = true;

      state.players.length = 0;
      state.enemies.clear();
      state.spells.clear();
      state.pillars.length = 0;

      // Two players: pyromancer + cryomancer
      const p1 = ss.createPlayer(0, 'pyromancer');
      p1.x = 420; p1.y = 370; p1.angle = -0.3; p1.hp = 90; p1.iframes = 0;
      const p2 = ss.createPlayer(1, 'cryomancer');
      p2.x = 580; p2.y = 350; p2.angle = -0.7; p2.hp = 75; p2.iframes = 0;
      state.players.push(p1, p2);
      state.localIdx = 0;

      ss.generateArena(state);

      // More enemies for intense scene
      for (let i = 0; i < 12; i++) {
        ss.spawnEnemy(state, ['slime', 'wraith', 'skeleton', 'bat', 'spider', 'bomber'][i % 6], 4, 1, 1);
      }
      const positions = [
        [200, 200], [400, 150], [600, 180], [800, 250],
        [250, 500], [450, 550], [650, 520], [850, 450],
        [150, 350], [750, 350], [350, 300], [550, 480]
      ];
      let idx = 0;
      for (const e of state.enemies) {
        if (idx < positions.length) {
          e.x = positions[idx][0];
          e.y = positions[idx][1];
          if (idx % 4 === 0) e._hitFlash = 0.3;
          idx++;
        }
      }

      // Fire spells from player 1
      for (const angle of [-0.6, -0.1, 0.4]) {
        state.spells.push({
          type: 'fireball',
          x: p1.x + Math.cos(angle) * 50, y: p1.y + Math.sin(angle) * 50,
          vx: Math.cos(angle) * 400, vy: Math.sin(angle) * 400,
          radius: 8, dmg: 25, owner: 0, pierceLeft: 0, life: 2,
          age: 0, trail: '#ff6633', color: '#ff4400',
          speed: 400, homing: 0, zap: 0, zapRate: 0, zapTimer: 0,
          slow: 0, drain: 0, explode: 0, burn: 0, stun: 0,
          clsKey: 'pyromancer', _reversed: false, _bounces: 0, _slot: 0,
        });
      }
      // Ice spells from player 2
      for (const angle of [-1.0, -0.5, 0.0]) {
        state.spells.push({
          type: 'ice_shard',
          x: p2.x + Math.cos(angle) * 50, y: p2.y + Math.sin(angle) * 50,
          vx: Math.cos(angle) * 350, vy: Math.sin(angle) * 350,
          radius: 7, dmg: 20, owner: 1, pierceLeft: 0, life: 2,
          age: 0, trail: '#44bbff', color: '#88ddff',
          speed: 350, homing: 0, zap: 0, zapRate: 0, zapTimer: 0,
          slow: 0, drain: 0, explode: 0, burn: 0, stun: 0,
          clsKey: 'cryomancer', _reversed: false, _bounces: 0, _slot: 0,
        });
      }

      // Particles for both players
      for (let i = 0; i < 40; i++) {
        const pt = state.particles.acquire();
        if (!pt) break;
        const owner = i < 20 ? p1 : p2;
        const colors = i < 20 ? ['#ff6633', '#ff4400'] : ['#44bbff', '#88ddff'];
        pt.x = owner.x + (Math.random() - 0.5) * 150;
        pt.y = owner.y + (Math.random() - 0.5) * 150;
        pt.vx = (Math.random() - 0.5) * 40;
        pt.vy = (Math.random() - 0.5) * 40;
        pt.life = 0.7;
        pt.r = 2 + Math.random() * 3;
        pt.color = colors[Math.floor(Math.random() * colors.length)];
      }

      state.time = 20;
      ss.renderFrame();
    });
  });

  // Scene 3: Boss fight — reload for clean state
  await page.goto('http://localhost:5199/?screenshots');
  await page.waitForFunction(() => (window as any).__ss !== undefined, { timeout: 15000 });
  await page.evaluate(() => {
    document.querySelectorAll('#lobby, #select-screen, #game-over-screen, #upgrade-screen, #shop-screen, #hud, .version-tag').forEach(el => {
      (el as HTMLElement).style.display = 'none';
    });
  });

  await captureScene(page, 'boss-fight', async () => {
    await page.evaluate(() => {
      const ss = (window as any).__ss;
      const state = ss.state;
      state.gamePhase = ss.GamePhase.Playing;
      state.mode = ss.NetworkMode.None;
      state.wave = 20;
      state.waveActive = true;

      state.players.length = 0;
      state.enemies.clear();
      state.spells.clear();
      state.pillars.length = 0;

      // Two players for boss fight
      const p1 = ss.createPlayer(0, 'stormcaller');
      p1.x = 350; p1.y = 480; p1.angle = -1.0; p1.hp = 60; p1.iframes = 0;
      const p2 = ss.createPlayer(1, 'necromancer');
      p2.x = 650; p2.y = 500; p2.angle = -2.0; p2.hp = 45; p2.iframes = 0;
      state.players.push(p1, p2);
      state.localIdx = 0;

      ss.generateArena(state);

      // Boss (archlord) at top center
      ss.spawnEnemy(state, 'archlord', 10, 1, 2);
      // Support enemies
      for (let i = 0; i < 4; i++) {
        ss.spawnEnemy(state, ['wraith', 'skeleton', 'necro', 'shieldbearer'][i], 6, 1.5, 1.5);
      }

      const positions = [[500, 200], [300, 300], [700, 280], [400, 250], [600, 300]];
      let idx = 0;
      for (const e of state.enemies) {
        if (idx < positions.length) {
          e.x = positions[idx][0];
          e.y = positions[idx][1];
          if (idx === 0) e._atkAnim = 0.5; // Boss attacking animation
          idx++;
        }
      }

      // Storm spells from player 1
      for (const angle of [-1.2, -0.8, -0.4]) {
        state.spells.push({
          type: 'lightning',
          x: p1.x + Math.cos(angle) * 50, y: p1.y + Math.sin(angle) * 50,
          vx: Math.cos(angle) * 450, vy: Math.sin(angle) * 450,
          radius: 6, dmg: 30, owner: 0, pierceLeft: 0, life: 2,
          age: 0, trail: '#aa66ff', color: '#cc88ff',
          speed: 450, homing: 0, zap: 0, zapRate: 0, zapTimer: 0,
          slow: 0, drain: 0, explode: 0, burn: 0, stun: 0,
          clsKey: 'stormcaller', _reversed: false, _bounces: 0, _slot: 0,
        });
      }

      // Dark spells from player 2
      for (const angle of [-1.8, -2.3]) {
        state.spells.push({
          type: 'death_bolt',
          x: p2.x + Math.cos(angle) * 50, y: p2.y + Math.sin(angle) * 50,
          vx: Math.cos(angle) * 350, vy: Math.sin(angle) * 350,
          radius: 9, dmg: 35, owner: 1, pierceLeft: 0, life: 2,
          age: 0, trail: '#66ff44', color: '#44cc22',
          speed: 350, homing: 0, zap: 0, zapRate: 0, zapTimer: 0,
          slow: 0, drain: 0, explode: 0, burn: 0, stun: 0,
          clsKey: 'necromancer', _reversed: false, _bounces: 0, _slot: 0,
        });
      }

      // Dramatic particles
      for (let i = 0; i < 50; i++) {
        const pt = state.particles.acquire();
        if (!pt) break;
        pt.x = 500 + (Math.random() - 0.5) * 400;
        pt.y = 350 + (Math.random() - 0.5) * 300;
        pt.vx = (Math.random() - 0.5) * 60;
        pt.vy = (Math.random() - 0.5) * 60;
        pt.life = 0.9;
        pt.r = 2 + Math.random() * 4;
        pt.color = ['#aa66ff', '#ff4444', '#66ff44', '#ffaa33'][Math.floor(Math.random() * 4)];
      }

      // Shockwave effect
      const sw = state.shockwaves.acquire();
      if (sw) {
        sw.x = 500; sw.y = 200; sw.radius = 30; sw.maxR = 120;
        sw.life = 0.7; sw.color = '#ffaa33';
      }

      state.time = 50;
      ss.renderFrame();
    });
  });

  // Scene 4: Upgrade selection — reload for clean state
  await page.goto('http://localhost:5199/?screenshots');
  await page.waitForFunction(() => (window as any).__ss !== undefined, { timeout: 15000 });
  await page.evaluate(() => {
    document.querySelectorAll('#lobby, #select-screen, #game-over-screen, #upgrade-screen, #shop-screen, #hud, .version-tag').forEach(el => {
      (el as HTMLElement).style.display = 'none';
    });
  });

  await captureScene(page, 'upgrade-selection', async () => {
    // First render a game scene in the background
    await page.evaluate(() => {
      const ss = (window as any).__ss;
      const state = ss.state;
      state.gamePhase = ss.GamePhase.Playing;
      state.mode = ss.NetworkMode.None;
      state.wave = 7;

      state.players.length = 0;
      state.enemies.clear();
      state.spells.clear();

      const p1 = ss.createPlayer(0, 'arcanist');
      p1.x = 500; p1.y = 350; p1.alive = true; p1.iframes = 0;
      state.players.push(p1);
      state.localIdx = 0;

      ss.generateArena(state);

      // Some enemies in background
      for (let i = 0; i < 5; i++) {
        ss.spawnEnemy(state, 'slime', 2, 1, 1);
      }
      let idx = 0;
      for (const e of state.enemies) {
        const pos = [[300, 250], [700, 300], [400, 500], [600, 200], [250, 400]];
        if (idx < pos.length) { e.x = pos[idx][0]; e.y = pos[idx][1]; }
        idx++;
      }

      state.time = 15;
      ss.renderFrame();
    });

    // Show upgrade screen DOM overlay with mock cards
    await page.evaluate(() => {
      const screen = document.getElementById('upgrade-screen');
      const grid = document.getElementById('upgrade-grid');
      if (screen && grid) {
        screen.style.display = 'flex';
        grid.innerHTML = '';

        const upgrades = [
          { name: 'Piercing Shot', desc: '+1 projectile pierce', color: '#44bbff', tier: 'Common' },
          { name: 'Fire Mastery', desc: '+25% fire damage', color: '#ff6633', tier: 'Rare' },
          { name: 'Soul Harvest', desc: 'Heal on kill', color: '#66ff44', tier: 'Epic' },
        ];

        for (const u of upgrades) {
          const card = document.createElement('div');
          card.className = 'upgrade-card';
          card.style.cssText = `border: 2px solid ${u.color}; background: rgba(20,15,30,0.95); padding: 20px; border-radius: 8px; text-align: center; cursor: pointer; min-width: 180px;`;
          card.innerHTML = `
            <div style="color: ${u.color}; font-size: 12px; margin-bottom: 8px;">${u.tier}</div>
            <div style="color: #fff; font-size: 16px; font-weight: bold; margin-bottom: 8px;">${u.name}</div>
            <div style="color: #aaa; font-size: 13px;">${u.desc}</div>
          `;
          grid.appendChild(card);
        }
      }
    });
  }, true);  // fullPage screenshot

  // Scene 5: Shop screen — reload for clean state
  await page.goto('http://localhost:5199/?screenshots');
  await page.waitForFunction(() => (window as any).__ss !== undefined, { timeout: 15000 });
  await page.evaluate(() => {
    document.querySelectorAll('#lobby, #select-screen, #game-over-screen, #upgrade-screen, #shop-screen, #hud, .version-tag').forEach(el => {
      (el as HTMLElement).style.display = 'none';
    });
  });

  await captureScene(page, 'shop', async () => {
    // Render game background
    await page.evaluate(() => {
      const ss = (window as any).__ss;
      const state = ss.state;
      state.gamePhase = ss.GamePhase.Playing;
      state.mode = ss.NetworkMode.None;
      state.wave = 5;
      state.gold = 150;

      state.players.length = 0;
      state.enemies.clear();
      state.spells.clear();

      const p1 = ss.createPlayer(0, 'paladin');
      p1.x = 500; p1.y = 350; p1.alive = true; p1.iframes = 0;
      state.players.push(p1);
      state.localIdx = 0;

      ss.generateArena(state);
      state.time = 25;
      ss.renderFrame();
    });

    // Show shop screen DOM overlay
    await page.evaluate(() => {
      // Hide upgrade screen if showing
      const upScreen = document.getElementById('upgrade-screen');
      if (upScreen) upScreen.style.display = 'none';

      const screen = document.getElementById('shop-screen');
      const grid = document.getElementById('shop-grid');
      if (screen && grid) {
        screen.style.display = 'flex';
        grid.innerHTML = '';

        const items = [
          { name: 'Healing Potion', desc: 'Restore 30 HP', price: 25, color: '#44ff44' },
          { name: 'Max HP Up', desc: '+20 Max HP', price: 40, color: '#ff4444' },
          { name: 'Damage Boost', desc: '+15% damage this wave', price: 35, color: '#ff8800' },
          { name: 'Magic Shield', desc: 'Block 2 hits', price: 50, color: '#4488ff' },
          { name: 'Speed Boost', desc: '+10% move speed', price: 30, color: '#ffff44' },
        ];

        for (const item of items) {
          const card = document.createElement('div');
          card.className = 'shop-item';
          card.style.cssText = `border: 1px solid ${item.color}; background: rgba(20,15,30,0.95); padding: 16px; border-radius: 6px; text-align: center; cursor: pointer; min-width: 140px;`;
          card.innerHTML = `
            <div style="color: #fff; font-size: 14px; font-weight: bold; margin-bottom: 4px;">${item.name}</div>
            <div style="color: #aaa; font-size: 12px; margin-bottom: 8px;">${item.desc}</div>
            <div style="color: #ffd700; font-size: 14px; font-weight: bold;">${item.price} gold</div>
          `;
          grid.appendChild(card);
        }
      }
    });
  }, true);

  await browser.close();
  await server.close();
  console.log(`\nDone! Screenshots saved to ${outDir}`);
}

async function captureScene(page: any, name: string, setup: () => Promise<void>, fullPage = false) {
  console.log(`Capturing ${name}...`);
  await setup();
  await page.waitForTimeout(200);  // Let rendering settle

  const path = join(outDir, `${name}.png`);
  if (fullPage) {
    await page.screenshot({ path, fullPage: false });  // viewport size
  } else {
    // Capture just the canvas
    const canvas = await page.$('canvas#c');
    if (canvas) {
      await canvas.screenshot({ path });
    } else {
      await page.screenshot({ path });
    }
  }
  console.log(`  Saved: ${path}`);
}

main().catch(err => { console.error(err); process.exit(1); });
