import React, {forwardRef, useEffect, useImperativeHandle, useRef, useState} from 'react';
import {PartitionOutlined} from '@ant-design/icons';
import {Flex, message} from 'antd';
import {Layout} from 'antd';
import FileList from "./components/FileList";
import CodeEditor from "./components/CodeEditor"
import {ProjectIndex} from "../../types";
import {useNavigate, useParams} from "react-router-dom";
import {get, post} from "../../utils/Comm/request";

const {Content, Sider} = Layout;

type FileListRef = {
    selectedFileUid: string
}

const EditorLayout: React.FC = forwardRef((props, ref) => {
    const [projectIndex, setProjectIndex] = useState<ProjectIndex>({
        createTime: 0,
        details: "",
        entrance: {uid: '', projectUid: '', createTime: 0, title: '', lastEdit: 0, fileType: ''},
        headers: [],
        languageType: "",
        lastEdit: 0,
        title: "",
        uid: ""
    });
    const params = useParams()
    const navigate = useNavigate()
    const [refreshSignal, setRefreshSignal] = useState<boolean>(false)
    const refresh = () => {
        setRefreshSignal(!refreshSignal)
    }
    useImperativeHandle(ref, () => {
        return {refresh}
    })

    //ProjectList fetching
    const fetchData = async () => {
        const response = await get('/api/getProjectList');
        if (response !== undefined && response.data.code === 0) {
            const projectIndex: ProjectIndex = JSON.parse(response.data.projectList).find((e: ProjectIndex) => e.uid === params.uid)
            if (projectIndex === undefined) {
                message.error('Cannot find project');
                navigate(-1)
            }
            setProjectIndex(projectIndex)
            return projectIndex
        } else {
            message.error('Failed to fetch project list');
        }
        return undefined
    }

    //File fetching
    const fileListRef = useRef<FileListRef>(null)
    const [fileContent, setFileContent] = useState<string>('')
    const [fileUid, setFileUid] = useState<string>('')
    const fetchFile = async (uid: string, projectUid: string) => {
        if (uid === '' && projectUid === '') {
            const projectIndex = await fetchData()
            if (projectIndex !== undefined) {
                uid = projectIndex.entrance.uid
                projectUid = projectIndex.uid
            } else return
        }
        const response = await post('/api/getFile', JSON.stringify({uid: uid, projectUid: projectUid}));
        if (response !== undefined) {
            setFileContent(response.data)
            setFileUid(uid)
            message.info('File fetched')
        } else {
            message.error('Failed to fetch file');
        }
    }

    useEffect(() => {
        fetchData()
        fetchFile('', '')
    }, [refreshSignal])

    return (
        <Layout style={{minHeight: '100vh'}}>
            <Sider style={{height: '100vh', background: '#e5e5e5', position: 'fixed'}}>
                <Flex style={{width: '100%', padding: '10px 0 10px 0', backgroundColor: '#14213d'}}>
                    <PartitionOutlined style={{margin: '0 10px 0 10px', fontSize: '16px', color: 'white'}}/>
                    <h3 style={{margin: '0 10px 2px 0', color: 'white'}}>{projectIndex.title}</h3>
                </Flex>
                <FileList projectIndex={projectIndex} refresh={refresh} fetchFile={fetchFile} ref={fileListRef}/>
            </Sider>
            <Content style={{height: '100vh', marginLeft: '200px', backgroundColor: '#edede9'}}>
                <div style={{height: '100%', padding: '10px'}}>
                    <CodeEditor codeFromFile={fileContent} fileUid={fileUid}/>
                </div>
            </Content>
        </Layout>
    )
})

export default EditorLayout;