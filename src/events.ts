import * as moment from 'moment';
import { Subject } from 'rxjs/Subject';
import { DISABLE_EVENT_THROTTLE } from 'src/constants';
import store from 'src/store';
import { async } from 'src/store/reducers/events';
import { dateFormat } from 'src/time';

const createInitialDatestamp = () => {
  return moment('1970-01-01 00:00:00.000Z').utc().format(dateFormat);
}

export const events$ = new Subject<Linode.Event>();

let filterDatestamp = createInitialDatestamp();

const initialPollInterval = 2000;
export let eventRequestDeadline = Date.now();
export let currentPollIntervalMultiplier = 1;

export const resetEventsPolling = () => {
  eventRequestDeadline = Date.now() + initialPollInterval;
  currentPollIntervalMultiplier = 1;
}
export const init = () => {
  filterDatestamp = createInitialDatestamp();
  resetEventsPolling();
};

export const requestEvents = () => {
  store.dispatch(async.getEvents())
    .then((events) => {
      const reversed = events.reverse();
      /*
        * Events come back in reverse chronological order, so we update our
        * datestamp with the latest Event that we've seen. We need to perform
        * a date comparison here because we also might get back some old events
        * from IDs that we're polling for.
        */
      const latest = reversed[0];
      if (latest) {
        const newDatestamp = moment(latest.created);
        const currentDatestamp = moment(filterDatestamp);
        if (newDatestamp > currentDatestamp) {
          filterDatestamp = newDatestamp.format(dateFormat);
        }
      }

      /**
       * Given an array of events in chronological order push them onto the events$ stream so
       * consumers see it. Once all of the uses of events$ are removed, this can be be deleted.
       */
      reversed
        .forEach((linodeEvent: Linode.Event) => {
          events$.next(linodeEvent);
        });
    });
}

/* the following is the Nyquist rate for the minimum polling interval */
setInterval(() => {
  if (Date.now() > eventRequestDeadline) {
    requestEvents();

    if (DISABLE_EVENT_THROTTLE) {
      /* If throttling is disabled, don't use or update the multiplier */
      const mocksPollingInterval = 500;

      eventRequestDeadline = Date.now() + mocksPollingInterval;
    } else {
      eventRequestDeadline = Date.now()
        + initialPollInterval * currentPollIntervalMultiplier;
      /* double the polling interval with each poll up to 16x */
      currentPollIntervalMultiplier = Math.min(currentPollIntervalMultiplier * 2, 16);
    }
  }
}, (initialPollInterval / 2 - 1));
