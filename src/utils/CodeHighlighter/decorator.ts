import {Token as SyntaxToken} from "./types";
import {Descendant, Element, Node, NodeEntry, Range} from "slate";
import {tokenize} from "./tokenizer";
import {CPatternBase} from "./pattern-c";

type Token = {
    types: string[]
    content: string
    empty?: boolean
}

type StackItem = {
    types: string[]
    tokens: Array<SyntaxToken | string>
    index: number
    size: number
}

type CodeBlockElement = {
    type: 'code-block'
    language: string
    children: Descendant[]
}

const newlineRe = /\r\n|\r|\n/

// Empty lines need to contain a single empty token, denoted with { empty: true }
const normalizeEmptyLines = (line: Token[]) => {
    if (line.length === 0) {
        line.push({
            types: ['plain'],
            content: '\n',
            empty: true,
        })
    } else if (line.length === 1 && line[0].content === '') {
        line[0].content = '\n'
        line[0].empty = true
    }
}

const appendTypes = (types: string[], add: string[] | string): string[] => {
    const typesSize = types.length
    if (typesSize > 0 && types[typesSize - 1] === add) {
        return types
    }
    return types.concat(add)
}

const normalizeTokens = (tokens: Array<SyntaxToken | string>): Token[][] => {
    const stack: StackItem[] = [{ types: [], tokens: tokens, index: 0, size: tokens.length }]

    let i, stackIndex = 0

    let currentLine: { types: string[]; content: string; }[] = []
    const acc = [currentLine]

    while (stackIndex > -1) {
        while ((i = stack[stackIndex].index++) < stack[stackIndex].size) {
            let content, types = stack[stackIndex].types
            const token = stack[stackIndex].tokens[i]

            // Determine content and append type to types if necessary
            if (typeof token === 'string') {
                types = stackIndex > 0 ? types : ['plain']
                content = token
            } else {
                types = appendTypes(types, token.type)
                if (token.alias) {
                    types = appendTypes(types, token.alias)
                }
                content = token.content
            }

            // If token.content is an array, increase the stack depth and repeat this while-loop
            if (typeof content !== 'string') {
                stackIndex++
                stack.push({ types: types, tokens: content, index: 0, size: content.length })
                continue
            }

            // Split by newlines
            const splitByNewlines = content.split(newlineRe)
            const newlineCount = splitByNewlines.length

            currentLine.push({ types: types, content: splitByNewlines[0] })

            // Create a new line for each string on a new line
            for (let j = 1; j < newlineCount; j++) {
                normalizeEmptyLines(currentLine)
                acc.push((currentLine = []))
                currentLine.push({ types: types, content: splitByNewlines[j] })
            }
        }

        // Decrease the stack depth
        stackIndex--
        stack.pop()
    }

    normalizeEmptyLines(currentLine)
    return acc
}

const getChildNodeToDecorations = ([block, blockPath,]: NodeEntry<CodeBlockElement>) => {
    const nodeToDecorations = new Map<Element, Range[]>()

    const text = block.children.map(line => Node.string(line)).join('\n')
    const tokens = tokenize(text, CPatternBase)
    const normalizedTokens = normalizeTokens(tokens) // make tokens flat and grouped by line
    const blockChildren = block.children as Element[]

    for (let index = 0; index < normalizedTokens.length; index++) {
        const tokens = normalizedTokens[index]
        const element = blockChildren[index]

        if (!nodeToDecorations.has(element)) {
            nodeToDecorations.set(element, [])
        }

        let start = 0
        for (const token of tokens) {
            const length = token.content.length
            if (!length) {
                continue
            }

            const end = start + length

            const path = [...blockPath, index, 0]
            const range = {
                anchor: { path, offset: start },
                focus: { path, offset: end },
                token: true,
                ...Object.fromEntries(token.types.map(type => [type, true])),
            }

            nodeToDecorations.get(element)!.push(range)

            start = end
        }
    }

    return nodeToDecorations
}


export {getChildNodeToDecorations}