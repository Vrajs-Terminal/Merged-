import { useState, useEffect } from "react";
import axios from "axios";
import API_BASE from "../api";
import "./hierarchyChart.css";

function HierarchyChart() {
    const [hierarchyData, setHierarchyData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHierarchy = async () => {
            try {
                const response = await axios.get(`${API_BASE}/hierarchy`);
                setHierarchyData(response.data);
            } catch (error) {
                console.error("Error fetching hierarchy:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchHierarchy();
    }, []);

    // Recursive component to render tree nodes
    const TreeNode = ({ node }: { node: any }) => {
        return (
            <li>
                <a href={`/employees?search=${node.employeeId}`}>
                    <div className="node-name">{node.firstName} {node.lastName}</div>
                    <div className="node-role">{node.designationName}</div>
                    <div className="node-level">{node.levelName}</div>
                    {node.children && node.children.length > 0 && (
                        <div className="node-badge" title="Direct Reports">{node.children.length}</div>
                    )}
                </a>
                {node.children && node.children.length > 0 && (
                    <ul>
                        {node.children.map((child: any) => (
                            <TreeNode key={child.id} node={child} />
                        ))}
                    </ul>
                )}
            </li>
        );
    };

    return (
        <div className="hierarchy-container">
            <h2>Organization Hierarchy</h2>

            <div style={{ background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', overflowX: 'auto' }}>
                {loading ? (
                    <div style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>Loading Organization Chart...</div>
                ) : hierarchyData.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>No active employees found to display hierarchy.</div>
                ) : (
                    <div className="tree">
                        <ul>
                            {hierarchyData.map(rootNode => (
                                <TreeNode key={rootNode.id} node={rootNode} />
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
}

export default HierarchyChart;
