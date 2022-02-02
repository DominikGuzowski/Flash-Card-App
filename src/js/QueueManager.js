import { getCardById, getConfig, updateCard } from "./UserDataJson";
import { getNextInterval } from "./IntervalCalculator";

export const createQueue = (cards = getConfig().cards) => {
    const today = getToday();
    const cardArray = Object.values(cards);
    const queue = cardArray.filter(({ nextDate }) => nextDate <= today.getTime());
    queue.sort((a, b) => a.nextDate - b.nextDate);
    return queue;
};

export const createQueueFromArray = (cardArray) => {
    const today = getToday();
    const config = getConfig();
    const queue = cardArray.filter(({ id }) => config.cards[id].nextDate <= today.getTime());
    queue.sort((a, b) => a.nextDate - b.nextDate);
    let resultQueue = [];
    for (const q of queue) {
        resultQueue.push(getCardById(q.id));
    }
    console.log(queue, resultQueue, cardArray);
    return resultQueue;
};

export const updateQueue = (queue, cardId, difficulty) => {
    console.log(getCardById(cardId).multiplier);
    const { interval, multiplier } = getNextInterval(cardId, difficulty);
    console.log(multiplier);
    const nextDate = new Date(new Date().getTime() + interval).getTime();
    const today = getToday();
    updateCard(cardId, interval, nextDate, multiplier);
    let index = -1;
    for (let i = 0; i < queue.length; i++) {
        if (queue[i].id === cardId) {
            // queue[i] = { interval, nextDate, multiplier, id: cardId };
            index = i;
            break;
        }
    }
    queue.splice(index, 1);
    queue.push({ interval, nextDate, multiplier, id: cardId });
    const newQueue = queue.filter(({ nextDate }) => nextDate <= today);
    return newQueue.slice();
};

const getToday = () => {
    let today = new Date();
    today.setHours(23);
    today.setMinutes(59);
    today.setSeconds(59);
    today.setMilliseconds(999);
    return today;
};
