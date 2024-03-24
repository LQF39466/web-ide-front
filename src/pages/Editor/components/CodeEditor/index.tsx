import React, {useState} from "react";
import {Flex} from "antd"

import {ContentBlock, convertFromRaw, Editor, EditorState} from "draft-js"
import 'draft-js/dist/Draft.css'
import './codeStyles.css'

const initialCodeState = convertFromRaw({
    entityMap: {}, blocks: [{
        text: `#include <stdio.h>`,
        key: 'initialCode0',
        type: 'code-block',
        depth: 0,
        entityRanges: [],
        inlineStyleRanges: [],
    }, {
        text: `int main() {`,
        key: 'initialCode1',
        type: 'code-block',
        depth: 0,
        entityRanges: [],
        inlineStyleRanges: [],
    }, {
        text: `    printf("Hello World!\\n");`,
        key: 'initialCode2',
        type: 'code-block',
        depth: 0,
        entityRanges: [],
        inlineStyleRanges: [],
    }, {
        text: `    return 0;`,
        key: 'initialCode3',
        type: 'code-block',
        depth: 0,
        entityRanges: [],
        inlineStyleRanges: [],
    }, {
        text: `}`, key: 'initialCode4', type: 'code-block', depth: 0, entityRanges: [], inlineStyleRanges: [],
    },],
})

const CodeEditor: React.FC = () => {
    const [editorState, setEditorState] = useState(EditorState.createWithContent(initialCodeState))

    const lineMarkerGen = (codeString: string) => {
        const regexp = /\n/g
        const LFMatch = codeString.match(regexp)
        let lineNum = 1
        if (LFMatch !== null) lineNum = LFMatch.length + 1
        let lineMarker = ''
        for (let i = 1; i <= lineNum; i++) {
            lineMarker = lineMarker + i + '\n'
        }
        return lineMarker
    }

    const codeBlockStyleFn = (contentBlock: ContentBlock) => {
        const type = contentBlock.getType()
        switch (type) {
            case 'code-block':
                return 'globalCodeBlock'
            default:
                return type
        }
    }

    return (<Flex style={{height: '100%'}} vertical={true}>
            <div style={{
                height: '40px', width: '100%', marginBottom: '10px', backgroundColor: 'white', borderRadius: '8px'
            }}>

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
                        <code>{lineMarkerGen(editorState.getCurrentContent().getPlainText())}</code>
                    </pre>
                    <div style={{marginLeft: '5px', width: '100%', overflowX: 'auto'}}>
                        <Editor
                            editorState={editorState}
                            onChange={setEditorState}
                            blockStyleFn={codeBlockStyleFn}
                        />
                    </div>
                </Flex>
            </div>
        </Flex>);
}

export default CodeEditor