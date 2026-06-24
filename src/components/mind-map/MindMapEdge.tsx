import { BaseEdge, type EdgeProps } from "@xyflow/react";

export function MindMapEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style,
  markerEnd,
}: EdgeProps) {
  // Calculate a smooth organic curve (MindMeister style)
  // For a horizontal mind map, we want the curve to start horizontally from the source
  // and smoothly bend into the target node.
  const isRight = targetX > sourceX;
  const xOffset = Math.abs(targetX - sourceX) * 0.45;
  
  // Custom cubic bezier: starts from source, control point 1 moves out horizontally,
  // control point 2 moves back horizontally from target, ends at target.
  const c1X = sourceX + (isRight ? xOffset : -xOffset);
  const c1Y = sourceY;
  const c2X = targetX - (isRight ? xOffset : -xOffset);
  const c2Y = targetY;

  const edgePath = `M ${sourceX},${sourceY} C ${c1X},${c1Y} ${c2X},${c2Y} ${targetX},${targetY}`;

  return (
    <g className="mind-map-edge-group">
      <BaseEdge 
        id={id} 
        path={edgePath} 
        markerEnd={markerEnd} 
        style={{
          ...style,
          strokeLinecap: "round",
          strokeLinejoin: "round",
        }} 
      />
    </g>
  );
}
