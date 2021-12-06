import { useState } from "react";

const usePageData = (sessionStoreKey, initialState) => {
  const sessionData = window.sessionStorage.getItem(sessionStoreKey)
  const state = sessionData ? JSON.parse(sessionData) : initialState
  const [localState, updateLocalState] = useState(state)
  const updateSessionStore = newState => {
    window.sessionStorage.setItem(sessionStoreKey, JSON.stringify(newState))
    updateLocalState(newState)
  }
  return [state, updateSessionStore]
}

export default usePageData;
