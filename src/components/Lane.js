import React, {useRef, useEffect} from 'react';
import Article from "./Article";

function Lane({lane, dispatch, setLike}) {
  const { id, articleList } = lane;
  const laneEl = useRef(null);
  const emptyEl = useRef(null);

  function handleIntersection(entries, observer) {
    entries.forEach((entry) => {
      dispatch({
        type: 'updateLane',
        data: {
          id: id,
          availableAddImage: entry.isIntersecting
        }
      });

      if (entry.isIntersecting) {
        dispatch({
          type: 'updateJob',
          data: {
            id: id,
            isContinue: true
          }
        });
      }
    });
  }

  useEffect(() => {
    dispatch({
      type: 'updateLane',
      data: {
        id: id,
        laneRef: laneEl
      }
    });
    const io = new IntersectionObserver(handleIntersection, {threshold: 0});
    io.observe(emptyEl.current);
    return () => {
      if (emptyEl && emptyEl.current) {
        io.unobserve(emptyEl.current);
      }
    }
  }, []);

  return (
    <div className='lane'>
      <div ref={laneEl}>
      {articleList.map(article => <Article key={article.id} article={article} dispatch={dispatch} setLike={setLike}/>)}
      </div>
      <div ref={emptyEl} className='empty_area'/>
    </div>
  );
}

export default Lane;
