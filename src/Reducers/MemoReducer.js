export const initialMemosState = {
    memos: [],
  };
  
  export const MemoReducer = (state, action) => {
    switch (action.type) {
      case 'SET_MEMOS':
        return { ...state, memos: action.payload };
      case 'ADD_MEMO':
        return { ...state, memos: [...state.memos, action.payload] };
      case 'UPDATE_MEMO':
        return { ...state, memos: state.memos.map((memo) =>
            memo.id === action.payload.id ? action.payload : memo) };
      case 'REMOVE_MEMO':
        return { ...state, memos: state.memos.filter((memo) => memo.id !== action.payload) };
      default:
        return state;
    }
  };  