import { useReducer, useCallback } from 'react';

const initialState = {
  loading: false,
  error: null,
  data: null,
  // can be the id of a delete or the ingredient of an add
  extra: null,
  // can be added on sendRequest and then used to handle effect (see useEffect in Ingredients.js)
  identifier: null,
};

const httpReducer = (currentHttpState, action) => {
  switch (action.type) {
    case 'SEND':
      return { loading: true, error: null, data: null, extra: null, identifier: action.identifier };
    case 'RESPONSE':
      return { ...currentHttpState, loading: false, data: action.responseData, extra: action.extra };
    case 'ERROR':
      return { loading: false, error: action.errorData };
    case 'CLEAR':
      return initialState;
    default:
      throw new Error('Should not get there!');
  }
};

const useHttp = () => {
  const [httpState, dispatchHttp] = useReducer(httpReducer, initialState);

  const clear = useCallback(() => dispatchHttp({type: 'CLEAR'}), []);

  const sendRequest = useCallback((url, method, body, requestExtra, requestIdentifier) => {
    dispatchHttp({type: 'SEND', identifier: requestIdentifier});
    fetch(url, {
      method: method,
      body: body,
      headers: {
        'Content-Type': 'application/json',
      }
    })
      .then(response => response.json())
      .then(responseData => {
        dispatchHttp({
          type: 'RESPONSE',
          responseData: responseData,
          extra: requestExtra,
        });
    })
      .catch(error => {
        dispatchHttp({type: 'ERROR', errorData: error.message});
    });
  }, []);

  return {
    isLoading: httpState.loading,
    data: httpState.data,
    error: httpState.error,
    sendRequest: sendRequest,
    requestExtra: httpState.extra,
    requestIdentifier: httpState.identifier,
    clear: clear,
  };
};

export default useHttp;
