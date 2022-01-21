import sha256 from "sha256";
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
    let element = document.createElement("a");
    element.setAttribute("href", "data:text/plain;charset=utf-8," + encodeURIComponent(text));
    element.setAttribute("download", filename);

    element.style.display = "none";
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
};

const btn = document.getElementById("download-btn");
let globalRes = {};
// btn.onclick = (e) => {
//     download("flashcards.json", JSON.stringify(globalRes, null, 4));
// }

// fileInput.onchange = (e) => {
//     readFlashCardFiles(e.target.files, jsonToFlashCard);
// };

export const readFlashCardFiles = (files, result) => {
    if (!files) {
        result?.({});
        return;
    }
    id = 0;
    let accumulator = {};
    const fileCount = files.length;
    let currentCount = 0;
    const resultAccumulatorFunction = (partialResult) => {
        accumulator = { ...accumulator, ...partialResult };
        currentCount++;
        if (currentCount === fileCount) result?.(accumulator);
    };
    [...files].forEach((file) => readFlashCardFile(file, resultAccumulatorFunction));
};

export const readFlashCardFile = (FILE, result) => {
    if (!FILE.name.endsWith(FLASH_CARD_FILE_EXTENSION)) {
        result?.({});
        return;
    }
    const fileReader = new FileReader();
    fileReader.onloadend = () => {
        result?.({ [FILE.name]: parseFlashCard(fileReader.result) });
    };
    fileReader.readAsText(FILE);
};
var id = 0;
export const parseFlashCard = (flashCard) => {
    let result = [];
    const content = flashCard.replaceAll("\r", "");

    let state = 0;
    let currentTopic = null;
    const lines = content.split("\n");
    for (let line of lines) {
        line = clearLeadingWhiteSpace(line);
        if (line.length === 0) continue;

        // console.log(matchMode(line));
        let redo = true;
        while (redo) {
            // console.log("DOING", line);
            // console.warn("State:", state);
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
            // console.error("State:", state);

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
                    // console.log(inlineQuestion);
                    line = line.substring(line.indexOf(inlineQuestion[0]) + inlineQuestion[0].length);
                    const { inlineAnswer: a1, inlineAnswerStart: a2 } = regexMatch(line);
                    // console.log(line, a1, a2);
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
            // console.log("REDO", redo);
            // console.log(currentTopic?.cards[currentTopic.cards.length - 1]);
        }
    }
    if (currentTopic) result.push(currentTopic);
    return cleanResults(mergeResults(result));
};

const handleInlineAnswer = (currentTopic, answer) => {
    const formattedAnswer = answer[0].replaceAll(/@![ \t]*/g, "").replaceAll(/[ \t]*!@/g, "");
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
        const formattedAnswer = answer[0].replaceAll(/@![ \t]*/g, "");
        if (
            !currentTopic.cards[currentTopic.cards.length - 1].answer &&
            currentTopic.cards[currentTopic.cards.length - 1].question
        ) {
            currentTopic.cards[currentTopic.cards.length - 1].answer = formattedAnswer;
        }
    } else {
        const currentAnswer = currentTopic.cards[currentTopic.cards.length - 1].answer;
        const endSpace = currentAnswer.match(/.*[ \t]$/);
        const updatedAnswer = endSpace
            ? currentAnswer + clearLeadingWhiteSpace(line)
            : currentAnswer + " " + clearLeadingWhiteSpace(line);
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
    const formattedAnswer = answer[0].replace(/[ \t]*!@/g, "");
    const currentAnswer = currentTopic.cards[currentTopic.cards.length - 1].answer;
    if (!currentAnswer) return currentTopic;
    const endSpace = currentAnswer.match(/.*[ \t]$/);
    const updatedAnswer = endSpace
        ? currentAnswer + clearLeadingWhiteSpace(formattedAnswer)
        : currentAnswer + " " + clearLeadingWhiteSpace(formattedAnswer);

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
    const formattedQuestion = clearLeadingWhiteSpace(question[0].replace(/[ \t]*!\$/g, ""));
    const currentQuestion = currentTopic.cards[currentTopic.cards.length - 1].question;
    const endSpace = currentQuestion.match(/.*[ \t]$/);
    const updatedQuestion = endSpace
        ? currentQuestion + clearLeadingWhiteSpace(formattedQuestion)
        : currentQuestion + " " + clearLeadingWhiteSpace(formattedQuestion);

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
        const formattedQuestion = clearLeadingWhiteSpace(question[0].replaceAll(/\$![ \t]*/g, ""));
        currentTopic.cards.push({
            question: formattedQuestion,
            topic: currentTopic.topic,
        });
    } else {
        const currentQuestion = currentTopic.cards[currentTopic.cards.length - 1].question;
        const endSpace = currentQuestion.match(/.*[ \t]$/);
        const updatedQuestion = endSpace
            ? currentQuestion + clearLeadingWhiteSpace(line)
            : currentQuestion + " " + clearLeadingWhiteSpace(line);
        currentTopic.cards[currentTopic.cards.length - 1].question = updatedQuestion;
    }
    return currentTopic;
};

const handleInlineQuestion = (currentTopic, question) => {
    const formattedQuestion = clearLeadingWhiteSpace(
        question[0].replaceAll(/\$![ \t]*/g, "").replaceAll(/[ \t]*!\$/g, "")
    );
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
    if (line.startsWith("$$")) {
        let l = clearLeadingWhiteSpace(line.replace(FLASH_CARD_QUESTION_REGEX, ""));
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
            let q = currentTopic.cards[currentTopic.cards.length - 1].question;
            let ln = q.charAt(q.length - 1) !== " " ? " " + clearLeadingWhiteSpace(l) : clearLeadingWhiteSpace(l);
            currentTopic.cards[currentTopic.cards.length - 1].question += ln;
        }
    } else {
        let q = currentTopic.cards[currentTopic.cards.length - 1].question;
        let ln = q.charAt(q.length - 1) !== " " ? " " + clearLeadingWhiteSpace(line) : clearLeadingWhiteSpace(line);
        currentTopic.cards[currentTopic.cards.length - 1].question += ln;
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
        let l = clearLeadingWhiteSpace(line.replace(FLASH_CARD_ANSWER_REGEX, ""));
        if (currentTopic.cards[currentTopic.cards.length - 1]) {
            if (currentTopic.cards[currentTopic.cards.length - 1].answer !== undefined) {
                let a = currentTopic.cards[currentTopic.cards.length - 1].answer;
                let ln = a.charAt(a.length - 1) !== " " ? " " + clearLeadingWhiteSpace(l) : clearLeadingWhiteSpace(l);
                currentTopic.cards[currentTopic.cards.length - 1].answer += ln;
            } else currentTopic.cards[currentTopic.cards.length - 1].answer = l;
        }
    } else {
        if (currentTopic.cards[currentTopic.cards.length - 1]) {
            let a = currentTopic.cards[currentTopic.cards.length - 1].answer;
            let ln = a.charAt(a.length - 1) !== " " ? " " + clearLeadingWhiteSpace(line) : clearLeadingWhiteSpace(line);
            currentTopic.cards[currentTopic.cards.length - 1].answer += ln;
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
        title = currentTopic.topic + "." + title.substring(1);
    } else if (title.startsWith(".")) {
        title = currentTopic.topic.split(".")[0] + title;
    } else if (title.startsWith("-")) {
        let nth = title.match(/-[0-9]+-/);
        if (nth) {
            let titles = currentTopic.topic.split(".");
            let idx = titles.length - parseInt(nth[0].replaceAll("-", ""));
            let newTitle = "";
            for (let i = 0; i < idx; i++) {
                newTitle += titles[i] + ".";
            }
            newTitle += title.substring(nth[0].length);
            title = newTitle;
        } else {
            let titles = currentTopic.topic.split(".");
            let idx = titles.length - 1;
            let newTitle = "";
            for (let i = 0; i < idx; i++) {
                newTitle += titles[i] + ".";
            }
            newTitle += title.substring(1);
            title = newTitle;
        }
    }

    title = title.replaceAll(/\.+/g, ".");
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
    let recentMostTopic = (currentTopic?.topic || "").split(".");
    if (clearLeadingWhiteSpace(topic[0]).startsWith("##+")) {
        recentMostTopic.push(topic.input.replace(topic[0], ""));
        currentTopic = {
            topic: recentMostTopic.join("."),
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
            topic: newTopic.join("."),
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
const FLASH_CARD_QUESTION_REGEX = /^[ \t]*\$\$/;
const FLASH_CARD_ANSWER_REGEX = /^[ \t]*@@/;
const FLASH_CARD_COMMENT_REGEX = /^[ \t]*--/;
const FLASH_CARD_END_MODE_REGEX = /^[ \t]*!!/;
const FLASH_CARD_MARKDOWN_TOPIC_REGEX = /^[ \t]*(##[+][ \t]|#{1,6}[ \t])/;
const FLASH_CARD_INLINE_QUESTION_REGEX = /[ \t]*\$![^(!$)]*!\$/;
const FLASH_CARD_INLINE_QUESTION_START_REGEX = /[ \t]*\$![^(!$)]*/;
const FLASH_CARD_INLINE_QUESTION_END_REGEX = /[ \t]*[^($!)]*!\$/;
const FLASH_CARD_INLINE_ANSWER_REGEX = /[ \t]*@![^(!@)]*!@/;
const FLASH_CARD_INLINE_ANSWER_START_REGEX = /[ \t]*@![^(!@)]*/;
const FLASH_CARD_INLINE_ANSWER_END_REGEX = /[ \t]*[^(@!)]*!@/;

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
const clearLeadingWhiteSpace = (str) => str.replaceAll(/^[ \t]+/g, "");

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
    console.log(flashCardString);
    return flashCardString;
};

const simpleRegexMatch = (startSymbol, endSymbol, string, options = {}) => {
    let { mustStartAt = null, mustEndAt = null, ignoreTrailingWhiteSpace = false } = options;
    if (ignoreTrailingWhiteSpace) string = clearTrailingWhiteSpace(string);
    const start = string.indexOf(startSymbol);
    if (mustStartAt !== null && mustStartAt !== start) return null;
    if (start === -1) return null;
    const end = string.indexOf(endSymbol, start);
    if (end === -1) return string.substring(start);
    console.log(end, string.length - 1 - mustEndAt + (endSymbol.length - 1));
    if (mustEndAt !== null && end !== string.length - 1 - mustEndAt + (endSymbol.length - 1)) return null;
    return string.substring(start, end + endSymbol.length);
};

const matchMode = (line) => ({
    bracketTopic: simpleRegexMatch("[", "]", line, {
        mustEndAt: 0,
        ignoreTrailingWhiteSpace: true,
    }),
    mdTopic1: simpleRegexMatch("# ", null, line, {
        mustStartAt: 0,
        mustEndAt: 0,
        ignoreTrailingWhiteSpace: true,
    }),
    mdTopic2: simpleRegexMatch("## ", null, line, {
        mustStartAt: 0,
        mustEndAt: 0,
        ignoreTrailingWhiteSpace: true,
    }),
    mdTopic3: simpleRegexMatch("### ", null, line, {
        mustStartAt: 0,
        mustEndAt: 0,
        ignoreTrailingWhiteSpace: true,
    }),
    mdTopic4: simpleRegexMatch("#### ", null, line, {
        mustStartAt: 0,
        mustEndAt: 0,
        ignoreTrailingWhiteSpace: true,
    }),
    mdTopic5: simpleRegexMatch("##### ", null, line, {
        mustStartAt: 0,
        mustEndAt: 0,
        ignoreTrailingWhiteSpace: true,
    }),
    mdTopic6: simpleRegexMatch("###### ", null, line, {
        mustStartAt: 0,
        mustEndAt: 0,
        ignoreTrailingWhiteSpace: true,
    }),
});

const clearTrailingWhiteSpace = (string) => reverseString(clearLeadingWhiteSpace(reverseString(string)));

const reverseString = (str) => str.split("").reverse().join("");
