const graphQuery = (input) => {
    const lines = input.trim().split('\n');
    const [N, M] = lines[0].split(' ').map(Number);
    const parent = Array(N + 1).fill(0).map((_, i) => i);
    
    const find = (x) => {
        if (parent[x] !== x) {
        parent[x] = find(parent[x]); 
        }
        return parent[x];
    }
    
    const union = (a, b) => {
        const rootA = find(a);
        const rootB = find(b);
        
        if (rootA !== rootB) {
        parent[rootB] = rootA;
        }
    }
    const graph = Array(N + 1).fill(0).map(() => new Set());
    
    const results = [];
    for (let i = 1; i <= M; i++) {
        const [query, A, B] = lines[i].split(' ').map(Number);
        switch (query) {
            case 1:
                graph[A].add(B)
                graph[B].add(A)
                union(A, B)
                break;
            case 2:
                graph[A].delete(B)
                graph[B].delete(A)
            
                for (let j = 1; j <= N; j++) {
                    parent[j] = j
                }
            
                for (let j = 1; j <= N; j++) {
                    for (const neighbor of graph[j]) {
                        if (j < neighbor) {
                            union(j, neighbor)
                        }
                    }
                }
                break;
            case 3:
                const result = find(A) === find(B) ? 1 : 0
                results.push(result)
                break;
        }
    }
    
    return results.join('\n');

}


const input = `4 11
1 1 2
1 2 3
1 3 4
1 1 4
3 4 2
2 1 2
3 2 4
2 3 4
3 4 2
1 2 4
3 4 2`;

console.log(graphQuery(input));