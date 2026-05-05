export const generateBubbleSort = (array) => {
  let arr = [...array];
  let steps = [];
  steps.push({ state: [...arr], active: [], type: 'start', line: 1, description: 'Start Bubble Sort' });
  for (let i = 0; i < arr.length - 1; i++) {
    for (let j = 0; j < arr.length - i - 1; j++) {
      steps.push({ state: [...arr], active: [j, j + 1], type: 'compare', line: 3, description: `Comparing elements at index ${j} and ${j + 1}: ${arr[j]} vs ${arr[j + 1]}` });
      if (arr[j] > arr[j + 1]) {
        let temp = arr[j];
        arr[j] = arr[j + 1];
        arr[j + 1] = temp;
        steps.push({ state: [...arr], active: [j, j + 1], type: 'swap', line: 4, description: `Swapping because ${arr[j + 1]} < ${arr[j]}` });
      }
    }
  }
  steps.push({ state: [...arr], active: [], type: 'done', line: 8, description: 'Array is sorted!' });
  return {
    structType: 'array',
    steps,
    codeSnippet: `function bubbleSort(arr) {\n  for (let i = 0; i < arr.length; i++) {\n    for (let j = 0; j < arr.length - i - 1; j++) {\n      if (arr[j] > arr[j + 1]) {\n        swap(arr, j, j + 1);\n      }\n    }\n  }\n  return arr;\n}`,
    timeComplexity: "O(n²)",
    label: "Bubble Sort"
  };
};

export const generateSelectionSort = (array) => {
  let arr = [...array];
  let steps = [];
  steps.push({ state: [...arr], active: [], type: 'start', line: 1, description: 'Start Selection Sort' });
  for (let i = 0; i < arr.length - 1; i++) {
    let minIdx = i;
    steps.push({ state: [...arr], active: [i], type: 'visit', line: 2, description: `Assume minimum is at index ${i}` });
    for (let j = i + 1; j < arr.length; j++) {
      steps.push({ state: [...arr], active: [minIdx, j], type: 'compare', line: 4, description: `Comparing with min value` });
      if (arr[j] < arr[minIdx]) {
        minIdx = j;
        steps.push({ state: [...arr], active: [minIdx], type: 'update', line: 5, description: `Found new min: ${arr[j]} at index ${j}` });
      }
    }
    if (minIdx !== i) {
      let temp = arr[i];
      arr[i] = arr[minIdx];
      arr[minIdx] = temp;
      steps.push({ state: [...arr], active: [i, minIdx], type: 'swap', line: 8, description: `Swapping minimum ${arr[i]} into correct position ${i}` });
    }
  }
  steps.push({ state: [...arr], active: [], type: 'done', line: 11, description: 'Array is sorted!' });
  return {
    structType: 'array',
    steps,
    codeSnippet: `function selectionSort(arr) {\n  for (let i = 0; i < arr.length; i++) {\n    let minIdx = i;\n    for (let j = i + 1; j < arr.length; j++) {\n      if (arr[j] < arr[minIdx]) minIdx = j;\n    }\n    if (minIdx !== i) swap(arr, i, minIdx);\n  }\n  return arr;\n}`,
    timeComplexity: "O(n²)",
    label: "Selection Sort"
  };
};

export const generateInsertionSort = (array) => {
  let arr = [...array];
  let steps = [];
  steps.push({ state: [...arr], active: [], type: 'start', line: 1, description: 'Start Insertion Sort' });
  for (let i = 1; i < arr.length; i++) {
    let key = arr[i];
    let j = i - 1;
    steps.push({ state: [...arr], active: [i], type: 'visit', line: 2, description: `Key to insert: ${key}` });
    while (j >= 0 && arr[j] > key) {
      steps.push({ state: [...arr], active: [j, j+1], type: 'compare', line: 4, description: `${arr[j]} > ${key}, shifting ${arr[j]} to right` });
      arr[j + 1] = arr[j];
      steps.push({ state: [...arr], active: [j, j+1], type: 'swap', line: 5, description: `Shifted` });
      j = j - 1;
    }
    arr[j + 1] = key;
    steps.push({ state: [...arr], active: [j+1], type: 'insert', line: 8, description: `Inserted ${key} at index ${j+1}` });
  }
  steps.push({ state: [...arr], active: [], type: 'done', line: 10, description: 'Array is sorted!' });
  return {
    structType: 'array',
    steps,
    codeSnippet: `function insertionSort(arr) {\n  for (let i = 1; i < arr.length; i++) {\n    let key = arr[i];\n    let j = i - 1;\n    while (j >= 0 && arr[j] > key) {\n      arr[j + 1] = arr[j];\n      j = j - 1;\n    }\n    arr[j + 1] = key;\n  }\n  return arr;\n}`,
    timeComplexity: "O(n²)",
    label: "Insertion Sort"
  };
};

export const generateStackOps = () => {
    let stack = [];
    let steps = [];
    steps.push({ state: [...stack], active: [], type: 'start', line: 1, description: 'Initialize Empty Stack' });
    
    stack.push(10);
    steps.push({ state: [...stack], active: [0], type: 'push', line: 3, description: 'Push 10 to stack' });
    stack.push(25);
    steps.push({ state: [...stack], active: [1], type: 'push', line: 3, description: 'Push 25 to stack' });
    stack.push(42);
    steps.push({ state: [...stack], active: [2], type: 'push', line: 3, description: 'Push 42 to stack' });
    
    stack.pop();
    steps.push({ state: [...stack], active: [], type: 'pop', line: 6, description: 'Pop top element (42)' });
    stack.pop();
    steps.push({ state: [...stack], active: [], type: 'pop', line: 6, description: 'Pop top element (25)' });
    
    return {
        structType: 'stack',
        steps,
        codeSnippet: `class Stack {\n  constructor() { this.items = []; }\n  push(val) {\n    this.items.push(val);\n  }\n  pop() {\n    return this.items.pop();\n  }\n}`,
        timeComplexity: "O(1) Push/Pop",
        label: "Stack (Push/Pop)"
    };
};

export const generateQueueOps = () => {
    let q = [];
    let steps = [];
    steps.push({ state: [...q], active: [], type: 'start', line: 1, description: 'Initialize Empty Queue' });
    
    q.push(5);
    steps.push({ state: [...q], active: [0], type: 'enqueue', line: 3, description: 'Enqueue 5 to back' });
    q.push(15);
    steps.push({ state: [...q], active: [1], type: 'enqueue', line: 3, description: 'Enqueue 15 to back' });
    q.push(30);
    steps.push({ state: [...q], active: [2], type: 'enqueue', line: 3, description: 'Enqueue 30 to back' });
    
    q.shift();
    steps.push({ state: [...q], active: [], type: 'dequeue', line: 6, description: 'Dequeue front element (5)' });
    
    return {
        structType: 'queue',
        steps,
        codeSnippet: `class Queue {\n  constructor() { this.items = []; }\n  enqueue(val) {\n    this.items.push(val);\n  }\n  dequeue() {\n    return this.items.shift();\n  }\n}`,
        timeComplexity: "O(1) Enqueue",
        label: "Queue (Enqueue/Dequeue)"
    };
};

export const generateLinkedList = () => {
    // simplified representation of linked list as array for generic UI
    let ll = [];
    let steps = [];
    steps.push({ state: [...ll], active: [], type: 'start', line: 1, description: 'Empty Linked List' });
    
    ll.push(10);
    steps.push({ state: [...ll], active: [0], type: 'insert', line: 3, description: 'Insert Node(10) at head' });
    ll.push(20);
    steps.push({ state: [...ll], active: [1], type: 'insert', line: 3, description: 'Insert Node(20) at tail' });
    ll.push(30);
    steps.push({ state: [...ll], active: [2], type: 'insert', line: 3, description: 'Insert Node(30) at tail' });
    
    ll.shift();
    steps.push({ state: [...ll], active: [], type: 'delete', line: 6, description: 'Delete Head Node (10)' });
    
    return {
        structType: 'linkedlist',
        steps,
        codeSnippet: `class LinkedList {\n  insert(val) {\n    let node = new Node(val);\n    // insert logic...\n  }\n  delete() {\n    // delete logic...\n  }\n}`,
        timeComplexity: "O(1) Head Insert",
        label: "Linked List Operations"
    };
};

export const dsaRegistry = {
  "bubble sort": generateBubbleSort,
  "selection sort": generateSelectionSort,
  "insertion sort": generateInsertionSort,
  "stack": generateStackOps,
  "queue": generateQueueOps,
  "linked list": generateLinkedList
};

export const findAlgorithm = (query) => {
  const q = query.toLowerCase();
  for (const key in dsaRegistry) {
    if (q.includes(key) || key.includes(q)) {
      return { key, generator: dsaRegistry[key] };
    }
  }
  return { key: "bubble sort", generator: dsaRegistry["bubble sort"] }; // default fallback
};
