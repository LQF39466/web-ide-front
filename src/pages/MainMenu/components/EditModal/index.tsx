import React, {useState, forwardRef, useImperativeHandle, Ref} from "react";
import {Form, Modal, Input, Select} from 'antd'

const { Option } = Select;

interface EditModalProps {
}

export type EditModalRef = {
    showModal(): void
}

const ProjectInfoEditor = forwardRef((props: EditModalProps,ref: Ref<EditModalRef>) => {
    const [open, setOpen] = useState(false)
    const [confirmLoading, setConfirmLoading] = useState(false)
    const [form] = Form.useForm()

    const showModal = () => {
        setOpen(true);
    }

    const handleOk = () => {
        setConfirmLoading(true)
        setTimeout(() => {
            setOpen(false)
            setConfirmLoading(false)
        }, 2000)
    }

    const handleCancel = () => {
        setOpen(false)
    }

    useImperativeHandle(ref, () => {
        return {showModal}
    })

    return (
        <>
            <Modal
                title='Create new project'
                open={open}
                onOk={handleOk}
                confirmLoading={confirmLoading}
                onCancel={handleCancel}
            >
                <Form
                    name="edit"
                    wrapperCol={{ span: 24 }}
                    autoComplete="off"
                    form={form}
                    onFinish={handleOk}
                >
                    <Form.Item
                        label="Title"
                        name="title"
                        rules={[{ required: true }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        label="Language"
                        name="language"
                        rules={[{ required: true }]}
                    >
                        <Select>
                            <Option value="C">C</Option>
                            <Option value="C++">C++</Option>
                            <Option value="other">Others</Option>
                        </Select>
                    </Form.Item>
                    <Form.Item
                        label="Description"
                        name="description"
                        rules={[{ required: true}]}
                    >
                        <Input />
                    </Form.Item>
                </Form>
            </Modal>
        </>
    );
})

export default ProjectInfoEditor