import React, {useEffect, useReducer, useRef} from 'react';
import produce from 'immer';
import Lane from "./Lane";

function getInitState(initValue = 0) {
  const countOfLane = initValue > 1 ? initValue : Math.ceil(window.innerWidth / 160);
  const laneList = [];
  for(let i=0 ; i<countOfLane ; i++) {
    laneList.push({
      id: i,
      laneRef: null,
      totalHeight: 0,
      availableAddImage: false,
      articleList: []
    });
  }
  return {
    init: true,
    job: {
      articleId: 1,
      status: 'ready',
      isContinue: false
    },
    laneList,
    countOfLane,
    minBreakWidth: 100 * countOfLane,
    maxBreakWidth: 180 * countOfLane
  };
}

function getLaneForArticle(laneInfo) {
  if (!laneInfo || laneInfo.length<=0) {
    return null;
  }

  let resultLane = null;
  for (let i=0 ; i<laneInfo.length ; i+=1) {
    const tmpLane = laneInfo[i];
    if (tmpLane.availableAddImage) {
      if (resultLane === null) {
        resultLane = tmpLane;
      } else {
        const { laneRef: { current : resultRef } } = resultLane;
        const { laneRef: { current : tmpRef } } = tmpLane;
        if (resultRef && tmpRef) {
          const resultLaneHeight = resultRef.getBoundingClientRect().height;
          const tmpLaneLaneHeight = tmpRef.getBoundingClientRect().height;
          if (resultLaneHeight > tmpLaneLaneHeight) {
            resultLane = tmpLane;
          }
        }
      }
    }
  }
  return resultLane;
}

function reducer(state, action) {
  const { type, data } = action;
  switch (type) {
    case 'updateJob': {
      return produce(state, draft => {
        if (draft.init) {
          draft.init = false;
          for (let i=0 ; i<draft.laneList.length ; i++) {
            if (draft.laneList[i].availableAddImage !== true) {
              draft.init = true;
            }
          }
        }

        draft.job = {
          ...draft.job,
          ...data
        };
      })
    }
    case 'updateLane': {
      const { id } = data;
      return produce(state, draft => {
        if (draft.laneList[id]) {
          draft.laneList[id] = {
            ...draft.laneList[data.id],
            ...data
          };
        }
      });
    }
    case 'updateArticle': {
      return produce(state, draft => {
        const {laneId, id, count} = data;
        draft.laneList[laneId].articleList[id].count = count;
      })
    }
    case 'loadArticle': {
      const {articleId, laneId} = data;
      return produce(state, draft => {
        draft.job.status = 'loading';
        draft.laneList[laneId].articleList[articleId] = {
          id: articleId,
          laneId,
          count: 0
        };
      });
    }
    case 'imageLoading': {
      return produce(state, draft => {
        draft.job.articleId += 1;
        draft.job.status = 'ready';
      });
    }
    default:
      throw new Error();
  }
}

function Page() {
  const [state, dispatch] = useReducer(reducer, getInitState());
  const pageEl = useRef(null);

  const handleResize = (entries, observer) => {
      const { minBreakWidth, maxBreakWidth } = state;
      entries.forEach((entry) => {
        const { width } = entry.contentRect;
        if (width < minBreakWidth || width > maxBreakWidth) {
          window.location.reload();
        }
      });
  }

  function setLike({laneId, id, isLike}) {
    const apiUrl = isLike ? '/like' : '/dislike';
    const formData = new FormData();
    formData.append('id', id);
    fetch(apiUrl, { method: 'POST', body: formData })
      .then(response => response.json())
      .then(result => {
        const { count } = result;
        dispatch({
          type: 'updateArticle',
          data: { laneId, id, count }
        });
      })
      .catch(error => {
        console.error('Error:', error);
      });
  }

  useEffect(() => {
    let ro = null;
    if (!state.init) {
      const ro = new ResizeObserver(handleResize);
      ro.observe(pageEl.current);
    }
    return () => {
      if (ro) {
        ro.unobserve(pageEl.current)
      }
    }
  }, [state.init]);

  useEffect(()=>{
    const { articleId, status, isContinue } = state.job;
    if (!state.init && status === 'ready' && isContinue) {
      const selectedLane = getLaneForArticle(state.laneList);
      if (selectedLane!==null) {
        dispatch({
          type: 'loadArticle',
          data: {
            articleId,
            laneId: selectedLane.id
          }
        });
      }
    }
  }, [state.job]);

  return (
    <div ref={pageEl} style={{width: '100%'}}>
      <div id='ScrollPage'>
        {state.laneList.map((lane) => <Lane key={lane.id} lane={lane} dispatch={dispatch} setLike={setLike}/>)}
      </div>
    </div>
  );
}

export default Page;
