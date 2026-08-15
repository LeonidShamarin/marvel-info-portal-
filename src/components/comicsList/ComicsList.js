import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

import useMarvelService from "../../services/MarvelService";
import Spinner from "../spinner/Spinner";
import ErrorMessage from "../errorMessage/ErrorMessage";
import noCover from "../../resources/img/UW.png";

import "./comicsList.scss";

const PER_PAGE = 8;

const ComicsList = () => {
  const [comicsList, setComicsList] = useState([]);
  const [newItemLoading, setnewItemLoading] = useState(false);
  const [offset, setOffset] = useState(0);
  const [comicsEnded, setComicsEnded] = useState(false);

  const { loading, error, getAllComics } = useMarvelService();

  useEffect(() => {
    // First page on mount only: `onRequest` is a new function on every
    // render, so depending on it would re-fetch in a loop.
    onRequest(offset, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onRequest = (offset, initial) => {
    initial ? setnewItemLoading(false) : setnewItemLoading(true);
    getAllComics(offset).then(onComicsListLoaded);
  };

  const onComicsListLoaded = (newComicsList) => {
    // Functional updates: the handler is called from a closure that may hold
    // an older copy of the list.
    setComicsList((previous) => [...previous, ...newComicsList]);
    setnewItemLoading(false);
    setOffset((previous) => previous + PER_PAGE);
    setComicsEnded(newComicsList.length < PER_PAGE);
  };

  function renderItems(arr) {
    const items = arr.map((item) => {
      return (
        <li className="comics__item" key={item.id}>
          <Link to={`/comics/${item.id}`}>
            <img
              src={item.thumbnail || noCover}
              alt={item.title}
              className="comics__item-img"
            />
            <div className="comics__item-name">{item.title}</div>
            <div className="comics__item-price">
              {item.description} · {item.year}
            </div>
          </Link>
        </li>
      );
    });

    return <ul className="comics__grid">{items}</ul>;
  }

  const items = renderItems(comicsList);

  const errorMessage = error ? <ErrorMessage /> : null;
  const spinner = loading && !newItemLoading ? <Spinner /> : null;

  return (
    <div className="comics__list">
      {errorMessage}
      {spinner}
      {items}
      <button
        disabled={newItemLoading}
        style={{ display: comicsEnded ? "none" : "block" }}
        className="button button__main button__long"
        onClick={() => onRequest(offset)}
      >
        <div className="inner">load more</div>
      </button>
    </div>
  );
};

export default ComicsList;
