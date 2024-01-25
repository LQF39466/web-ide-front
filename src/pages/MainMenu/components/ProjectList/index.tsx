import React from "react";
import {Flex, MenuProps} from "antd";
import {Button, Dropdown, List, Tag} from "antd";
import {MoreOutlined, DeleteOutlined, ExportOutlined} from "@ant-design/icons";

const data = [
    {
        title: 'Project Title 1',
        description: 'project description 1',
        type: 'JavaScript',
    },
    {
        title: 'Project Title 2',
        description: 'project description 2',
        type: 'C',
    },
    {
        title: 'Project Title 3',
        description: 'project description 3',
        type: 'C',
    },
    {
        title: 'Project Title 4',
        description: 'project description 4',
        type: 'C++',
    },
];

const items: MenuProps['items'] = [
    {
        key: '1',
        label: (
            <Flex justify={'space-between'}>
                <ExportOutlined />
                <div style={{marginLeft: '3px'}}>Open</div>
            </Flex>
        ),
    },
    {
        key: '2',
        label: (
            <Flex justify={'space-between'}>
                <DeleteOutlined />
                <div style={{marginLeft: '3px'}}>Delete</div>
            </Flex>
        ),
        danger: true,
    },
]

const languageList = [
    {
        type: 'C',
        color: 'cyan',
    },
    {
        type: 'C++',
        color: 'blue',
    },
    {
        type: 'unknown',
        color: 'red',
    }
]

const LanguageTag: React.FC<{ type: string }> = ({type}) => {
    if (type !== 'C' && type !== 'C++') type = 'unknown'
    return (
        <Tag
            bordered={false}
            color={languageList.find((element) => element.type === type)?.color}
        >
            {type}
        </Tag>
    )
}

const ProjectList: React.FC = () => {
    return (
        <div style={{backgroundColor: 'white', borderRadius: '10px'}}>
            <div style={{height: '100%', width: '100%'}}>
                <List
                    itemLayout='horizontal'
                    dataSource={data}
                    renderItem={(item) => (
                        <List.Item actions={[
                            <Dropdown menu={{ items }} placement={'bottomCenter'}>
                                <Button style={{height: '30px', width: '30px', padding: '0'}}>
                                    <MoreOutlined/>
                                </Button>
                            </Dropdown>
                        ]}>
                            <List.Item.Meta
                                title={<div>{item.title}</div>}
                                description={<div>{item.description}</div>}
                            />
                            <LanguageTag type={item.type}/>
                        </List.Item>
                    )}
                    style={{padding: '15px 30px'}}
                />
            </div>
        </div>
    );
}

export default ProjectList