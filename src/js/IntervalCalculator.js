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

const baselineCardMultiplier = 2;
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

const createReturnObject = (newInterval, newCardMultiplier) => {
	return {
		newInterval,
		newCardMultiplier
	}
}

// dayDivTotal = current day / total number of days in timeframe
const getNextInterval = (previousInterval, cardMultiplier, difficulty, finalDay) => {

	let localCardMultiplier = cardMultiplier < 0.25 ? 0.25 : cardMultiplier;

	// new card
	if (previousInterval === -1) {
		switch (difficulty) {
			case 5:
				return createReturnObject(FIVE_MINS, baselineCardMultiplier);
			case 4:
				return createReturnObject(TEN_MINS, baselineCardMultiplier);
			case 3:
				return createReturnObject(THIRTY_MINS, baselineCardMultiplier);
			case 2:
				return createReturnObject(ONE_DAY, baselineCardMultiplier);
			case 1:
				return createReturnObject(ONE_DAY * 3, baselineCardMultiplier);
		}
	} else {
		// last interval was triggered by 'again'
		if (previousInterval === FIVE_MINS) {
			switch (difficulty) {
				case 5:
					return createReturnObject(FIVE_MINS, localCardMultiplier + HARD_ADJUSTMENT);
				case 4:
					return createReturnObject(TEN_MINS, localCardMultiplier + HARD_ADJUSTMENT);
				case 3:
					return createReturnObject(THIRTY_MINS, localCardMultiplier + MEDIUM_ADJUSTMENT);
				case 2:
					return createReturnObject(ONE_DAY * 3, localCardMultiplier + EASY_ADJUSTMENT);
				case 1:
					return createReturnObject(ONE_DAY * 7, localCardMultiplier + EASY_ADJUSTMENT);
			}
		} else {
			let newCardAdjustmentMult = 0;
			let difficultyLevel = 0;
			switch (difficulty) {
				case 5:
					return createReturnObject(FIVE_MINS, localCardMultiplier + HARD_ADJUSTMENT);
				case 4:
					newCardAdjustmentMult = localCardMultiplier + HARD_ADJUSTMENT;
					difficultyLevel = HARD_DIFFICULTY;
					break;
				case 3:
					newCardAdjustmentMult = localCardMultiplier + MEDIUM_ADJUSTMENT;
					difficultyLevel = MEDIUM_DIFFICULTY;
					break;				
				case 2:
					newCardAdjustmentMult = localCardMultiplier + EASY_ADJUSTMENT;
					difficultyLevel = EASY_DIFFICULTY;
					break;				
				case 1:
					newCardAdjustmentMult = localCardMultiplier + EASY_ADJUSTMENT;
					difficultyLevel = EASY_DIFFICULTY;
					break;			
			}
			let today = new Date();
			const newInterval = previousInterval * difficultyLevel * newCardAdjustmentMult * (1 - (1/(finalDay.getTime() - today.getTime())));
			return createReturnObject(newInterval, newCardAdjustmentMult);
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
	finalDay = new Date(finalDay.getTime() + (ONE_DAY * totalDays));
	console.log(finalDay);

	for (let a of arr) {
		let { newInterval, newCardMultiplier } = getNextInterval(interval, cardMultiplier, a, finalDay);
		previousInterval = interval;
		previousCardMultiplier = cardMultiplier;
		interval = newInterval;
		cardMultiplier = newCardMultiplier;
		console.log("Day -> ",currentDay, "\nDate -> ", currentDate,"\nCard -> ", a, "\nPrevious Interval -> ", previousInterval, "\nNew Interval -> ", interval, "\nPrevious Multiplier -> ", previousCardMultiplier, "\nNew Multiplier -> ", cardMultiplier);
		currentDay += (interval / (86400000));
		currentDate = new Date(currentDate.getTime() + interval)
		console.log("\n\n");
	}
}

main([3, 4, 4, 5, 5, 1, 4]);