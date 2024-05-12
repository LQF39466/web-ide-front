import React, {useCallback, useEffect, useState} from "react";
import {Flex} from "antd"

import {
    Editable,
    ReactEditor,
    RenderElementProps,
    RenderLeafProps,
    Slate,
    useSlate,
    useSlateStatic,
    withReact
} from "slate-react"
import {
    BaseEditor,
    BaseRange, before,
    createEditor,
    Descendant,
    Editor,
    Element,
    Node,
    NodeEntry,
    Range,
    Transforms
} from 'slate'
import Navigation from "../Navigation";
import {getChildNodeToDecorations} from "../../../../utils/CodeHighlighter/defaultStyle";
import '../../../../utils/CodeHighlighter/CodeStyle.css'
import {match} from "node:assert";

type CodeEditorProps = {
    codeFromFile: string
    fileUid: string
    projectUid: string
    fetchFile: (uid: string, projectUid: string) => Promise<void>
    setStdout: (stdOut: string) => void
    setExecComplete: (status: boolean) => void
}

type CodeBlockElement = {
    type: 'code-block'
    language: string
    children: Descendant[]
}

type CodeLineElement = {
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

const CodeBlockType = 'code-block'
const CodeLineType = 'code-line'

const CodeEditor = (props: CodeEditorProps) => {
    const [editor] = useState(() => withReact(createEditor()))
    const [nodes, setNodes] = useState<Descendant[]>([])

    const decorate = useDecorate(editor)
    const stringToDescendant = (text: string) => {
        const descendants: Descendant[] = []
        text.split('\r\n').forEach((line) => {
            descendants.push({
                type: CodeLineType,
                children: [{text: line}],
            })
        })
        const codeBlock: CodeBlockElement = {
            type: CodeBlockType,
            language: 'c',
            children: descendants
        }
        return codeBlock
    }

    const updateNodes = () => { //Clear current slate then insert with new content
        const currentCodeBlock = stringToDescendant(props.codeFromFile)
        setNodes([currentCodeBlock])
        Transforms.deselect(editor);
        Transforms.removeNodes(editor, { at: [0] });
        Transforms.insertNodes(editor, currentCodeBlock, { at: [0] });
    }

    useEffect(() => {
        updateNodes()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [props.codeFromFile])

    const initialValue: Descendant[] = [stringToDescendant('')]

    const lineMarkerGen = (nodeList: Descendant[]) => {
        const codeBlock: any = nodeList[0]
        if(!codeBlock || codeBlock.type !== CodeBlockType || !codeBlock.children) return ''
        let lineMarker = ''
        for (let i = 1; i <= codeBlock.children.length; i++) {
            lineMarker = lineMarker + i + '\n'
        }
        return lineMarker
    }

    const serialize = (nodes: Node[]) => {
        return nodes.map(n => Node.string(n)).join('\r\n')
    }

    // This will not be triggered when selecting a single character from back to front and change it, reason unknown
    const handelContentChange = (nodeList: Descendant[]) => {
        if(nodes === nodeList) return
        setNodes(nodeList) //For line marker generation
        if (props.fileUid === '') return
        const codeBlock: any = nodeList[0]
        if(!codeBlock || codeBlock.type !== CodeBlockType || !codeBlock.children) return
        localStorage.setItem('file_' + props.fileUid, serialize(codeBlock.children))  //Save changes at realtime
    }

    return (
        <Flex style={{height: '100%'}} vertical={true}>
            <div style={{
                height: '52px', width: '100%', marginBottom: '10px', backgroundColor: 'white', borderRadius: '8px'
            }}>
                <Navigation projectUid={props.projectUid} fileUid={props.fileUid} setStdout={props.setStdout}
                            setExecComplete={props.setExecComplete} fetchFile={props.fetchFile}/>
            </div>
            <div style={{
                height: '100%',
                width: '100%',
                backgroundColor: 'white',
                borderRadius: '8px',
                boxSizing: 'border-box',
                overflowY: 'auto',
                overflowX: 'clip'
            }}>
                <Flex>
                    <pre style={{
                        paddingLeft: '25px',
                        width: '60px',
                        fontSize: '16px',
                        backgroundColor: 'white',
                        opacity: '1.0',
                        zIndex: 10,
                        borderRightWidth: '1px',
                        borderRight: 'solid #999999',
                    }}>
                        <code>{lineMarkerGen(nodes)}</code>
                    </pre>
                    <div style={{marginLeft: '5px', width: '100%', overflowX: 'auto', marginTop: '16px'}}>
                        <Slate editor={editor} initialValue={initialValue} onValueChange={handelContentChange}>
                            <SetNodeToDecorations/>
                            <Editable
                                decorate={decorate}
                                renderElement={ElementWrapper}
                                renderLeaf={renderLeaf}
                                onKeyDown={(event) => {
                                    if (event.key === 'Tab') {
                                        event.preventDefault()
                                        editor.insertText('    ')
                                    }
                                }}
                            />
                        </Slate>
                    </div>
                </Flex>
            </div>
        </Flex>
    );
}

const ElementWrapper = (props: RenderElementProps) => {
    const {attributes, children, element} = props
    const editor = useSlateStatic()

    if (element.type === CodeBlockType) {
        return (
            <div
                {...attributes}
                style={{position: 'relative', fontFamily: 'source-code-pro, Menlo, Monaco, Consolas, monospace', fontSize: '16px'}}
                spellCheck={false}
            >
                {children}
            </div>
        )
    }

    if (element.type === CodeLineType) {
        return (
            <div {...attributes} style={{position: 'relative'}}>
                {children}
            </div>
        )
    }

    const Tag = editor.isInline(element) ? 'span' : 'div'
    return (
        <Tag {...attributes} style={{position: 'relative'}}>
            {children}
        </Tag>
    )
}

const renderLeaf = (props: RenderLeafProps) => {
    const {attributes, children, leaf} = props
    const {text, ...rest} = leaf

    return (
        <span {...attributes} className={Object.keys(rest).join(' ')}>
            {children}
        </span>
    )
}

const useDecorate = (editor: Editor) => {
    return useCallback(
        ([node]: NodeEntry) => {
            if (Element.isElement(node) && node.type === CodeLineType) {
                if (editor.nodeToDecorations === undefined) return []
                return editor.nodeToDecorations.get(node) || []
            }
            return []
        },
        [editor.nodeToDecorations]
    )
}

const SetNodeToDecorations = () => {
    const editor = useSlate()

    const blockEntries = Array.from(
        Editor.nodes(editor, {
            at: [],
            mode: 'highest',
            match: n => Element.isElement(n) && n.type === CodeBlockType,
        })
    )
    editor.nodeToDecorations = mergeMaps(
        ...blockEntries.map(blockEntry => getChildNodeToDecorations(blockEntry as NodeEntry<CodeBlockElement>))
    )

    return null
}

const mergeMaps = <K, V>(...maps: Map<K, V>[]) => {
    const newMap = new Map<K, V>()

    for (const m of maps) {
        m.forEach((value, key) => {
            newMap.set(key, value)
        })
    }

    return newMap
}

export default CodeEditor