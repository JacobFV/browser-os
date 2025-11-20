import React, { useMemo, useState } from 'react';
import type { ProcessInfo } from './types';
import './ProcessManager.css';

interface ProcessTreeViewProps {
  processes: ProcessInfo[];
  selectedPid: number | null;
  onSelectProcess: (pid: number | null) => void;
}

interface ProcessTreeNode {
  process: ProcessInfo;
  children: ProcessTreeNode[];
}

export const ProcessTreeView: React.FC<ProcessTreeViewProps> = ({
  processes,
  selectedPid,
  onSelectProcess,
}) => {
  const [expandedPids, setExpandedPids] = useState<Set<number>>(new Set());

  // Build tree structure
  const processTree = useMemo(() => {
    const processMap = new Map<number, ProcessTreeNode>();
    const roots: ProcessTreeNode[] = [];

    // Create nodes for all processes
    processes.forEach((proc) => {
      processMap.set(proc.pid, {
        process: proc,
        children: [],
      });
    });

    // Build tree relationships
    processes.forEach((proc) => {
      const node = processMap.get(proc.pid)!;
      if (proc.ppid === null || !processMap.has(proc.ppid)) {
        roots.push(node);
      } else {
        const parent = processMap.get(proc.ppid);
        if (parent) {
          parent.children.push(node);
        } else {
          roots.push(node);
        }
      }
    });

    return roots;
  }, [processes]);

  const toggleExpand = (pid: number) => {
    setExpandedPids((prev) => {
      const next = new Set(prev);
      if (next.has(pid)) {
        next.delete(pid);
      } else {
        next.add(pid);
      }
      return next;
    });
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'running':
        return 'status-badge status-running';
      case 'stopped':
        return 'status-badge status-stopped';
      case 'terminated':
        return 'status-badge status-terminated';
      default:
        return 'status-badge';
    }
  };

  const renderTreeNode = (node: ProcessTreeNode, level: number = 0): React.ReactNode => {
    const { process } = node;
    const hasChildren = node.children.length > 0;
    const isExpanded = expandedPids.has(process.pid);
    const isSelected = selectedPid === process.pid;

    return (
      <div key={process.pid} className="process-tree-node">
        <div
          className={`process-tree-item ${isSelected ? 'selected' : ''}`}
          style={{ paddingLeft: `${level * 20 + 8}px` }}
          onClick={() => onSelectProcess(process.pid)}
        >
          {hasChildren && (
            <button
              className="process-tree-toggle"
              onClick={(e) => {
                e.stopPropagation();
                toggleExpand(process.pid);
              }}
            >
              {isExpanded ? '▼' : '▶'}
            </button>
          )}
          {!hasChildren && <span className="process-tree-spacer" />}
          <span className="process-tree-pid">{process.pid}</span>
          <span className="process-tree-name">{process.name}</span>
          <span className={getStatusBadgeClass(process.status)}>{process.status}</span>
        </div>
        {hasChildren && isExpanded && (
          <div className="process-tree-children">
            {node.children.map((child) => renderTreeNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="process-tree-view">
      <div className="process-tree-header">
        <h3>Process Tree</h3>
        <button
          className="process-tree-expand-all"
          onClick={() => {
            const allPids = new Set<number>();
            const collectPids = (nodes: ProcessTreeNode[]) => {
              nodes.forEach((node) => {
                if (node.children.length > 0) {
                  allPids.add(node.process.pid);
                  collectPids(node.children);
                }
              });
            };
            collectPids(processTree);
            setExpandedPids(allPids);
          }}
        >
          Expand All
        </button>
        <button
          className="process-tree-collapse-all"
          onClick={() => setExpandedPids(new Set())}
        >
          Collapse All
        </button>
      </div>
      <div className="process-tree-content">
        {processTree.length === 0 ? (
          <div className="process-tree-empty">No processes found</div>
        ) : (
          processTree.map((root) => renderTreeNode(root))
        )}
      </div>
    </div>
  );
};

