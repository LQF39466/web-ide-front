import React, {forwardRef, Ref, useImperativeHandle, useState} from "react";
import {Drawer} from "antd";

interface StatusModalProps {
    stdout: string
}

export type StatusModalRef = {
    showDrawer: () => void
}

const StatusModal = forwardRef((props: StatusModalProps, ref: Ref<StatusModalRef>) => {
    const [open, setOpen] = useState(false)

    const showDrawer = () => {
        if(props.stdout === '') return
        setOpen(true)
    }

    //Expose showModal function using imperative handel
    useImperativeHandle(ref, () => {
        return {showDrawer}
    })

    const onClose = () => {
        setOpen(false)
    }

    return <>
        <Drawer
            title='Execution Result'
            open={open}
            onClose={onClose}
            mask={false}
            maskClosable={false}
            placement='bottom'
        >
            <pre style={{margin: 0}}><code>{props.stdout}</code></pre>
        </Drawer>
    </>
})

export default StatusModal