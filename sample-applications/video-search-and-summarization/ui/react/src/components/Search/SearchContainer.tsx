import { FC, useEffect } from 'react';
import SearchSidebar from './SearchSidebar';
import SearchContent from './SearchContent';
import { useAppDispatch, useAppSelector } from '../../redux/store';
import { SearchLoad, SearchSelector, SyncWatched } from '../../redux/search/searchSlice';
import { socket } from '../../socket';

export const SearchMainContainer: FC = () => {
  const { triggerLoad } = useAppSelector(SearchSelector);

  const dispatch = useAppDispatch();

  useEffect(() => {
    if (triggerLoad) {
      dispatch(SearchLoad());
    }
  }, [triggerLoad]);

  useEffect(() => {
    socket.on('search:sync', (data) => {
      console.log('Search sync received', data);
      dispatch(SyncWatched());
    });
  }, []);

  return (
    <>
      <SearchSidebar />
      <SearchContent />
    </>
  );
};

export default SearchMainContainer;
