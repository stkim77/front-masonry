import React, { useRef, useState, useEffect } from "react";

const IMAGE_STATUS = {
  READY: 'READY',
  LOADING: 'LOADING',
  COMPLETE: 'COMPLETE'
};

function Article({article, dispatch, setLike}) {
  const [isShow, setShow] = useState(true);
  const [imageInfo, setImageInfo] = useState({ status: IMAGE_STATUS.READY, ratio: 0 });
  const { id, count, laneId } = article;
  const articleEl = useRef(null);
  const imageUrl = `http://localhost:3000/img/img${id}.png`;

  function handleBtn(isLike) {
    setLike({ laneId, id, isLike });
  }

  function handleIntersection(entries, observer) {
    entries.forEach((entry) => {
      setShow(entry.isIntersecting);
    });
  }

  function handleOnLoad(e) {
    const { height, width } = e.target.getBoundingClientRect();
    setImageInfo({ status: IMAGE_STATUS.COMPLETE, ratio: height/width*100 });
    dispatch({ type: 'imageLoading' });
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      setImageInfo(draft => ({ ...draft, status: IMAGE_STATUS.LOADING }));
    }, 100);
    const io = new IntersectionObserver(handleIntersection, {threshold: 0});
    io.observe(articleEl.current);
    return () => {
      if (articleEl && articleEl.current) {
        io.unobserve(articleEl.current);
      }
      if (timer) {
        clearTimeout(timer);
      }
    }
  }, []);

  function renderImageElement() {
    const { status, ratio } = imageInfo;

    if (status === IMAGE_STATUS.READY) {
      return <div>Image</div>;
    }

    if (status === IMAGE_STATUS.LOADING) {
      return <img className='image' src={imageUrl} alt={''} onLoad={handleOnLoad}/>
    }

    if (isShow) {
      return <img className='image' src={imageUrl} alt={''}/>
    }

    return <img className='image' alt={''} style={{paddingBottom: `${ratio}%`}}/>
  }

  return (
    <div className='article' ref={articleEl}>
      {
        renderImageElement()
      }
      <div className='like_status'>
        <div className='like_count'>{count}</div>
        <div>
          <button className='btn' onClick={()=>{handleBtn(true)}}>좋아요</button>
          <button className='btn' onClick={()=>{handleBtn(false)}}>취소</button>
        </div>
      </div>
    </div>
  );
}

export default Article;
