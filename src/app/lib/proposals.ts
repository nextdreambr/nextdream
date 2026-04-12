import type { Proposal } from './api';

export function buildProposalMapByDream(proposals: Proposal[]) {
  const map = new Map<string, Proposal>();

  for (const proposal of proposals) {
    if (!map.has(proposal.dreamId)) {
      map.set(proposal.dreamId, proposal);
    }
  }

  return map;
}

