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


function matchGrammar(text: string, tokenList: LinkedList<string | Token>, grammar: any, startNode: LinkedListNode<string | Token>, startPos: number, rematch?: number) {
    let from;
    for (let token in grammar) {
        if (!grammar.hasOwnProperty(token) || !grammar[token]) {
            continue;
        }

        let patterns = grammar[token];
        patterns = Array.isArray(patterns) ? patterns : [patterns];

        for (let j = 0; j < patterns.length; ++j) {
            const patternObj = patterns[j];
            const inside = patternObj.inside;
            const lookbehind = !!patternObj.lookbehind;
            const greedy = !!patternObj.greedy;
            const alias = patternObj.alias;

            if (greedy && !patternObj.pattern.global) { //Add global flag if not exist in pattern
                const flags = patternObj.pattern.toString().match(/[imsuy]*$/)[0];
                patternObj.pattern = RegExp(patternObj.pattern.source, flags + 'g');
            }

            const pattern: RegExp = patternObj.pattern || patternObj;

            for ( // iterate the token list and keep track of the current token/string position
                let currentNode = startNode.next, pos = startPos;
                currentNode !== tokenList.tail;
            ) {
                if(currentNode === null || currentNode.value === null) break
                let str = currentNode.value;

                if (tokenList.length > text.length) {   // Something went terribly wrong, ABORT!
                    return;
                }

                if (str instanceof Token) {
                    continue;
                }

                let removeCount = 1, match; // this is the to parameter of removeBetween

                if (greedy) {
                    match = matchPattern(pattern, pos, text, lookbehind);
                    if (!match || match.index >= text.length) {
                        break;
                    }

                    from = match.index;
                    const to = match.index + match[0].length;
                    let p = pos;

                    // find the node that contains the match
                    p += currentNode.value.length;
                    while (from >= p) {
                        if(currentNode.next === null) break;
                        currentNode = currentNode.next;
                        if(currentNode.value === null) break;
                        p += currentNode.value.length;
                    }
                    // adjust pos (and p)
                    if(currentNode.value === null) continue;
                    p -= currentNode.value.length;
                    pos = p;

                    // the current node is a Token, then the match starts inside another Token, which is invalid
                    if (currentNode.value instanceof Token) {
                        continue;
                    }

                    // find the last node which is affected by this match
                    for (
                        let k = currentNode;
                        k !== tokenList.tail && (p < to || typeof k.value === 'string');
                        k = k.next || tokenList.tail
                    ) {
                        removeCount++;
                        if (k.value !== null)
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
                from = match.index;
                const matchStr = match[0];
                const before = str.slice(0, from);
                const after = str.slice(from + matchStr.length);

                const reach = pos + str.length;
                if (rematch && reach > rematch) {
                    rematch = reach;
                }

                let removeFrom = currentNode.prev;

                if (before && removeFrom) {
                    removeFrom = tokenList.addAfter(removeFrom, before);
                    pos += before.length;
                }

                if(removeFrom === null) continue
                tokenList.removeRange(removeFrom, removeCount);

                let wrapped = new Token(token, inside ? tokenize(matchStr, inside) : matchStr, alias, matchStr);
                currentNode = tokenList.addAfter(removeFrom, wrapped);

                if (after && currentNode) {
                    tokenList.addAfter(currentNode, after);
                }

                if (removeCount > 1 && currentNode?.prev) {
                    // at least one Token object was removed, so we have to do some rematching
                    // this can only happen if the current pattern is greedy
                    const nestedRematch = reach
                    matchGrammar(text, tokenList, grammar, currentNode.prev, pos, nestedRematch);

                    // the reach might have been extended because of the rematching
                    if (rematch && nestedRematch > rematch) {
                        rematch = nestedRematch;
                    }
                }
                if(currentNode === null || currentNode.value === null) break
                pos += currentNode.value.length
                currentNode = currentNode.next
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

    matchGrammar(text, tokenList, grammar, tokenList.head, 0);

    return tokenList.toArray();
}

export {tokenize}