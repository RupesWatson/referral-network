// Same sample data as the original referral-network.html
export const SAMPLE_NODES = [
  { id: 'n1', name: 'James Hartley',  type: 'client',       organisation: 'Hartley Capital',  sector: 'Private equity',  estimatedAUM: '>£50m',   engagementScore: 5, referralLikelihood: 4, notes: 'Long-standing client, well connected in PE', introducedBy: null, areaOfFocus: '', firmsCovered: '', jpmTitle: '', jpmEngagement: '', industry: '', website: '', keyContacts: '' },
  { id: 'n2', name: 'Sarah Chen',     type: 'prospect',     organisation: 'Meridian Ventures', sector: 'Venture capital', estimatedAUM: '£25–50m', engagementScore: 3, referralLikelihood: 2, notes: '',                                             introducedBy: 'n1', areaOfFocus: '', firmsCovered: '', jpmTitle: '', jpmEngagement: '', industry: '', website: '', keyContacts: '' },
  { id: 'n3', name: 'Robert Okafor',  type: 'referrer',     organisation: 'Okafor & Partners', sector: 'Legal',           estimatedAUM: '',        engagementScore: 4, referralLikelihood: 5, notes: 'Top referrer — family law focus',              introducedBy: null, areaOfFocus: '', firmsCovered: '', jpmTitle: '', jpmEngagement: '', industry: '', website: '', keyContacts: '' },
  { id: 'n4', name: 'Emma Blackwood', type: 'prospect',     organisation: 'Blackwood Family',  sector: 'Real estate',     estimatedAUM: '>£50m',   engagementScore: 4, referralLikelihood: 3, notes: '',                                             introducedBy: 'n3', areaOfFocus: '', firmsCovered: '', jpmTitle: '', jpmEngagement: '', industry: '', website: '', keyContacts: '' },
  { id: 'n5', name: 'David Lim',      type: 'client',       organisation: 'Lim Group',         sector: 'Tech founder',    estimatedAUM: '£10–25m', engagementScore: 4, referralLikelihood: 3, notes: '',                                             introducedBy: null, areaOfFocus: '', firmsCovered: '', jpmTitle: '', jpmEngagement: '', industry: '', website: '', keyContacts: '' },
  { id: 'n6', name: 'Claire Dubois',  type: 'adviser',      organisation: 'Montrose Tax',      sector: 'Accounting',      estimatedAUM: '',        engagementScore: 3, referralLikelihood: 4, notes: 'Tax adviser — good conduit',                   introducedBy: null, areaOfFocus: '', firmsCovered: '', jpmTitle: '', jpmEngagement: '', industry: '', website: '', keyContacts: '' },
  { id: 'n7', name: 'Marcus Webb',    type: 'prospect',     organisation: 'Webb Industries',   sector: 'Corporate',       estimatedAUM: '£10–25m', engagementScore: 2, referralLikelihood: 1, notes: '',                                             introducedBy: null, areaOfFocus: '', firmsCovered: '', jpmTitle: '', jpmEngagement: '', industry: '', website: '', keyContacts: '' },
  { id: 'n8', name: 'Alex Morgan',    type: 'jpmorgan',     organisation: 'JP Morgan',         sector: '',                estimatedAUM: '',        engagementScore: 0, referralLikelihood: 0, notes: 'Covers HF clients in London',                 introducedBy: null, areaOfFocus: 'Hedge Funds', firmsCovered: 'Bridgewater, Man Group', jpmTitle: 'Relationship Manager', jpmEngagement: 'active', industry: '', website: '', keyContacts: '' },
  { id: 'n9', name: 'Hartley Capital',type: 'organisation', organisation: '',                  sector: '',                estimatedAUM: '>£100m',  engagementScore: 0, referralLikelihood: 0, notes: "James Hartley's firm",                         introducedBy: null, areaOfFocus: '', firmsCovered: '', jpmTitle: '', jpmEngagement: '', industry: 'Asset Management', website: 'hartleycapital.com', keyContacts: 'James Hartley' },
];

export const SAMPLE_EDGES = [
  { id: 'e1', sourceId: 'n1', targetId: 'n2', relationshipType: 'referred',   strength: 3, notes: '' },
  { id: 'e2', sourceId: 'n3', targetId: 'n4', relationshipType: 'referred',   strength: 3, notes: '' },
  { id: 'e3', sourceId: 'n3', targetId: 'n5', relationshipType: 'referred',   strength: 2, notes: '' },
  { id: 'e4', sourceId: 'n1', targetId: 'n3', relationshipType: 'knows',      strength: 2, notes: '' },
  { id: 'e5', sourceId: 'n6', targetId: 'n1', relationshipType: 'adviser-to', strength: 3, notes: '' },
  { id: 'e6', sourceId: 'n6', targetId: 'n4', relationshipType: 'adviser-to', strength: 2, notes: '' },
  { id: 'e7', sourceId: 'n5', targetId: 'n7', relationshipType: 'knows',      strength: 1, notes: '' },
  { id: 'e8', sourceId: 'n8', targetId: 'n1', relationshipType: 'covers',     strength: 2, notes: 'JPM coverage' },
  { id: 'e9', sourceId: 'n1', targetId: 'n9', relationshipType: 'colleague',  strength: 3, notes: '' },
];
