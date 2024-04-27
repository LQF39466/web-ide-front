import React from "react";
import {Button, Flex, message, Tooltip} from 'antd'
import {PlayCircleOutlined, StopOutlined} from '@ant-design/icons'
import {post} from '../../../../utils/Comm/request'

type NavigationProps = {
    projectUid: string
}

const Navigation: React.FC<NavigationProps> = (props: NavigationProps) => {
    const [loading, setLoading] = React.useState<boolean>(false)
    const [terminateDisabler, setTerminateDisabler] = React.useState<boolean>(true)
    const [stdout, setStdout] = React.useState<string[]>([])

    const runProject = async () => {
        setLoading(true)
        setTerminateDisabler(false)
        const response = await post('/api/runProject', JSON.stringify({uid: props.projectUid}))
        if (response !== undefined && response.data.code === 0) {
            console.log(response.data.stdout)
            setStdout(response.data.stdout)
        } else {
            message.error('Failed to run project');
        }
        setLoading(false)
        setTerminateDisabler(true)
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