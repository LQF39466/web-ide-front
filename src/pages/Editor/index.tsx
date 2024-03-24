import React from 'react';
import {
    PartitionOutlined,
} from '@ant-design/icons';
import {Flex} from 'antd';
import {Layout} from 'antd';
import FileList from "./components/FileList";
import CodeEditor from "./components/CodeEditor"

const {Content, Sider} = Layout;


const EditorLayout: React.FC = () => {

    return (
        <Layout style={{minHeight: '100vh'}}>
            <Sider style={{height: '100vh', background: '#e5e5e5', position: 'fixed'}}>
                <Flex style={{width: '100%',  padding: '10px 0 10px 0', backgroundColor: '#14213d'}}>
                    <PartitionOutlined style={{margin: '0 10px 0 10px', fontSize: '16px', color: 'white'}}/>
                    <h3 style={{margin: '0 10px 2px 0', color: 'white'}}>Project Name</h3>
                </Flex>
                <FileList/>
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