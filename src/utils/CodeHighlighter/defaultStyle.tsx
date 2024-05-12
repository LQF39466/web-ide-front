import {Descendant, NodeEntry, Element, Node, Range} from "slate";
import {tokenize} from "./index";
import {CPatternBase} from "./pattern-c";
import {normalizeTokens} from "./token-normalize";

const colorScheme = JSON.parse(`{
    'comment': '#8C8C8C',
    'char': '#000000',
    'marco': '#0033B3',
    'string': '#067D17',
    'class-name': '#000000',
    'keyword': '#CF8E6D',
    'constant': '#871094',
    'function': '#0033B3',
    'number': '#1750EB',
    'operator': '#871094',
    'punctuation': '#000000',
}`)

export type CodeBlockElement = {
    type: 'code-block'
    language: string
    children: Descendant[]
}

export type CodeLineElement = {
    type: 'code-line'
    children: Descendant[]
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