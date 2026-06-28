/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum GameStage {
  BETTING = 'BETTING',       // 5-second betting phase countdown
  SYSTEMS_CHECK = 'SYSTEMS_CHECK', // 2-second systems check countdown (0% to 100%)
  FLYING = 'FLYING',         // Rocket is flying, multiplier is climbing
  CRASHED = 'CRASHED',       // Rocket exploded, displays crash multiplier
}

export interface PlayerStats {
  usdcBalance: number;       // Wallet USDC balance
  oroBalance: number;        // Wallet ORO balance
  totalRounds: number;
  totalWins: number;
  highestMultiplier: number;
  netProfit: number;         // Total ORO gained/lost
}

export interface ActiveBet {
  amount: number;            // ORO amount placed
  autoCashout: number;       // Auto cashout multiplier target (e.g. 1.2)
  cashedOut: boolean;        // Whether the player cashed out this round
  cashoutMultiplier?: number;// The multiplier at which they cashed out
  winAmount?: number;        // Calculated win in ORO
}

export interface HistoryItem {
  id: string;
  multiplier: number;
  timestamp: string;
  isMega: boolean;           // Multipliers >= 2.0x are highlighted
}

export interface FlightLogMessage {
  percentage: number;
  message: string;
}
