// Single Linked List DSA for game nodes

export interface NodeData {
  id: number;      // value 1..n
  x: number;       // % position
  y: number;       // % position
  radius: number;  // px
  clicked: boolean;
  fading: boolean;
}

export class ListNode {
  data: NodeData;
  next: ListNode | null = null;

  constructor(data: NodeData) {
    this.data = data;
  }
}

export class LinkedList {
  head: ListNode | null = null;
  size: number = 0;

  append(data: NodeData): void {
    const node = new ListNode(data);
    if (!this.head) {
      this.head = node;
    } else {
      let curr = this.head;
      while (curr.next) curr = curr.next;
      curr.next = node;
    }
    this.size++;
  }

  toArray(): NodeData[] {
    const arr: NodeData[] = [];
    let curr = this.head;
    while (curr) {
      arr.push(curr.data);
      curr = curr.next;
    }
    return arr;
  }

  updateNode(id: number, updates: Partial<NodeData>): void {
    let curr = this.head;
    while (curr) {
      if (curr.data.id === id) {
        curr.data = { ...curr.data, ...updates };
        return;
      }
      curr = curr.next;
    }
  }

  clear(): void {
    this.head = null;
    this.size = 0;
  }

  clone(): LinkedList {
    const list = new LinkedList();
    let curr = this.head;
    while (curr) {
      list.append({ ...curr.data });
      curr = curr.next;
    }
    return list;
  }
}

export function generateNodes(n: number, width: number, height: number): LinkedList {
  const list = new LinkedList();
  const radius = Math.max(20, Math.min(35, Math.floor(220 / Math.sqrt(n))));
  const placed: { x: number; y: number }[] = [];

  // Shuffle numbers 1..n
  const nums = Array.from({ length: n }, (_, i) => i + 1);
  for (let i = nums.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [nums[i], nums[j]] = [nums[j], nums[i]];
  }

  for (let i = 0; i < n; i++) {
    let x: number, y: number;
    let attempts = 0;
    const pad = radius + 4;

    do {
      x = pad + Math.random() * (width - pad * 2);
      y = pad + Math.random() * (height - pad * 2);
      attempts++;
    } while (
      attempts < 200 &&
      placed.some(p => Math.hypot(p.x - x, p.y - y) < radius * 1.8)
    );

    placed.push({ x, y });
    list.append({
      id: nums[i],
      x: (x / width) * 100,
      y: (y / height) * 100,
      radius,
      clicked: false,
      fading: false,
    });
  }

  return list;
}
