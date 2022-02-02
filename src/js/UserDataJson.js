const baselineCardMultiplier = 2;
const MINUTE = 60000;
const FIVE_MINS = 300000;
const TEN_MINS = 600000;
const THIRTY_MINS = 1800000;
const ONE_DAY = 86400000;

const SIMPLE_ADJUSTMENT = 0.3;
const EASY_ADJUSTMENT = 0.1;
const MEDIUM_ADJUSTMENT = -0.1;
const HARD_ADJUSTMENT = -0.3;

const HARD_DIFFICULTY = 0.5;
const MEDIUM_DIFFICULTY = 0.9;
const EASY_DIFFICULTY = 2;
const SIMPLE_DIFFICULTY = 3;

export const setupConfig = (saveLocally) => {
    const config = {
        cards: {},
        config: {
            baselineMultiplier: 2,
            adjustments: {
                easiest: +0.3,
                easy: +0.1,
                medium: -0.1,
                hard: -0.3,
                again: -0.5,
            },
            difficultyMultiplier: {
                easiest: 3,
                easy: 2,
                medium: 1.25,
                hard: 1,
            },
            newCardSettings: {
                easiest: 3 * ONE_DAY,
                easy: ONE_DAY,
                medium: 30 * MINUTE,
                hard: 10 * MINUTE,
                again: 5 * MINUTE,
            },
            oldCardSettings: {
                again: 5 * MINUTE,
            },
            againCardSettings: {
                // when again was used before
                easiest: 7 * ONE_DAY,
                easy: 3 * ONE_DAY,
                medium: 30 * MINUTE,
                hard: 10 * MINUTE,
                again: 5 * MINUTE,
            },
            timeline: {
                finalDay: null,
            },
        },
    };
    if (saveLocally) updateConfig(config);
    return config;
};

export const updateCard = (
    cardId,
    interval = -1,
    nextDate = new Date(),
    multiplier = getConfig().baseLineMultiplier
) => {
    if (!cardId) return;
    let currentConfig = getConfig();
    currentConfig.cards[cardId] = {
        id: cardId,
        interval,
        multiplier,
        nextDate,
    };
    updateConfig(currentConfig);
};

export const updateCard_Drive = (
    config,
    cardId,
    interval = -1,
    nextDate = new Date(),
    multiplier = config?.baseLineMultiplier || 2
) => {
    if (!config || !cardId) return null;
    config.cards[cardId] = {
        id: cardId,
        interval,
        multiplier,
        nextDate,
    };
    return config;
};

export const getCardById = (cardId) => {
    return getConfig().cards[cardId];
};

const updateConfig = (config) => localStorage.setItem("config", JSON.stringify(config));
export const getConfig = () => JSON.parse(localStorage.getItem("config") || setupConfig());

export const setPreferences = (preferences) => {
    let config = getConfig();
    config.config = { ...config.config, ...preferences };
};

export const defaultCard = (id) => {
    let { config } = getConfig();
    return {
        id,
        interval: -1,
        multiplier: config.baselineMultiplier,
        nextDate: 0,
    };
};

export const initialiseCards = (cards) => {
    let config = getConfig();
    for (let card of cards) {
        if (config.cards[card.id]) continue;
        let c = defaultCard(card.id);
        console.log(c);
        config.cards[card.id] = c;
    }
    updateConfig(config);
};
