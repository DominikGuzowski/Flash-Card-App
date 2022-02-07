import sha256 from "sha256";

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
export const download = (filename, text) => {
    let element = document.createElement("a");
    element.setAttribute("href", "data:text/plain;charset=utf-8," + encodeURIComponent(text));
    element.setAttribute("download", filename);

    element.style.display = "none";
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
};

export const readFlashCardFiles = (files, result) => {
    // test();
    if (!files) {
        result?.({});
        return;
    }
    let accumulator = {};
    const fileCount = files.length;
    let currentCount = 0;
    const resultAccumulatorFunction = (partialResult) => {
        currentCount++;
        if (partialResult[Object.keys(partialResult)[0]]) accumulator = { ...accumulator, ...partialResult };
        if (currentCount === fileCount) {
            result?.(accumulator);
        }
    };
    [...files].forEach((file, i) => readFlashCardFile(file, resultAccumulatorFunction, i));
};

export const readFlashCardFile = (FILE, result, index) => {
    if (!FILE.name.endsWith(FLASH_CARD_FILE_EXTENSION)) {
        result?.({});
        return;
    }
    const fileReader = new FileReader();
    fileReader.onloadend = () => {
        result?.({ [index + "_" + FILE.name]: optimizedHashParser(fileReader.result) });
    };
    fileReader.readAsText(FILE);
};

export const parseFlashCard = (flashCard) => {
    let result = [];
    const content = flashCard.replaceAll("\r", "");

    let state = 0;
    let currentTopic = null;
    const lines = content.split("\n");
    let parent = clearLeadingWhiteSpace(lines[0]);
    if (!parent.includes("::")) {
        return null;
    }
    parent = parent.replace(/^[ \t]*::[ \t]*/g, "");
    for (let line of lines) {
        // line = clearLeadingWhiteSpace(line);
        if (line.length === 0) continue;

        let redo = true;
        while (redo) {
            redo = false;
            const {
                topic,
                question,
                answer,
                comment,
                endMode,
                mdTopic,
                inlineQuestion,
                inlineQuestionStart,
                inlineQuestionEnd,
                inlineAnswer,
                inlineAnswerEnd,
                inlineAnswerStart,
            } = regexMatch(line);
            if (comment) continue;
            else if (endMode) state = 0;
            else if (topic) state = 1;
            else if (question) state = 2;
            else if (answer) state = 3;
            else if (mdTopic) state = 4;
            else if (inlineQuestion && state !== 5 && state !== 9) state = 5;
            else if (inlineQuestionStart && state !== 5 && state !== 9) state = 6;
            else if (inlineQuestionEnd && state === 6) state = 7;
            else if (inlineAnswer && state !== 8 && state !== 6) state = 8;
            else if (inlineAnswerStart && state !== 8 && state !== 6) state = 9;
            else if (inlineAnswerEnd && state === 9) state = 10;
            else {
                if (state !== 1 && state !== 2 && state !== 3 && state !== 6 && state !== 9) {
                    state = 0;
                }
            }

            switch (state) {
                case 1: {
                    currentTopic = handleTopic(currentTopic, topic, result); // Updates result on topic change.
                    break;
                }
                case 2: {
                    currentTopic = handleQuestion(currentTopic, line);
                    break;
                }
                case 3: {
                    currentTopic = handleAnswer(currentTopic, line);
                    break;
                }
                case 4: {
                    currentTopic = handleMarkdownTopic(currentTopic, mdTopic, line, result);
                    break;
                }
                case 5: {
                    currentTopic = handleInlineQuestion(currentTopic, inlineQuestion);
                    line = line.substring(line.indexOf(inlineQuestion[0]) + inlineQuestion[0].length);
                    const { inlineAnswer: a1, inlineAnswerStart: a2 } = regexMatch(line);
                    if (a1 || a2) redo = true;
                    else state = 0;

                    break;
                }
                case 6: {
                    currentTopic = handleInlineQuestionStart(currentTopic, line, inlineQuestionStart);
                    break;
                }
                case 7: {
                    currentTopic = handleInlineQuestionEnd(currentTopic, inlineQuestionEnd);
                    line = line.substring(line.indexOf(inlineQuestionEnd[0]) + inlineQuestionEnd[0].length);
                    const { inlineAnswer: a1, inlineAnswerStart: a2 } = regexMatch(line);
                    if (a1 || a2) redo = true;
                    else state = 0;
                    break;
                }
                case 8: {
                    currentTopic = handleInlineAnswer(currentTopic, inlineAnswer);
                    line = line.substring(line.indexOf(inlineAnswer[0]) + inlineAnswer[0].length);
                    const { inlineQuestion: a1, inlineQuestionStart: a2 } = regexMatch(line);
                    if (a1 || a2) redo = true;
                    else state = 0;

                    break;
                }
                case 9: {
                    currentTopic = handleInlineAnswerStart(currentTopic, line, inlineAnswerStart);
                    break;
                }
                case 10: {
                    currentTopic = handleInlineAnswerEnd(currentTopic, inlineAnswerEnd);
                    line = line.substring(line.indexOf(inlineAnswerEnd[0]) + inlineAnswerEnd[0].length);
                    const { inlineQuestion: a1, inlineQuestionStart: a2 } = regexMatch(line);
                    if (a1 || a2) redo = true;
                    else state = 0;
                    break;
                }
                default:
                    break;
            }
        }
    }
    if (currentTopic) {
        if (currentTopic.cards.length - 1 >= 0) {
            currentTopic.cards[currentTopic.cards.length - 1].id = sha256(
                JSON.stringify(currentTopic.cards[currentTopic.cards.length - 1])
            );
            result.push(currentTopic);
        }
    }
    appendParent(result, parent);
    return cleanResults(mergeResults(result));
};

const appendParent = (result, parent) => {
    for (let i = 0; i < result.length; i++) {
        result[i].topic = parent + DELIMITER + result[i].topic;
        for (let j = 0; j < result[i].cards.length; j++) {
            result[i].cards[j].topic = parent + DELIMITER + result[i].cards[j].topic;
        }
    }
};

const handleInlineAnswer = (currentTopic, answer) => {
    const formattedAnswer = answer[0].replaceAll(/@!/g, "").replaceAll(/!@/g, "");
    if (
        !currentTopic.cards[currentTopic.cards.length - 1].answer &&
        currentTopic.cards[currentTopic.cards.length - 1].question
    ) {
        currentTopic.cards[currentTopic.cards.length - 1].answer = formattedAnswer;
    }
    return currentTopic;
};

const handleInlineAnswerStart = (currentTopic, line, answer) => {
    if (answer) {
        const formattedAnswer = answer[0].replaceAll(/@!/g, "");
        if (
            !currentTopic.cards[currentTopic.cards.length - 1].answer &&
            currentTopic.cards[currentTopic.cards.length - 1].question
        ) {
            currentTopic.cards[currentTopic.cards.length - 1].answer = formattedAnswer;
        }
    } else {
        const currentAnswer = currentTopic.cards[currentTopic.cards.length - 1].answer;
        // const endSpace = currentAnswer.match(/.*[ \t]$/);
        const updatedAnswer = currentAnswer + "\n" + line;
        if (
            !currentTopic.cards[currentTopic.cards.length - 1].answer &&
            currentTopic.cards[currentTopic.cards.length - 1].question
        ) {
            currentTopic.cards[currentTopic.cards.length - 1].answer = updatedAnswer;
        }
    }
    return currentTopic;
};

const handleInlineAnswerEnd = (currentTopic, answer) => {
    const formattedAnswer = answer[0].replace(/!@/g, "");
    const currentAnswer = currentTopic.cards[currentTopic.cards.length - 1].answer;
    if (!currentAnswer) return currentTopic;
    const updatedAnswer = currentAnswer + "\n" + formattedAnswer;

    if (
        currentTopic.cards[currentTopic.cards.length - 1].answer &&
        currentTopic.cards[currentTopic.cards.length - 1].question
    ) {
        currentTopic.cards[currentTopic.cards.length - 1].answer = updatedAnswer;
    }
    return currentTopic;
};

const handleInlineQuestionEnd = (currentTopic, question) => {
    if (
        currentTopic.cards.length > 0 &&
        currentTopic.cards[currentTopic.cards.length - 1].answer &&
        currentTopic.cards[currentTopic.cards.length - 1].question
    ) {
        currentTopic.cards[currentTopic.cards.length - 1].id = sha256(
            JSON.stringify(currentTopic.cards[currentTopic.cards.length - 1])
        );
    }
    const formattedQuestion = question[0].replace(/!\?/g, "");
    const currentQuestion = currentTopic.cards[currentTopic.cards.length - 1].question;
    const updatedQuestion = currentQuestion + "\n" + formattedQuestion;

    currentTopic.cards[currentTopic.cards.length - 1].question = updatedQuestion;
    return currentTopic;
};

const handleInlineQuestionStart = (currentTopic, line, question) => {
    if (
        currentTopic.cards.length > 0 &&
        currentTopic.cards[currentTopic.cards.length - 1].answer &&
        currentTopic.cards[currentTopic.cards.length - 1].question
    ) {
        currentTopic.cards[currentTopic.cards.length - 1].id = sha256(
            JSON.stringify(currentTopic.cards[currentTopic.cards.length - 1])
        );
    }
    if (question) {
        const formattedQuestion = question[0].replaceAll(/\?!/g, "");
        currentTopic.cards.push({
            question: formattedQuestion,
            topic: currentTopic.topic,
        });
    } else {
        const currentQuestion = currentTopic.cards[currentTopic.cards.length - 1].question;
        const updatedQuestion = currentQuestion + "\n" + line;
        currentTopic.cards[currentTopic.cards.length - 1].question = updatedQuestion;
    }
    return currentTopic;
};

const handleInlineQuestion = (currentTopic, question) => {
    const formattedQuestion = question[0].replaceAll(/\?!/g, "").replaceAll(/!\?/g, "");
    if (
        currentTopic.cards.length > 0 &&
        currentTopic.cards[currentTopic.cards.length - 1].answer &&
        currentTopic.cards[currentTopic.cards.length - 1].question
    ) {
        currentTopic.cards[currentTopic.cards.length - 1].id = sha256(
            JSON.stringify(currentTopic.cards[currentTopic.cards.length - 1])
        );
    }
    currentTopic.cards.push({
        question: formattedQuestion,
        topic: currentTopic.topic,
    });
    return currentTopic;
};

const handleQuestion = (currentTopic, line) => {
    if (!currentTopic) {
        currentTopic = {
            topic: "undefined",
            cards: [],
        };
    }
    if (line.startsWith("??")) {
        let l = line.replace(FLASH_CARD_QUESTION_REGEX, "");
        if (currentTopic.cards.length === 0) {
            currentTopic.cards.push({ question: l, topic: currentTopic.topic });
        } else if (
            currentTopic.cards[currentTopic.cards.length - 1].answer &&
            currentTopic.cards[currentTopic.cards.length - 1].question
        ) {
            currentTopic.cards[currentTopic.cards.length - 1].id = sha256(
                JSON.stringify(currentTopic.cards[currentTopic.cards.length - 1])
            );
            currentTopic.cards.push({ question: l, topic: currentTopic.topic });
        } else {
            // let q = currentTopic.cards[currentTopic.cards.length - 1].question;
            // let ln = q.charAt(q.length - 1) !== " " ? " " + clearLeadingWhiteSpace(l) : clearLeadingWhiteSpace(l);
            currentTopic.cards[currentTopic.cards.length - 1].question += "\n" + l;
        }
    } else {
        // let q = currentTopic.cards[currentTopic.cards.length - 1].question;
        // let ln = q.charAt(q.length - 1) !== " " ? " " + clearLeadingWhiteSpace(line) : clearLeadingWhiteSpace(line);
        currentTopic.cards[currentTopic.cards.length - 1].question += "\n" + line;
    }
    return currentTopic;
};

const handleAnswer = (currentTopic, line) => {
    if (!currentTopic) {
        currentTopic = {
            topic: "undefined",
            cards: [],
        };
    }
    if (line.startsWith("@@")) {
        let l = line.replace(FLASH_CARD_ANSWER_REGEX, "");
        if (currentTopic.cards[currentTopic.cards.length - 1]) {
            if (currentTopic.cards[currentTopic.cards.length - 1].answer !== undefined) {
                // let a = currentTopic.cards[currentTopic.cards.length - 1].answer;
                // let ln = a.charAt(a.length - 1) !== " " ? " " + clearLeadingWhiteSpace(l) : clearLeadingWhiteSpace(l);
                currentTopic.cards[currentTopic.cards.length - 1].answer += "\n" + l;
            } else currentTopic.cards[currentTopic.cards.length - 1].answer = l;
        }
    } else {
        if (currentTopic.cards[currentTopic.cards.length - 1]) {
            // let a = currentTopic.cards[currentTopic.cards.length - 1].answer;
            // let ln = a.charAt(a.length - 1) !== " " ? " " + clearLeadingWhiteSpace(line) : clearLeadingWhiteSpace(line);
            currentTopic.cards[currentTopic.cards.length - 1].answer += "\n" + line;
        }
    }
    return currentTopic;
};

const handleTopic = (currentTopic, topic, result) => {
    if (currentTopic) {
        if (
            currentTopic.cards.length > 0 &&
            currentTopic.cards[currentTopic.cards.length - 1].answer &&
            currentTopic.cards[currentTopic.cards.length - 1].question
        ) {
            currentTopic.cards[currentTopic.cards.length - 1].id = sha256(
                JSON.stringify(currentTopic.cards[currentTopic.cards.length - 1])
            );
        }
        result.push(currentTopic);
    }

    let title = topic[0].substring(1, topic[0].length - 1);
    if (title === ".") {
        title = currentTopic.topic.split(".")[0] || "__notopic__";
    } else if (title.startsWith("+")) {
        title = currentTopic.topic + DELIMITER + title.substring(1);
    } else if (title.startsWith(".")) {
        title = currentTopic.topic.split(DELIMITER)[0] + title;
    } else if (title.startsWith("-")) {
        let nth = title.match(/-[0-9]+-/);
        if (nth) {
            let titles = currentTopic.topic.split(DELIMITER);
            let idx = titles.length - parseInt(nth[0].replaceAll("-", ""));
            let newTitle = "";
            for (let i = 0; i < idx; i++) {
                newTitle += titles[i] + DELIMITER;
            }
            newTitle += title.substring(nth[0].length);
            title = newTitle;
        } else {
            let titles = currentTopic.topic.split(DELIMITER);
            let idx = titles.length - 1;
            let newTitle = "";
            for (let i = 0; i < idx; i++) {
                newTitle += titles[i] + DELIMITER;
            }
            newTitle += title.substring(1);
            title = newTitle;
        }
    }

    // title = title.replaceAll(/\.+/g, ".");
    currentTopic = {
        topic: title,
        cards: [],
    };
    return currentTopic;
};

const handleMarkdownTopic = (currentTopic, topic, line, result) => {
    if (currentTopic) {
        if (
            currentTopic.cards.length > 0 &&
            currentTopic.cards[currentTopic.cards.length - 1].answer &&
            currentTopic.cards[currentTopic.cards.length - 1].question
        ) {
            currentTopic.cards[currentTopic.cards.length - 1].id = sha256(
                JSON.stringify(currentTopic.cards[currentTopic.cards.length - 1])
            );
        }
        result.push(currentTopic);
    }
    let recentMostTopic = (currentTopic?.topic || "").split(DELIMITER);
    if (clearLeadingWhiteSpace(topic[0]).startsWith("##+")) {
        recentMostTopic.push(topic.input.replace(topic[0], ""));
        currentTopic = {
            topic: recentMostTopic.join(DELIMITER),
            cards: [],
        };
    } else {
        let mode = topic[0].replaceAll(/[^#]/g, "").length - 1;
        let inputTopic = topic.input.replace(topic[0], "");
        let newTopic = [];
        if (recentMostTopic.length <= mode) {
            for (let str of recentMostTopic) {
                if (str.length !== 0) newTopic.push(str);
            }
            while (newTopic.length < mode) {
                newTopic.push("__notopic__");
            }
            newTopic.push(inputTopic);
        } else {
            while (newTopic.length < mode) {
                newTopic.push(recentMostTopic.shift());
            }
            newTopic.push(inputTopic);
        }
        currentTopic = {
            topic: newTopic.join(DELIMITER),
            cards: [],
        };
    }
    return currentTopic;
};

const mergeResults = (obj) => {
    let combined = {};
    for (let section of obj) {
        if (!combined[section.topic])
            combined[section.topic] = section.cards.filter(({ question, answer }) => question && answer);
        else
            combined[section.topic] = [
                ...combined[section.topic],
                ...section.cards.filter(({ question, answer }) => question && answer),
            ];
    }
    for (let topic of Object.keys(combined)) {
        for (let i = 0; i < combined[topic].length; i++) {
            combined[topic][i].question = clearLeadingWhiteSpace(combined[topic][i].question);
            combined[topic][i].topic = clearLeadingWhiteSpace(combined[topic][i].topic);
            combined[topic][i].answer = clearLeadingWhiteSpace(combined[topic][i].answer);
            combined[topic][i].question = clearTrailingWhiteSpace(combined[topic][i].question);
            combined[topic][i].topic = clearTrailingWhiteSpace(combined[topic][i].topic);
            combined[topic][i].answer = clearTrailingWhiteSpace(combined[topic][i].answer);
        }
    }
    return Object.entries(combined).map(([k, v]) => ({ topic: k, cards: v }));
};

const FLASH_CARD_FILE_EXTENSION = ".md";
const FLASH_CARD_TOPIC_REGEX = /^[ \t]*\[.+\]/;
const FLASH_CARD_QUESTION_REGEX = /^[ \t]*\?\?/;
const FLASH_CARD_ANSWER_REGEX = /^[ \t]*@@/;
const FLASH_CARD_COMMENT_REGEX = /^[ \t]*--/;
const FLASH_CARD_END_MODE_REGEX = /^[ \t]*!!/;
const FLASH_CARD_MARKDOWN_TOPIC_REGEX = /^[ \t]*(##[+][ \t]|#{1,6}[ \t])/;
const FLASH_CARD_INLINE_QUESTION_REGEX = /[ \t]*\?![^(!?)]*!\?/;
const FLASH_CARD_INLINE_QUESTION_START_REGEX = /[ \t]*\?![^(!?)]*/;
const FLASH_CARD_INLINE_QUESTION_END_REGEX = /[ \t]*[^(?!)]*!\?/;
const FLASH_CARD_INLINE_ANSWER_REGEX = /[ \t]*@![^(!@)]*!@/;
const FLASH_CARD_INLINE_ANSWER_START_REGEX = /[ \t]*@![^(!@)]*/;
const FLASH_CARD_INLINE_ANSWER_END_REGEX = /[ \t]*[^(@!)]*!@/;
const DELIMITER = "*:-:*";

const cleanResults = (arr) => arr.filter((e) => e.cards.length > 0);
const regexMatch = (line) => ({
    topic: line.match(FLASH_CARD_TOPIC_REGEX),
    question: line.match(FLASH_CARD_QUESTION_REGEX),
    answer: line.match(FLASH_CARD_ANSWER_REGEX),
    comment: line.match(FLASH_CARD_COMMENT_REGEX),
    endMode: line.match(FLASH_CARD_END_MODE_REGEX),
    mdTopic: line.match(FLASH_CARD_MARKDOWN_TOPIC_REGEX),
    inlineQuestion: line.match(FLASH_CARD_INLINE_QUESTION_REGEX),
    inlineQuestionStart: line.match(FLASH_CARD_INLINE_QUESTION_START_REGEX),
    inlineQuestionEnd: line.match(FLASH_CARD_INLINE_QUESTION_END_REGEX),
    inlineAnswer: line.match(FLASH_CARD_INLINE_ANSWER_REGEX),
    inlineAnswerStart: line.match(FLASH_CARD_INLINE_ANSWER_START_REGEX),
    inlineAnswerEnd: line.match(FLASH_CARD_INLINE_ANSWER_END_REGEX),
});
const clearLeadingWhiteSpace = (str) => str.replace(/^[ \t\n\r]+/g, "");

const jsonToFlashCard = (json) => {
    let flashCardString = "";
    for (let file of Object.keys(json)) {
        flashCardString += "## Start: " + file + "\n\n";
        for (let { topic, cards } of json[file]) {
            flashCardString += "[" + topic + "]\n\n";
            let counter = 1;
            for (let { question, answer } of cards) {
                flashCardString += "## [" + topic + "] Flash Card No.: " + counter++ + "\n";
                flashCardString +=
                    "?? " + clearLeadingWhiteSpace(question) + "\n>> " + clearLeadingWhiteSpace(answer) + "\n\n";
            }
        }
        flashCardString += "## End: " + file + "\n\n";
    }
    return flashCardString;
};

const clearTrailingWhiteSpace = (string) => reverseString(clearLeadingWhiteSpace(reverseString(string)));

const reverseString = (str) => str.split("").reverse().join("");

export const treeifyCards = (cards) => {
    let tree = { root: {} };
    for (let file of Object.keys(cards)) {
        for (let set of cards[file]) {
            treeify(tree, set);
        }
    }
    return tree.root;
};

const treeify = (tree, set) => {
    let topics = set.topic.replaceAll("__notopic__" + DELIMITER, "").split(DELIMITER);
    let root = tree.root;
    for (let topic of topics) {
        if (!root[topic]) {
            root[topic] = {};
        }
        root = root[topic];
    }
    root.__flashcards = set.cards;
};
const CARD_RGX =
    /(?<=\s*#Q\s+)([\S\s]+?\s+#A\s+[\S\s]+?)((?=\s+#Q\s+)|(?=\s+#E\s+)|(?=\s*$)|(?=\s*#{1,6}\s+))|(\B#{1,6}\s+[\S \t]+?(?=\n))/g;
const HEADERS = /(?<=\s*)#{1,6}\s+[\S \t]+?(?=\n)/g;
const HEADER_RGX = /^#{1,6}(?=\s+[\S \t]+$)/g;
const PARENT = /::.*?(?=\n)/g;

const optimizedHashParser = (str) => {
    let parent = str.match(PARENT)?.[0];
    if (!parent) return [];
    parent = parent.replaceAll(/:{2}\s*/g, "");
    let res = [];
    const matches = str.replaceAll(/[ ]*\n/g, "\n").match(CARD_RGX);
    console.log(matches);
    if (!matches) return [];
    let current = {
        topic: "",
        cards: [],
    };
    for (const m of matches) {
        const header = m.match(HEADER_RGX)?.[0];
        if (header) {
            if (current.cards.length > 0) {
                res.push({ ...current });
                current.cards = [];
            }
            const position = header.length - 1;
            let topics = current.topic.split(DELIMITER);
            if (topics.length > 0 && topics[0].length === 0) topics.shift();
            while (topics.length < position) {
                topics.push("__notopic__");
            }
            topics = topics.slice(0, position);
            topics.push(clearLeadingWhiteSpace(m.replaceAll(HEADER_RGX, "")));
            current.topic = topics.join(DELIMITER);
        } else if (current.topic.length > 0) {
            const [question, answer] = m.split(/\s+#A\s+/g);
            current.cards.push({ question, answer });
        }
    }
    res.push({ ...current });
    for (let i = 0; i < res.length; i++) {
        let topics = res[i].topic.split(DELIMITER);
        if (topics.length === 1 && topics[0].length === 0) topics = [];
        res[i].topic = [parent, ...topics].join(DELIMITER);

        for (let j = 0; j < res[i].cards.length; j++) {
            res[i].cards[j].topic = res[i].topic;
            res[i].cards[j].id = sha256(JSON.stringify(res[i].cards[j]));
        }
    }
    return cleanResults(mergeResults(res));
};
