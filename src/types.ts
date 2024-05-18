 interface ProjectIndex {
     uid: string,
     title: string,
     details: string,
     languageType: string,
     createTime: number,
     lastEdit: number,
     entrance: FileIndex
     headers: Array<FileIndex>
     textFiles: Array<FileIndex>
 }

 interface FileIndex {
     uid: string,
     projectUid: string,
     title: string,
     fileType: string,
     createTime: number,
     lastEdit: number
 }

 export type {ProjectIndex, FileIndex}