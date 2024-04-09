import React, {forwardRef, Ref, useEffect, useImperativeHandle, useRef, useState} from "react";
import {Button, Dropdown, Flex, List, MenuProps, message, Tag} from "antd";
import {DeleteOutlined, ExportOutlined, MoreOutlined} from "@ant-design/icons";
import dayjs from "dayjs";
import ConfirmModal, {ConfirmModalRef} from "../ConfirmModal";
import {ProjectIndex} from "../../../../types";
import { get } from "../../../../utils/Comm/request"


interface projectListProps{}
export type ProjectListRef = { refresh(): void }


const handleProjectOpen = (uid: string) => {
    // request /code page from server
    console.log('open ', uid)
}

const ActionButton: React.FC<{ uid: string }> = ({uid}) => {
    const confirmModalRef = useRef<ConfirmModalRef>(null)
    const handleOpenModal = () => {
        if (confirmModalRef.current !== null) confirmModalRef.current.showModal();
    }
    const items: MenuProps['items'] = [
        {
            key: 'open_' + uid,
            label: (
                <Flex justify={'space-between'}>
                    <ExportOutlined/>
                    <div style={{marginLeft: '3px'}}>Open</div>
                </Flex>
            ),
        },
        {
            key: 'delete_' + uid,
            label: (
                <Flex justify={'space-between'}>
                    <DeleteOutlined/>
                    <div style={{marginLeft: '3px'}}>Delete</div>
                </Flex>
            ),
            danger: true,
        },
    ]

    const onClick: MenuProps['onClick'] = ({key}) => {
        const info = key.split('_')
        switch (info[0]) {
            case 'open':
                handleProjectOpen(info[1])
                break
            case 'delete':
                handleOpenModal()
                break
        }
    }

    return (
        <>
            <ConfirmModal ref={confirmModalRef}></ConfirmModal>
            <Dropdown menu={{items, onClick}} placement={'bottom'}>
                <Button style={{height: '30px', width: '30px', padding: '0'}}>
                    <MoreOutlined/>
                </Button>
            </Dropdown>
        </>
    )
}

const ProjectList = forwardRef((props: projectListProps, ref: Ref<ProjectListRef>) => {
    const [data , setData] = useState<ProjectIndex[]>([]);
    const [refreshSignal, setRefreshSignal] = useState<boolean>(false)
    const refresh = () => {setRefreshSignal(!refreshSignal)}

    useImperativeHandle(ref, () => {return {refresh}})

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

    const fetchData = async () => {
        const response = await get('/api/getProjectList');
        console.log('Fetching list')
        console.log(response)
        if(response !== undefined && response.data.code === 0) {
            console.log(response.data)
            setData(JSON.parse(response.data.projectList))
        } else {
            message.error('Failed to fetch project list');
        }
    }

    useEffect(() => {fetchData()}, [refreshSignal])

    const LanguageTag: React.FC<{ type: string }> = ({type}) => {
        if (type !== 'C' && type !== 'C++') type = 'unknown'
        return (
            <Tag
                bordered={false}
                color={languageList.find((element) => element.type === type)?.color}
                style={{width: '65px', textAlign: 'center', marginLeft: '30px'}}
            >
                {type}
            </Tag>
        )
    }

    const TimeDisplay: React.FC<{ timeStamp: number }> = ({timeStamp}) => {
        const lastEdit = dayjs(timeStamp)
        const diffInSec = dayjs().diff(lastEdit) / 1000
        if (diffInSec < 60)
            return (<div>{(diffInSec).toFixed(0)} seconds ago</div>)
        else if (diffInSec < 3600)
            return (<div>{(diffInSec / 60).toFixed(0)} minutes ago</div>)
        else if (diffInSec < 86400)
            return (<div>{(diffInSec / 24 / 60).toFixed(0)} hours ago</div>)
        else
            return (<div>{lastEdit.format('MM-DD')}</div>)
    }

    return (
        <>
            <div style={{backgroundColor: 'white', borderRadius: '10px'}}>
                <div style={{height: '100%', width: '100%'}}>
                    <List
                        itemLayout='horizontal'
                        dataSource={data}
                        renderItem={(item) => (
                            <List.Item actions={[<ActionButton uid={item.uid}/>]}>
                                <List.Item.Meta
                                    title={<a onClick={() => handleProjectOpen(item.uid)}>{item.title}</a>}
                                    description={<div>{item.details}</div>}
                                />
                                <Flex justify={'space-between'}>
                                    <TimeDisplay timeStamp={item.lastEdit}/>
                                    <LanguageTag type={item.languageType}/>
                                </Flex>
                            </List.Item>
                        )}
                        style={{padding: '15px 30px'}}
                    />
                </div>
            </div>
        </>
    );
})

export default ProjectList