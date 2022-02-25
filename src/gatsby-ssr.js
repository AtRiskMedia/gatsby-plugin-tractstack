// eslint-disable-next-line no-unused-vars
import React from 'react';

import {defaultQueries} from './config';
import {TractStackProvider} from './provider';

export const wrapRootElement = ({element}, {queries = null}) => {
  return (
    <TractStackProvider queries={queries !== null ? queries : defaultQueries}>
      {element}
    </TractStackProvider>
  );
};

export function onRenderBody({setHeadComponents}) {
  setHeadComponents([<script src="https://unpkg.com/scrollreveal"></script>]);
}
