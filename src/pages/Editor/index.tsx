import React, {useEffect, useState} from 'react';
import {
    PartitionOutlined,
} from '@ant-design/icons';
import {Flex, message} from 'antd';
import {Layout} from 'antd';
import FileList from "./components/FileList";
import CodeEditor from "./components/CodeEditor"
import {FileIndex, ProjectIndex} from "../../types";
import {useNavigate, useParams} from "react-router-dom";
import {get} from "../../utils/Comm/request";

const {Content, Sider} = Layout;


const EditorLayout: React.FC = () => {
    const [projectTitle, setProjectTitle] = useState<string>("");
    const [fileList, setFileList] = React.useState<FileIndex[]>([]);
    const params = useParams()
    const navigate = useNavigate()

    const fetchData = async () => {
        const response = await get('/api/getProjectList');
        if (response !== undefined && response.data.code === 0) {
            const projectIndex: ProjectIndex = JSON.parse(response.data.projectList).find((e: ProjectIndex) => e.uid === params.uid)
            if (projectIndex === undefined) {
                message.error('Cannot find project');
                navigate(-1)
            }
            setProjectTitle(projectIndex.title)
            setFileList([projectIndex.entrance].concat(projectIndex.headers))
        } else {
            message.error('Failed to fetch project list');
        }
    }

    useEffect(() => {
        fetchData()
    }, []);

    return (
        <Layout style={{minHeight: '100vh'}}>
            <Sider style={{height: '100vh', background: '#e5e5e5', position: 'fixed'}}>
                <Flex style={{width: '100%', padding: '10px 0 10px 0', backgroundColor: '#14213d'}}>
                    <PartitionOutlined style={{margin: '0 10px 0 10px', fontSize: '16px', color: 'white'}}/>
                    <h3 style={{margin: '0 10px 2px 0', color: 'white'}}>{projectTitle}</h3>
                </Flex>
                <FileList fileList={fileList}/>
            </Sider>
            <Content style={{height: '100vh', marginLeft: '200px', backgroundColor: '#edede9'}}>
                <div style={{height: '100%', padding: '10px'}}>
                    <CodeEditor/>
                </div>
            </Content>
        </Layout>
    );
};

export default EditorLayout;