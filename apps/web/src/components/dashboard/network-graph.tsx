"use client";
import { Cosmograph, CosmographProvider } from "@cosmograph/react";

type Node = {
  id: string;
  x?: number;
  y?: number;
  username: string;
  walletAddress: string | null;
};

type Link = {
  source: string;
  target: string;
};

export function NetworkGraph({
  nodes,
  links,
}: {
  nodes: Node[];
  links: Link[];
}): JSX.Element {
  return (
    <CosmographProvider nodes={nodes} links={links}>
      <Cosmograph
        nodeLabelAccessor={(n: Node) => n.username}
        nodeColor={(n: Node) =>
          n.id.startsWith("main-") ? "red" : "#" + n.id.slice(0, 6)
        }
        nodeSize={(n: Node) => (n.id.startsWith("main-") ? 10 : 2)}
        linkWidth={2}
        simulationRepulsion={2}
        simulationLinkDistance={20}
        simulationLinkSpring={0.4}
        showDynamicLabels={false}
        showLabelsFor={nodes.filter((n: Node) => n.id.startsWith("main-"))}
      />
    </CosmographProvider>
  );
}
