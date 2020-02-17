import React, { useReducer, useState, useEffect, useCallback, useMemo } from 'react';

import IngredientForm from './IngredientForm';
import IngredientList from './IngredientList';
import ErrorModal from '../UI/ErrorModal';
import Search from './Search';
import useHttp from '../../hooks/http';

// when we have a state with complex actions || connected datas || that can depend on previous state,
// it can be cleaner to use reducer instead of state
const ingredientReducer = (currentIngredients, action) => {
  switch(action.type) {
    case 'SET':
      return action.ingredients;
    case 'ADD':
      return [...currentIngredients, action.ingredient];
    case 'DELETE':
      return currentIngredients.filter(ing => ing.id !== action.id);
    default:
      throw new Error('Should not get there!');
  }
};

const Ingredients = () => {

  const [userIngredients, dispatch] = useReducer(ingredientReducer, []);

  // all the exposed datas returned by our hook
  const { isLoading, error, data, sendRequest, requestExtra, requestIdentifier, clear } = useHttp();

  // const [userIngredients, setUserIngredients] = useState([]);
  // const [isLoading, setIsLoading] = useState(false);
  // const [error, setError] = useState();

  useEffect(() => {
    // https://www.udemy.com/course/react-the-complete-guide-incl-redux/learn/lecture/15700400#overview
    // Handle local effects
    if (!isLoading && !error) {
      if (requestIdentifier === 'REMOVE_INGREDIENT') {
        dispatch({type: 'DELETE', id: requestExtra});
      } else if ( requestIdentifier === 'ADD_INGREDIENT') {
        dispatch({
          type: 'ADD',
          ingredient: { id: data.name, ...requestExtra}
        });
      }
    }

    // re-render only when this changes
  }, [data, requestExtra, requestIdentifier, isLoading, error]);

  const addIngredientHandler = useCallback(ingredient => {
    sendRequest(
      'https://react-hooks-update-9dae4.firebaseio.com/ingredients.json',
      'POST',
      JSON.stringify(ingredient),
      ingredient,
      'ADD_INGREDIENT',
    );
  }, [sendRequest]);

  const removeIngredientHandler = useCallback(ingredientId => {
    sendRequest(
      `https://react-hooks-update-9dae4.firebaseio.com/ingredients/${ingredientId}.jon`,
      'DELETE',
      null,
      ingredientId,
      'REMOVE_INGREDIENT',
    );
  }, [sendRequest]);

  // with useCallback we prevent infinite loop, this function will not be recreated on re-renders,
  // so it won't trigger change in Search setEffect
  // https://www.udemy.com/course/react-the-complete-guide-incl-redux/learn/lecture/15700360#questions
  const filteredIngredientsHandler = useCallback(filteredIngredients => {
    dispatch({ type: 'SET', ingredients: filteredIngredients });
  }, []);


  // This is an alternative to using react.memo in IngredientList
  // https://www.udemy.com/course/react-the-complete-guide-incl-redux/learn/lecture/15700390#overview
  const ingredientList = useMemo(() => {
    return (
      <IngredientList ingredients={userIngredients} onRemoveItem={removeIngredientHandler} />
    )
  }, [userIngredients, removeIngredientHandler]);

  return (
    <div className="App">
      {error && (
        <ErrorModal onClose={clear}>{error}</ErrorModal>
      )}

      <IngredientForm
        onAddIngredient={addIngredientHandler}
        loading={isLoading}
      />

      <section>
        <Search onLoadIngredients={filteredIngredientsHandler} />
        {ingredientList}
      </section>
    </div>
  );
}

export default Ingredients;
