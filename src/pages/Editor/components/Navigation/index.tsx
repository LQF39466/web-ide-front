import React from "react";
import {Button, Flex, message, Tooltip} from 'antd'
import {PlayCircleOutlined, StopOutlined} from '@ant-design/icons'
import {post} from '../../../../utils/Comm/request'

interface NavigationProps {
    projectUid: string
    fileUid: string
    fetchFile: (uid: string, projectUid: string) => Promise<void>
    setStdout: (stdOut: string) => void
    setExecComplete: (status: boolean) => void
}

const Navigation: React.FC<NavigationProps> = (props: NavigationProps) => {
    const [loading, setLoading] = React.useState<boolean>(false)
    const [terminateDisabler, setTerminateDisabler] = React.useState<boolean>(true)

    const saveFileToServer = async (fileUid: string) => {
        const content = localStorage.getItem('file_' + fileUid)
        if (content === null || props.projectUid === '' || fileUid === '') return
        await post('/api/saveFile', JSON.stringify({
            projectUid: props.projectUid,
            uid: fileUid,
            content: content
        }))
        await props.fetchFile(fileUid, props.projectUid)
    }

    const runProject = async () => {
        setLoading(true)
        setTerminateDisabler(false)
        await saveFileToServer(props.fileUid)
        const response = await post('/api/runProject', JSON.stringify({uid: props.projectUid}))
        if (response !== undefined && response.data.code === 0) {
            props.setStdout(response.data.stdout)
        } else {
            message.error('Failed to run project');
        }
        setLoading(false)
        setTerminateDisabler(true)
        props.setExecComplete(true)
    }

    return (<>
        <Flex align='center' justify='end' style={{height: '100%', width: '100%'}}>
            <Tooltip title='Run' mouseEnterDelay={1}>
                <Button
                    type='primary'
                    style={{marginRight: '10px'}}
                    shape='circle'
                    icon={<PlayCircleOutlined/>}
                    loading={loading}
                    onClick={runProject}
                />
            </Tooltip>
            <Tooltip title='Terminate' mouseEnterDelay={1}>
                <Button
                    type='primary'
                    shape='circle'
                    danger
                    disabled={terminateDisabler}
                    style={{marginRight: '10px'}}
                    icon={<StopOutlined/>}
                />
            </Tooltip>
        </Flex>
    </>);
}

export default Navigation