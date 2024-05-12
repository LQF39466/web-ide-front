import {Token, LinkedListNode, LinkedList} from "./types";

const matchPattern = (pattern: RegExp, pos: number, text: string, lookbehind: boolean): RegExpExecArray | null => {
    pattern.lastIndex = pos;
    let match = pattern.exec(text);
    if (match && lookbehind && match[1]) {
        // change the match to remove the text matched by the Prism lookbehind group
        let lookbehindLength = match[1].length;
        match.index += lookbehindLength;
        match[0] = match[0].slice(lookbehindLength);
    }
    return match;
}

/**
 * @param {string} text
 * @param {LinkedList<string | Token>} tokenList
 * @param {any} grammar
 * @param {LinkedListNode<string | Token>} startNode
 * @param {number} startPos
 * @param {RematchOptions} [rematch]
 * @returns {void}
 * @private
 *
 * @typedef RematchOptions
 * @property {string} cause
 * @property {number} reach
 */
function matchGrammar(text: string, tokenList: LinkedList<string | Token>, grammar: any, startNode: any, startPos: any, rematch: any) {
    for (var token in grammar) {
        if (!grammar.hasOwnProperty(token) || !grammar[token]) {
            continue;
        }

        var patterns = grammar[token];
        patterns = Array.isArray(patterns) ? patterns : [patterns];

        for (var j = 0; j < patterns.length; ++j) {
            if (rematch && rematch.cause == token + ',' + j) {
                return;
            }

            var patternObj = patterns[j];
            var inside = patternObj.inside;
            var lookbehind = !!patternObj.lookbehind;
            var greedy = !!patternObj.greedy;
            var alias = patternObj.alias;

            if (greedy && !patternObj.pattern.global) {
                // Without the global flag, lastIndex won't work
                var flags = patternObj.pattern.toString().match(/[imsuy]*$/)[0];
                patternObj.pattern = RegExp(patternObj.pattern.source, flags + 'g');
            }

            /** @type {RegExp} */
            var pattern = patternObj.pattern || patternObj;

            for ( // iterate the token list and keep track of the current token/string position
                var currentNode = startNode.next, pos = startPos;
                currentNode !== tokenList.tail;
                pos += currentNode.value.length, currentNode = currentNode.next
            ) {

                if (rematch && pos >= rematch.reach) {
                    break;
                }

                var str = currentNode.value;

                if (tokenList.length > text.length) {
                    // Something went terribly wrong, ABORT, ABORT!
                    return;
                }

                if (str instanceof Token) {
                    continue;
                }

                var removeCount = 1; // this is the to parameter of removeBetween
                var match;

                if (greedy) {
                    match = matchPattern(pattern, pos, text, lookbehind);
                    if (!match || match.index >= text.length) {
                        break;
                    }

                    var from = match.index;
                    var to = match.index + match[0].length;
                    var p = pos;

                    // find the node that contains the match
                    p += currentNode.value.length;
                    while (from >= p) {
                        currentNode = currentNode.next;
                        p += currentNode.value.length;
                    }
                    // adjust pos (and p)
                    p -= currentNode.value.length;
                    pos = p;

                    // the current node is a Token, then the match starts inside another Token, which is invalid
                    if (currentNode.value instanceof Token) {
                        continue;
                    }

                    // find the last node which is affected by this match
                    for (
                        var k = currentNode;
                        k !== tokenList.tail && (p < to || typeof k.value === 'string');
                        k = k.next
                    ) {
                        removeCount++;
                        p += k.value.length;
                    }
                    removeCount--;

                    // replace with the new match
                    str = text.slice(pos, p);
                    match.index -= pos;
                } else {
                    match = matchPattern(pattern, 0, str, lookbehind);
                    if (!match) {
                        continue;
                    }
                }

                // eslint-disable-next-line no-redeclare
                var from = match.index;
                var matchStr = match[0];
                var before = str.slice(0, from);
                var after = str.slice(from + matchStr.length);

                var reach = pos + str.length;
                if (rematch && reach > rematch.reach) {
                    rematch.reach = reach;
                }

                var removeFrom = currentNode.prev;

                if (before) {
                    removeFrom = tokenList.addAfter(removeFrom, before);
                    pos += before.length;
                }

                tokenList.removeRange(removeFrom, removeCount);

                var wrapped = new Token(token, inside ? tokenize(matchStr, inside) : matchStr, alias, matchStr);
                currentNode = tokenList.addAfter(removeFrom, wrapped);

                if (after) {
                    tokenList.addAfter(currentNode, after);
                }

                if (removeCount > 1) {
                    // at least one Token object was removed, so we have to do some rematching
                    // this can only happen if the current pattern is greedy

                    /** @type {RematchOptions} */
                    var nestedRematch = {
                        cause: token + ',' + j,
                        reach: reach
                    };
                    matchGrammar(text, tokenList, grammar, currentNode.prev, pos, nestedRematch);

                    // the reach might have been extended because of the rematching
                    if (rematch && nestedRematch.reach > rematch.reach) {
                        rematch.reach = nestedRematch.reach;
                    }
                }
            }
        }
    }
}

function tokenize (text: string, grammar: any) {
    const rest = grammar.rest;
    if (rest) {
        for (const token in rest) {
            grammar[token] = rest[token];
        }
        delete grammar.rest;
    }

    const tokenList: LinkedList<string | Token> = new LinkedList();
    tokenList.addAfter(tokenList.head, text);

    matchGrammar(text, tokenList, grammar, tokenList.head, 0, null);

    return tokenList.toArray();
}

export {tokenize}