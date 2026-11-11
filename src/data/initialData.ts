import { Subject, LectureNote, Deadline, Flashcard, CuratedResource, StudyScheduleItem, StudyGroup, UserPreferences, AcademicGoal } from '../types';

export const initialSubjects: Subject[] = [
  {
    id: 'sub-dsa',
    name: 'Data Structures & Algorithms',
    code: 'CS-201',
    semester: 4,
    color: '#F43F5E', // Rose
    iconName: 'Binary',
    professor: 'Dr. V. K. Ramanujan',
    credits: 4,
    syllabusProgress: 78,
    targetGrade: 'A+',
    description: 'Advanced data structures, asymptotic analysis, dynamic programming, and graph algorithms.'
  },
  {
    id: 'sub-os',
    name: 'Operating Systems',
    code: 'CS-202',
    semester: 4,
    color: '#D946EF', // Fuchsia
    iconName: 'Cpu',
    professor: 'Prof. Ananya Sharma',
    credits: 4,
    syllabusProgress: 65,
    targetGrade: 'A',
    description: 'Process management, concurrency, deadlock prevention, virtual memory, and distributed file systems.'
  },
  {
    id: 'sub-dbms',
    name: 'Database Management Systems',
    code: 'CS-203',
    semester: 4,
    color: '#EC4899', // Blossom Pink
    iconName: 'Database',
    professor: 'Dr. R. Sengupta',
    credits: 4,
    syllabusProgress: 82,
    targetGrade: 'A+',
    description: 'Relational algebra, SQL, normalization (1NF to BCNF), indexing (B+ trees), and ACID transactions.'
  },
  {
    id: 'sub-cn',
    name: 'Computer Networks',
    code: 'CS-204',
    semester: 4,
    color: '#FB7185', // Coral Blush
    iconName: 'Network',
    professor: 'Prof. Rajesh K. Pillai',
    credits: 3,
    syllabusProgress: 54,
    targetGrade: 'A',
    description: 'OSI 7-layer architecture, TCP/IP protocol suite, sliding window, routing algorithms, and socket programming.'
  },
  {
    id: 'sub-ai',
    name: 'Artificial Intelligence & ML',
    code: 'CS-205',
    semester: 4,
    color: '#A855F7', // Lavender Purple
    iconName: 'Sparkles',
    professor: 'Dr. Neha Agarwal',
    credits: 3,
    syllabusProgress: 70,
    targetGrade: 'O (Outstanding)',
    description: 'Heuristic search, supervised & unsupervised learning, gradient descent, and neural networks.'
  }
];

export const initialNotes: LectureNote[] = [
  {
    id: 'note-1',
    subjectId: 'sub-dsa',
    title: 'Dijkstra\'s Shortest Path & Priority Queue Implementation',
    topic: 'Graph Algorithms',
    moduleNumber: 3,
    date: '2026-11-08',
    difficulty: 'Hard',
    bookmarked: true,
    tags: ['Graphs', 'Greedy', 'PriorityQueue', 'GATE-Priority'],
    content: `## Dijkstra's Algorithm Overview
Dijkstra's algorithm solves the single-source shortest path (SSSP) problem on weighted graphs with **non-negative edge weights**. It maintains a min-priority queue of vertices ordered by their tentative distance from the source vertex.

### Invariant & Optimality
At each iteration, the vertex $u$ with the minimum tentative distance is settled. Once extracted from the priority queue, $dist[u]$ is guaranteed to be optimal because all edge weights are strictly $\ge 0$.

### Time Complexity Analysis
- Using Adjacency Matrix: $O(V^2)$
- Using Binary Min-Heap: $O((V + E) \\log V)$
- Using Fibonacci Heap: $O(E + V \\log V)$

### University Exam Traps
1. **Negative Edge Weights**: If any edge weight is negative, Dijkstra can produce wrong answers or cycle indefinitely. Use **Bellman-Ford** ($O(V \\cdot E)$) instead!
2. **Disconnected Components**: Vertices unreachable from source retain distance $\\infty$. Always check $dist[v] == \\infty$ before printing path.`,
    summary: `Dijkstra finds the single-source shortest path in weighted digraphs with non-negative weights using a greedy min-heap approach in O((V + E) log V) time. Cannot handle negative weights—use Bellman-Ford for graphs with negative edges.`,
    keyFormulas: [
      'Relaxation condition: if dist[v] > dist[u] + weight(u, v) then dist[v] = dist[u] + weight(u, v)',
      'Binary Min-Heap Time: O((V + E) log V)',
      'Fibonacci Heap Time: O(E + V log V)'
    ],
    bulletPoints: [
      'Requires non-negative edge weights exclusively.',
      'Greedy choice: extract vertex u with minimal tentative distance.',
      'Bellman-Ford is the mandatory alternative for graphs with negative weights.',
      'Space complexity is O(V) for distances array and heap.'
    ],
    commonMistakes: [
      'Applying Dijkstra to graphs with negative cycle edges',
      'Forgetting to re-insert or decrease-key in the priority queue when relaxing an edge'
    ],
    codeSnippet: {
      language: 'cpp',
      code: `// C++ Min-Heap Implementation of Dijkstra
#include <vector>
#include <queue>
using namespace std;

typedef pair<int, int> pii; // {distance, vertex}

vector<int> dijkstra(int V, vector<vector<pii>>& adj, int src) {
    priority_queue<pii, vector<pii>, greater<pii>> pq;
    vector<int> dist(V, 1e9);

    dist[src] = 0;
    pq.push({0, src});

    while(!pq.empty()) {
        int d = pq.top().first;
        int u = pq.top().second;
        pq.pop();

        if (d > dist[u]) continue; // Stale heap entry

        for (auto& edge : adj[u]) {
            int v = edge.first;
            int weight = edge.second;

            if (dist[u] + weight < dist[v]) {
                dist[v] = dist[u] + weight;
                pq.push({dist[v], v});
            }
        }
    }
    return dist;
}`
    }
  },
  {
    id: 'note-2',
    subjectId: 'sub-os',
    title: 'Process Synchronization: Peterson\'s Solution & Semaphores',
    topic: 'Concurrency & Deadlocks',
    moduleNumber: 2,
    date: '2026-11-05',
    difficulty: 'Medium',
    bookmarked: true,
    tags: ['OS', 'Concurrency', 'Semaphores', 'Peterson', 'Exam-Classic'],
    content: `## Critical Section Problem (CSP)
A Critical Section is a segment of code where shared resources (e.g., shared variables, files) are accessed. Any correct solution to the Critical Section problem must satisfy three strict requirements:

1. **Mutual Exclusion**: If process $P_i$ is executing in its critical section, no other process can enter.
2. **Progress**: If no process is in critical section and some wish to enter, selection cannot be postponed indefinitely.
3. **Bounded Waiting**: There must be a bound on the number of times other processes are allowed to enter their critical sections after a process has requested entry.

### Peterson's Algorithm (2 Processes)
Uses two shared variables:
- \`boolean flag[2]\`: Indicates intent to enter.
- \`int turn\`: Indicates whose turn has priority if both contend simultaneously.`,
    summary: `Classic 2-process synchronization solution satisfying Mutual Exclusion, Progress, and Bounded Waiting using shared flag array and turn variable. In modern multi-core systems, hardware atomics (Test-and-Set, Compare-and-Swap) and counting semaphores are used.`,
    keyFormulas: [
      'Requirements: Mutual Exclusion + Progress + Bounded Waiting',
      'Wait (P) operation: wait(S) { while (S <= 0); S--; }',
      'Signal (V) operation: signal(S) { S++; }'
    ],
    bulletPoints: [
      'Peterson algorithm works on software level for 2 processes with atomic memory operations.',
      'Counting semaphores manage finite resource pools.',
      'Binary semaphores function identically to Mutexes but lack ownership restrictions.'
    ],
    codeSnippet: {
      language: 'c',
      code: `// Peterson's Solution for Process i (partner is j = 1 - i)
flag[i] = true;
turn = j;
while (flag[j] && turn == j) {
    // Busy wait (spin lock)
}

// CRITICAL SECTION
// ... access shared resources ...

// EXIT SECTION
flag[i] = false;`
    }
  },
  {
    id: 'note-3',
    subjectId: 'sub-dbms',
    title: 'Relational Decomposition: 3NF vs BCNF & Lossless Joins',
    topic: 'Normalization',
    moduleNumber: 4,
    date: '2026-11-03',
    difficulty: 'Hard',
    bookmarked: false,
    tags: ['DBMS', '3NF', 'BCNF', 'Dependencies', 'LosslessJoin'],
    content: `## Functional Dependencies & Normal Forms
Normalization aims to minimize redundancy and eliminate insertion, update, and deletion anomalies.

### 3rd Normal Form (3NF)
A relation $R$ is in 3NF if for every non-trivial functional dependency $X \\rightarrow Y$:
1. $X$ is a Super Key, OR
2. $Y$ is a Prime Attribute (member of any candidate key).

### Boyce-Codd Normal Form (BCNF)
A relation $R$ is in BCNF if for every non-trivial functional dependency $X \\rightarrow Y$:
- $X$ **must** be a Super Key.

### Crucial Distinction: Dependency Preservation
- Every relation can be decomposed into 3NF such that the decomposition is **Lossless** and **Dependency Preserving**.
- BCNF decomposition guarantees Lossless Join, but **may NOT preserve dependencies**!`,
    summary: `3NF allows non-trivial FD X -> Y if X is a superkey OR Y is prime. BCNF strictly requires X to be a superkey. 3NF always guarantees dependency preservation; BCNF may lose dependency preservation.`,
    keyFormulas: [
      'Lossless Join condition: (R1 ∩ R2) -> (R1 - R2) OR (R1 ∩ R2) -> (R2 - R1)',
      'BCNF: X -> Y implies X is a super key'
    ],
    bulletPoints: [
      'Eliminates update anomalies and transitive dependencies.',
      'Always check prime attributes before failing 3NF condition.',
      'Lossless join test uses the common attribute as candidate key of at least one partition.'
    ]
  },
  {
    id: 'note-4',
    subjectId: 'sub-cn',
    title: 'Sliding Window Protocols: Stop-and-Wait vs Go-Back-N vs Selective Repeat',
    topic: 'Data Link & Transport Layer Flow Control',
    moduleNumber: 2,
    date: '2026-10-29',
    difficulty: 'Medium',
    bookmarked: true,
    tags: ['Networks', 'SlidingWindow', 'TCP', 'GATE-Formulas'],
    content: `## Flow Control Mechanisms
To prevent faster senders from overwhelming slower receivers, sliding window protocols utilize sequence numbers and window buffers.

### Protocol Comparison Table
| Feature | Stop-and-Wait | Go-Back-N (GBN) | Selective Repeat (SR) |
|---|---|---|---|
| Sender Window ($W_s$) | 1 | $N$ | $N$ |
| Receiver Window ($W_r$) | 1 | 1 | $N$ |
| Out-of-order packets | Discarded | Discarded | Buffered |
| Retransmission | Lost packet | Lost packet + all subsequent | Only lost packet |
| Min Sequence Bits ($k$) | 1 ($2^1=2$) | $\\lceil \\log_2(N+1) \\rceil$ | $\\lceil \\log_2(2N) \\rceil$ |

### Efficiency Formula
$$Efficiency (\\eta) = \\frac{N}{1 + 2a}$$
where $a = \\frac{T_{prop}}{T_{trans}}$`,
    summary: `Go-Back-N uses receiver window = 1 and discards out-of-order packets, requiring retransmission of all subsequent frames. Selective Repeat buffers out-of-order frames and retransmits only lost ones.`,
    keyFormulas: [
      'Efficiency eta = N / (1 + 2a), where a = T_prop / T_trans',
      'For GBN: W_s = N, W_r = 1, Sequence numbers >= N + 1',
      'For SR: W_s = N, W_r = N, Sequence numbers >= 2N'
    ],
    bulletPoints: [
      'Selective Repeat requires timer for every individual packet.',
      'Go-Back-N uses cumulative ACKs.',
      'Stop-and-Wait efficiency is eta = 1 / (1 + 2a).'
    ]
  }
];

export const initialDeadlines: Deadline[] = [
  {
    id: 'dl-1',
    title: 'DSA Programming Lab Assignment: Graph Cycle Detection',
    subjectId: 'sub-dsa',
    dueDate: '2026-11-14',
    dueTime: '23:59',
    type: 'Assignment',
    priority: 'High',
    status: 'in_progress',
    weightagePercentage: 10,
    notes: 'Implement Kahn\'s algorithm and DFS cycle detection on directed graph with benchmark timings.'
  },
  {
    id: 'dl-2',
    title: 'Mid-Term Semester Examination: Operating Systems',
    subjectId: 'sub-os',
    dueDate: '2026-11-18',
    dueTime: '10:00',
    type: 'Mid-Term',
    priority: 'High',
    status: 'pending',
    weightagePercentage: 30,
    notes: 'Chapters 1-6: Process scheduling, Peterson algorithm, Banker\'s deadlock algorithm, Paging.'
  },
  {
    id: 'dl-3',
    title: 'DBMS Project Milestone 2: Schema Normalization & ER Diagram',
    subjectId: 'sub-dbms',
    dueDate: '2026-11-20',
    dueTime: '17:00',
    type: 'Project',
    priority: 'Medium',
    status: 'pending',
    weightagePercentage: 15,
    notes: 'Submit 3NF normalized schema for University Course Portal with relational constraints.'
  },
  {
    id: 'dl-4',
    title: 'Computer Networks Packet Tracer Lab Submission',
    subjectId: 'sub-cn',
    dueDate: '2026-11-22',
    dueTime: '16:00',
    type: 'Lab Exam',
    priority: 'Medium',
    status: 'pending',
    weightagePercentage: 10,
    notes: 'Configure OSPF on 4-router topology and verify subnetting routing tables.'
  },
  {
    id: 'dl-5',
    title: 'AI Machine Learning Mini-Quiz on Backprop',
    subjectId: 'sub-ai',
    dueDate: '2026-11-12',
    dueTime: '14:30',
    type: 'Quiz',
    priority: 'Low',
    status: 'completed',
    weightagePercentage: 5,
    notes: 'Covering chain rule gradient flow in 2-layer MLP.'
  }
];

export const initialFlashcards: Flashcard[] = [
  {
    id: 'fc-1',
    subjectId: 'sub-dsa',
    topic: 'Graph Algorithms',
    front: 'Why cannot Dijkstra\'s algorithm work reliably with negative edge weights?',
    back: 'Dijkstra assumes that once a vertex is settled (extracted from priority queue), its shortest path distance is permanently finalized. A negative edge encountered later could lower the distance to an already settled vertex, violating the greedy choice property.',
    hint: 'Think greedy property & settled vertex invariants',
    masteryLevel: 2,
    lastReviewed: '2026-11-09',
    tag: 'Graphs'
  },
  {
    id: 'fc-2',
    subjectId: 'sub-dsa',
    topic: 'Sorting & Divide and Conquer',
    front: 'What is the recurrence relation and solution for MergeSort?',
    back: 'T(n) = 2T(n/2) + O(n).\nBy Case 2 of Master Theorem, T(n) = O(n log n) in all cases (best, average, and worst). It requires O(n) auxiliary memory.',
    hint: 'Divide into two halves + linear merge step',
    masteryLevel: 1,
    lastReviewed: '2026-11-08',
    tag: 'Divide & Conquer'
  },
  {
    id: 'fc-3',
    subjectId: 'sub-os',
    topic: 'Deadlocks',
    front: 'State the 4 Coffman conditions for system deadlock.',
    back: '1. Mutual Exclusion (unsharable resource)\n2. Hold and Wait (holds resource while waiting for another)\n3. No Preemption (resources cannot be forcibly revoked)\n4. Circular Wait (circular chain of processes waiting)',
    hint: 'M-H-N-C',
    masteryLevel: 1,
    lastReviewed: '2026-11-07',
    tag: 'Deadlock'
  },
  {
    id: 'fc-4',
    subjectId: 'sub-os',
    topic: 'Virtual Memory',
    front: 'What is Belady\'s Anomaly in Page Replacement?',
    back: 'Belady\'s Anomaly is the counter-intuitive phenomenon where increasing the number of physical page frames results in an INCREASE in the number of page faults. It occurs in FIFO page replacement, but NEVER in stack algorithms like LRU or Optimal.',
    hint: 'More memory frames causing MORE page faults',
    masteryLevel: 0,
    lastReviewed: '2026-11-04',
    tag: 'Memory Management'
  },
  {
    id: 'fc-5',
    subjectId: 'sub-dbms',
    topic: 'Normalization',
    front: 'What is the exact condition for a relation to be in BCNF?',
    back: 'For every non-trivial functional dependency X -> Y, X must be a SUPERKEY of the relation. If any determinant is not a candidate/super key, the relation is not in BCNF.',
    hint: 'The Left-Hand Side (determinant) must always be a key',
    masteryLevel: 2,
    lastReviewed: '2026-11-06',
    tag: 'Database Design'
  },
  {
    id: 'fc-6',
    subjectId: 'sub-cn',
    topic: 'Transport Protocols',
    front: 'Explain the TCP 3-Way Handshake step-by-step.',
    back: '1. Client sends SYN (seq = x)\n2. Server replies with SYN-ACK (seq = y, ack = x + 1)\n3. Client sends ACK (seq = x + 1, ack = y + 1)\nConnection is now ESTABLISHED and data exchange begins.',
    hint: 'SYN -> SYN-ACK -> ACK',
    masteryLevel: 1,
    lastReviewed: '2026-11-05',
    tag: 'TCP/IP'
  }
];

export const initialResources: CuratedResource[] = [
  {
    id: 'res-1',
    subjectId: 'sub-dsa',
    topic: 'Graph Algorithms',
    title: 'NPTEL: Programming, Data Structures and Algorithms by Prof. Madhavan Mukund',
    provider: 'NPTEL / IIT Madras',
    type: 'video_course',
    url: 'https://nptel.ac.in/courses/106106133',
    description: 'Gold-standard Indian university course covering mathematical proofs of shortest paths, dynamic programming, and complexity classes.',
    rating: 4.9,
    estimatedHours: '40 Hours',
    bookmarked: true
  },
  {
    id: 'res-2',
    subjectId: 'sub-dsa',
    topic: 'Data Structures Visualization',
    title: 'VisuAlgo: Interactive Algorithm Visualizer',
    provider: 'National University of Singapore (NUS)',
    type: 'interactive_tool',
    url: 'https://visualgo.net/en',
    description: 'Step-through visualizer for Dijkstra, BFS/DFS, AVL trees, and sorting algorithms with custom input arrays.',
    rating: 5.0,
    estimatedHours: 'Interactive Sandbox',
    bookmarked: true
  },
  {
    id: 'res-3',
    subjectId: 'sub-os',
    topic: 'Process Scheduling & Synchronization',
    title: 'Operating Systems: Three Easy Pieces (OSTEP Book & Notes)',
    provider: 'Remzi H. Arpaci-Dusseau (Univ of Wisconsin)',
    type: 'academic_notes',
    url: 'https://pages.cs.wisc.edu/~remzi/OSTEP/',
    description: 'The most readable and rigorous OS book covering virtualization, concurrency, and persistence with code walkthroughs.',
    rating: 4.95,
    estimatedHours: '15 Hours',
    bookmarked: false
  },
  {
    id: 'res-4',
    subjectId: 'sub-dbms',
    topic: 'Relational Design & SQL',
    title: 'GeeksforGeeks DBMS Complete Syllabus & Interview Guide',
    provider: 'GeeksforGeeks',
    type: 'article_and_code',
    url: 'https://www.geeksforgeeks.org/dbms/',
    description: 'Quick revision sheets for BCNF decomposition, B+ tree split-and-merge operations, and SQL transaction isolation levels.',
    rating: 4.8,
    estimatedHours: '6 Hours',
    bookmarked: true
  },
  {
    id: 'res-5',
    subjectId: 'sub-cn',
    topic: 'Computer Networks',
    title: 'GATE Overflow: Computer Networks Previous Year Questions with Solutions',
    provider: 'GATE Overflow',
    type: 'practice_questions',
    url: 'https://gateoverflow.in',
    description: '25 years of solved university and competitive exam questions on sliding window protocol efficiency and IP subnetting calculations.',
    rating: 4.9,
    estimatedHours: 'Self-Paced Practice',
    bookmarked: false
  }
];

export const initialSchedule: StudyScheduleItem[] = [
  {
    id: 'sch-1',
    day: 'Monday',
    timeBlock: '07:30 AM - 09:00 AM',
    subjectId: 'sub-dsa',
    focusTopic: 'Dijkstra and A* Search Code Optimization',
    sessionType: 'Active Coding & Practice',
    difficulty: 'High',
    completed: true
  },
  {
    id: 'sch-2',
    day: 'Monday',
    timeBlock: '04:00 PM - 05:30 PM',
    subjectId: 'sub-os',
    focusTopic: 'Deadlock Detection & Banker\'s Algorithm Matrices',
    sessionType: 'Theory & Formula Derivation',
    difficulty: 'High',
    completed: true
  },
  {
    id: 'sch-3',
    day: 'Tuesday',
    timeBlock: '08:00 AM - 09:30 AM',
    subjectId: 'sub-dbms',
    focusTopic: 'Lossless Decomposition Testing & Armstrong Axioms',
    sessionType: 'Problem Solving & Flashcards',
    difficulty: 'Medium',
    completed: false
  },
  {
    id: 'sch-4',
    day: 'Tuesday',
    timeBlock: '05:00 PM - 06:30 PM',
    subjectId: 'sub-cn',
    focusTopic: 'Subnet Masking (CIDR) and Routing Calculations',
    sessionType: 'Numerical Problems',
    difficulty: 'Medium',
    completed: false
  },
  {
    id: 'sch-5',
    day: 'Wednesday',
    timeBlock: '07:30 AM - 09:00 AM',
    subjectId: 'sub-ai',
    focusTopic: 'Backpropagation Gradient Descent Matrix Math',
    sessionType: 'Derivation & Math',
    difficulty: 'High',
    completed: false
  },
  {
    id: 'sch-6',
    day: 'Wednesday',
    timeBlock: '08:00 PM - 09:00 PM',
    subjectId: 'sub-dsa',
    focusTopic: 'Weekly High-Yield Quiz & Flashcard Review',
    sessionType: 'Active Recall',
    difficulty: 'Low',
    completed: false
  }
];

export const initialStudyGroups: StudyGroup[] = [
  {
    id: 'grp-dsa',
    name: 'B.Tech DSA & Competitive Code Room',
    subjectCode: 'CS-201',
    membersCount: 42,
    activeNow: 9,
    description: 'Daily LeetCode/Codeforces engineering discussions, graph algorithmic puzzles, and semester lab solution reviews.',
    tags: ['Graph Theory', 'Dynamic Programming', 'GATE 2027'],
    sharedNotesCount: 18,
    meetLink: 'https://meet.google.com/study-dsa-pulse',
    messages: [
      {
        id: 'msg-1',
        groupId: 'grp-dsa',
        senderName: 'Aarav Mehta',
        senderAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
        senderRole: 'Top Contributor',
        text: 'Guys, remember in question 3 of the lab assignment: when detecting cycles in a directed graph with BFS, if the count of visited nodes < V, a cycle exists!',
        timestamp: '10:24 AM',
        noteSnippet: 'Cycle in directed graph <=> Kahn Algorithm topological sort fails to visit all V vertices.'
      },
      {
        id: 'msg-2',
        groupId: 'grp-dsa',
        senderName: 'Priya Nambiar',
        senderAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=80',
        senderRole: 'Class Rep',
        text: 'Awesome tip Aarav! Dr. Ramanujan specifically hinted in today\'s lecture that a variation of this will appear in the 10-mark section of Mid-Terms.',
        timestamp: '10:31 AM'
      },
      {
        id: 'msg-3',
        groupId: 'grp-dsa',
        senderName: 'Abhi Chaudhary (You)',
        senderAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
        senderRole: 'B.Tech Student',
        text: 'Just generated an AI summary and 5-card flashcard set for Dijkstra and Bellman-Ford on the study assistant. Sharing it to our group vault now!',
        timestamp: '10:35 AM',
        isMe: true
      }
    ]
  },
  {
    id: 'grp-os',
    name: 'Operating Systems & Kernel Masters',
    subjectCode: 'CS-202',
    membersCount: 38,
    activeNow: 6,
    description: 'Virtual memory simulations, synchronization deadlock traps, and Unix system calls study circle.',
    tags: ['Processes', 'Semaphores', 'Memory Management'],
    sharedNotesCount: 14,
    meetLink: 'https://meet.google.com/study-os-sync',
    messages: [
      {
        id: 'msg-os-1',
        groupId: 'grp-os',
        senderName: 'Rohan Gupta',
        senderAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
        senderRole: 'TA Assistant',
        text: 'Quick poll: Do you want a 45-minute live review of Banker\'s algorithm tomorrow at 6 PM?',
        timestamp: '09:12 AM'
      },
      {
        id: 'msg-os-2',
        groupId: 'grp-os',
        senderName: 'Sneha Patel',
        senderAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
        senderRole: 'Study Peer',
        text: 'Yes please! Especially the Need Matrix calculation: Need[i][j] = Max[i][j] - Allocation[i][j].',
        timestamp: '09:15 AM'
      }
    ]
  },
  {
    id: 'grp-dbms',
    name: 'DBMS & High-Scale Systems Circle',
    subjectCode: 'CS-203',
    membersCount: 29,
    activeNow: 4,
    description: 'Database normalization derivations, B+ tree balancing, transaction concurrency, and SQL query tuning.',
    tags: ['BCNF', 'SQL Tuning', 'ACID'],
    sharedNotesCount: 9,
    meetLink: 'https://meet.google.com/study-dbms-group',
    messages: [
      {
        id: 'msg-db-1',
        groupId: 'grp-dbms',
        senderName: 'Vikram Joshi',
        senderAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
        senderRole: 'Peer',
        text: 'Remember: to test for Lossless Decomposition (R1 ∩ R2), check if that intersection is a superkey for either R1 or R2.',
        timestamp: 'Yesterday'
      }
    ]
  }
];

export const initialPreferences: UserPreferences = {
  theme: 'midnight',
  accent: 'rose',
  dailyStudyTargetHours: 4.5,
  offlineMode: false,
  pomodoroWorkMins: 25,
  pomodoroBreakMins: 5,
  soundEnabled: true,
  syncDeviceId: 'DEVICE-BTECH-IND-8842',
  lastSyncedAt: 'Just now'
};

export const initialAcademicGoal: AcademicGoal = {
  currentCGPA: 8.84,
  targetCGPA: 9.25,
  currentSemester: 4,
  totalSemesters: 8,
  totalCredits: 160,
  completedCredits: 74,
  studyStreakDays: 14,
  totalStudyMinutes: 2840,
  attendanceRate: 91.5
};
