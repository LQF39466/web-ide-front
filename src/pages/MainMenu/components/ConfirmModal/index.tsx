import React, {forwardRef, Ref, useImperativeHandle, useState} from "react";
import {Modal} from 'antd'


interface ConfirmModalProps {
}

export type ConfirmModalRef = {
    showModal(): void
}

const ConfirmModal = forwardRef((props: ConfirmModalProps, ref: Ref<ConfirmModalRef>) => {
    const [open, setOpen] = useState(false)
    const [confirmLoading, setConfirmLoading] = useState(false)

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

    return (<>
            <Modal
                open={open}
                onOk={handleOk}
                confirmLoading={confirmLoading}
                onCancel={handleCancel}
                okText={'Confirm'}
                okType={'danger'}
            >Delete this project?
            </Modal>
        </>);
})

export default ConfirmModal