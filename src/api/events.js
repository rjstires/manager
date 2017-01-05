import { fetch } from '~/fetch';
import { actions } from './configs/events';

export function eventAction(action) {
  return (eventId) => async (dispatch, getState) => {
    const state = getState();

    const event = state.api.events.events[eventId];
    await dispatch(actions.one({ ...event, [action]: true }, eventId));

    if (action === 'seen') {
      // Mark all events seen. Using many to avoid a dispatch per event.
      const page = {
        total_pages: state.api.events.totalPages,
        total_results: state.api.events.totalResults,
        events: Object.values(state.api.events.events).reduce(
          (unseen, e) => e.seen ? unseen : { ...e, seen: true }, []),
      };
      dispatch(actions.many(page));
    }

    const { token } = state.authentication;
    fetch(token, `/account/events/${eventId}/${action}`, { method: 'POST' });
  };
}

export const eventRead = eventAction('read');
export const eventSeen = eventAction('seen');
