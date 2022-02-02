import * as UserData from "./UserDataJson";
/* 

	baseline card multiplier: 2

	simple multiplier adjustment: +0.3
	easy multiplier adjustment: +0.1
	medium multiplier adjustment: -0.1
	hard multiplier adjustment: -0.3

	formula:
		previous interval in days * difficulty * ( ( card multiplier + multiplier adjustment ) ) * ( 1 - current day / total days )

	new card (-1):
		again: 5 mins
		hard: 10 mins
		medium: 30 mins
		easy: 1 day
		simple: 3 days

	old card again:
		again: 5 mins
		hard: 10 mins
		medium: 30 mins
		easy: 3 days
		simple: 7 days

	old card general:
		formula:
			hard: 0.5
			medium: 0.9
			easy: 2
			simple: 3
*/

const ONE_DAY = 86400000;

const createReturnObject = (interval, multiplier, cardId) => {
    UserData.updateCard(cardId, interval, new Date(new Date().getTime() + interval).getTime(), multiplier);
    return {
        interval,
        multiplier,
    };
};

// dayDivTotal = current day / total number of days in timeframe
export const getNextInterval = (cardId, difficulty) => {
    let { config } = UserData.getConfig();
    let card = UserData.getCardById(cardId);
    if (!card) {
        console.error("Unknown Card ID:", cardId);
        return null;
    }
    let localCardMultiplier = card.multiplier < 1 ? 1 : card.multiplier;

    // new card
    if (card.interval === -1) {
        switch (difficulty) {
            case 5:
                return createReturnObject(config.newCardSettings.again, config.baselineMultiplier, cardId);
            case 4:
                return createReturnObject(config.newCardSettings.hard, config.baselineMultiplier, cardId);
            case 3:
                return createReturnObject(config.newCardSettings.medium, config.baselineMultiplier, cardId);
            case 2:
                return createReturnObject(config.newCardSettings.easy, config.baselineMultiplier, cardId);
            case 1:
                return createReturnObject(config.newCardSettings.easiest, config.baselineMultiplier, cardId);
            default:
                break;
        }
    } else {
        // last interval was triggered by 'again'
        if (card.interval === config.oldCardSettings.again) {
            switch (difficulty) {
                case 5:
                    return createReturnObject(
                        config.againCardSettings.again,
                        localCardMultiplier + config.adjustments.again,
                        cardId
                    );
                case 4:
                    return createReturnObject(
                        config.againCardSettings.hard,
                        localCardMultiplier + config.adjustments.hard,
                        cardId
                    );
                case 3:
                    return createReturnObject(
                        config.againCardSettings.medium,
                        localCardMultiplier + config.adjustments.medium,
                        cardId
                    );
                case 2:
                    return createReturnObject(
                        config.againCardSettings.easy,
                        localCardMultiplier + config.adjustments.easy,
                        cardId
                    );
                case 1:
                    return createReturnObject(
                        config.againCardSettings.easiest,
                        localCardMultiplier + config.adjustments.easiest,
                        cardId
                    );
                default:
                    break;
            }
        } else {
            let newCardAdjustmentMult = 0;
            let difficultyLevel = 0;
            switch (difficulty) {
                case 5:
                    return createReturnObject(
                        config.oldCardSettings.again,
                        localCardMultiplier + config.adjustments.again,
                        cardId
                    );
                case 4:
                    newCardAdjustmentMult = localCardMultiplier + config.adjustments.hard;
                    difficultyLevel = config.difficultyMultiplier.hard;
                    break;
                case 3:
                    newCardAdjustmentMult = localCardMultiplier + config.adjustments.medium;
                    difficultyLevel = config.difficultyMultiplier.medium;
                    break;
                case 2:
                    newCardAdjustmentMult = localCardMultiplier + config.adjustments.easy;
                    difficultyLevel = config.difficultyMultiplier.easy;
                    break;
                case 1:
                    newCardAdjustmentMult = localCardMultiplier + config.adjustments.easiest;
                    difficultyLevel = config.difficultyMultiplier.easiest;
                    break;
                default:
                    break;
            }
            let today = new Date();
            const newInterval =
                card.interval *
                difficultyLevel *
                newCardAdjustmentMult *
                (config.timeline.finalDay ? 1 - 1 / (config.timeline.finalDay - today.getTime()) : 1);
            return createReturnObject(newInterval, newCardAdjustmentMult, cardId);
        }
    }
};

const main = (arr) => {
    let interval = -1;
    let previousInterval = null;
    let cardMultiplier = 2;
    let previousCardMultiplier = 2;
    let totalDays = 100;
    let currentDay = 1;
    let currentDate = new Date();
    let finalDay = new Date();
    finalDay = new Date(finalDay.getTime() + ONE_DAY * totalDays);
    console.log(finalDay);

    for (let a of arr) {
        let { newInterval, newCardMultiplier } = getNextInterval(interval, cardMultiplier, a, finalDay);
        previousInterval = interval;
        previousCardMultiplier = cardMultiplier;
        interval = newInterval;
        cardMultiplier = newCardMultiplier;
        console.log(
            "Day -> ",
            currentDay,
            "\nDate -> ",
            currentDate,
            "\nCard -> ",
            a,
            "\nPrevious Interval -> ",
            previousInterval,
            "\nNew Interval -> ",
            interval,
            "\nPrevious Multiplier -> ",
            previousCardMultiplier,
            "\nNew Multiplier -> ",
            cardMultiplier
        );
        currentDay += interval / 86400000;
        currentDate = new Date(currentDate.getTime() + interval);
        console.log("\n\n");
    }
};

// main([3, 4, 4, 5, 5, 1, 4]);
