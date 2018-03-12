import React from 'react';
import { storiesOf } from '@storybook/react';
import { object } from '@storybook/addon-knobs/react';
import V3SearchBar from './component';
//import searchQueryGenerator from '../../../../veritone-csp-generator/index'


storiesOf('SearchBar', module)
  .add('WithTranscriptPill', () => {
    let csp = {"and":[{"state":{"search":"Lakers","language":"en"},"engineCategoryId":"67cd4dd0-2f75-445d-a6f0-2f297d6cd182"},{"or":[{"state":{"search":"Kobe","language":"en"},"engineCategoryId":"67cd4dd0-2f75-445d-a6f0-2f297d6cd182"},{"state":{"search":"Lebron","language":"en"},"engineCategoryId":"67cd4dd0-2f75-445d-a6f0-2f297d6cd182"},{"state":{"search":"Shaq","language":"en"},"engineCategoryId":"67cd4dd0-2f75-445d-a6f0-2f297d6cd182"}]}]};

    const onSearch = (csp) => console.log('onSearch', csp)

    //attachSearchBar({mountPoint: 'root', relativeSize: 20, color: "#00ff66"});

    return [
      <div
      style={{
        height: '45px',
        width: '100%',
        padding: '5px',
        background: '#00aacc',
        display: 'flex',
        alignItems: 'center'
      }}
    >
    <V3SearchBar color={'#00aacc'}
      onSearch={onSearch}
      csp={csp}
      api={'https://enterprise.stage.veritone.com/api'}
    />
    </div>
    ] ;
  });
