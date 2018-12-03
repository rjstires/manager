import * as moment from 'moment';
import { append, compose, equals, findIndex, omit, sort, take, update } from 'ramda';
import { AnyAction } from "redux";
import { ThunkAction } from "redux-thunk";
import { getEvents as _getEvents, markEventSeen } from 'src/services/account/events';
import { dateFormat } from 'src/time';
import { generatePollingFilter } from 'src/utilities/requestFilters';
import updateRight from 'src/utilities/updateRight';
import actionCreatorFactory, { isType } from 'typescript-fsa';

type Event = ExtendedEvent;

/** State */
type State = ApplicationState['events'];

/** We use the epoch on our initial request to get all of the users events. */
const epoch = new Date(`1970-01-01T00:00:00.000`).getTime();

export const defaultState: State = {
  events: [],
  mostRecentEventTime: epoch,
  countUnseenEvents: 0,
  inProgressEvents: {},
};



/** Actions */
const ADD_EVENTS = `ADD_EVENTS`;

const UPDATE_EVENTS_AS_SEEN = `UPDATE_EVENTS_AS_SEEN`;

const actionCreator = actionCreatorFactory(`@@manager/events`);

const addEvents = actionCreator<Event[]>(ADD_EVENTS);

const updateEventsAsSeen = actionCreator(UPDATE_EVENTS_AS_SEEN);

export const actions = { addEvents, updateEventsAsSeen };

/** Reducer */
export default (state = defaultState, action: AnyAction) => {

  if (isType(action, addEvents)) {
    const events = updateEvents(state.events, action.payload);
    return {
      ...state,
      events,
      mostRecentEventTime: events.reduce(mostRecentCreated, epoch),
      countUnseenEvents: getNumUnseenEvents(events),
      inProgressEvents: updateInProgressEvents(state.inProgressEvents, action.payload),
    };
  }

  if (isType(action, updateEventsAsSeen)) {
    return {
      ...state,
      events: state.events.map((event) => ({ ...event, seen: true })),
      countUnseenEvents: 0,
    }
  }

  return state;
};


/** Helpers */
/**
 * Safely find an entity in a list of entities returning the index.
 * Will return -1 if the index is not found.
 *
 * entities {Linode.Entity[]}
 * entity {null | Linode.Entity}
 */
const findInEntities = (entities: Linode.Entity[], entity: null | Partial<Linode.Entity> = {}) =>
  findIndex((e) => equals(e, entity), entities);

const setDeletedEvents = (events: Event[]) => {
  /** Create a list of deletion events. */
  const deletions = events
    .reduce((result: Linode.Entity[], event) => {
      const { entity, action, status } = event;

      if (!entity) {
        return result;
      }

      if (action !== 'linode_delete' || status !== 'finished') {
        return result;
      }

      return append(entity, result);
    }, []);

  /** If there are no deletions to process, just return the events. */
  if (deletions.length === 0) {
    return events;
  }

  /** Map events to either deleted or not. */
  return events.map((e) =>
    findInEntities(deletions, e.entity) > -1
      ? ({ ...e, _deleted: e.created })
      : e
  );
};

const updateEvents = compose(
  /** Finally we return the updated state (right) */
  ([prevEvents, events]) => events,

  /** Nested compose to get around Ramda's shotty typing. */
  compose(
    /** Take only the last 25 events. */
    updateRight<Event[], Event[]>((prevEvents, events) => take(25, events)),

    /** Ensure the events are sorted correctly. */
    updateRight<Event[], Event[]>((prevEvents, events) => sortEventsByCreated(events)),

    /** Marked events "_deleted". */
    updateRight<Event[], Event[]>((prevEvents, events) => setDeletedEvents(events)),

    /** Add events to the list. */
    updateRight<Event[], Event[]>((prevEvents, events) => addToEvents(prevEvents, events)),
  ),

  /** Convert the arguments to a tuple so we can use updateRight. */
  (prevEvents: Event[], events: Event[]) => [prevEvents, events],
);

/**
 * Compare the latestTime with the given Linode's created time and return the most recent.
 *
 * @param latestTime {number}
 * @param current {Event}
 */
const mostRecentCreated = (latestTime: number, current: Event) => {
  const time = new Date(current.created).getTime();
  return latestTime > time ? latestTime : time;
};

/**
 * Compile an updated list of events by either updating an event in place or appending an event
 * to prevEvents.
 *
 * @param prevEvents {Event[]}
 * @param events {Event}
 */
const addToEvents = (prevEvents: Event[], events: Event[]) => {
  return events
    .reverse()
    .reduce((updatedEvents, event) => {
      /** We will either be updating in place or appending the new event. */

      /** We need to handle update in place. */
      const idx = findIndex(({ id }) => id === event.id, updatedEvents);
      if (idx > -1) {
        return update<Event>(idx, event, updatedEvents);
      }

      /** Standard appending. */
      return append(event, updatedEvents);
    }, prevEvents);
}

const isInProgressEvent = (e: Event) => e.percent_complete !== null && e.percent_complete < 100;

const isCompletedEvent = (e: Event) => e.percent_complete === 100;

/**
 * Iterate through new events and either add/remove it from the inPgoressEvents.
 *
 * @param inProgressEvents { [string]: Event }
 * @param event {Event}
 */
const updateInProgressEvents = (inProgressEvents: Record<number, boolean>, event: Event[]) => {
  return event.reduce((result, e) => {
    if (isCompletedEvent(e)) {
      return omit([String(e.id)], inProgressEvents);
    }

    return isInProgressEvent(e) ? { ...result, [e.id]: true } : result
  }, inProgressEvents);
}

const sortEventsByCreated = sort<Event>((a: Event, b: Event) => new Date(b.created).getTime() - new Date(a.created).getTime());

const getNumUnseenEvents = (events: Event[]) =>
  events.reduce((result, event) => event.seen ? result : result + 1, 0);



/** Async */
/**
 * Will send a filtered request for events which have been created after the most recent existing
 * event or the epoch if there are no stored events.
 */
const getEvents: () => ThunkAction<Promise<Event[]>, ApplicationState, undefined>
  = () => (dispatch, getState) => {
    const { mostRecentEventTime, inProgressEvents } = getState().events;

    const filters = generatePollingFilter(
      moment(mostRecentEventTime).format(dateFormat),
      Object.keys(inProgressEvents),
    );

    return _getEvents({ page_size: 25 }, filters)
      .then(response => response.data.data)
      .then(events => events.map(e => ({ ...e, _initial: mostRecentEventTime === epoch })))
      .then((events) => {
        if (events.length > 0) {
          dispatch(addEvents(events));
        }
        return events;
      })
  };

/**
 * Send a request to mark all currently stored events as seen, then call updateEventsAsSeen
 * which iterates the evnts and marks them seen.
 */
const markAllSeen: () => ThunkAction<Promise<any>, ApplicationState, undefined>
  = () => (dispatch, getState) => {
    const { events: { events } } = getState();
    const latestId = events.reduce((result, { id }) => id > result ? id : result, 0);

    return markEventSeen(latestId)
      .then(() => dispatch(updateEventsAsSeen()))
      .catch(() => null)
  };

export const async = { getEvents, markAllSeen };
