class Token {
    type: string
    content: string | Array<string | Token>
    alias: string | string[]
    length: number

    constructor(type: string, content: string | Array<string | Token>, alias: string | string[], matchedStr: string) {
        this.type = type;
        this.content = content;
        this.alias = alias;
        this.length = (matchedStr || '').length | 0;
    }
}

class LinkedListNode<T> {
    value: T | null
    prev: LinkedListNode<T> | null
    next: LinkedListNode<T> | null

    constructor(value: T | null, prev: LinkedListNode<T> | null, next: LinkedListNode<T> | null) {
        this.value = value;
        this.prev = prev;
        this.next = next;
    }
}

class LinkedList<T> {
    head: LinkedListNode<T>
    tail: LinkedListNode<T>
    length: number

    constructor() {
        this.head = new LinkedListNode<T>(null, null, null)
        this.tail = new LinkedListNode<T>(null, this.head, null)
        this.head.next = this.tail
        this.length = 0
    }

    addAfter(node: LinkedListNode<T>, value: T) {
        const next = node.next;
        if(next === null || next.prev === null) return null
        const newNode = { value: value, prev: node, next: next };
        node.next = newNode;
        next.prev = newNode;
        this.length++;
        return newNode;
    }

    toArray() {
        const array = [];
        let node = this.head.next;
        while (node !== this.tail && node !== null) {
            if(node.value) array.push(node.value);
            node = node.next;
        }
        return array;
    }

    removeRange(node: LinkedListNode<T>, count: number) {
        let i: number, next = node.next;
        for (i = 0; i < count && next !== this.tail; i++) {
            if(next === null) break
            next = next.next;
        }
        node.next = next;
        if(next !== null) next.prev = node;
        this.length -= i;
    }
}

export {Token, LinkedListNode, LinkedList}