import {Token, LinkedList} from "./types";

const matchPattern = (pattern: RegExp, pos: number, text: string, lookbehind: boolean): RegExpExecArray | null => {
    pattern.lastIndex = pos;
    let match = pattern.exec(text);
    if (match && lookbehind && match[1]) {  // remove the text matched by the capturing group
        let lookbehindLength = match[1].length;
        match.index += lookbehindLength;
        match[0] = match[0].slice(lookbehindLength);
    }
    return match;
}

function matchGrammar(text: string, tokenList: LinkedList<string | Token>, grammar: any, startNode: any, startPos: any, rematch: any) {
    for (let token in grammar) {
        if (!grammar.hasOwnProperty(token) || !grammar[token]) continue

        let patterns = grammar[token]
        patterns = Array.isArray(patterns) ? patterns : [patterns]

        for (let j = 0; j < patterns.length; j++) {
            if (rematch && rematch.cause == token + ',' + j) return

            const patternObj = patterns[j]
            const inside = patternObj.inside
            const lookbehind = !!patternObj.lookbehind    // !! here is to eliminate undefined
            const greedy = !!patternObj.greedy
            const alias = patternObj.alias

            if (greedy && !patternObj.pattern.global) { // Without the global flag, lastIndex won't work
                const flags = patternObj.pattern.toString().match(/[imsuy]*$/)[0]
                patternObj.pattern = RegExp(patternObj.pattern.source, flags + 'g')
            }

            const pattern = patternObj.pattern || patternObj

            for ( // iterate the token list and keep track of the current token/string position
                let currentNode = startNode.next, pos = startPos;
                currentNode !== tokenList.tail;
                pos += currentNode.value.length, currentNode = currentNode.next
            ) {
                if (rematch && pos >= rematch.reach) break

                let str = currentNode.value

                // if (tokenList.length > text.length) {
                //     // Something went terribly wrong, ABORT, ABORT!
                //     return;
                // }

                if (str instanceof Token) continue

                let removeCount = 1 // this is the to parameter of removeBetween
                let match

                if (greedy) {
                    match = matchPattern(pattern, pos, text, lookbehind)
                    if (!match || match.index >= text.length) break

                    const matchedStart = match.index
                    const matchedEnd = match.index + match[0].length

                    // find the node that contains the match
                    let p = pos + currentNode.value.length
                    while (matchedStart >= p) {
                        currentNode = currentNode.next
                        p += currentNode.value.length
                    }
                    p -= currentNode.value.length
                    pos = p

                    // the current node is a Token, then the match starts inside another Token, which is invalid
                    if (currentNode.value instanceof Token) continue

                    // find the last node which is affected by this match
                    for (let k = currentNode; k !== tokenList.tail && (p < matchedEnd || typeof k.value === 'string'); k = k.next) {
                        removeCount++
                        p += k.value.length
                    }
                    removeCount--

                    // replace with the new match
                    str = text.slice(pos, p)
                    match.index -= pos
                } else {
                    match = matchPattern(pattern, 0, str, lookbehind)
                    if (!match) continue
                }

                const from = match.index
                const matchStr = match[0]
                const precede = str.slice(0, from)
                const trail = str.slice(from + matchStr.length)

                const reach = pos + str.length
                if (rematch && reach > rematch.reach) rematch.reach = reach

                // insert a node for the preceding string if exists
                let removeFrom = currentNode.prev
                if (precede) {
                    removeFrom = tokenList.addAfter(removeFrom, precede);
                    pos += precede.length;
                }

                // Replace affected nodes with a new Token, if contains inside patterns, recursively tokenize matched string
                tokenList.removeRange(removeFrom, removeCount)
                currentNode = tokenList.addAfter(removeFrom, new Token(token, inside ? tokenize(matchStr, inside) : matchStr, alias, matchStr))

                // insert a node for the trailing string if exists
                if (trail) tokenList.addAfter(currentNode, trail)

                // More than one Token object was removed, rematching is required
                if (removeCount > 1) {
                    const nestedRematch = {
                        cause: token + ',' + j,
                        reach: reach
                    }
                    matchGrammar(text, tokenList, grammar, currentNode.prev, pos, nestedRematch)

                    // the reach might have been extended because of the rematching
                    if (rematch && nestedRematch.reach > rematch.reach) rematch.reach = nestedRematch.reach
                }
            }
        }
    }
}

function tokenize(text: string, grammar: any) {
    const tokenList: LinkedList<string | Token> = new LinkedList();
    tokenList.addAfter(tokenList.head, text);
    matchGrammar(text, tokenList, grammar, tokenList.head, 0, null);
    return tokenList.toArray();
}

export {tokenize}