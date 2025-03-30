export const initialSpacesState = {
  spaces: [],
};

export const SpaceReducer = (state, action) => {
  switch (action.type) {
    case 'SET_SPACES':
      return { ...state, spaces: action.payload };
    case 'ADD_SPACE':
      return { ...state, spaces: [...state.spaces, action.payload] };
    case 'UPDATE_SPACE':
      return { ...state, spaces: state.spaces.map((space) =>
        space.id === action.payload.id ? action.payload : space) };
    case 'REMOVE_SPACE':
      return { ...state, spaces: state.spaces.filter((space) => space.id !== action.payload) };
    default:
      return state;
  }
};  