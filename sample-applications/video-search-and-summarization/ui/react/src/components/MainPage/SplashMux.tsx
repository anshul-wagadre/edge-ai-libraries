import { FC, useState } from 'react';
import SummaryMainContainer from '../Summaries/SummaryContainer';
import SearchMainContainer from '../Search/SearchContainer';
import { IconButton } from '@carbon/react';
import { DataAnalytics, Sigma } from '@carbon/react/icons';
import styled from 'styled-components';

const SuperSidebar = styled.div`
  display: flex;
  flex-flow: column nowrap;
  align-items: flex-start;
  justify-content: flex-start;
  background-color: var(--color-sidebar);
  border-right: 1px solid var(--color-border);
`;

export const SplashSummarySearch: FC = () => {
  enum MuxFeatures {
    SEARCH,
    SUMMARY,
  }

  const [mux, setMux] = useState<MuxFeatures>(MuxFeatures.SEARCH);

  return (
    <>
      <SuperSidebar>
        <IconButton
          align='right'
          label='Summary'
          onClick={() => setMux(MuxFeatures.SUMMARY)}
          kind={mux == MuxFeatures.SUMMARY ? 'primary' : 'ghost'}
        >
          <Sigma />
        </IconButton>
        <IconButton
          align='right'
          label='Search'
          onClick={() => setMux(MuxFeatures.SEARCH)}
          kind={mux == MuxFeatures.SEARCH ? 'primary' : 'ghost'}
        >
          <DataAnalytics />
        </IconButton>
      </SuperSidebar>

      {MuxFeatures.SUMMARY === mux && <SummaryMainContainer />}
      {MuxFeatures.SEARCH === mux && <SearchMainContainer />}
    </>
  );
};
