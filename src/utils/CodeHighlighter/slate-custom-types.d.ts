import {BaseEditor, BaseRange, Descendant} from "slate";
import {ReactEditor} from "slate-react";

export type CodeBlockElement = {
    type: 'code-block'
    language: string
    children: Descendant[]
}

export type CodeLineElement = {
    type: 'code-line'
    children: Descendant[]
}

declare module 'slate' {
    interface CustomTypes {
        Editor: BaseEditor & ReactEditor & { nodeToDecorations?: Map<Element, Range[]> }
        Element: CodeBlockElement | CodeLineElement
        Range: BaseRange & { [key: string]: unknown }
    }
}