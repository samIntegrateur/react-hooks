import React, { useContext } from 'react';

import Ingredients from './components/Ingredients/Ingredients';
import Auth from './components/Auth';
import { AuthContext } from './context/auth-context';

// Here without hooks, we would need to turn into a class to use context data outside jsx (with static contextType)
const App = props => {
  const authContext = useContext(AuthContext);

  let content = <Auth />;
  if (authContext.isAuth) {
    content = <Ingredients />
  }

  return content;
};

export default App;
