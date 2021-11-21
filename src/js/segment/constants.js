const PADDING_IN_PIXELS = 3
const BORDER_IN_PIXELS = 1

export const NAME = 'Segment'

export const FIELD = {
  EDITABLE: 'select[xname]',
  READONLY: 'input[type=hidden][xname]',
  TEXT: 'div[xid]'
}

export const CSS_CLASSES = {
  GROUP_CLASS: 'o-segments',
  LABEL_CLASS: 'o-segment',
  SELECTION_CLASS: 'o-segment-selection',
  ACTIVE_CLASS: '-active',
  DISABLED_CLASS: '-disabled',
  ANIMATED_CLASS: '-animated'
}

export const POSITION = {
  space: PADDING_IN_PIXELS + BORDER_IN_PIXELS,
  padding: PADDING_IN_PIXELS
}
