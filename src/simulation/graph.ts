import { Device, NetworkLink } from './types';

export interface DijkstraResult {
  path: string[] | null;
  totalCost: number;
}

/**
 * Computes shortest path between startNodeId and targetNodeId.
 * Adheres strictly to:
 * 1. Only operational (UP) links.
 * 2. Deterministic tie-breaking: lowest cost, then lexicographical node ID.
 * 3. Returns null path if disconnected.
 */
export function findShortestPath(
  startNodeId: string,
  targetNodeId: string,
  devices: Map<string, Device>,
  links: NetworkLink[]
): DijkstraResult {
  if (startNodeId === targetNodeId) {
    return { path: [startNodeId], totalCost: 0 };
  }

  // Build adjacency graph from operational UP links
  const adj = new Map<string, Array<{ neighbor: string; cost: number; linkId: string }>>();
  
  for (const link of links) {
    if (link.state !== 'UP') continue;
    
    if (!adj.has(link.source)) adj.set(link.source, []);
    if (!adj.has(link.target)) adj.set(link.target, []);

    adj.get(link.source)!.push({ neighbor: link.target, cost: link.cost, linkId: link.id });
    adj.get(link.target)!.push({ neighbor: link.source, cost: link.cost, linkId: link.id });
  }

  // Dijkstra's algorithm
  const dist = new Map<string, number>();
  const prev = new Map<string, string>();
  const visited = new Set<string>();

  for (const deviceId of devices.keys()) {
    dist.set(deviceId, Infinity);
  }
  dist.set(startNodeId, 0);

  while (visited.size < devices.size) {
    // Pick unvisited node with minimum distance, tie-breaking lexicographically
    let u: string | null = null;
    let minDistance = Infinity;

    for (const [nodeId, d] of dist.entries()) {
      if (visited.has(nodeId)) continue;
      if (d < minDistance) {
        minDistance = d;
        u = nodeId;
      } else if (d === minDistance && u !== null && nodeId < u) {
        // Lexicographical tie-breaker
        u = nodeId;
      }
    }

    if (u === null || minDistance === Infinity) break;
    if (u === targetNodeId) break;

    visited.add(u);

    const neighbors = adj.get(u) || [];
    for (const edge of neighbors) {
      if (visited.has(edge.neighbor)) continue;

      const alt = dist.get(u)! + edge.cost;
      const currentDist = dist.get(edge.neighbor)!;

      if (alt < currentDist) {
        dist.set(edge.neighbor, alt);
        prev.set(edge.neighbor, u);
      } else if (alt === currentDist) {
        // Deterministic tie-breaker for predecessor
        const currentPrev = prev.get(edge.neighbor);
        if (currentPrev === undefined || u < currentPrev) {
          prev.set(edge.neighbor, u);
        }
      }
    }
  }

  if (!dist.has(targetNodeId) || dist.get(targetNodeId) === Infinity) {
    return { path: null, totalCost: Infinity };
  }

  // Reconstruct path
  const path: string[] = [];
  let curr: string | undefined = targetNodeId;
  while (curr !== undefined) {
    path.unshift(curr);
    if (curr === startNodeId) break;
    curr = prev.get(curr);
  }

  if (path[0] !== startNodeId) {
    return { path: null, totalCost: Infinity };
  }

  return { path, totalCost: dist.get(targetNodeId)! };
}

/**
 * Finds the link between two connected nodes
 */
export function getLinkBetween(
  nodeA: string,
  nodeB: string,
  links: NetworkLink[]
): NetworkLink | undefined {
  return links.find(
    (l) =>
      (l.source === nodeA && l.target === nodeB) ||
      (l.source === nodeB && l.target === nodeA)
  );
}
