const fileInput = document.getElementById("fsc-file");

/*
    TOPIC MODES
    [topicName] - starts a new main topic
    [.subTopic] - starts a subtopic under the current main topic
    [+subTopic] - starts a subtopic under the current subtopic
    [-subTopic] - starts a subtopic under the previous subtopic.
    [-N-subTopic] - starts a subtopic under the nth previous subtopic
    [topic.sub1.sub2] - defines an absolute topic path and re-declares the main topic
    [.] - returns to base level of current main topic.
*/
const download = (filename, text) => {
    let element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);
  
    element.style.display = 'none';
    document.body.appendChild(element);
  
    element.click();
  
    document.body.removeChild(element);
  }

const btn = document.getElementById("download-btn");
let globalRes = {};
btn.onclick = (e) => {
    download("flashcards.json", JSON.stringify(globalRes, null, 4));
}

fileInput.onchange = (e) => {
    readFlashCardFiles(e.target.files, jsonToFlashCard);
};

export const readFlashCardFiles = (files, result) => {
    if(!files) {
        result?.({});
        return;
    }

    let accumulator = {};
    const fileCount = files.length;
    let currentCount = 0;
    const resultAccumulatorFunction = (partialResult) => {
        accumulator = {...accumulator, ...partialResult};
        currentCount++;
        if(currentCount === fileCount) result?.(accumulator);
    }
    [...files].forEach(file => readFlashCardFile(file, resultAccumulatorFunction));
}

export const readFlashCardFile = (FILE, result) => {
    if(!FILE.name.endsWith(FLASH_CARD_FILE_EXTENSION)) {
        result?.({});
        return;
    }
    const fileReader = new FileReader();
    fileReader.onloadend = () => {
        result?.({ [FILE.name]: parseFlashCard(fileReader.result) });
    }
    fileReader.readAsText(FILE);
};

export const parseFlashCard = (flashCard) => {
    let result = [];
    const content = flashCard.replaceAll("\r", "");

    let state = 0;
    let currentTopic = null;
    const lines = content.split("\n");
    for(let line of lines) {
        line = clearLeadingWhiteSpace(line);
        if(line.length === 0) continue;

        const { topic, question, answer, comment, endMode } = regexMatch(line);

        if(comment) continue;
        else if(endMode) state = 0;
        else if(topic) state = 1;
        else if(question) state = 2;
        else if(answer) state = 3;

        switch(state) {
            case 1:
                currentTopic = handleTopic(currentTopic, topic, result); // Updates result on topic change.
                break;
            case 2:
                currentTopic = handleQuestion(currentTopic, line);
                break;
            case 3:
                currentTopic = handleAnswer(currentTopic, line);
                break;
            default: break;
        }
    }
    if(currentTopic) result.push(currentTopic);
    return cleanResults(mergeResults(result));
}

const handleQuestion = (currentTopic, line) => {
    if(!currentTopic) {
        currentTopic = {
            topic: "undefined",
            cards: []
        }
    }
    if(line.startsWith("$$")) {
        let l = line.replace(FLASH_CARD_QUESTION_REGEX, "");
        if(currentTopic.cards.length === 0) currentTopic.cards.push({question: l});
        else if(currentTopic.cards[currentTopic.cards.length - 1].answer && currentTopic.cards[currentTopic.cards.length - 1].question) {
            currentTopic.cards.push({question: l});
        } else {
            let q = currentTopic.cards[currentTopic.cards.length - 1].question;
            let ln = q.charAt(q.length - 1) !== ' ' 
                  ? (" " + clearLeadingWhiteSpace(l))
                  : clearLeadingWhiteSpace(l);
                  currentTopic.cards[currentTopic.cards.length - 1].question += ln;
        }
    } else {
        let q = currentTopic.cards[currentTopic.cards.length - 1].question;
        let ln = q.charAt(q.length - 1) !== ' ' 
              ? (" " + clearLeadingWhiteSpace(line))
              : clearLeadingWhiteSpace(line);
              currentTopic.cards[currentTopic.cards.length - 1].question += ln;
    }
    return currentTopic;
}
const handleAnswer = (currentTopic, line) => {
    if(!currentTopic) {
        currentTopic = {
            topic: "undefined",
            cards: []
        }
    }
    if(line.startsWith("@@")) {
        let l = line.replace(FLASH_CARD_ANSWER_REGEX, "");
        if(currentTopic.cards[currentTopic.cards.length - 1]) {
            if(currentTopic.cards[currentTopic.cards.length - 1].answer !== undefined) {
                let a = currentTopic.cards[currentTopic.cards.length - 1].answer;
                let ln = a.charAt(a.length - 1) !== ' ' 
                      ? (" " + clearLeadingWhiteSpace(l))
                      : clearLeadingWhiteSpace(l);
                currentTopic.cards[currentTopic.cards.length - 1].answer += ln;
            }
            else currentTopic.cards[currentTopic.cards.length - 1].answer = l;
        }
    } else {
        if(currentTopic.cards[currentTopic.cards.length - 1]) {
            let a = currentTopic.cards[currentTopic.cards.length - 1].answer;
            let ln = a.charAt(a.length - 1) !== ' ' 
                  ? (" " + clearLeadingWhiteSpace(line))
                  : clearLeadingWhiteSpace(line);
            currentTopic.cards[currentTopic.cards.length - 1].answer += ln;
        }
    }
    return currentTopic;
}

const handleTopic = (currentTopic, topic, result) => {
    if(currentTopic) {
        result.push(currentTopic);
    }

    let title = topic[0].substring(1, topic[0].length - 1);
    if(title === ".") {
        title = currentTopic.topic.split(".")[0] || "__notopic__";
    }
    else if(title.startsWith("+")) {
        title = currentTopic.topic + "." + title.substring(1);
    } else if(title.startsWith(".")) {
        title = currentTopic.topic.split(".")[0] + title;
    } else if(title.startsWith("-")) {
        let nth = title.match(/-[0-9]+-/);
        if(nth) {
            let titles = currentTopic.topic.split(".");
            let idx = titles.length - parseInt(nth[0].replaceAll("-", ""));
            let newTitle = "";
            for(let i = 0; i < idx; i++) {
                newTitle += titles[i] + ".";
            }
            newTitle += title.substring(nth[0].length);
            title = newTitle;
        } else {
            let titles = currentTopic.topic.split(".");
            let idx = titles.length - 1;
            let newTitle = "";
            for(let i = 0; i < idx; i++) {
                newTitle += titles[i] + ".";
            }
            newTitle += title.substring(1);
            title = newTitle;
        }
    }

    title = title.replaceAll(/\.+/g, ".");
    currentTopic = {
        topic: title,
        cards: []
    }
    return currentTopic;
}

const mergeResults = (obj) => {
    let combined = {};
    for(let section of obj) {
        if(!combined[section.topic]) combined[section.topic] = section.cards;
        else combined[section.topic] = [...combined[section.topic], ...section.cards];
    }
    return Object.entries(combined).map(([k, v]) => ({topic: k, cards: v}));
}

const FLASH_CARD_FILE_EXTENSION = ".flshcrd";
const FLASH_CARD_TOPIC_REGEX = /^[ \t]*\[.+\]/;
const FLASH_CARD_QUESTION_REGEX = /^[ \t]*\$\$/;
const FLASH_CARD_ANSWER_REGEX = /^[ \t]*@@/;
const FLASH_CARD_COMMENT_REGEX = /^[ \t]*##/;
const FLASH_CARD_END_MODE_REGEX = /^[ \t]*\!\!/;
const cleanResults = (arr) => arr.filter((e) => e.cards.length > 0);
const regexMatch = (line) => ({
    topic: line.match(FLASH_CARD_TOPIC_REGEX), 
    question: line.match(FLASH_CARD_QUESTION_REGEX), 
    answer: line.match(FLASH_CARD_ANSWER_REGEX),
    comment: line.match(FLASH_CARD_COMMENT_REGEX),
    endMode: line.match(FLASH_CARD_END_MODE_REGEX)
});
const clearLeadingWhiteSpace = (str) => str.replaceAll(/^[ \t]+/g, "");

const jsonToFlashCard = (json) => {
    let flashCardString = "";
    for(let file of Object.keys(json)) {
        flashCardString += "## Start: " + file + "\n\n";
        for(let {topic, cards} of json[file]) {
            flashCardString += "[" + topic + "]\n\n";
            let counter = 1;
            for(let {question, answer} of cards) {
                flashCardString += "## [" + topic + "] Flash Card No.: " + counter++ + "\n";
                flashCardString += "?? " + clearLeadingWhiteSpace(question) + "\n>> " + clearLeadingWhiteSpace(answer) + "\n\n";
            }
        }
        flashCardString += "## End: " + file + "\n\n";
    }
    console.log(flashCardString);
    return flashCardString;
}