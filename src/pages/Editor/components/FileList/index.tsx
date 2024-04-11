import {Tree} from 'antd';
import type {GetProps, TreeDataNode} from 'antd';
import {FileIndex} from "../../../../types";

interface FileListProps {
    fileList: FileIndex[]
}

type DirectoryTreeProps = GetProps<typeof Tree.DirectoryTree>;

const {DirectoryTree} = Tree;


const FileList: React.FC<FileListProps> = (props) => {
    const listToTree = (fileList: FileIndex[]) => {
        const treeData: TreeDataNode[] = [];
        let key = 0
        fileList.forEach((e: FileIndex) => {
            treeData.push({
                title: e.title,
                key: '0-' + key++,
                isLeaf: true,
            })
        })
        return treeData
    }

    const onSelect: DirectoryTreeProps['onSelect'] = (keys, info) => {
        console.log('Trigger Select', keys, info);
    };

    const onExpand: DirectoryTreeProps['onExpand'] = (keys, info) => {
        console.log('Trigger Expand', keys, info);
    };

    return (
        <DirectoryTree
            multiple
            defaultExpandAll
            onSelect={onSelect}
            onExpand={onExpand}
            treeData={listToTree(props.fileList)}
            rootStyle={{background: 'transparent', color: 'black', fontSize: '15px'}}
        />
    );
};

export default FileList;