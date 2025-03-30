export const initialSchedulesState = {
  schedules: [],
  events: [],
};

export const ScheduleReducer = (state, action) => {
  switch (action.type) {
    case 'SET_SCHEDULES':
      const events = action.payload.map((item) => ({
        ...item.event,
        start: new Date(item.event.start),
        end: new Date(item.event.end),
      }));
      return { ...state, schedules: action.payload, events };
    case 'ADD_SCHEDULE':
      const updatedSchedules = [...state.schedules, action.payload];
      const updatedEvents = updatedSchedules.map((item) => ({
        ...item.event,
        start: new Date(item.event.start),
        end: new Date(item.event.end),
      }));
      return { ...state, schedules: updatedSchedules, events: updatedEvents };
    case 'UPDATE_SCHEDULE':
      const modifiedSchedules = state.schedules.map((schedule) =>
        schedule.id === action.payload.id ? action.payload : schedule);
      const modifiedEvent = modifiedSchedules.map((item) => ({
        ...item.event,
        start: new Date(item.event.start),
        end: new Date(item.event.end),
      }));
      return { ...state, schedules: modifiedSchedules, events: modifiedEvent };
    case 'REMOVE_SCHEDULE':
      const filterSchedules = state.schedules.filter((schedule) => schedule.id !== action.payload);
      const filterEvents = filterSchedules.map((item) => ({
        ...item.event,
        start: new Date(item.event.start),
        end: new Date(item.event.end),
      }));
      return { ...state, schedules: filterSchedules, events: filterEvents };
    default:
      return state;
  }
};
