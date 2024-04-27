import React, {useEffect, useState} from "react";
import {Flex} from "antd"

import {Slate, Editable, withReact, ReactEditor, RenderElementProps} from "slate-react"
import {createEditor, BaseText, Descendant, BaseRange, Transforms, Editor, Node} from 'slate'
import Navigation from "../Navigation";

type CodeEditorProps = {
    codeFromFile: string
    fileUid: string
    projectUid: string
}

declare module 'slate' {
    interface CustomTypes {
        Editor: ReactEditor
        Text: BaseText & {
            placeholder?: string
            onPlaceholderResize?: (node: HTMLElement | null) => void
            [key: string]: unknown
        }
        Range: BaseRange & {
            placeholder?: string
            onPlaceholderResize?: (node: HTMLElement | null) => void
            [key: string]: unknown
        }
    }
}

const CodeElement = (props: RenderElementProps) => {
    return (
        <pre {...props.attributes}
             style={{margin: '0', fontFamily: 'source-code-pro, Menlo, Monaco, Consolas, monospace', fontSize: '16px'}}>
            <code>{props.children}</code>
        </pre>
    )
}

const CodeEditor = (props: CodeEditorProps) => {
    const [editor] = useState(() => withReact(createEditor()))
    const [nodes, setNodes] = useState<Descendant[]>([])

    const stringToDescendant = (text: string) => {
        const descendants: Descendant[] = []
        text.split('\r\n').forEach((line) => {
            descendants.push({
                type: 'code-inline',
                children: [{text: line}],
            })
        })
        return descendants
    }

    const updateNodes = () => { //Clear current slate then insert with new content
        setNodes(stringToDescendant(props.codeFromFile))
        const currentEnd = Editor.end(editor, [])   //Mark the end of current slate
        Transforms.insertNodes(editor, stringToDescendant(props.codeFromFile), {at: Editor.end(editor, [])})    //Insert first, editor does not allow nodes to be empty
        Transforms.removeNodes(editor, {at: {anchor: Editor.start(editor, []), focus: currentEnd}})
    }

    useEffect(() => {
        updateNodes()
    }, [props]);

    const initialValue: Descendant[] = stringToDescendant('')

    const lineMarkerGen = (nodeList: Descendant[]) => {
        let lineNum = nodeList.length
        let lineMarker = ''
        for (let i = 1; i <= lineNum; i++) {
            lineMarker = lineMarker + i + '\n'
        }
        return lineMarker
    }

    const serialize = (nodes: Node[]) => {
        return nodes.map(n => Node.string(n)).join('\r\n')
    }

    const handelContentChange = (value: Descendant[]) => {
        setNodes(value) //For line marker generation
        localStorage.setItem('file_' + props.fileUid, serialize(value))  //Save changes at realtime
    }

    return (<Flex style={{height: '100%'}} vertical={true}>
        <div style={{
            height: '52px', width: '100%', marginBottom: '10px', backgroundColor: 'white', borderRadius: '8px'
        }}>
            <Navigation projectUid={props.projectUid}/>
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
                        <Editable
                            renderElement={ElementWrapper}
                        />
                    </Slate>
                </div>
            </Flex>
        </div>
    </Flex>);
}

const ElementWrapper = (props: RenderElementProps) => {
    return (
        <CodeElement attributes={props.attributes} children={props.children} element={props.element}/>
    )
}

export default CodeEditor