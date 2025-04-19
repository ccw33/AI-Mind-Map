import { getNode } from '.';

export function renderNodeTree(nodes) {
  // 如果nodes是数组，转换为对象形式
  const nodeMap = Array.isArray(nodes) 
    ? nodes.reduce((acc, node) => ({...acc, [node.id]: node}), {})
    : nodes;
  
  const rootNodes = Object.values(nodeMap).filter(n => !n.parentId);
  
  let svg = '<svg width="800" height="600">';
  svg += '<g class="nodes">';
  
  rootNodes.forEach(node => {
    svg += renderNode(node, nodeMap);
  });
  
  svg += '</g></svg>';
  
  return { svg, nodes: rootNodes };
}

export function highlightNodePath(nodeId, nodes) {
  const path = getNodePath(nodeId, nodes);
  let svg = '<svg width="800" height="600">';
  
  path.forEach(id => {
    const node = getNode(id, nodes);
    svg += `<g class="node highlighted" id="node-${node.id}">`;
    svg += `<rect x="${node.x}" y="${node.y}" width="120" height="40" fill="yellow"/>`;
    svg += `<text x="${node.x + 10}" y="${node.y + 25}">${node.content}</text>`;
    svg += '</g>';
  });
  
  return { svg, highlightedNodes: path };
}

export function toggleNodeCollapse(nodeId, nodes) {
  const node = getNode(nodeId, nodes);
  node.collapsed = !node.collapsed;
  return renderNodeTree(nodes);
}

// 私有方法
function renderNode(node, nodes, depth = 0) {
  const x = depth * 150 + 20;
  const y = 100;
  
  let svg = `<g class="node" id="node-${node.id}">`;
  svg += `<rect x="${x}" y="${y}" width="120" height="40" fill="#ddd"/>`;
  svg += `<text x="${x + 10}" y="${y + 25}">${node.content}</text>`;
  
  if (!node.collapsed && node.children.length > 0) {
    node.children.forEach(childId => {
      const child = getNode(childId, nodes);
      svg += `<line x1="${x + 60}" y1="${y + 40}" x2="${depth * 150 + 170}" y2="100" stroke="#999"/>`;
      svg += renderNode(child, nodes, depth + 1);
    });
  }
  
  svg += '</g>';
  return svg;
}

function getNodePath(nodeId, nodes) {
  const path = [];
  let currentId = nodeId;
  
  while (currentId) {
    path.unshift(currentId);
    const node = getNode(currentId, nodes);
    currentId = node.parentId;
  }
  
  return path;
}
