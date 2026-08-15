import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";

import useMarvelService from "../../services/MarvelService";
import Spinner from "../spinner/Spinner";
import ErrorMessage from "../errorMessage/ErrorMessage";
import noCover from "../../resources/img/x-men.png";

import "./singleComic.scss";

/**
 * This page used to be hard-coded: it rendered X-Men: Days of Future Past no
 * matter which comic had been clicked, and its "Back to all" link went to "#".
 * There was no route pointing at it either. It reads the id from the route now.
 */
const SingleComic = () => {
  const { comicId } = useParams();
  const [comic, setComic] = useState(null);

  const { loading, error, getComic, clearError } = useMarvelService();

  useEffect(() => {
    clearError();
    getComic(comicId).then(setComic);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [comicId]);

  const errorMessage = error ? <ErrorMessage /> : null;
  const spinner = loading ? <Spinner /> : null;
  const content = !(loading || error || !comic) ? <View comic={comic} /> : null;

  return (
    <>
      {errorMessage}
      {spinner}
      {content}
    </>
  );
};

const View = ({ comic }) => {
  const { title, description, thumbnail, subjects } = comic;

  return (
    <div className="single-comic">
      <img src={thumbnail || noCover} alt={title} className="single-comic__img" />
      <div className="single-comic__info">
        <h2 className="single-comic__name">{title}</h2>
        <p className="single-comic__descr">{description}</p>
        {subjects.length > 0 && (
          <p className="single-comic__descr">Subjects: {subjects.join(", ")}</p>
        )}
      </div>
      <Link to="/comics" className="single-comic__back">
        Back to all
      </Link>
    </div>
  );
};

export default SingleComic;
