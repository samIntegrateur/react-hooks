import React, { useState, useEffect, useRef } from 'react';
import ErrorModal from '../UI/ErrorModal';
import Card from '../UI/Card';
import useHttp from '../../hooks/http';
import './Search.css';

const Search = React.memo(props => {

  // create a var for specific props, in order to specify that we watch for it in our effect
  const { onLoadIngredients } = props;
  const [filter, setFilter] = useState('');
  const inputRef = useRef();
  const { isLoading, data, error, sendRequest, clear} = useHttp();

  useEffect(() => {

   const timer = setTimeout(() => {
      // filter has the value of the useEffect time, before the timeout ran out,
      // so we can compare it with the current and avoid spamming db
      if (filter === inputRef.current.value) {
        const query = filter.length === 0 ? '' : `?orderBy="title"&equalTo="${filter}"`;

        sendRequest(
          `https://react-hooks-update-9dae4.firebaseio.com/ingredients.json${query}`,
          'GET',
        );

      }
    }, 500);

   // cleanup function, run before the next time it will run, or when components unmount if dependencies is []
   return () => {
     clearTimeout(timer);
   };
  }, [filter, inputRef, sendRequest]);

  useEffect(() => {
    if (!isLoading && !error && data) {
      const loadedIngredients = [];
      for (const key in data) {
        loadedIngredients.push({
          id: key,
          title: data[key].title,
          amount: data[key].amount,
        });
      }
      onLoadIngredients(loadedIngredients);
    }
  }, [data, isLoading, error, onLoadIngredients]);

  return (
    <section className="search">
      { error &&
        <ErrorModal onClose={clear}>{error}</ErrorModal>
      }
      <Card>
        <div className="search-input">
          <label>Filter by Title</label>
          { isLoading &&
            <span>Loading...</span>
          }
          <input type="text"
                 ref={inputRef}
                 value={filter}
                 onChange={event => setFilter(event.target.value)}
          />
        </div>
      </Card>
    </section>
  );
});

export default Search;
