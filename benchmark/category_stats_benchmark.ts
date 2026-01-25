const NUM_ROWS = 100000;
const CATEGORIES = ['Coding', 'Writing', 'Art', 'Music', 'Business', 'Education', 'Other'];

// Generate mock data
const mockData = Array.from({ length: NUM_ROWS }, () => ({
    category: CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)]
}));

console.log(`Benchmarking category counting with ${NUM_ROWS} rows...`);

// Method 1: Current Implementation (Client-side aggregation)
const start1 = Date.now();

// Simulate JSON serialization/deserialization overhead (approximate network transfer overhead logic)
// In a real scenario, this is much slower due to network latency and bandwidth
const serialized = JSON.stringify(mockData);
const deserialized = JSON.parse(serialized);

const categoryCounts: Record<string, number> = {};
deserialized.forEach((p: { category: string }) => {
    categoryCounts[p.category] = (categoryCounts[p.category] || 0) + 1;
});

const sortedCategories = Object.entries(categoryCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([name, count]) => ({ name, count }));

const end1 = Date.now();
console.log(`Current Implementation (Client-side aggregation): ${(end1 - start1).toFixed(2)}ms`);
console.log(`Data size transferred (approx): ${(serialized.length / 1024 / 1024).toFixed(2)} MB`);

// Method 2: Optimized Implementation (RPC/Database aggregation)
const start2 = Date.now();

// Simulate RPC response (small payload)
const rpcResponse = [
    { name: 'Coding', count: 15000 },
    { name: 'Writing', count: 14000 },
    { name: 'Art', count: 13000 },
    { name: 'Music', count: 12000 },
    { name: 'Business', count: 11000 }
];

// Simulate JSON overhead for RPC response
const serializedRpc = JSON.stringify(rpcResponse);
const deserializedRpc = JSON.parse(serializedRpc);

const end2 = Date.now();

console.log(`Optimized Implementation (RPC aggregation): ${(end2 - start2).toFixed(2)}ms`);
console.log(`Data size transferred (approx): ${(serializedRpc.length / 1024).toFixed(2)} KB`);
