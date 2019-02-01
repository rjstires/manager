import * as React from 'react';

const {
  Provider: LinodeProvider,
  Consumer: LinodeConsumer
} = React.createContext<any>(null);

export { LinodeProvider, LinodeConsumer };
