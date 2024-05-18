import React, {useState, forwardRef, useImperativeHandle, Ref} from "react";
import {Form, Modal, Input, Select, message, Button} from 'antd'
import {ProjectIndex} from "../../../../types";
import {post} from "../../../../utils/Comm/request"

const {Option} = Select;

interface EditModalProps {
    refresh: () => void
}

export type EditModalRef = {
    showModal(): void
}

const ProjectInfoEditor = forwardRef((props: EditModalProps, ref: Ref<EditModalRef>) => {
    const [open, setOpen] = useState(false)
    const [form] = Form.useForm()

    const showModal = () => {
        setOpen(true)
    }

    const handleOk = async (value: ProjectIndex) => {
        const response = await post('/api/addProject', JSON.stringify(value))
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

    return (
        <>
            <Modal
                title='Create new project'
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
                        label="Language"
                        name="languageType"
                        rules={[{required: true}]}
                    >
                        <Select>
                            <Option value="C">C</Option>
                            {/*<Option value="C++">C++</Option>*/}
                            {/*<Option value="other">Others</Option>*/}
                        </Select>
                    </Form.Item>
                    <Form.Item
                        label="Description"
                        name="details"
                        rules={[{required: true}]}
                    >
                        <Input/>
                    </Form.Item>
                    <Form.Item wrapperCol={{span: 24}}>
                        <Button key="submit" type="primary" htmlType="submit" block>
                            OK
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>
        </>
    );
})

export default ProjectInfoEditor