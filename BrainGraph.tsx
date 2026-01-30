import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { SyntaxGraph, SynapseNode, SynapseLink } from '../types';

interface BrainGraphProps {
  data: SyntaxGraph;
  width?: number;
  height?: number;
}

const BrainGraph: React.FC<BrainGraphProps> = ({ data, width = 400, height = 300 }) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!data || !svgRef.current || data.nodes.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove(); // Clear previous render

    const nodes: SynapseNode[] = data.nodes.map(d => ({ ...d }));
    const links: any[] = data.links.map(d => ({ ...d }));

    const simulation = d3.forceSimulation(nodes)
      .force("link", d3.forceLink(links).id((d: any) => d.id).distance(100))
      .force("charge", d3.forceManyBody().strength(-200))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collide", d3.forceCollide().radius(30));

    // Draw lines for links
    const link = svg.append("g")
      .attr("stroke", "#64748b")
      .attr("stroke-opacity", 0.6)
      .selectAll("line")
      .data(links)
      .join("line")
      .attr("stroke-width", (d: any) => Math.sqrt(d.value || 1) * 2);

    // Draw circles for nodes
    const node = svg.append("g")
      .attr("stroke", "#fff")
      .attr("stroke-width", 1.5)
      .selectAll("g")
      .data(nodes)
      .join("g");
      
    // Node circles with color based on role
    node.append("circle")
      .attr("r", (d) => 15 + (d.weight * 10))
      .attr("fill", (d) => {
        if (d.group === 1) return "#3b82f6"; // Subject - Blue
        if (d.group === 2) return "#ef4444"; // Verb - Red
        return "#10b981"; // Object/Other - Green
      })
      .call(d3.drag<any, any>()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended));

    // Text labels
    node.append("text")
      .text(d => d.word)
      .attr("x", 12)
      .attr("y", 3)
      .attr("class", "text-[10px] font-mono fill-white pointer-events-none")
      .style("text-shadow", "1px 1px 2px black");
      
    // Role labels (small subtitle)
    node.append("text")
      .text(d => d.role)
      .attr("x", 12)
      .attr("y", 14)
      .attr("class", "text-[8px] fill-gray-400 pointer-events-none");

    simulation.on("tick", () => {
      link
        .attr("x1", (d: any) => d.source.x)
        .attr("y1", (d: any) => d.source.y)
        .attr("x2", (d: any) => d.target.x)
        .attr("y2", (d: any) => d.target.y);

      node
        .attr("transform", (d: any) => `translate(${d.x},${d.y})`);
    });

    function dragstarted(event: any) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      event.subject.fx = event.subject.x;
      event.subject.fy = event.subject.y;
    }

    function dragged(event: any) {
      event.subject.fx = event.x;
      event.subject.fy = event.y;
    }

    function dragended(event: any) {
      if (!event.active) simulation.alphaTarget(0);
      event.subject.fx = null;
      event.subject.fy = null;
    }

    return () => {
      simulation.stop();
    };
  }, [data, width, height]);

  return (
    <svg ref={svgRef} width={width} height={height} className="bg-slate-900/50 rounded-lg border border-slate-700 shadow-inner" />
  );
};

export default BrainGraph;