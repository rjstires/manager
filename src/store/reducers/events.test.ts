import { createStore } from 'redux';
import reducer, { actions, defaultState } from './events';

const store = createStore(reducer, defaultState);

describe('events', () => {
  describe('reducer', () => {
    describe('when passed addEvents', () => {
      describe('with no events', () => {
        store.dispatch(actions.addEvents([]));

        it('should not update the store', () => {
          const state = store.getState();
          expect(state).toEqual(defaultState);
        });
      });
      describe('with events', () => {
        it('should add the events to the store.', () => { });
      });
    });
  });
});
