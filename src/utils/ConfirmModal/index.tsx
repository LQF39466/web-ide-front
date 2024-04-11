import React, {forwardRef, Ref, useImperativeHandle, useState} from "react";
import {message, Modal} from 'antd'
import {post} from "../Comm/request";


interface ConfirmModalProps {
    uid: string
    projectUid: string
    type: string
    refresh: () => void
}

export type ConfirmModalRef = {
    showModal(): void
}

const ConfirmModal = forwardRef((props: ConfirmModalProps, ref: Ref<ConfirmModalRef>) => {
    const [open, setOpen] = useState(false)

    const showModal = () => {
        setOpen(true);
    }

    const handleOk = async () => {
        let response = undefined
        if(props.type === 'project') response = await post('/api/deleteProject', JSON.stringify({uid: props.uid}))
        else if(props.type ==='file') response = await post('/api/deleteFile', JSON.stringify({uid: props.uid, projectUid: props.projectUid}))
        if (response !== undefined) message.info(response.data.message)
        props.refresh()
        setOpen(false)
    }

    const handleCancel = () => {
        setOpen(false)
    }

    useImperativeHandle(ref, () => {
        return {showModal}
    })

    return (<>
            <Modal
                open={open}
                onOk={handleOk}
                onCancel={handleCancel}
                okText={'Confirm'}
                okType={'danger'}
            >Delete this {props.type}?
            </Modal>
        </>);
})

export default ConfirmModal