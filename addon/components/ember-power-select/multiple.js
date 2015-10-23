import Ember from 'ember';
import PowerSelectBaseComponent from './base';
import layout from '../../templates/components/ember-power-select/multiple';

const { computed, get } = Ember;
const { htmlSafe } = Ember.String;

export default PowerSelectBaseComponent.extend({
  layout: layout,

  // CPs
  selection: computed('selected', {
    get() { return Ember.A(this.get('selected')); },
    set(_, v) { return v; }
  }),

  triggerMultipleInputStyle: computed('_searchText', function() {
    return htmlSafe(`width: ${(this.get('_searchText.length') || 0) * 0.5 + 2}em`);
  }),

  // Actions
  actions: {
    removeOption(option, dropdown, e) {
      e.stopPropagation();
      this.removeOption(option, dropdown);
    },

    multipleModeInputKeydown(dropdown, e) {
      if (e.keyCode === 40 || e.keyCode === 38) { // Arrow up/down
        this.handleVerticalArrowKey(e);
      } else if (e.keyCode === 8) {   // backspace
        this.removeLastOptionIfSearchIsEmpty(dropdown);
        dropdown.open(e);
      } else if (e.keyCode === 13) {  // Enter
        e.stopPropagation();
        const highlighted = this.get('_highlighted');
        if (highlighted && (this.get('selected') || []).indexOf(highlighted) === -1) {
          this.select(highlighted, dropdown, e);
        } else {
          dropdown.close(e);
        }
      } else if (e.keyCode === 9) {   // Tab
        dropdown.close(e);
      } else if (e.keyCode === 27) {  // escape
        e.preventDefault();
        dropdown.close(e);
      } else {
        dropdown.open(e);
      }
    }
  },

  // Methods
  defaultHighlighted() {
    return this.optionAtIndex(0);
  },

  select(option, dropdown, e) {
    const newSelection = this.cloneSelection();
    if (newSelection.indexOf(option) > -1) {
      newSelection.removeObject(option);
    } else {
      newSelection.addObject(option);
    }
    if (this.get('closeOnSelect')) {
      dropdown.close(e);
    }
    this.get('onchange')(newSelection, dropdown);
  },

  removeLastOptionIfSearchIsEmpty(dropdown) {
    if (this.get('_searchText.length') !== 0) { return; }
    const lastSelection = this.get('selection.lastObject');
    if (!lastSelection) { return; }
    this.removeOption(lastSelection, dropdown);
    if (typeof lastSelection === 'string') {
      this.performSearch(lastSelection);
    } else {
      if (!this.get('searchField')) { throw new Error('Need to provide `searchField` when options are not strings'); }
      this.performSearch(get(lastSelection, this.get('searchField')));
    }
  },

  removeOption(option, dropdown) {
    const newSelection = this.cloneSelection();
    newSelection.removeObject(option);
    this._resultsDirty = true;
    this.get('onchange')(newSelection, dropdown);
  },

  focusSearch() {
    this.element.querySelector('.ember-power-select-trigger-multiple-input').focus();
  },

  cloneSelection() {
    return Ember.A((this.get('selection') || []).slice(0));
  }
});