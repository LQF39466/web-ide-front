import React, {useRef} from 'react';
import {Layout, Flex, Button} from 'antd';
import ProjectList, {ProjectListRef} from './components/ProjectList/index'
import ProjectInfoEditor, {EditModalRef} from "./components/EditModal";

const {Header, Content, Footer} = Layout;


const MainMenuLayout: React.FC = () => {
    const editModalRef = useRef<EditModalRef>(null)
    const projectListRef = useRef<ProjectListRef>(null)

    const handelProjectListRefresh = () => {
        if(projectListRef.current !== null) projectListRef.current.refresh()
    }

    const handleOpenModal = () => {
        if(editModalRef.current !== null) editModalRef.current.showModal()
    }


    return (
        <>
            <ProjectInfoEditor refresh={handelProjectListRefresh} ref={editModalRef}></ProjectInfoEditor>
            <Layout>
                <Header style={{display: 'flex', alignItems: 'center'}}>
                    <h1 style={{color: 'white'}}>WEB IDE</h1>
                </Header>
                <Content style={{padding: '0 48px'}}>
                    <Flex style={{padding: '30px 0'}} justify={"space-between"}>
                        <h1 style={{margin: '0'}}>Project List</h1>
                        <Button type={'primary'} onClick={handleOpenModal}>New Project</Button>
                    </Flex>
                    <ProjectList ref={projectListRef}/>
                </Content>
                <Footer style={{textAlign: 'center'}}>
                    WEB-IDE Designed by @LQF39466
                </Footer>
            </Layout>
        </>
    );
};

export default MainMenuLayout;