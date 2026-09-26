from typing import Any

from .hazard_graph import HazardGraph


def to_networkx(graph: HazardGraph) -> Any:
    try:
        import networkx as nx  # type: ignore[import-not-found,import-untyped]
    except ImportError as exc:
        raise RuntimeError("Install the 'graph' extra for NetworkX support") from exc
    result = nx.DiGraph()
    for source, targets in graph.edges.items():
        for target in targets:
            result.add_edge(source, target)
    return result
