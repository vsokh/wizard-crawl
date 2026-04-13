import { GameState, spawnText } from '../state';
import { SHOP_ITEMS, ShopItemDef, ROOM_WIDTH, ROOM_HEIGHT } from '../constants';

/** Get current price for a shop item based on how many times it's been bought */
export function getItemPrice(item: ShopItemDef, purchases: number): number {
  return item.basePrice + item.priceIncrease * purchases;
}

/** Check if the player can buy this item */
function canBuy(state: GameState, item: ShopItemDef): boolean {
  const bought = state.shopPurchases[item.id] || 0;
  if (item.maxBuys > 0 && bought >= item.maxBuys) return false;
  return state.gold >= getItemPrice(item, bought);
}

/** Apply item effect */
function applyItem(state: GameState, item: ShopItemDef): void {
  const p = state.players[state.localIdx];
  if (!p) return;

  switch (item.id) {
    case 'heal':
      p.hp = Math.min(p.maxHp, p.hp + 3);
      spawnText(state, p.x, p.y - 20, '+3 HP', '#44cc55');
      break;
    case 'maxhp':
      p.maxHp += 2;
      p.hp += 2;
      spawnText(state, p.x, p.y - 20, '+2 Max HP', '#cc4444');
      break;
    case 'dmgboost':
      state.shopTempDmg += 1;
      spawnText(state, p.x, p.y - 20, '+1 DMG', '#cc8833');
      break;
    case 'shield':
      state.shopShieldHits += 2;
      spawnText(state, p.x, p.y - 20, 'SHIELD +2', '#4488cc');
      break;
    case 'speed':
      p.moveSpeed *= 1.15;
      spawnText(state, p.x, p.y - 20, '+15% SPD', '#88cc44');
      break;
  }
}

/** Purchase a shop item by index */
export function purchaseItem(state: GameState, index: number): boolean {
  if (index < 0 || index >= SHOP_ITEMS.length) return false;
  const item = SHOP_ITEMS[index];
  if (!canBuy(state, item)) return false;

  const bought = state.shopPurchases[item.id] || 0;
  const price = getItemPrice(item, bought);

  state.gold -= price;
  state.shopPurchases[item.id] = bought + 1;
  applyItem(state, item);
  renderShop(state); // refresh after purchase
  return true;
}

/** Open shop UI */
export function openShop(state: GameState): void {
  state.shopOpen = true;
  renderShop(state);
  const el = document.getElementById('shop-screen');
  if (el) el.style.display = 'flex';
}

/** Close shop UI */
export function closeShop(state: GameState): void {
  state.shopOpen = false;
  state.waveBreakTimer = 2; // resume 2-second countdown
  const el = document.getElementById('shop-screen');
  if (el) el.style.display = 'none';
}

/** Render shop items into the DOM */
export function renderShop(state: GameState): void {
  const grid = document.getElementById('shop-grid');
  if (!grid) return;

  const goldEl = document.getElementById('shop-gold');
  if (goldEl) goldEl.textContent = String(state.gold);

  grid.innerHTML = '';
  SHOP_ITEMS.forEach((item, i) => {
    const bought = state.shopPurchases[item.id] || 0;
    const price = getItemPrice(item, bought);
    const affordable = state.gold >= price;
    const soldOut = item.maxBuys > 0 && bought >= item.maxBuys;

    const btn = document.createElement('button');
    btn.className = 'shop-item' + (!affordable && !soldOut ? ' shop-item-disabled' : '') + (soldOut ? ' shop-item-sold' : '');
    btn.innerHTML = `<div class="shop-item-name" style="color:${item.color}">${item.name}</div>` +
      `<div class="shop-item-desc">${item.desc}</div>` +
      `<div class="shop-item-price">${soldOut ? 'SOLD OUT' : price + 'g'}</div>`;

    if (!soldOut && affordable) {
      btn.onclick = () => purchaseItem(state, i);
    }
    grid.appendChild(btn);
  });
}

/** Initialize shop event listeners (call once at game start) */
export function initShop(state: GameState): void {
  const closeBtn = document.getElementById('shop-close');
  if (closeBtn) {
    closeBtn.onclick = () => closeShop(state);
  }

  // Number keys 1-5 to buy items
  document.addEventListener('keydown', (e) => {
    if (!state.shopOpen) return;
    const num = parseInt(e.key);
    if (num >= 1 && num <= 5) {
      purchaseItem(state, num - 1);
    }
    if (e.key === 'Escape' || e.key === 'Enter') {
      closeShop(state);
    }
  });
}
