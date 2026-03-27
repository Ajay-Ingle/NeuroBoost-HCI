export type GameMode = 'reflex' | 'memory' | 'focus';

export interface AdaptiveSettings {
    level: number;
    // Reflex mode specific
    stimulusDurationMs?: number;
    spawnIntervalMs?: number;

    // Memory mode specific
    sequenceLength?: number;

    // Focus mode specific
    distractorCount?: number;
    similarityToTarget?: number; // 0.0 to 1.0 (harder)
}

// Initial baselines for Tier 1
const BASE_SETTINGS: Record<GameMode, AdaptiveSettings> = {
    reflex: { level: 1, stimulusDurationMs: 1500, spawnIntervalMs: 2000 },
    memory: { level: 1, sequenceLength: 3 },
    focus: { level: 1, distractorCount: 8, similarityToTarget: 0.2 },
};

export class AdaptiveEngine {

    static getInitialSettings(mode: GameMode): AdaptiveSettings {
        return { ...BASE_SETTINGS[mode] };
    }

    // Reflex Mode Logic: Evaluate Performance and Return Next Settings
    static evaluateReflexPerformance(
        currentSettings: AdaptiveSettings,
        avgReactionTime: number,
        misses: number,
        accuracy: number
    ): AdaptiveSettings {
        let nextSettings = { ...currentSettings };
        let levelChange = 0;

        // Rule 1: High accuracy and fast reaction time -> Increase difficulty
        if (accuracy >= 90 && avgReactionTime < 400 && misses === 0) {
            levelChange = 1;
            nextSettings.stimulusDurationMs = Math.max(400, (currentSettings.stimulusDurationMs || 1000) * 0.85);
            nextSettings.spawnIntervalMs = Math.max(500, (currentSettings.spawnIntervalMs || 1500) * 0.9);
        }
        // Rule 2: Constant high accuracy but average reaction -> Slight speed increase
        else if (accuracy >= 80 && avgReactionTime < 600) {
            nextSettings.stimulusDurationMs = Math.max(500, (currentSettings.stimulusDurationMs || 1000) * 0.95);
        }
        // Rule 3: Low accuracy or high misses -> Decrease difficulty
        else if (accuracy < 60 || misses >= 3) {
            levelChange = -1;
            nextSettings.stimulusDurationMs = Math.min(2000, (currentSettings.stimulusDurationMs || 1000) * 1.2);
            nextSettings.spawnIntervalMs = Math.min(3000, (currentSettings.spawnIntervalMs || 1500) * 1.1);
        }

        nextSettings.level = Math.max(1, currentSettings.level + levelChange);
        return nextSettings;
    }

    // Memory Mode Logic
    static evaluateMemoryPerformance(
        currentSettings: AdaptiveSettings,
        perfectRecallStreak: number,
        failedRecalls: number
    ): AdaptiveSettings {
        let nextSettings = { ...currentSettings };

        if (perfectRecallStreak >= 2) {
            nextSettings.level += 1;
            nextSettings.sequenceLength = (currentSettings.sequenceLength || 3) + 1;
        } else if (failedRecalls >= 2) {
            nextSettings.level = Math.max(1, currentSettings.level - 1);
            nextSettings.sequenceLength = Math.max(3, (currentSettings.sequenceLength || 4) - 1);
        }

        return nextSettings;
    }
}
