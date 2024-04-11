import React, {forwardRef, Ref, useImperativeHandle, useRef, useState} from "react";
import {Flex, Button, Tree, Form, message, Input, Select, Modal} from 'antd';
import type {GetProps, TreeDataNode} from 'antd';
import {FileIndex} from "../../../../types";
import {PlusOutlined, DeleteOutlined} from "@ant-design/icons";
import {v4 as uuidv4} from "uuid";
import {post} from "../../../../utils/Comm/request";
import ConfirmModal, {ConfirmModalRef} from "../../../../utils/ConfirmModal";

const {Option} = Select;
const {DirectoryTree} = Tree;

interface EditModalProps {
    projectUid: string
    refresh: () => void
}

interface FileOpProps {
    uid: string
    projectUid: string
    refresh: () => void
}

interface FileListProps {
    fileList: FileIndex[]
    projectUid: string
    refresh: () => void
}

type EditModalRef = {
    showModal(): void
}

type DirectoryTreeProps = GetProps<typeof Tree.DirectoryTree>;

const EditModal = forwardRef((props: EditModalProps, ref: Ref<EditModalRef>) => {
    const [open, setOpen] = useState(false)
    const [form] = Form.useForm()

    const showModal = () => {
        setOpen(true)
    }

    const handleOk = async (value: FileIndex) => {
        value.uid = uuidv4()
        value.projectUid = props.projectUid
        const response = await post('/api/addFile', JSON.stringify(value))
        if (response !== undefined) message.info(response.data.message)
        props.refresh()
        setOpen(false)
    }

    const handleCancel = () => {
        setOpen(false)
    }

    //Expose showModal function using imperative handel
    useImperativeHandle(ref, () => {
        return {showModal}
    })

    return <>
        <Modal
            title='Add file'
            open={open}
            onCancel={handleCancel}
            destroyOnClose
            footer={[]}
        >
            <Form
                name="edit"
                wrapperCol={{span: 24}}
                autoComplete="off"
                form={form}
                onFinish={handleOk}
            >
                <Form.Item
                    label="Title"
                    name="title"
                    rules={[{required: true}]}
                >
                    <Input/>
                </Form.Item>
                <Form.Item
                    label="File type"
                    name="fileType"
                    rules={[{required: true}]}
                >
                    <Select>
                        <Option value=".c">C source file</Option>
                        <Option value=".h">C header file</Option>
                    </Select>
                </Form.Item>
                <Form.Item wrapperCol={{span: 24}}>
                    <Button key="submit" type="primary" htmlType="submit" block>
                        OK
                    </Button>
                </Form.Item>
            </Form>
        </Modal>
    </>
})

const FileOperation: React.FC<FileOpProps> = (props) => {
    const editModalRef = useRef<EditModalRef>(null)
    const confirmModalRef = useRef<ConfirmModalRef>(null)
    const handleOpenEditModal = () => {
        if (editModalRef.current !== null) editModalRef.current.showModal()
    }
    const handleOpenConfirmModal = () => {
        if (confirmModalRef.current !== null) confirmModalRef.current.showModal()
    }

    return <>
        <EditModal projectUid={props.projectUid} refresh={props.refresh} ref={editModalRef}/>
        <ConfirmModal uid={props.uid} projectUid={props.projectUid} type={'file'} refresh={props.refresh}
                      ref={confirmModalRef}/>
        <Flex justify={'space-between'} style={{padding: '10px'}}>
            <Button
                shape='round'
                icon={<PlusOutlined/>}
                type='primary'
                block
                style={{marginRight: '10px'}}
                onClick={handleOpenEditModal}
            >
                Add File
            </Button>
            <Button
                shape='circle'
                icon={<DeleteOutlined/>}
                type='primary'
                danger
                onClick={handleOpenConfirmModal}
            />
        </Flex>
    </>
}

const FileList: React.FC<FileListProps> = (props) => {
    const listToTree = (fileList: FileIndex[]) => {
        const treeData: TreeDataNode[] = [];
        let key = 0
        fileList.forEach((e: FileIndex) => {
            treeData.push({
                title: e.title,
                key: '0-' + key,
                isLeaf: true,
            })
            key++
        })
        return treeData
    }
    const [selectedFileUid, setSelectedFileUid] = React.useState('')

    const onSelect: DirectoryTreeProps['onSelect'] = (keys) => {
        setSelectedFileUid(props.fileList[parseInt(keys[0].toString().split('-')[1])].uid)
    };

    const onExpand: DirectoryTreeProps['onExpand'] = (keys, info) => {
        console.log('Trigger Expand', keys, info);
    };

    return (
        <Flex vertical={true}>
            <FileOperation uid={selectedFileUid} projectUid={props.projectUid} refresh={props.refresh}/>
            <DirectoryTree
                defaultExpandAll
                onSelect={onSelect}
                onExpand={onExpand}
                treeData={listToTree(props.fileList)}
                rootStyle={{background: 'transparent', color: 'black', fontSize: '15px'}}
                defaultSelectedKeys={['0-0']}
            />
        </Flex>
    )
}

export default FileList;