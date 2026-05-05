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

export const generateQuickSort = (array) => {
  let arr = [...array];
  let steps = [];
  steps.push({ state: [...arr], active: [], type: 'start', line: 1, description: 'Start Quick Sort' });
  
  const partition = (low, high) => {
    let pivot = arr[high];
    steps.push({ state: [...arr], active: [high], type: 'visit', line: 3, description: `Select pivot ${pivot} at index ${high}` });
    let i = low - 1;
    for (let j = low; j < high; j++) {
      steps.push({ state: [...arr], active: [j, high], type: 'compare', line: 5, description: `Compare ${arr[j]} with pivot ${pivot}` });
      if (arr[j] < pivot) {
        i++;
        let temp = arr[i];
        arr[i] = arr[j];
        arr[j] = temp;
        steps.push({ state: [...arr], active: [i, j], type: 'swap', line: 7, description: `Swap ${arr[i]} and ${arr[j]} since ${arr[i]} < pivot` });
      }
    }
    let temp = arr[i + 1];
    arr[i + 1] = arr[high];
    arr[high] = temp;
    steps.push({ state: [...arr], active: [i + 1, high], type: 'swap', line: 10, description: `Place pivot ${pivot} in correct position ${i + 1}` });
    return i + 1;
  };

  const quickSort = (low, high) => {
    if (low < high) {
      let pi = partition(low, high);
      quickSort(low, pi - 1);
      quickSort(pi + 1, high);
    }
  };
  
  quickSort(0, arr.length - 1);
  steps.push({ state: [...arr], active: [], type: 'done', line: 15, description: 'Array is sorted!' });
  return {
    structType: 'array',
    steps,
    codeSnippet: `function quickSort(arr, low, high) {\n  if (low < high) {\n    let pi = partition(arr, low, high);\n    quickSort(arr, low, pi - 1);\n    quickSort(arr, pi + 1, high);\n  }\n}`,
    timeComplexity: "O(n log n)",
    label: "Quick Sort"
  };
};

export const generateLinearSearch = (array) => {
  let arr = [...array];
  let target = arr[Math.floor(Math.random() * arr.length)];
  let steps = [];
  steps.push({ state: [...arr], active: [], type: 'start', line: 1, description: `Start Linear Search for target: ${target}` });
  
  for (let i = 0; i < arr.length; i++) {
    steps.push({ state: [...arr], active: [i], type: 'compare', line: 3, description: `Checking index ${i}: Is ${arr[i]} === ${target}?` });
    if (arr[i] === target) {
      steps.push({ state: [...arr], active: [i], type: 'done', line: 4, description: `Target ${target} found at index ${i}!` });
      break;
    }
  }
  return {
    structType: 'array',
    steps,
    codeSnippet: `function linearSearch(arr, target) {\n  for (let i = 0; i < arr.length; i++) {\n    if (arr[i] === target) return i;\n  }\n  return -1;\n}`,
    timeComplexity: "O(n)",
    label: "Linear Search"
  };
};

export const generateBinarySearch = (array) => {
  let arr = [...array].sort((a, b) => a - b);
  let target = arr[Math.floor(Math.random() * arr.length)];
  let steps = [];
  steps.push({ state: [...arr], active: [], type: 'start', line: 1, description: `Start Binary Search for target: ${target} (Array must be sorted)` });
  
  let left = 0;
  let right = arr.length - 1;
  while (left <= right) {
    let mid = Math.floor((left + right) / 2);
    steps.push({ state: [...arr], active: [left, mid, right], type: 'visit', line: 4, description: `Left: ${left}, Right: ${right}, Mid: ${mid} (${arr[mid]})` });
    steps.push({ state: [...arr], active: [mid], type: 'compare', line: 5, description: `Is arr[mid] ${arr[mid]} === ${target}?` });
    if (arr[mid] === target) {
      steps.push({ state: [...arr], active: [mid], type: 'done', line: 6, description: `Target ${target} found at index ${mid}!` });
      break;
    } else if (arr[mid] < target) {
      steps.push({ state: [...arr], active: [mid], type: 'update', line: 8, description: `${arr[mid]} < ${target}, so search right half.` });
      left = mid + 1;
    } else {
      steps.push({ state: [...arr], active: [mid], type: 'update', line: 10, description: `${arr[mid]} > ${target}, so search left half.` });
      right = mid - 1;
    }
  }
  return {
    structType: 'array',
    steps,
    codeSnippet: `function binarySearch(arr, target) {\n  let left = 0, right = arr.length - 1;\n  while (left <= right) {\n    let mid = Math.floor((left + right) / 2);\n    if (arr[mid] === target) return mid;\n    if (arr[mid] < target) left = mid + 1;\n    else right = mid - 1;\n  }\n  return -1;\n}`,
    timeComplexity: "O(log n)",
    label: "Binary Search"
  };
};

export const generateBST = () => {
  const nodes = [
    { id: 0, val: 50, cx: 50, cy: 20 },
    { id: 1, val: 30, cx: 25, cy: 50 },
    { id: 2, val: 70, cx: 75, cy: 50 },
    { id: 3, val: 20, cx: 12.5, cy: 80 },
    { id: 4, val: 40, cx: 37.5, cy: 80 },
    { id: 5, val: 60, cx: 62.5, cy: 80 },
    { id: 6, val: 80, cx: 87.5, cy: 80 }
  ];
  const edges = [
    { from: 0, to: 1 }, { from: 0, to: 2 },
    { from: 1, to: 3 }, { from: 1, to: 4 },
    { from: 2, to: 5 }, { from: 2, to: 6 }
  ];
  
  let steps = [];
  let state = { nodes, edges };
  steps.push({ state, active: [], type: 'start', line: 1, description: 'Start Inorder Traversal of BST' });
  
  const inorder = (nodeId) => {
    if (nodeId === undefined) return;
    steps.push({ state, active: [nodeId], type: 'visit', line: 3, description: `Visiting Node ${nodes[nodeId].val}, traversing left subtree...` });
    
    let leftEdge = edges.find(e => e.from === nodeId && nodes[e.to].cx < nodes[nodeId].cx);
    if (leftEdge) inorder(leftEdge.to);
    
    steps.push({ state, active: [nodeId], type: 'process', line: 4, description: `Processing Node ${nodes[nodeId].val}` });
    
    let rightEdge = edges.find(e => e.from === nodeId && nodes[e.to].cx > nodes[nodeId].cx);
    if (rightEdge) inorder(rightEdge.to);
  };
  
  inorder(0);
  steps.push({ state, active: [], type: 'done', line: 6, description: 'Inorder Traversal Complete!' });
  
  return {
    structType: 'tree',
    steps,
    codeSnippet: `function inorder(node) {\n  if (node !== null) {\n    inorder(node.left);\n    console.log(node.val);\n    inorder(node.right);\n  }\n}`,
    timeComplexity: "O(n)",
    label: "BST Inorder Traversal"
  };
};

export const generateGraphBFS = () => {
  const nodes = [
    { id: 0, val: 'A', cx: 50, cy: 20 },
    { id: 1, val: 'B', cx: 20, cy: 50 },
    { id: 2, val: 'C', cx: 80, cy: 50 },
    { id: 3, val: 'D', cx: 35, cy: 80 },
    { id: 4, val: 'E', cx: 65, cy: 80 }
  ];
  const edges = [
    { from: 0, to: 1 }, { from: 0, to: 2 },
    { from: 1, to: 3 }, { from: 1, to: 4 },
    { from: 2, to: 4 }
  ];
  
  let steps = [];
  let state = { nodes, edges };
  steps.push({ state, active: [], type: 'start', line: 1, description: 'Start Breadth-First Search from Node A' });
  
  let queue = [0];
  let visited = new Set([0]);
  
  while (queue.length > 0) {
    let u = queue.shift();
    steps.push({ state, active: [u], type: 'dequeue', line: 4, description: `Dequeue Node ${nodes[u].val} and visit its neighbors` });
    
    let neighbors = edges.filter(e => e.from === u || e.to === u).map(e => e.from === u ? e.to : e.from);
    for (let v of neighbors) {
      if (!visited.has(v)) {
        visited.add(v);
        queue.push(v);
        steps.push({ state, active: [u, v], type: 'enqueue', line: 7, description: `Neighbor Node ${nodes[v].val} is unvisited, enqueueing.` });
      }
    }
  }
  
  steps.push({ state, active: [], type: 'done', line: 10, description: 'BFS Traversal Complete!' });
  
  return {
    structType: 'graph',
    steps,
    codeSnippet: `function bfs(graph, start) {\n  let queue = [start];\n  let visited = new Set([start]);\n  while (queue.length > 0) {\n    let u = queue.shift();\n    for (let v of graph.neighbors(u)) {\n      if (!visited.has(v)) {\n        visited.add(v);\n        queue.push(v);\n      }\n    }\n  }\n}`,
    timeComplexity: "O(V + E)",
    label: "Graph BFS"
  };
};

export const dsaRegistry = {
  "bubble sort": generateBubbleSort,
  "selection sort": generateSelectionSort,
  "insertion sort": generateInsertionSort,
  "quick sort": generateQuickSort,
  "binary search": generateBinarySearch,
  "linear search": generateLinearSearch,
  "stack": generateStackOps,
  "queue": generateQueueOps,
  "linked list": generateLinkedList,
  "binary search tree": generateBST,
  "graph bfs": generateGraphBFS
};

export const findAlgorithm = (query) => {
  const q = query.toLowerCase();
  
  if (dsaRegistry[q]) {
    return { key: q, generator: dsaRegistry[q] };
  }
  
  for (const key in dsaRegistry) {
    if (q.includes(key) || key.includes(q)) {
      return { key, generator: dsaRegistry[key] };
    }
  }
  return { key: "bubble sort", generator: dsaRegistry["bubble sort"] }; // default fallback
};
