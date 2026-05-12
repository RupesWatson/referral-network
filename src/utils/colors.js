export const TYPE_COLORS = {
  client:       { fill: '#185FA5', light: '#E6F1FB', text: '#0C447C' },
  prospect:     { fill: '#0F6E56', light: '#E1F5EE', text: '#085041' },
  referrer:     { fill: '#993C1D', light: '#FAECE7', text: '#712B13' },
  adviser:      { fill: '#534AB7', light: '#EEEDFE', text: '#3C3489' },
  jpmorgan:     { fill: '#003087', light: '#DCE9F5', text: '#003087' },
  organisation: { fill: '#6B7280', light: '#F0F0F0', text: '#374151' },
};

export const TYPE_LABELS = {
  client:       'Client',
  prospect:     'Prospect',
  referrer:     'Referrer',
  adviser:      'Adviser',
  jpmorgan:     'JP Morgan',
  organisation: 'Organisation',
};

export const EDGE_STYLES = {
  referred:     { stroke: '#185FA5', dashArray: null,    width: 2,   arrow: true  },
  knows:        { stroke: '#888780', dashArray: '6,4',   width: 1.5, arrow: false },
  colleague:    { stroke: '#0F6E56', dashArray: null,    width: 1.5, arrow: false },
  'adviser-to': { stroke: '#534AB7', dashArray: '2,4',   width: 1.5, arrow: false },
  family:       { stroke: '#993C1D', dashArray: null,    width: 2.5, arrow: false },
  covers:       { stroke: '#003087', dashArray: '4,3',   width: 1.5, arrow: false },
};

export const RELATIONSHIP_TYPES = [
  { value: 'referred',   label: 'Referred' },
  { value: 'knows',      label: 'Knows' },
  { value: 'colleague',  label: 'Colleague' },
  { value: 'adviser-to', label: 'Adviser to' },
  { value: 'family',     label: 'Family' },
  { value: 'covers',     label: 'JPM Covers' },
];

export const STRENGTH_LABELS = {
  1: 'Distant',
  2: 'Solid',
  3: 'Close',
};
