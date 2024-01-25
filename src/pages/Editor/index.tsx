import React from 'react';
import {
    PartitionOutlined,
} from '@ant-design/icons';
import {Flex} from 'antd';
import {Layout, theme} from 'antd';
import FileList from "./components/FileList";

const {Header, Content, Sider} = Layout;


const EditorLayout: React.FC = () => {
    const {
        token: {colorBgContainer, borderRadiusLG},
    } = theme.useToken();

    return (
        <Layout style={{minHeight: '100vh'}}>
            <Header style={{padding: 0, boxShadow: '0px 3px 3px black', zIndex: 10}}>

            </Header>
            <Layout>
                <Sider style={{background: 'white'}}>
                    <Flex style={{width: '100%', margin: '10px 0 10px 0'}}>
                        <PartitionOutlined style={{margin: '0 10px 0 10px', fontSize: '16px'}}/>
                        <h3 style={{margin: '0 10px 2px 0'}}>Project Name</h3>
                    </Flex>
                    <FileList/>
                </Sider>
                <Content style={{margin: '20px 16px'}}>
                    <div
                        style={{
                            padding: 24,
                            minHeight: 360,
                            background: colorBgContainer,
                            borderRadius: borderRadiusLG,
                        }}
                    >
                        Bill is a cat.
                    </div>
                </Content>
            </Layout>
        </Layout>
    );
};

export default EditorLayout;